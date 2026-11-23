# Almaway Guard — Current Engineering State
**Snapshot reviewed:** 2026-11-23 20:29 Asia/Almaty (UTC+05)
**Status:** Guard P0 visual integration verified on PR #9. Owner review and merge authorization pending. [Dated integration report](sessions/2026-11-23T20-28+05-codex-pr8-pr9-visual-review.md) · [Engineering session](https://app.notion.com/p/421d12b48f4981449d0cf588bc49a963).

This file records the **last observed** state and must be revalidated against GitHub/Notion at the start of every new agent session. It is a handoff summary, not a substitute for the actual branch HEAD. Only the integration owner should revise it, always with a dated session report.

## 1. GitHub source of truth

Repo: https://github.com/Arvex-studio/almaway-project-V1

| Branch/PR | Verified at snapshot | Purpose | State |
| --- | --- | --- | --- |
| [PR #9](https://github.com/Arvex-studio/almaway-project-V1/pull/9) · `codex/ag-guard-p0` | **Verified application `4ddaaf1288fd07166aed948b1ff6b9d109a9ccb9`; last read-back before this handoff `61a62002acda83b5639cfb0db931f92e6d86138f`** | P0 hiking-preparation app, new Guard MapHome, route catalog, plan and export | `Ready for review`, mergeable, not merged at inspection |
| [PR #8](https://github.com/Arvex-studio/almaway-project-V1/pull/8) · `codex/alpine-map-route-preview` | Application head `a6cae13448bb1939d24c592f83a1084b4ff8740b` | Accessible map card, provenance, source status, 320x568 UX | `Ready for review`, mergeable, not merged at inspection |
| `main` | `f5c787271cc9d4cbbc00e691581383bbbb9af488` at inspection | Released branch, prior to Guard P0 | No PR #8/#9 merge observed |

The evidence and handoff commits follow the tested application commit. [PR #9 commits](https://github.com/Arvex-studio/almaway-project-V1/pull/9/commits) gives the current branch tip.

## 2. P0 capabilities verified by code inspection

- Existing **Next.js 16.3.3 / React 19 / TypeScript / Tailwind v4 / MapLibre / MapTiler** application reused; no new runtime dependency was needed for the PR #9 changes according to PR.
- GuardMapHome: map + filters/search + list fallback, source-labeled point details, single MapLibre engine, selected place card with keyboard focus / Escape / focus return, manual saved state and precise distinction between point vs trail.
- Guard route catalog: **three guide/atlas variants** (Bukreev, Butakovsky Pass, Tuyuk-Su T1) + Furmanov geographic peak point. Their `geometry` is `missing`; no validated full trail for navigation or return ETA. OSM route line is a **fragment**.
- Day-plan: manual planned start/return/rest, estimated sunrise/sunset for Almaty timezone; **not** an AI hiking prediction or topographic shadow model.
- Weather API adapter: fixed points, Open-Meteo development/evaluation; shows provider freshness and degraded state, **production provider/licensing decision outstanding**.
- Packing: conditional checklist with source-aware caveats.
- Local private trip drafts/history in browser + manual copy, TXT download and OS share where supported; **not** cloud sync, actual delivery status or automated trusted-contact check-ins.
- `almaway-design` skill and Alpine UI design rules.

## 3. Current verification

The integrator ran the pinned pnpm install, typecheck, build, 16 Playwright tests (10 map, 6 missing-key), and diff checks. Matched production screenshots cover 320 × 568, 390 × 844 and 1440 × 900. A protected Vercel deployment of the application SHA passed the keyboard map-to-private-trip scenario at six widths from 320 through 1440. Across map and preparation, 12 axe scans reported zero violations. Weather returned its expected disabled-provider 503. Physical devices and assistive-technology sessions remain outstanding. [Screenshots and decisions](https://github.com/Arvex-studio/almaway-project-V1/tree/61a62002acda83b5639cfb0db931f92e6d86138f/docs/design/pr8-pr9-comparison) · [Per-width results](https://github.com/Arvex-studio/almaway-project-V1/blob/61a62002acda83b5639cfb0db931f92e6d86138f/docs/design/pr8-pr9-comparison/preview-checks.json) · [Tested Preview](https://almaway-project-v1-f0-preview-mbbfyfoi7-byicnq-3328s-projects.vercel.app/map).

GitHub REST confirmed #9 open, ready for review and clean at the evidence commit. #8 remains open. [T407](https://app.notion.com/p/421d12b48f49819dbab1d3ae8fe71039) moved from Ready to Review. [T304](https://app.notion.com/p/421d12b48f4981d89102ee978d07ba57) remains in Review with updated browser evidence.

## 4. Integration decision

- Retain PR #9's GuardShell, one MapLibre surface, catalog, preparation and private journal. Retain #8's focus on heading, Escape, focus return, separated attribution and source, and pinned details/save actions.
- Adapt #8's visible marker above the sheet and compact source/date strip. The camera measures the open panel and frames repeated list selections after panning. The status of full route geometry remains visible on 320 × 568.
- The comparison rejects the legacy demo metrics and third-party thumbnail. The existing desktop catalog and map stay side by side. No demo planner CTA was introduced. The previous state and decision history are in the [handoff preceding the comparison](sessions/2026-11-23T20-04+05-chatgpt-combo-handoff.md).
- The owner reviews #9. After acceptance and authorized merge, #8 can be closed as superseded.

## 5. Remaining blockers

- Full, permissioned and **independently verified continuous GPX route variants** with proper trailheads, directions, timing scope, dates, licensing, current seasonal access and hazards; field guide review.
- Human timing ground truth from actual consenting GPS/timed hikes; no validated ML. Don't claim AI predicts hiking time until hold-out tests.
- Commercial/public production weather license/provider and quota/terms decision.
- QA on **real physical devices**, weak/mobile network, assistive technology/screen readers, rights and risk review.
- No background check-in, real notifications, SOS automation, or official MЧС integration. Keep those disabled/unclaimed.
- Public release is **NOT** authorized by PR merge.

## 6. Ownership

| Owner | Next decision or work |
| --- | --- |
| Product owner | Review PR #9, screenshots and T407; authorize merge explicitly. Decide closure of #8 after #9 acceptance. |
| Integration owner | Record the owner's decision in the next dated session; retain the single Guard map and the regression tests. |
| Data and QA team | Verify GPX rights and trail continuity, weather terms, physical-device behavior and screen-reader use. |

## 7. Start the next session

Read [AGENTS](../../AGENTS.md), the [handoff protocol](HANDOFF_PROTOCOL.md), the [latest session](sessions/2026-11-23T20-28+05-codex-pr8-pr9-visual-review.md), [Engineering Control Room](https://app.notion.com/p/421d12b48f49813ba5d4cc384c252938) and both live PRs. Fetch current refs before edits. A PR approval or merge is separate from public release authorization.

## 8. Canonical navigation

- [ALMAWAY product HQ](https://app.notion.com/p/421d12b48f49811ba465d5fd175f3e05)
- [AG product PRD](https://app.notion.com/p/421d12b48f49812fa381f58e98ed699e)
- [AG implementation task board](https://app.notion.com/p/421d12b48f4981a19b74d2256a08449d)
- [UX Blueprint](https://app.notion.com/p/421d12b48f49817d9c38c8f748b94a5c)
- [Alpine design system](https://app.notion.com/p/421d12b48f4981108bd2e69a07e70f27)
- [Prior PR #8 screenshot proof](https://github.com/Arvex-studio/almaway-project-V1/pull/8)
- [Integrated PR #9 screenshot proof](https://github.com/Arvex-studio/almaway-project-V1/pull/9)

Updated by the PR #9 integration owner after live GitHub, Vercel and Notion readback. See the [append-only session report](sessions/2026-11-23T20-28+05-codex-pr8-pr9-visual-review.md).
