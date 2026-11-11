# ALMAWAY V1 — PHASE 2B-2: MIGRATION PREPARATION

Этот prompt — отдельный artifact для будущего явного запуска. **Его сохранение не запускает Phase 2B-2.**

---

Работай с каноническим `Arvex-studio/almaway-project-V1`.
Цель: подготовить проверяемые migrations и Supabase client foundation по контракту
Phase 2B-1, не меняя hosted БД, Auth settings, deployment или существующий интерфейс.

Прочитай актуальные HEAD/main, рабочее дерево, `AGENTS.md` и документы:

- `docs/backend-contract.md`
- `docs/backend-schema-proposal.md`
- `docs/backend-migration-plan.md`
- `docs/map-integration.md`
- `data/research/README.md`

Проверь merge Phase 2B-0 и наличие reviewed Phase 2B-1; зафиксируй baseline SHA.
Не затирай чужие изменения, используй отдельную ветку от актуального main.
Пользовательские инструкции имеют приоритет над навыками и шаблонами.

## Обязательный gate проекта

В 2B-1 правильный AlmaWay Supabase не был доступен. Через проверенное подключение
отображались только Gridy-проекты; их schema не исследовалась. Состояние AlmaWay
таблиц/Auth/RLS/history неизвестно. Не считать базу пустой.
При финальной проверке владелец сообщил о новом nickname `AlmawayV1`, но он ещё не
появился в разрешённых подключениях инструментов чата. Проверить его доступность заново,
не переносить старый blocked status на новую сессию без проверки.

До любых DB-related действий получи подтверждённый владельцем AlmaWay project ref,
организацию и соответствующее Supabase OAuth/MCP подключение. Проверь совпадение
project metadata и URL. Не используй Gridy, Qaskelen или иной проект, даже для тестирования.
Если правильного проекта/доступа нет — остановись на конкретной инструкции подключения,
сохрани blocked artifact и не начинай migrations/client implementation по догадке.
Не запрашивай passwords, service-role keys, SMTP/OAuth secrets или tokens в чате.

При наличии доступа проведи read-only аудит именно AlmaWay: schema/constraints/indexes,
policies/grants/exposed schemas/functions/views/triggers, Auth config без secrets,
migration history и drift, advisors. Сохрани evidence с ref/временем и unknowns.
Не выгружай PII из auth.users/sessions. Если инструмент не даёт Auth config/history,
запиши конкретный пробел и не объявляй аудит полным.

## Реализация после успешного gate

1. Сопоставь фактическую schema/history с четырьмя предложенными таблицами.
   При existing data проектируй additive delta. Не прячь несовместимость за IF NOT EXISTS,
   не ремонтируй hosted history и не удаляй старые policies без reviewed delta.
2. Проверь актуальные Supabase docs/changelog, локальные Next.js 16 docs, CLI version/help
   и target semantics. Pin tools/dependencies; используй pnpm из проекта.
   Новые Supabase зависимости/CLI устанавливай только в scope отдельно запущенной 2B-2.
   В финальной ревизии 2B-1 разрешена только чистая установка существующего lockfile для
   проверок frontend; это не разрешает backend implementation. Не ставь latest без проверки.
3. Подготовь будущие migration files штатным `supabase migration new <name>` после проверки help.
   DDL + constraints/indexes + explicit least-privilege grants + RLS policies должны быть
   одной атомарной schema migration; seed — отдельно. Никаких apply на hosted.
4. Сохрани пять slug/стабильные UUID, longitude/latitude и source metadata из каталога.
   Не импортируй demo distance/metrics, Profile stats, default Saved, чужую личность,
   Unsplash image без review прав или 15 published guide estimates как observed routes.
5. `profiles` приватные, owner-only 3 editable поля, lazy init; `saved_places` unique
   `(user_id, place_id)`, INSERT/DELETE без UPDATE, published-only insertion. Catalog writes
   только оператору, не всем authenticated. Не использовать user_metadata для полномочий.
   Различать anon и anonymous Auth JWT. Проверить RLS и grants независимо.
6. Подготовь generated `Database` types, browser `createBrowserClient`, request-scoped
   server `createServerClient` с async cookies и session refresh через Next.js `proxy.ts`.
   Проверка identity на private operations, отсутствие shared session/cache, сохранение
   cookie/cache headers. В runtime только publishable key + user session, не service_role.
   При неготовом env foundation не должен ломать текущий demo build; никаких fallback projects.
7. Подготовь typed repository/adapter boundary и желаемое состояние save/unsave
   вместо toggle; результаты не смешивать с demo. Не подключай foundation к существующему
   UI/provider в этой фазе, не добавляй login/admin screens и Auth providers.
8. Реально проверь migrations и A/B matrix на disposable **local Supabase** без remote
   credentials/production data. Не использовать другой hosted проект как sandbox.
   Прямые API assertions anon/A/B должны идти под public key + пользовательскими JWT,
   privileged fixture setup — отдельно. Если local tool/runtime недоступен, укажи not verified
   и не объявляй migration готовой к hosted apply.
9. Подготовь reviewed compensating rollback и recovery notes с учётом actual baseline.
   `DROP CASCADE`, remote reset, migration repair, отключение RLS и silent loss запрещены.
10. Запусти релевантные contract/RLS tests и штатные build/typecheck/test, проверь diff,
    secrets и отсутствие UI изменений. Сохрани результат отдельным reviewable artifact.

## Ограничения и результат

Не выполнять hosted migrations/DDL/DML, не создавать hosted users, не менять Auth settings,
не делать deploy/merge. Следующая задача hosted apply требует отдельного явного запуска
на проверенном AlmaWay с reviewed SHA, backup/restore и local acceptance evidence.
Не автоматизируй этот переход.

Итог: подтверждённый sanitized Supabase audit; предложенный delta и migration files;
typed clients/adapter foundation; local replay, A/B isolation и regression results;
rollback; remaining blockers и ограничения. Чётко раздели confirmed, proposed и not tested.
