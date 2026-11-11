# Phase 2B-1 — отдельный migration plan

Статус: **план, не выполнен**. AlmaWay Supabase недоступен; schema, Auth, grants,
RLS и hosted migration history неизвестны. Этот документ не разрешает hosted mutations.
Основание: [контракт](backend-contract.md), [схема](backend-schema-proposal.md).
Документальный security-review и frontend regression checks завершены в Phase 2B-1;
они не заменяют выполнение будущих migrations и A/B runtime tests. Финальная проверка
доступа: nickname `AlmawayV1` ещё не виден инструментам текущего чата, единый блокер
и минимальное действие владельца зафиксированы в разделе 1 контракта.

## Порядок и точки остановки

### 0. Подтвердить доступ и фактическую baseline

Владелец предоставляет project ref/organization и project-scoped read-only доступ
к AlmaWay по инструкции в контракте. Ни Gridy, ни Qaskelen не являются substitute.
Без этого остановиться на документах, не создавать/линковать новый проект автоматически.

Снять read-only inventory: table/column definitions, constraints/indexes,
RLS/policies/grants/default ACL, views/functions/triggers/ownership, exposed schemas,
Auth config без secrets, security advisors, migration versions/names и drift.
Сохранить sanitized audit artifact со временем, ref и unknowns.

Далее выбрать ветку плана по evidence:

| Состояние после аудита | Действие |
| --- | --- |
| Четырёх таблиц нет, migration history согласована | Подготовить additive migrations по контракту |
| Таблицы уже есть | Сравнить типы, данные, grants и policies; сделать non-destructive delta, не CREATE поверх существующего |
| Объекты есть, но в history нет | Согласовать baseline capture; импорт схемы в Git без изменения hosted schema/history |
| Непонятный history drift/расхождение Git и hosted | Остановить apply; отдельный reviewed reconciliation plan |
| Не хватает чтения Auth/policies/history | Зафиксировать конкретный пробел и получить недостающий read-only доступ |

Нельзя считать удалённую БД пустой по отсутствию migrations в Git. Нельзя использовать
`migration repair` и редактировать remote migration table для получения «зелёного» результата.

### 1. Подготовить Phase 2B-2 отдельным изменением

Рекомендованный scope Phase 2B-2 после явного запуска: audit + migration files +
изолированная local verification + подготовленные clients, **без применения к hosted**
и без переключения существующего UI. Следовать [отдельному prompt](phase-2b-2-implementation-prompt.md).

Проверить версии Node/pnpm из `.mise.toml`/`package.json`, Supabase CLI `--version` и
`--help` соответствующих команд. Changelog CLI v3 изменил local/remote defaults;
никаких команд с подразумеваемой hosted целью. Pin конкретную CLI version,
не устанавливать latest без проверки. CLI сейчас не обнаружен в PATH; не устанавливался.

Использовать `supabase migration new <name>` для создания будущих файлов (сначала
проверить installed CLI help); SQL из Markdown не является готовой migration.
Не изобретать timestamps и не запускать `apply_migration` для итераций локального прототипа.
Если выбран local scratch/diff workflow, final artifacts должны воспроизводить схему
с нуля и содержать grants/RLS; отсутствие diff после ручного редактирования не proof.

Предлагаемые единицы будущих изменений (имена, не реальные файлы):

1. `almaway_v1_contract`: четыре таблицы, constraints, indexes, explicit grants, RLS и
   policies в **одной транзакции**. Без signup trigger, definer RPC, views, PostGIS и Auth config changes.
2. `almaway_v1_reviewed_places`: отдельный reviewed data seed с фиксированными UUID,
   пятью slug и coordinate provenance; публикация только после проверки, без mock metrics/images
   с неподтверждёнными правами. При existing data не переписывать редакционные данные upsert-ом.
3. Generate `Database` TypeScript types из проверенной локальной схемы; clients/adapter
   foundation отдельным code diff, не подключённым к текущему demo UI.

Если audit выявит existing tables, номера/содержание корректируются в delta plan до генерации.
Credentials только через OAuth/локальное secret storage; никаких паролей или service-role
значений в prompt, SQL, tests, output и Git.

### 2. Проверить исключительно на изолированном local Supabase

