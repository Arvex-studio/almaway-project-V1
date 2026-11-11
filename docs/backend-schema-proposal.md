# Phase 2B-1 — минимальная схема: проект, не migration

**Предложение. Ничего из DDL/RLS ниже не применялось.** Завершающий
[read-only audit](audits/supabase-phase-2b-1-2026-11-11.md) подтвердил ACTIVE_HEALTHY,
PostgreSQL 17.6 и отсутствие всех четырёх application tables. Приватный Auth config
проверен не полностью; scope и подтверждённые grants/functions приведены в report.
Следующий шаг — только отдельно разрешённая local preparation по
[migration plan](backend-migration-plan.md); hosted apply этим документом не разрешён.
`supabase/migrations/` в Phase 2B-1 не создаётся.

## Модель

| Таблица | Владелец данных | Назначение |
| --- | --- | --- |
| `profiles` | Один постоянный Auth user, `id = auth.users.id` | Приватные display name, hometown, bio |
| `places` | Редакция AlmaWay; нет user owner | Расширяемый каталог, stable UUID + slug, точный category code, координаты, public content, статус публикации |
| `place_sources` | Редакция AlmaWay | Несколько независимых citations одного kind/field на место, с собственной атрибуцией |
| `saved_places` | Auth user, `user_id = auth.uid()` | Many-to-many relation, без копирования текста места |

Email/password/provider identities остаются в Supabase Auth и не дублируются в `profiles`.
Нет `profiles.role`, `is_admin`, пользовательских grants или публичного списка профилей.
Saved ссылается напрямую на `auth.users`, поэтому отсутствие лениво создаваемого профиля
не ломает сохранение. Удаление Auth user штатным privileged процессом удалит профиль
и saves через cascade; самообслуживание account deletion в этот контракт не входит.

## Предлагаемые DDL и ограничения

```sql
-- REVIEW ONLY. Не запускать на hosted или local в Phase 2B-1.
-- Требуется существующий Supabase auth schema; не vanilla Postgres migration.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or
    (char_length(btrim(display_name)) between 1 and 80)),
  hometown text check (hometown is null or
    (char_length(btrim(hometown)) between 1 and 100)),
  bio text check (bio is null or char_length(bio) <= 280),
  created_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    char_length(slug) <= 100 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  region text not null check (char_length(btrim(region)) between 1 and 160),
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  why text not null check (char_length(btrim(why)) between 1 and 2000),
  category text not null check (
    char_length(category) <= 64 and category ~ '^[a-z][a-z0-9]*(_[a-z0-9]+)*$'),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  tags text[] not null default '{}' check (
    tags <@ array['mountains', 'lakes', 'scenic', 'weekend']::text[]
    and array_position(tags, null) is null),
  image_url text check (image_url is null or
    (image_url like 'https://%' and char_length(image_url) <= 2048)),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table public.place_sources (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  kind text not null check (kind in ('coordinates', 'content', 'image')),
  field_key text not null check (
    char_length(field_key) <= 64 and field_key ~ '^[a-z][a-z0-9]*(_[a-z0-9]+)*$'),
  provider text not null check (char_length(btrim(provider)) between 1 and 100),
  source_url text not null check (
    source_url like 'https://%' and octet_length(source_url) <= 2048),
  retrieved_at date not null,
  is_primary boolean not null default false,
  method text,
  feature text,
  attribution text not null check (char_length(btrim(attribution)) between 1 and 1000),
  license text not null check (char_length(btrim(license)) between 1 and 200),
  unique (place_id, kind, field_key, source_url, retrieved_at),
  check (kind <> 'coordinates' or (
    field_key = 'coordinates'
    and method is not null and char_length(btrim(method)) between 1 and 100
    and feature is not null and char_length(btrim(feature)) between 1 and 1000
  ))
);

-- Максимум один выбранный источник для конкретного kind/field, остальные сохраняются.
create unique index place_sources_primary_idx
  on public.place_sources (place_id, kind, field_key) where is_primary;

create table public.saved_places (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- PK (user_id, place_id) уже индексирует ownership predicate.
create index saved_places_user_order_idx
  on public.saved_places (user_id, created_at desc, place_id);
-- Обратный FK lookup при удалении place не покрывается первым столбцом PK.
create index saved_places_place_idx on public.saved_places (place_id);
```

`gen_random_uuid()` доступна в подтверждённом PostgreSQL 17.6; устанавливать extension
ради UUID этой схемы не требуется.
FK `place_sources.place_id` покрыт первым столбцом dedup UNIQUE index. Небольшому каталогу
не нужны GIN tags, spatial index и speculative performance indexes. На росте проверять EXPLAIN.
`created_at` задаётся БД и недоступен для записи обычному клиенту. `updated_at` и его trigger
не вводятся без потребителя; это минимизирует функции и privilege surface.

