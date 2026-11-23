# AlmaWay Phase 2B-1 — read-only Supabase audit

Аудит: **11 ноября 2026, 21:58–22:16, Asia/Qyzylorda (UTC+05)**.
Baseline `main`: `d9ffe3ab0d2324213a2d2c6503ec88913e5e5b9a`.
PR [#2](https://github.com/Arvex-studio/almaway-project-V1/pull/2) подтверждён как merged;
его contract head — `8ca8cbc649829023cf0479459081447ed00c98aa`.

**Результат:** фактическая DB/API baseline установлена. Прикладных объектов AlmaWay
и application migration history нет. Можно отдельно запускать Phase 2B-2 для подготовки
локальных migrations и client foundation. Готовность live Auth и hosted apply этим
аудитом **не подтверждается**. Приватный Auth Management config недоступен текущим
read-инструментам и остаётся явно обозначенным пробелом; называть весь Auth audit полным нельзя.

[Sanitized evidence snapshot](supabase-phase-2b-1-2026-11-11.json) содержит результаты
metadata-проверок и статусы покрытия. Это снимок на указанное время, не текущая live state.
Сравнение выполнено с утверждёнными [контрактом](../backend-contract.md),
[схемой](../backend-schema-proposal.md), [migration plan](../backend-migration-plan.md)
и [prompt Phase 2B-2](../phase-2b-2-implementation-prompt.md).

## 1. Идентичность и границы доступа

| Проверка | Подтверждено |
| --- | --- |
| Подключение | Только `AlmawayV1` |
| Project / ref | `almaway-project-V1` / `nwmmqtyfaumuaocspsur` |
| Organization / id | `Almaway-project-V1` / `mlghjrgokzobvflbqmay` |
| Region / plan | `ap-south-1` / `free` |
| Status | Сначала `COMING_UP`, затем `ACTIVE_HEALTHY`; повторная финальная проверка также healthy |
| API URL | `https://nwmmqtyfaumuaocspsur.supabase.co` |
| Database | SQL server `17.6`; project metadata version `17.6.1.166` |
| SQL audit role | `postgres`, с BYPASSRLS; SQL `transaction_read_only=off` |

Восстановление запущено владельцем до этого аудита; агент не вызывал restore/resume.
Gridy, Qaskelen и иные проекты не использовались. Создание ресурсов, migrations,
DDL/DML, grants, Auth settings и deploy не выполнялись.

Несмотря на доступную привилегированную SQL-сессию, агент выполнял только SELECT
для системных каталогов, metadata и двух агрегатов: количества Auth users и buckets.
Не было SET ROLE, SQL-файлов с применением schema, вызовов mutating routines или Auth flows.
Функции Storage/Vault только читались через `pg_get_functiondef`, а не исполнялись.
Поэтому этот аудит не является runtime-доказательством защиты пользователей A/B.

Публичные HTTP probes выполнялись только GET с publishable key: Auth settings/health/JWKS,
Data API schema check и zero-limit read отсутствующей `profiles`. Значения API keys,
JWT, passwords, OAuth/SMTP secrets, содержимое Vault и пользовательские записи в артефакты
не включены. Service-role/secret keys не запрашивались. Сохранены только признаки key types
и публичный тип алгоритма JWKS, без key material.

## 2. Фактическая schema и migration history

| Область | Фактическое состояние |
| --- | --- |
| `public` | 0 tables/partitioned/foreign tables, views/materialized views, sequences и functions |
| Четыре V1 таблицы | `profiles`, `places`, `place_sources`, `saved_places` отсутствуют |
| Application columns / constraints / indexes | Пусто; нет существующих category CHECK, source PK или индексов, которые нужно преобразовывать |
| Application types / domains / routines | В public нет enum/domain/custom types, aggregates или других routines; в graphql_public нет custom types/domain constraints |
| Application triggers | Нет signup/profile trigger и иных triggers на прикладных таблицах |
| Пользовательские schemas | Не обнаружены вне platform schemas, перечисленных ниже |
| `list_migrations` | `[]` |
| `supabase_migrations` schema | Отсутствует |
| `supabase_migrations.schema_migrations` | `to_regclass` вернул `null` |
| Git migrations | В проверенном main нет `supabase/` и application migration files |
| Auth users / Storage buckets | Агрегаты: 0 / 0; PII и bucket content не выгружались |
| Edge Functions | `[]` |
| Realtime | Publication `supabase_realtime`, `all_tables=false`, опубликованных tables нет |

База целиком не пустая: присутствуют managed schemas `auth`, `extensions`, `graphql`,
`graphql_public`, `realtime`, `storage`, `vault` и схема `public`. Inventory содержит
27 Auth tables и 1 sequence, 10 Storage tables, Realtime tables/partitioned table/sequence,
Vault table/view и 2 extension views. Нельзя экспортировать/удалять managed schemas
как часть первоначальной AlmaWay migration.

Установлены `plpgsql`, `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault`.
PostGIS и `pg_graphql` не установлены; для минимального контракта они не требуются.
Служебные migration tables в Auth/Storage/Realtime не являются application migration history.

**Классификация baseline:** новый прикладной слой поверх работающего managed Supabase.
В проверенном снимке нет видимого application history drift: и Git migrations, и remote
application history отсутствуют. Это не forensic-доказательство отсутствия любых действий
в прошлом. Для будущего runner нужны первые reviewed local migration files; remote
`migration repair`, reset или искусственная запись baseline не нужны и не выполнялись.

## 3. Grants, ownership и RLS

Подтверждён фактический Data API exposure: **`public`, `graphql_public`**.
GET с намеренно несуществующим `Accept-Profile` вернул `406 / PGRST106` и этот список.
Обычный zero-limit GET `public.profiles` вернул `404 / PGRST205`; это согласуется с каталогами.
Schema settings SQL-сессии сами по себе не раскрыли список, поэтому он проверен через API.

- `anon` и `authenticated` не имеют LOGIN, SUPERUSER, BYPASSRLS, CREATEROLE или CREATEDB.
  У них нет membership друг в друге, `service_role`, `pg_read_all_data` или `pg_write_all_data`.
- На `public` им предоставлен USAGE, но не CREATE. USAGE на managed schemas не означает
  SELECT/INSERT разрешение на их таблицы.
- Проверены 58 effective relation privilege combinations для anon/authenticated в
  `auth`/`vault` и пустой `public`: ни SELECT, ни INSERT/UPDATE/DELETE не разрешены.
  Дополнительных column grants для этих клиентов там не обнаружено.
- `service_role` и `postgres` имеют BYPASSRLS; это privileged platform/operator доступ,
  не допустимый credential для обычного browser/server client.
- `pg_policies` пуст во всех schemas. На будущих V1 таблицах пока нет ни RLS, ни policies,
  поскольку сами таблицы отсутствуют. Изоляцию A/B сейчас нечему доказательно тестировать.
- RLS включена на всех 10 Storage tables. Некоторые новые managed Auth tables имеют
  RLS off, но у anon/authenticated нет table privileges, и `auth` не exposed в Data API.
  Это не найденный обход доступа и не основание менять managed Auth schema.

### Существенный технический риск: широкие default ACL

Для будущих объектов `public`, создаваемых `postgres` и `supabase_admin`, фактически
сохраняются default grants anon/authenticated/service_role: широкие table privileges,
EXECUTE на functions и права на sequences. Это наблюдение реальной конфигурации,
а не предположение о современных defaults платформы.

Сейчас прикладных таблиц/функций нет, поэтому текущая утечка AlmaWay data этим не доказана.
Но CREATE TABLE без последующего REVOKE/RLS откроет лишние permissions в будущей migration.
Утверждённый контракт уже предусматривает подходящий контроль: DDL + RLS + policies +
явные REVOKE/GRANT в одной транзакции. Проверить effective table **и column** privileges
после replay, отсутствие UPDATE для saves и прав на ownership/timestamps у Profile.
Не полагаться на RLS alone или изменения defaults из changelog.

Глобальные default privileges и managed grants в этом этапе не исправлялись.
Их отдельное ужесточение допустимо обсуждать позднее; оно не требуется для local
подготовки минимального контракта при атомарном применении его собственных ограничений.

## 4. Functions, views и triggers

Inventory: 104 functions/procedures вне `pg_*`/`information_schema`:
`auth=4`, `extensions=55`, `graphql_public=1`, `realtime=15`, `storage=24`, `vault=5`.
Для всех получены owner, security mode, search_path, EXECUTE ACL, extension ownership
и hash определения. Это inventory и целевая проверка доступа, не exhaustive review
каждой строки managed extension code.

- В `public` нет RPC, SECURITY DEFINER functions или views, способных обходить будущую RLS.
- Единственная функция exposed `graphql_public.graphql` — platform placeholder,
  SECURITY INVOKER, доступна на EXECUTE клиентским ролям. Тело проверено: возвращает
  сообщение `pg_graphql extension is not enabled`; DML в нём нет.
- Все 5 SECURITY DEFINER functions находятся в managed Storage/Vault. Их определения
  прочитаны без вызова. У anon/authenticated effective EXECUTE отсутствует:
  `storage.protect_active_lifecycle_states`, `storage.reconcile_lifecycle_state`,
  `storage.wake_lifecycle_state`, `vault.create_secret`, `vault.update_secret`.
  Storage helpers фиксируют search_path=`pg_catalog`, Vault helpers — пустой search_path.
- 12 non-internal table triggers относятся только к Storage/Realtime. Нет trigger
  на `auth.users`, автоматически создающего AlmaWay Profile.
- 6 event triggers — platform GraphQL/extension-access/PostgREST helpers,
  owned by `supabase_admin`; прикладных event triggers не обнаружено.
- Extension views, включая `pg_stat_statements`, лежат вне exposed schemas;
  их данные не читались. Vault rows и decrypted secrets не читались.

Контракту не нужны дополнительные definer helpers, admin RPC, views или signup triggers.
Существующие managed functions не копировать в application migrations и не менять их ACL.

## 5. Auth: подтверждено и не проверено

Read-only GET `/auth/v1/settings`, `/health` и `/.well-known/jwks.json` успешны (`200`).

| Свойство | Подтверждено публичным ответом |
| --- | --- |
| Auth service | GoTrue `v2.197.0`, health 200 |
| Email provider | Включён |
| Signup | `disable_signup=false` |
| Email confirmation | `mailer_autoconfirm=false`, то есть autoconfirm выключен |
| Anonymous sign-ins | `external.anonymous_users=false` |
| Phone provider / phone autoconfirm | Выключены / false |
| Внешние OAuth providers | Все перечисленные settings providers выключены |
| SAML | Выключен |
| Passkeys | Выключены |
| SAML next-key readiness flag | `saml_private_key_next_configured=true`; прочитан только boolean, не key value |
| JWKS | Один публичный EC signing key, `alg=ES256`, `use=sig` |
| API key metadata | По одному enabled legacy anon и modern publishable key; значения не сохранялись |

Settings содержит label SMS provider `twilio`, но при выключенном phone provider это
не доказывает настройку Twilio credentials, готовность SMS или использование иной БД.
Аналогично SAML next-key boolean не означает включённый SAML или проверенную rotation policy.
Проверен полный набор top-level полей public settings: site_url, redirect allowlist,
Auth TTL, SMTP и session enforcement этот endpoint не возвращает.
JWK advertisement не доказывает полную signing-key rotation policy или успешный login.
Legacy DB setting `app.settings.jwt_exp=3600` прочитан как DB configuration; его нельзя
выдавать за подтверждённый TTL фактически выдаваемых Auth tokens.

### Конкретный пробел: private Auth Management config

Доступный Supabase connector не предоставляет read-операции Auth config. Scoped
Management API credentials в environment/стандартных CLI credential files отсутствуют;
CLI и авторизованный Dashboard view для такого чтения не предоставлены. Агент не
извлекал OAuth token подключения и не запрашивал passwords/service-role secrets.

Поэтому **не подтверждены**:

- `site_url`, redirect `uri_allow_list` и callback origins;
- Auth `jwt_exp`, signing-key lifecycle, refresh rotation/reuse interval;
- session timebox/inactivity/single-session и MFA enforcement;
- SMTP readiness, password policy/leaked-password protection;
- Auth hooks, CAPTCHA и auth rate limits.

Также не проверена доставка писем: signup/OTP/password-reset probes создавали бы Auth
state и выходят за read-only scope. Наличие email provider не равно delivery readiness.

Минимальное действие для полного закрытия Auth audit — предоставить **sanitized read-only
export перечисленных Auth config полей** либо доступную агенту операцию их чтения в
разрешённом Management API/Dashboard. Для SMTP достаточно readiness flags/проверки settings,
не значения password; для hooks — enablement и безопасные targets без embedded credentials.
Секреты и passwords в чат не нужны. Это gate перед live Auth/callback rollout,
а не повод поручать владельцу SQL inventory, Git или local migration preparation.

## 6. Security advisors

`get_advisors` выполнен для **security**, **performance** и **health**. Каждый ответ
содержит `lints: []`, без ошибки инструмента. Remediation URLs отсутствуют, потому что
advisory findings не возвращены. Пустые advisors не проверяют отсутствующую application
schema, не доказывают A/B isolation и не закрывают перечисленные Auth config unknowns.

## 7. Расхождения с контрактом

| Контракт | Факт | Следствие для следующей фазы |
| --- | --- | --- |
| 4 application tables | Все отсутствуют | Initial additive migration; не upgrade старого enum/PK |
| Открытый category code и UI mapping | Каталога/категорий в DB нет | Реализовать утверждённый формат, сохранить точные subtype |
| Citation UUID, field_key/dedup/primary | Sources в DB нет | Реализовать many-source модель с нуля, без удаления старых citations |
| Private profiles и saved_places | Нет tables, пользователей 0 | Нет текущего backfill; lazy profile и empty Saved остаются контрактом |
| Явные least-privilege grants + RLS | Сейчас только platform/default privileges | Снять широкие defaults с новых 4 tables в той же транзакции |
| Browser/server SSR clients | В frontend нет Supabase integration | Подготовить typed foundation после явного старта 2B-2, не переключать UI |
| App migration history | Нет и в Git, и на сервере | Начать local tracked history; remote repair не нужен |
| Подтверждённый Supabase project | Теперь ACTIVE_HEALTHY | Старый блокер INACTIVE снят |
| Полностью проверенный Auth config | Доступны public settings, private config неизвестен | Отдельный read-only config gate до live Auth |

READY research card по-прежнему не означает published place, verified route или GPS track.
В фактической DB сейчас нет импортированного research catalog; этот аудит не подтверждает
качество 20 cards/83 source references и не меняет правила их отдельного review/import.

## 8. Готовность и конкретные задачи Phase 2B-2

**Можно отдельно разрешить подготовительную Phase 2B-2:** read-only baseline достаточна
для первоначальной local schema migration и изолированного client foundation.
Это условная готовность по scope: private Auth config gate фиксируется до live Auth,
hosted apply не разрешается. **Реализация в этом аудите не начата.**

1. Прочитать этот snapshot и recheck project/ref/main перед работой. Зафиксировать clean
   application baseline; не baseline/repair managed schemas или remote history.
2. Подготовить 4 таблицы/constraints/indexes, RLS и точные grants одним атомарным local
   migration artifact. Использовать утверждённые extensible category и per-field citation
   identity/primary; никакого closed пятизначного enum или PK(place_id,kind).
3. Проверить clean local replay, generated Database types и effective anon/authenticated
   ACL. Не полагаться на `postgres` smoke как на user test; привилегии на timestamps/ID,
   чужие записи, bulk changes и Saved UPDATE должны быть закрыты.
4. Выполнить local A/B/anon/anonymous-claim matrix из migration plan через Data API с
   раздельными user sessions. Проверить source visibility, dedup conflicts, primary swap,
   неизвестные категории, aggregation без дублирования cards/counts, desired-state saves.
   Hosted users/rows для этих тестов сейчас не создавались.
5. Подготовить request-scoped Next.js 16 server client, browser client и Proxy refresh
   с проверенной identity, async cookies, сохранением cache headers и private/no-store.
   Оставить существующий UI на demo; runtime не получает service_role/secret key.
6. До live Auth/callback behavior закрыть private Management config gap из раздела 5,
   проверить redirect allowlist/session policy/SMTP readiness. Public ES256 JWKS уже
   позволяет выбрать совместимый getClaims-based foundation, не доказывая revocation.
7. Подготовить только approved seed/manifest и recovery notes: исходные 5 slug/UUID
   сохраняются, research import отдельно требует raw pack и reconciliation. Не импортировать
   mock metrics, demo Profile/Saved defaults или research estimates как observed tracks.
8. Выполнить штатные build/typecheck/tests и contract/RLS checks на local реализации;
   сохранить отдельный reviewable diff. Hosted mutation/apply/deploy требуют новой явно
   запущенной задачи, свежей baseline и проверенного rollback/backup plan.

Backup/PITR и restore rehearsal не проверены, поэтому готовность к hosted apply не
выводится из healthy статуса и free plan metadata. Ошибку доступа/прав в будущей фазе
не исправлять выключением RLS, global grants или использованием service-role client.

## 9. Проверка отчёта

В этой ветке только Markdown и sanitized JSON. Application source, dependencies,
lockfile, migrations и Auth configuration не изменяются. Проверяются JSON consistency,
local links/anchors, secret patterns, отсутствие key values и doc-only diff.
Предыдущие frontend checks остаются применимыми к неизменному runtime source; новые
build/tests ради публикации отчёта не требуются. SQL replay и A/B tests не выдаются за
выполненные — они являются задачами отдельно запущенной реализации.