Без пользовательских/production данных и без другого hosted проекта. Local target
должен быть явно верифицирован; нельзя полагаться только на default flags или текущий
`supabase link`. Не запускать даже local tests с inherited remote credentials.

- Clean migration replay; constraints, FK и grants; generated types совпадают со schema.
- Повторный запуск migration runner: нет pending migrations и дублей; не требовать,
  чтобы произвольный повтор CREATE SQL был idempotent.
- Seed: ровно 5 ожидаемых slug, один coordinate source на place; совпадают координаты,
  методы, дата, UUID mapping. Image и metrics не подменены mock claims.
- Public DTO соответствует MapSurface/PlaceDetails, lon/lat не перепутаны,
  неизвестный/draft slug не возвращается, filters сохраняют нынешнюю семантику.
- A/B tests ниже через Supabase Data API с publishable key + раздельными user JWT,
  не через service_role. SQL harness дополнительно допустим, но не заменяет Data API тест.
- Read-only security advisors в local при поддержке, review новых exposure warnings.
  Невозможность запустить проверку указывается как not verified.
- `pnpm build`, `pnpm typecheck`, `pnpm test` и targeted contract/RLS tests.
  В будущем UI остаётся demo, существующие Map tests должны оставаться зелёными.

### 3. Будущий hosted apply — за рамками Phase 2B-1 и рекомендуемого 2B-2

Только отдельная явно запущенная задача с доступным AlmaWay, reviewed migration SHA,
зафиксированной baseline/history, проверенными backup/export и restore procedure.
Проверить реальную доступность backup/PITR — тариф и состояние сейчас неизвестны.
Не обещать восстановление без проверенного recovery point и restoration rehearsal.

До apply: перечитать main/AGENTS, убедиться в отсутствии новых migrations/drift,
подтвердить именно AlmaWay ref, закрыть seed review и local A/B acceptance, подготовить
rollback artifact. Hosted mutations выполняются migration runner, чтобы schema и history
не расходились; не ad hoc SQL в обход history. Никаких Auth settings/deploy по умолчанию.

После apply в этой отдельной задаче: catalog metadata и migration history read-back,
grants/RLS/advisors, public read smoke. A/B проверки, которые создают users/rows,
в hosted не являются read-only: их делать лишь в явно разрешённом AlmaWay test environment
с отдельными test accounts и cleanup plan. В текущем этапе они не выполнялись.

## Матрица пользовательской изоляции A/B

Фикстуры исключительно local: постоянные Auth users A и B с разными browser cookie jars,
published places P/Q и draft D, sources у всех; отдельный anon client.
Local admin credential только создаёт fixtures и проверяет итоговые counts.
Все assertions доступа выполняются clients anon/A/B. Никогда не печатать их токены.

| Проверка | Ожидаемый результат |
| --- | --- |
| anon читает P/Q, detail по slug | Published DTO и public provenance; не D |
| anon обращается напрямую к sources D по известному ID | Нет rows; не утечка через child table |
| anon читает/меняет profiles и saves | Нет доступа (grants deny); никаких private payload |
| A создаёт свой profile; повторная lazy init | Одна строка; повтор не стирает профиль |
| A читает/меняет profile B по известному UUID | SELECT пуст; UPDATE 0 rows; B не меняется |
| A пытается INSERT profile с id B | RLS denial, B не меняется |
| A меняет id/created_at своего profile, DELETE profile | Permission denied; identity/timestamp/row неизменны |
| A меняет свои display_name/hometown/bio | Success, returned row A; лимиты и null работают |
| A сохраняет P дважды, включая concurrent retry | Одна строка `(A,P)`; исходный created_at сохраняется |
| B сохраняет тот же P | Отдельная строка `(B,P)`, независимая от A |
| A без фильтра или с `user_id=B` читает saved_places | Только свои / пусто для B; count не раскрывает B |
| A INSERT save с user_id B | RLS denial, ни B row, ни перезапись |
| A UPDATE save: user_id B / place_id Q / timestamp | Нет UPDATE grants; state неизменен |
| A DELETE save B по полному ключу | 0 rows; B save остаётся |
| A удаляет свой P дважды | Идемпотентный desired absent; B save остаётся |
| A сохраняет draft D / отсутствующий UUID | Операция не создаёт row; web-boundary возвращает общий not_found |
| Local admin снимает P с публикации после сохранения | A/B link приватно остаётся, joined place null, source скрыт; удалить свой link можно |
| A/B пытаются писать places/sources, включая publish | Permission denied; каталог неизменен |
| A выставляет user_metadata.role/is_admin | Не получает никаких дополнительных прав |
| Anonymous Auth JWT и signed JWT без is_anonymous claim | Public read допустим, profiles/saves недоступны, несмотря на authenticated role |
| Missing/invalid JWT или expired JWT без рабочего refresh | Private server boundary отклоняет запрос; public доступ остаётся только anon |
| Expired access JWT с действующим refresh cookie | Сессия того же user обновляется, cookies/cache headers передаются без утечки |
| A sign-out → B sign-in в том же browser | Ноль профиля/saves A в state и SSR; запоздалый ответ A игнорируется |
| Параллельные A/B SSR requests + token refresh | Разные request clients; Set-Cookie/cache headers не переносят сессию A к B |
| Duplicate retry / network failure | Нет double-toggle; UI не сообщает успех до подтверждения и корректно отменяет optimistic state |
| Local admin удаляет Auth user A / place Q | Cascade только соответствующих profile/saves/sources; B и другие places не повреждены |

