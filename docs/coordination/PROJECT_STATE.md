# Almaway Guard — Current Engineering State
**Snapshot checked:** 2026-11-23, after 21:02 Asia/Almaty (UTC+05).  
**Status:** **P0 merged into `main` with owner's explicit approval**. PR #8 closed as superseded. **Not approved for public launch or outdoor-safety use.**

This is the current engineering handoff, not a replacement for live GitHub/Vercel/Notion checks. See the dated [merge-and-closure evidence](sessions/2026-11-23T21-03+05-chatgpt-pr9-merge-pr8-close.md) and [prior comparative review](sessions/2026-11-23T20-28+05-codex-pr8-pr9-visual-review.md). Only the integration owner updates this file after live readback.

## 1. GitHub source of truth

Repo: https://github.com/Arvex-studio/almaway-project-V1

| Branch / PR | Observed SHA and exact event | Status |
| --- | --- | --- |
| `main` | [Merge commit `3c7cd916b44cf6f3ae9678898703998cb85368e6`](https://github.com/Arvex-studio/almaway-project-V1/commit/3c7cd916b44cf6f3ae9678898703998cb85368e6), verified as `main` HEAD immediately after merge, followed by documentation-only commits | **Guard P0 integrated into main** |
| [PR #9](https://github.com/Arvex-studio/almaway-project-V1/pull/9), branch `codex/ag-guard-p0` | Reviewed head `fcdeb557e49b53fc3a592cf9a16ef769e592a2b3`. Merged **2026-11-23 21:01:42 UTC+05**. | **Merged** |
| [PR #8](https://github.com/Arvex-studio/almaway-project-V1/pull/8), branch `codex/alpine-map-route-preview` | Reference head `a6cae13448bb1939d24c592f83a1084b4ff8740b`. Closed **2026-11-23 21:02:24 UTC+05**. | **Closed WITHOUT merging — superseded by #9** |

GitHub preflight used `expected_head_sha=fcdeb55` and merge method `merge` to retain the history. Latest main SHA will advance with any later handoff documentation commits; **always fetch the live ref rather than relying on the merge SHA alone**.

Vercel **automatically** created a production-target deployment on the merge into `main` (commit `3c7cd916`), recorded as `READY`, and another production-target `READY` deployment for the next documentation commit. **No manual deploy/promotion was executed here.** The project currently reports SSO protection enabled for `vercel.app` domains (`all_except_custom_domains`) and `live=false`; do not infer general public access or launch approval from a production-target build. Do not change Vercel domain/protection/settings without owner authorization.

## 2. P0 capabilities verified by code inspection

- Existing **Next.js 16.3.3 / React 19 / TypeScript / Tailwind v4 / MapLibre / MapTiler** application reused; no new runtime dependency was needed for the PR #9 changes according to PR.
- GuardMapHome: map + filters/search + list fallback, source-labeled point details, single MapLibre engine, selected place card with keyboard focus / Escape / focus return, manual saved state and precise distinction between point vs trail.
- Guard route catalog: **three guide/atlas variants** (Bukreev, Butakovsky Pass, Tuyuk-Su T1) + Furmanov geographic peak point. Their `geometry` is `missing`; no validated full trail for navigation or return ETA. OSM route line is a **fragment**.
- Day-plan: manual planned start/return/rest, estimated sunrise/sunset for Almaty timezone; **not** an AI hiking prediction or topographic shadow model.
- Weather API adapter: fixed points, Open-Meteo development/evaluation; shows provider freshness and degraded state, **production provider/licensing decision outstanding**.
- Packing: conditional checklist with source-aware caveats.
- Local private trip drafts/history in browser + manual copy, TXT download and OS share where supported; **not** cloud sync, actual delivery status or automated trusted-contact check-ins.
- `almaway-design` skill and Alpine UI design rules.

## 3. Verification and trust levels

- **Verified by GitHub:** PR9 merged and attached to main commit `3c7cd916`; PR8 closed unmerged; `main` HEAD read back matching merge commit immediately after the operation.
- **Verified by Vercel:** production-target READY for merge commit `3c7cd916`, with Git metadata referring to `main`; SSO protection on `vercel.app` domains according to project config. Later documentation-only commits can trigger automatic further production deployments.
- **Codex-reported on PR9 head `fcdeb55`:** `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm build`, `pnpm test` (16 Playwright scenarios: 10 map and 6 missing-key), 6 Chromium viewport reviews, 12 axe-core checked states with zero reported violations. These are real recorded agent observations, **but were not independently re-run by this ChatGPT merge session**; no separate GitHub Actions test workflow was found.
- **Unverified for beta/public release:** physical phones, mobile weak-network, screen readers, continuous GPX routes and rights, timed field tracks, commercial forecast terms, and professional route safety review.
- [Screenshot comparison/decisions](https://github.com/Arvex-studio/almaway-project-V1/tree/61a62002acda83b5639cfb0db931f92e6d86138f/docs/design/pr8-pr9-comparison) · [Codex comparison log](sessions/2026-11-23T20-28+05-codex-pr8-pr9-visual-review.md) · [Owner-authorized merge record](sessions/2026-11-23T21-03+05-chatgpt-pr9-merge-pr8-close.md).

## 4. Final integration decision (accepted / completed)

- **Owner explicitly approved** merging PR9 into main and closing PR8 after readback; both actions are complete as verified above.
- PR9 is the single canonical Guard P0 base: GuardShell, one MapLibre surface, atlas catalogue, manual day planning, weather adapter, gear checklist and private local journal/export.
- PR8's best map UX was included: heading focus, Escape and focus return, compact source/date row, marker visible above sheet at 320×568, recenter after panning, visible attribution, and no fictitious full trail.
- PR8 was **not** merged separately; its code and screenshot history remains accessible in the closed PR.
- This milestone is **internal product integration**, not public launch or claim of safe hiking navigation.

## 5. Remaining blockers

- Full, permissioned and **independently verified continuous GPX route variants** with proper trailheads, directions, timing scope, dates, licensing, current seasonal access and hazards; field guide review.
- Human timing ground truth from actual consenting GPS/timed hikes; no validated ML. Don't claim AI predicts hiking time until hold-out tests.
- Commercial/public production weather license/provider and quota/terms decision.
- QA on **real physical devices**, weak/mobile network, assistive technology/screen readers, rights and risk review.
- No background check-in, real notifications, SOS automation, or official MЧС integration. Keep those disabled/unclaimed.
- Public release is **NOT** authorized by PR merge.

## 6. Ownership and next work

| Owner | Next concrete action |
| --- | --- |
| Product owner | Evaluate priority of real GPX field data, provider licensing, beta scope and authorization. Separate public-launch decision required. |
| Future Codex / integration owner | Start from current `main`, preserve history, create a NEW feature branch and date-stamped session report; do not restart the superseded PR8 implementation. |
| Data/route owners | Source continuous permissioned GPX, verify trailheads/access/timing, field checks and source licenses. |
| QA | Physical Android/iOS, offline/weak signal, map attribution and screen-reader assessment; report evidence before beta. |

## 7. Start the next session

Read [AGENTS.md](../../AGENTS.md), [handoff protocol](HANDOFF_PROTOCOL.md), [the latest merge/closure session](sessions/2026-11-23T21-03+05-chatgpt-pr9-merge-pr8-close.md), [the prior comparative session](sessions/2026-11-23T20-28+05-codex-pr8-pr9-visual-review.md), [Notion Engineering Control Room](https://app.notion.com/p/421d12b48f49813ba5d4cc384c252938) and the task board. Fetch actual `main` HEAD and Vercel deployment target/protection before changing deployment. Distinguish automated production deployment from public-launch authorization.

**Never re-open or independently merge superseded PR #8.** For new features branch from `main` and make dated GitHub+Notion handoff records. Do not claim complete route prediction/check-ins/official rescue integration.

## 8. Canonical navigation

- [ALMAWAY product HQ](https://app.notion.com/p/421d12b48f49811ba465d5fd175f3e05)
- [AG product PRD](https://app.notion.com/p/421d12b48f49812fa381f58e98ed699e)
- [AG implementation task board](https://app.notion.com/p/421d12b48f4981a19b74d2256a08449d)
- [UX Blueprint](https://app.notion.com/p/421d12b48f49817d9c38c8f748b94a5c)
- [Alpine design system](https://app.notion.com/p/421d12b48f4981108bd2e69a07e70f27)
- [Prior PR #8 screenshot proof](https://github.com/Arvex-studio/almaway-project-V1/pull/8)
- [Integrated PR #9 screenshot proof](https://github.com/Arvex-studio/almaway-project-V1/pull/9)

Updated by ChatGPT in a documented owner-authorized merge/closure session, after GitHub and Vercel readback. See [2026-11-23 merge/closure report](sessions/2026-11-23T21-03+05-chatgpt-pr9-merge-pr8-close.md).
