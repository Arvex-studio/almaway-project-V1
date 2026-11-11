# Phase 2B-2 backend foundation

Implemented locally against main `d9ffe3ab0d2324213a2d2c6503ec88913e5e5b9a`.
The approved [contract](backend-contract.md), [schema proposal](backend-schema-proposal.md),
[migration plan](backend-migration-plan.md), and the complete read-only audit in
[PR #3](https://github.com/Arvex-studio/almaway-project-V1/pull/3) are the design inputs.
PR #3 was open/unmerged at intake; its ACTIVE_HEALTHY audit supersedes the earlier INACTIVE contract prose.
Read-only recheck through **AlmawayV1** confirmed `almaway-project-V1`, ref
`nwmmqtyfaumuaocspsur`, organization `mlghjrgokzobvflbqmay`, ACTIVE_HEALTHY,
Postgres metadata `17.6.1.166`, zero public tables and zero application migrations.
No hosted writes, Auth flows/settings changes, users, deploys, or merges were performed.

Shared dependency/env and CI-only dev-indicator changes are isolated in prerequisite [PR #5](https://github.com/Arvex-studio/almaway-project-V1/pull/5).
The foundation branch is stacked on that branch. Review/merge #5 first; then retarget the
foundation PR to main without duplicating its dependency changes. Frontend branches,
`app/`, components, original data modules, and demo behavior are untouched.

## Local setup and checks

Use Node 22 and pnpm 10.34.3 from `.mise.toml`/`packageManager`, with Docker available:

```sh
pnpm install --frozen-lockfile
node scripts/backend/local.mjs start
node scripts/backend/local.mjs reset
node scripts/backend/local.mjs migrate
node scripts/backend/local.mjs history
node scripts/backend/local.mjs check-types
node scripts/backend/local.mjs test
node scripts/backend/local.mjs advisors
pnpm build
pnpm typecheck
pnpm exec playwright install --with-deps chromium
pnpm test
node scripts/backend/local.mjs stop
```

To regenerate types, run `node scripts/backend/local.mjs types`. Types come from the
running **local** public schema and are formatted with the pinned TypeScript printer;
`check-types` repeats generation and compares bytes. Do not hand-edit generated types.

The guarded runner accepts only the listed operations, refuses linked directories and
remote configuration blocks, strips inherited Supabase CLI credentials/overrides, and
rejects CLI overrides in dotenv files. It uses project ID `almaway-phase-2b-2` and API
`http://127.0.0.1:55431` / SQL `127.0.0.1:55432`. There is no hosted link or remote target.
Tests obtain only local fixture credentials from CLI status in memory. The local signing
secret is generated in ignored `supabase/.temp/backend-fixture.json` with mode 0600.
Do not copy that file, CLI credential output, or raw logs into Git or reports.

CLI 3.1.0 uses its slim Docker backend (`experimental.stack`) here. Service distributions
are pinned by generated `supabase/supabase.lock`, including Postgres `17.11.0.018-r0`,
GoTrue `v2.197.0-r0`, and PostgREST `v16.5-r0`. Local/hosted Postgres major versions match;
this is not a claim that their patch versions or private Auth settings match. The normal
bootstrap file mask is applied only inside the runner so container Postgres can read its
bootstrap files; test secret files still use explicit 0600. This was necessary on the
execution host with umask 0077. Classic image layering exhausted its small Docker vfs disk;
using slim images and moving disposable build/package caches to temporary storage resolved it.

A CI workflow repeats reset, type generation consistency, API/session tests, advisors,
build/typecheck and existing map tests. It needs no hosted credentials. Local test files
intentionally avoid Playwright's `*.spec.*`/`*.test.*` names so they do not alter its discovery.
Two initial GitHub Actions attempts passed backend/build checks but the missing-key browser
case was blocked by Next's developer portal intercepting mobile navigation clicks. The shared
prerequisite now sets `devIndicators: false` only under CI using the supported Next.js option;
compile/runtime errors remain visible. Assertions are unchanged. CI also retains Playwright
failure context for diagnosis.

## Schema, authority and visibility

`20261111173352_almaway_v1_contract.sql` creates all four tables, constraints, indexes,
RLS and explicit REVOKE/GRANT in one transaction. New tables belong to `postgres`;
client roles never own them. Managed schemas and global default ACLs are unchanged.
`api.auto_expose_new_tables=true` recreates the audited broad default grants before the
migration removes them from these tables. The schema fails on existing objects instead
of hiding drift with `IF NOT EXISTS`.

| Table | anon | permanent authenticated user |
| --- | --- | --- |
| places / place_sources | Published SELECT | Published SELECT; no catalog writes |
| profiles | No access | Own SELECT/INSERT; UPDATE only display_name/hometown/bio; no DELETE or ID/timestamp writes |
| saved_places | No access | Own SELECT/INSERT/DELETE; INSERT only for a published place; no UPDATE/timestamp writes |

Private policies require owner UUID and signed `is_anonymous=false`; missing and true claims
fail closed. There are no user_metadata roles, profile signup triggers, application views,
SECURITY DEFINER functions, or admin RPCs. The equivalent `(select auth.jwt())` form keeps
JWT extraction in an initplan and also satisfies local advisors. Direct API tests prove
isolation independently of server guards. Catalog/integrity SQL uses postgres **only** for
fixture setup and metadata/constraint checks, never as evidence that RLS protected a user.
Local pg-safeupdate additionally rejects unfiltered PATCH/DELETE (`21000`); tests also
use broad filtered requests to exercise RLS rather than stopping at that safeguard.

Categories accept stable snake_case codes up to 64 characters, preserving subtypes.
Every citation has its own UUID, field key, URL/date, attribution and license. The dedup
identity is `(place_id,kind,field_key,source_url,retrieved_at)`; a partial unique index
allows at most one selected primary for each kind/field. Alternative sources survive.
Source URL byte limits and a maximal composite B-tree key are exercised by local SQL.
The pure source review helper distinguishes distinct, exact duplicate and conflicting
metadata/primary choices; it never overwrites conflicts. This is not a research importer.

## Clients, sessions and repositories

- `lib/supabase/client.ts`: typed browser client using the SDK's browser-context singleton.
- `lib/supabase/request-client.ts`: fresh server client for every request, no shared user state,
  no-store fetches, caller-owned cookie and cache-header adapter, `server-only` boundary.
- `lib/supabase/server.ts`: awaited Next.js 16 `cookies()`; separate read-only RSC and
  explicitly writable handler/action factories. Unexpected RSC cookie writes throw.
- `lib/supabase/proxy.ts`: verified `getClaims()`, forwards refreshed request cookies and all
  response cookie options/cache headers, preserves previous writes, private/no-store response.
- `proxy.ts`: refresh is off by default. `ALMAWAY_LOCAL_AUTH_ENABLED=true` enables it only
  with the exact local origin. Hosted activation throws until a later reviewed Auth phase.
- `lib/backend/repository.ts`: published catalogue/detail, lazy profile creation/editing,
  own saved links and desired-state save/unsave. Each private operation verifies identity.
  User IDs come from verified claims. No service-role/secret credential is used by runtime.

Browser/server env validation is lazy, allowing a credential-free demo build. It accepts
only the confirmed AlmaWay HTTPS origin or the exact loopback stack and a publishable-key
format; it never echoes values, accepts a secret/service-role key, or falls back to another
project. Opaque publishable keys cannot be cryptographically matched to a project by their
prefix; later hosted configuration must obtain the matching key through authorized discovery.
Legacy anon placeholders are removed in #5.

The repository uses INSERT ON CONFLICT DO NOTHING for desired saved=true, and DELETE for
saved=false. Retries preserve one row and its original timestamp; operations return the
confirmed current state. Separate users remain independent. Boundary errors are limited to
`unauthenticated`, `invalid_input`, `not_found`, `unavailable`; raw SQL/Auth messages are not
returned to callers. Draft/missing save targets use the same not_found response.

A left-joined unpublished saved place becomes null while its private link remains removable.
The public adapter returns one card per place, all citations, the exact categoryCode plus
reviewed RU label (unknown code falls back to itself), tag-only filters, [longitude,latitude],
empty route metrics, and no fabricated distance. Missing/ambiguous/incompatible coordinate
primaries are rejected. Profile visible saved counts can be derived from non-null list items.

Publication provenance is an editorial integrity rule, **not** a cross-table DB invariant.
RLS allows public reads of every published row directly. A privileged arbitrary edit can
publish an invalid row; the adapter rejects it, but cannot hide public API data. Before
arbitrary Dashboard editing is introduced, add a separately reviewed DB enforcement design.
Published sources must already be suitable for public disclosure. Image rights require
editorial review; none are included in this seed.

`getClaims()` verifies signature/expiry, not immediate server-side revocation. Use `getUser()`
when a future operation requires fresh Auth state; strict instantaneous token revocation
needs a separate session-aware model. Future private pages/handlers must remain request-time,
private/no-store, keep cookie/cache headers on their final response, and recheck identity.
UI cache clearing, stale response cancellation, CSRF/origin checks for future custom write
handlers, PKCE callbacks, login/logout screens, and provider flows belong to live integration.
They are not connected to the demo interface by this PR.

## Reviewed local seed

`supabase/seeds/reviewed-five.json` records fixed place/citation UUIDs and the input main SHA.
`seed.sql` inserts drafts and citations, validates compatible primary provenance, then
publishes only those five UUIDs atomically. It fails on collisions; it does not overwrite existing editorial rows.
This is a local reset seed, separate from application schema migration and hosted data rollout.

| Slug | Place UUID suffix | Coordinate provenance |
| --- | --- | --- |
| bolshoe-almatinskoe-ozero | 000000000001 | OSM relation/3427772, bounding-box-center |
| medeo | 000000000002 | OSM way/171504564, bounding-box-center |
| kok-tobe | 000000000003 | OSM node/12985379969, node |
| butakovskiy-vodopad | 000000000004 | OSM node/1843570839, node |
| furmanovka | 000000000005 | OSM node/3718134916, node |

Place UUID prefix is `10000000-0000-4000-8000-`; citation prefix is
`20000000-0000-4000-8000-` with the same suffixes. Coordinates, date `2026-09-30`, feature,
method and original filter tags match the existing map data. Attribution is
OpenStreetMap contributors, ODbL-1.0, retained per citation; see [OSM attribution](map-integration.md).
This review establishes traceability to the approved map source, not a new survey or access
safety check. Description/why are editorial copy; the lake copy was made neutral. Object
centres are not entrances/trailheads. No photographs, route geometry/metrics, estimates,
mock users, saved defaults, Profile stats, or the unavailable 20-place research pack are imported.

## Before any hosted apply

1. Review/merge the shared-file prerequisite and foundation in order; freeze the approved SHA.
2. Fresh read-only project/ref/org/schema/history/default ACL/advisor check against AlmaWay;
   reconcile any new objects or migrations instead of repair/reset/baseline guesses.
3. Verify an actual recovery point/export and restoration rehearsal; free-plan metadata is
   not proof of backup/PITR availability. Prepare a reviewed additive recovery plan.
4. Review hosted seed/publication separately; keep local fixtures and test Auth users local.
   Future research import requires the raw pack, per-field provenance reconciliation and rights review.
5. Retain the **private Auth Management configuration gate** before live Auth/callbacks:
   sanitized site_url/redirect allowlist, signing/TTL/refresh/session policy, MFA, SMTP readiness,
   password/leaked-password controls, hooks, CAPTCHA and rate limits. No secret export is needed.
6. Hosted mutation/deploy is a separate explicitly authorized task. A migration runner must
   record schema history, then read back schema/grants/RLS/advisors. Any hosted A/B fixture
   users require their own authorized test scope and cleanup plan.

On application incompatibility, keep additive tables and return to the demo provider. Never
solve permission errors by disabling RLS or adding a service-role client. A data-bearing
rollback requires restore/compensating review; do not drop user tables automatically.