### Категории без закрытого enum

`category` — стабильный точный snake_case код, а не UI chip и не разрешение на публикацию.
CHECK проверяет только формат/длину. Добавление нового кода не требует DDL; новая категория
проходит editorial review и добавляется в версионируемый adapter mapping. Не сводить
`summit` к `mountain`, `lake_group` к `lake` или `national_park` к «Горы» в хранилище.
Существующие `peak`/`mountain` допустимы как отдельные legacy codes; автоматически
переписывать их нельзя. Прямой импорт исследовательского snake_case кода сохраняет его
побайтно. Для внешнего формата/синонима нужен явный reviewed mapping и исходное значение
в import manifest, не эвристика slugify/перевода.

Конкретные RU labels и отношение к текущему UI заданы в
[контракте категорий](backend-contract.md#категории-и-преобразование-в-ui).
Незнакомый корректный код сохраняется, label по умолчанию равен коду, category-derived
filters пусты; это не делает строку unpublished автоматически и не выдумывает её свойства.
Для production publication желателен reviewed RU label. Не создавать fifth taxonomy table
или ENUM только ради текущих категорий.

### Несколько источников и дедупликация

Одна строка — citation конкретного поля, не «все сведения о месте из одного provider».
`kind` — широкий тип (`coordinates`, `content`, `image`); `field_key` — точный snake_case
ключ поддерживаемого поля, например `coordinates`, `description`, `category`, `image_url`.
Несколько ссылок одного kind/field различаются URL; один URL может обосновывать разные
поля и поэтому иметь отдельные строки. `id` даёт стабильную identity независимо от
редактирования citation. `retrieved_at` в dedup key сохраняет отдельные датированные
снимки источника, не перезаписывая старый при повторной проверке.

- Dedup identity: `(place_id, kind, field_key, source_url, retrieved_at)`. Все её части
  NOT NULL; URL ≤ 2048 **байт**, ASCII field key ≤ 64, чтобы composite B-tree key не
  превышал допустимый размер из-за многобайтных URL. В будущем local replay проверяет boundary.
- Canonical URL: parse HTTPS, lowercase host, убрать default port. Path case, trailing
  slash, query и fragment (включая `#page=` у PDF) сохраняются; не вырезать query/fragment
  или объединять разные документы по домену. Raw URL и mapping сохраняются в import manifest.
- Повтор exact citation с теми же metadata → существующий `id`, без новой строки.
  При совпадении dedup key и различии attribution/license/provider/method/feature —
  конфликт на review, не `ON CONFLICT DO UPDATE` и не молчаливое `DO NOTHING`.
  До разрешения сохранить оба input records в manifest и не объявлять импорт завершённым.
- Attribution/license хранятся **на каждой citation**, не на месте или provider. Не терять
  их при агрегации; неизвестные обязательные metadata отмечаются в manifest для review,
  не заполняются вымышленной лицензией. Raw research pack остаётся неизменным.
- `is_primary` выбирается редакционно, не по порядку rows/URL и не числом цитирований.
  Partial UNIQUE обеспечивает ≤1 primary на kind/field; publication validator требует
  ровно один для `coordinates/coordinates`. Смена primary — один admin transaction,
  сначала снять старый флаг; альтернативные citations не удалять.
- Для текущего `CoordinateSource` выбранный primary должен быть `OpenStreetMap` с
  `node` или `bounding-box-center`; остальные providers/methods можно хранить без подмены
  под OSM. Если primary несовместим, текущий Map DTO не выдаётся до review/отдельного
  изменения frontend contract. Общая source schema не ограничена одним provider.

Дополнительные таблицы источников, polymorphic ACL, JSON metadata store и definer RPC
для этого не нужны. Поддержка множества citations не доказывает их независимость,
достоверность, согласие по значению поля или наличие безопасного GPS track.

`tags` нормализуются как множество в admin importer. `latitude/longitude` checks исключают
выход за диапазон, включая infinity/NaN средствами сравнений Postgres. Схема не доказывает
точность географии. URL checks ограничивают формат; они не дают права server-side fetch.
Если позже появится загрузчик remote media, нужны отдельные SSRF/host ограничения.

Publication validator (будущая реализация/seed review) обязан проверить primary coordinate
citation и её соответствие сохранённой точке, OSM object URL для текущего Map adapter,
license/attribution каждой citation, метод, date и image source/права.
Схема допускает draft без source; отсутствие child row нельзя проверить обычным CHECK.
V1 не добавляет definer RPC/циклические FK ради публикации. Admin edits только через
reviewed pipeline, а public adapter исключает повреждённую запись с диагностикой без PII.
Если понадобится произвольное редактирование через Dashboard, усилить publication invariant
отдельным reviewed constraint trigger до предоставления такого доступа.

## Матрица доступа

`anon` = visitor без Auth session. Supabase anonymous Auth account — отдельный случай:
он имеет роль `authenticated`, поэтому private policies дополнительно требуют
`(auth.jwt()->>'is_anonymous')::boolean is false`. Missing claim закрывает private доступ.
Не включать anonymous sign-ins; в публичном Auth settings snapshot они выключены.

| Объект / действие | Visitor `anon` | Постоянный authenticated owner | Другой authenticated user | Администратор приложения |
| --- | --- | --- | --- | --- |
| Published places/sources SELECT | Да | Да | Да | Как обычный user |
| Draft places/sources SELECT | Нет | Нет | Нет | Нет специального bypass |
| Catalog INSERT/UPDATE/DELETE | Нет | Нет | Нет | Нет клиентского доступа |
| Profile SELECT/INSERT | Нет | Только свой | Нет | Только собственный профиль |
| Profile UPDATE | Нет | Только 3 editable поля своего | Нет | Без расширенных прав |
| Profile DELETE / ID/timestamp writes | Нет | Нет | Нет | Нет |
| Saved SELECT | Нет | Только свои links | Нет | Только свои |
| Saved INSERT | Нет | Только свои + published place | Нет | Только свои |
| Saved DELETE | Нет | Только свои, в том числе unpublished place | Нет | Только свои |
| Saved UPDATE / ownership transfer | Нет | Нет | Нет | Нет |

**Platform admin / migration operator** отличается от app user. Только доверенный оператор
через Dashboard/защищённый workflow может менять каталог, grants и schema. Используется
выданный платформой privileged доступ, не boolean из `user_metadata` и не открытый admin API.
Privileged SQL/secret credentials обходят RLS и требуют собственной операционной защиты;
их не передавать frontend, обычному Next server client, чатам или Git. App admin roles,
moderation UI, отдельная admin-таблица/claim и глобальное чтение профилей вне V1.
Если появится отдельная задача admin UI, проектировать отдельный authorization contract;
не расширять все authenticated policies.

## Предлагаемые grants и RLS

Пример рассчитан на **новые, ранее не существовавшие четыре таблицы**. Если они уже есть,
нельзя считать REVOKE table-level достаточным: проверить также column grants, inherited
roles, views/RPC и старые permissive policies. Не использовать `IF NOT EXISTS` для сокрытия drift.

```sql
-- REVIEW ONLY. Применять вместе с DDL в одной будущей транзакции.
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.place_sources enable row level security;
alter table public.saved_places enable row level security;

revoke all on table public.profiles, public.places,
  public.place_sources, public.saved_places from PUBLIC, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.places, public.place_sources to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, display_name, hometown, bio) on public.profiles to authenticated;
grant update (display_name, hometown, bio) on public.profiles to authenticated;
grant select, delete on public.saved_places to authenticated;
grant insert (user_id, place_id) on public.saved_places to authenticated;

create policy places_read_published on public.places
  for select to anon, authenticated using (status = 'published');

create policy place_sources_read_published on public.place_sources
  for select to anon, authenticated using (exists (
    select 1 from public.places p
    where p.id = place_sources.place_id and p.status = 'published'
  ));

create policy profiles_read_own on public.profiles
  for select to authenticated using (
    id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (
    id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );
create policy profiles_update_own on public.profiles
  for update to authenticated using (
    id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  ) with check (
    id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );

create policy saved_places_read_own on public.saved_places
  for select to authenticated using (
    user_id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );
create policy saved_places_insert_own_published on public.saved_places
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
    and exists (
      select 1 from public.places p
      where p.id = saved_places.place_id and p.status = 'published'
    )
  );
create policy saved_places_delete_own on public.saved_places
  for delete to authenticated using (
    user_id = (select auth.uid())
    and (select (auth.jwt()->>'is_anonymous')::boolean) is false
  );
```

Не нужны profile signup trigger и `SECURITY DEFINER`: профиль создаётся лениво после
проверенного входа с правами самого user. Пустой профиль допустим; имя из provider metadata
может быть лишь editable display input после валидации, никогда не role/authorization.
Обычный `UPDATE` требует SELECT policy и обе ownership проверки; column grants дополнительно
запрещают изменение ID и `created_at`. Saved UPDATE не предоставляется вообще.

Таблицы и политики добавляются одной транзакцией, чтобы не было окна доступа без RLS.
Не менять глобальные default privileges и grants для unrelated tables. Отсутствие table
grant означает permission error, наличие RLS без policy — отсутствие доступных строк.
Оба механизма проверяются отдельно через Data API, не только SQL Editor от имени postgres.
FORCE RLS для owner/BYPASSRLS не является заменой этой модели; privileged operator остаётся
доверенным. Новые views/RPC в V1 не нужны и не должны обходить private policies.

## Security review Phase 2B-1

Выполнен статический design review DDL, grants и каждой policy, сопоставленный с
frontend types и Next.js session contract. Это не runtime-проверка RLS: SQL не исполнялся,
настоящие Auth users A/B не создавались. Существенных обходов ownership в предложенных
политиках не найдено при условии новых таблиц, отсутствия дополнительных grants/policies
и корректного Supabase Auth JWT. Эти предпосылки должны быть проверены аудитом AlmaWay.

| Попытка обхода | Контроль в предложении | Что ещё проверять в Phase 2B-2 |
| --- | --- | --- |
| A передаёт известный UUID B в SELECT/INSERT/UPDATE/DELETE | RLS ownership на каждой private операции; ID из server session, не body | Прямые Data API вызовы без server-фильтра; affected rows и неизменность B |
| A меняет владельца или время записи | Column grants profiles; отсутствие Saved UPDATE; USING и WITH CHECK для Profile | Явный PATCH ID/timestamp и bulk requests |
| Гость или anonymous Auth user обращается к private таблицам | У anon нет grants; authenticated дополнительно требует signed `is_anonymous=false` | JWT с true и отсутствующим claim не получает private доступ |
| User подставляет admin role через metadata | Нет app-admin bypass и role field; user_metadata не участвует в policies | Подмена metadata не расширяет grants; проверка existing RPC/views |
| User читает draft по ID, slug или source | Published-only places policy; каждая citation проверяет опубликованного parent | Несколько sources одного поля, primary и non-primary, child ID и joins |
| A подделывает cookie либо B получает response A | Проверенный JWT, request-scoped server client, private/no-store и отдельные cookie jars | Invalid/expired token, refresh, A→B switch, parallel SSR и stale responses |
| Старая permissive policy или column grant расширяет доступ | Перед delta обязательный inventory; пример применим только к новым таблицам | PostgreSQL складывает permissive policies через OR; REVOKE table-level не удаляет column grants |
| Admin публикует запись без provenance | Reviewed validator/transaction и DTO validation | Это integrity boundary, не RLS boundary: прямой Data API читает опубликованные строки без adapter |

Последний пункт — осознанное ограничение минимальной схемы: provenance обязательна
по редакционному контракту, но наличие source не обеспечено DB constraint. Нельзя
считать adapter защитой конфиденциальных полей или доказательством DB-инварианта.
Все поля published places/sources должны быть публичными уже на уровне хранения.
При вводе произвольного admin editing DB enforcement требует отдельной реализации.

Category extension и новая source identity не добавляют клиентских write grants и не
меняют owner predicates. `place_sources_read_published` по-прежнему связывает каждую
строку через `place_id`, а не через её `id` или `is_primary`: все approved citations
published parent публичны. Ни поле `is_primary`, ни category code не являются ACL.
Sources для draft скрыты независимо от числа и primary flag. Публичные joins должны
агрегировать sources как массив по place, не размножать cards, saved rows и counts.

Для сессии сверены Next.js 16 `proxy.ts` и async `cookies()`: refresh в Proxy не отменяет
проверку identity в каждом private action/handler и не заменяет RLS. Не принуждать
SDK cookies к HttpOnly в browser-client архитектуре без проверки совместимости:
browser SSR client должен управлять сессией через поддерживаемый SDK механизм.
Secure/SameSite/path и response headers задаются по актуальной документации выбранного SDK,
а не вторым самописным token store. Logout не гарантирует мгновенный отзыв выданного JWT;
эта граница явно описана в основном контракте.

## Seed boundary

Будущий explicit mapping пяти slug → UUID фиксируется в reviewed seed; значения не
вычисляются заново на каждом deploy. Сначала draft place + все citations в одной
транзакции, validator, затем publish. Не seed mock users, Profile stats и Saved defaults.
`retrieved_at` переносится из источника (`2026-09-30`), не подменяется датой импорта.
OSM атрибуция: OpenStreetMap contributors, ODbL-1.0, соответствующий object URL.
Нет автоматической публикации Unsplash image без review прав; нет импорта demo metrics.
15 research guide estimates и OSM demo-route остаются вне этих seeds.
Будущий research import расширяет этот baseline по отдельному reviewed manifest;
пять demo places не являются ограничением каталога. Политика READY ≠ published/verified track.