Для RLS denied UPDATE/DELETE API может вернуть success с 0 affected rows. Assertions
проверяют final state и returned data, а не только HTTP status. Прямые запросы к таблицам
нужны даже если Server Actions дополнительно фильтруют user ID: проверяем независимую защиту БД.

Session/cache и UI integration assertions исполняются в фазе подключения live flows;
в 2B-2 тестировать подготовленные handlers/clients без изменения текущего интерфейса.
Этот план не утверждает, что A/B isolation уже проверена.

## Rollback и восстановление

| Сбой / стадия | Предусмотренное действие |
| --- | --- |
| Только документы/PR | Отменить doc commit; базы и UI не затронуты |
| Local draft migration | Откатить/пересоздать только disposable local stack и повторить replay |
| Ошибка DDL внутри одной транзакции | Transaction rollback; проверить schema и history, не предполагать успех/откат по одному exit code |
| Apply успешен, но клиент несовместим | Сохранить additive tables; остановить rollout/вернуть demo или предыдущую версию кода без удаления данных |
| Обнаружена утечка доступа | Остановить private flow, reviewed corrective migration закрывает лишние grants/policies; не выключать RLS |
| Seed ошибочен | По seed manifest снять публикацию/исправить только добавленные записи; учитывать сохранения пользователей |
| Нужно убрать новую schema до появления данных | Reviewed compensating migration: явное удаление конкретных policies/indexes/tables в обратном порядке |
| Пользовательские данные уже появились | Предпочитать forward fix; destructive rollback только после export/restore проверки и отдельного разрешения |

Для **новой пустой** схемы обратный dependency order: `saved_places`, `place_sources`,
`places`, `profiles`. Не применять DROP CASCADE и не трогать `auth`, `storage`, `realtime`
или ранее существовавшие объекты. Удаление через новую compensating migration сохраняет
честную историю; не удалять уже применённые migration files/remote versions.
Если аудит обнаружит существующие таблицы, этот empty-schema rollback неприменим:
нужен план возврата только внесённых delta, включая прежние grants/policies.

Перед destructive operation определить затронутые row counts/dependencies, сохранить
данные и проверенный recovery point. Backup restore может откатить и другие изменения:
его область и допустимая потеря данных согласуются отдельно. Пока backup/PITR AlmaWay
не проверен, безопасный default — оставить additive schema и исправлять вперёд.

## Definition of ready / done

**Ready for 2B-2:** выбран подтверждённый AlmaWay ref и read-only доступ, аудит заполнен,
решён existing-schema/history путь, этот контракт reviewed, 2B-2 явно запущена.

**Done for 2B-2:** отдельный reviewable diff с audit evidence, migration/rollback artifacts,
local replay/A/B результатами и limitations, typed clients foundation; hosted DB/Auth/UI
не изменены. Без доступа — только blocked status и инструкция подключения, без обхода.
