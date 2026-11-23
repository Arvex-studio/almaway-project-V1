# Almaway Guard — Current Engineering State
**Snapshot reviewed:** 2026-11-23 19:58 Asia/Almaty (UTC+05)  
**Status:** P0 implemented on a **review branch**, not merged or publicly launched. **Integration decision pending owner review.**

This file records the **last observed** state and must be revalidated against GitHub/Notion at the start of every new agent session. It is a handoff summary, not a substitute for the actual branch HEAD. Only the integration owner should revise it, always with a dated session report.

## 1. GitHub source of truth

Repo: https://github.com/Arvex-studio/almaway-project-V1

| Branch/PR | Verified at snapshot | Purpose | State |
| --- | --- | --- | --- |
| [PR #9](https://github.com/Arvex-studio/almaway-project-V1/pull/9) · `codex/ag-guard-p0` | **Last application/integration commit `cac78146fa7856aa40576f29e26f5ef31a19905c`** | P0 hiking-preparation app, new Guard MapHome, route catalog, plan and export | `Ready for review`, mergeable, not merged at inspection |
| [PR #8](https://github.com/Arvex-studio/almaway-project-V1/pull/8) · `codex/alpine-map-route-preview` | Application head `a6cae13448bb1939d24c592f83a1084b4ff8740b` | Accessible map card, provenance, source status, 320x568 UX | `Ready for review`, mergeable, not merged at inspection |
| `main` | `f5c787271cc9d4cbbc00e691581383bbbb9af488` at inspection | Released branch, prior to Guard P0 | No PR #8/#9 merge observed |

**Note:** documentation commits for this handoff protocol are being added **after** `cac7814`. Always inspect live PR head before using a SHA, rebuilding or merging. The last verified application code did not change in this documentation-only update.

## 2. P0 capabilities verified by code inspection

- Existing **Next.js 16.3.3 / React 19 / TypeScript / Tailwind v4 / MapLibre / MapTiler** application reused; no new runtime dependency was needed for the PR #9 changes according to PR.
- GuardMapHome: map + filters/search + list fallback, source-labeled point details, single MapLibre engine, selected place card with keyboard focus / Escape / focus return, manual saved state and precise distinction between point vs trail.
- Guard route catalog: **three guide/atlas variants** (Bukreev, Butakovsky Pass, Tuyuk-Su T1) + Furmanov geographic peak point. Their `geometry` is `missing`; no validated full trail for navigation or return ETA. OSM route line is a **fragment**.
- Day-plan: manual planned start/return/rest, estimated sunrise/sunset for Almaty timezone; **not** an AI hiking prediction or topographic shadow model.
- Weather API adapter: fixed points, Open-Meteo development/evaluation; shows provider freshness and degraded state, **production provider/licensing decision outstanding**.
- Packing: conditional checklist with source-aware caveats.
- Local private trip drafts/history in browser + manual copy, TXT download and OS share where supported; **not** cloud sync, actual delivery status or automated trusted-contact check-ins.
- `almaway-design` skill and Alpine UI design rules.

## 3. Verified vs reported validation (do not conflate)

**GitHub-observed:** PR #9 was `draft=false`, `mergeable=true`, code head `cac7814`; Vercel commit status `success`. PR #8 also `draft=false`, `mergeable=true`. No PR #9 independent GitHub Actions workflow run was found during review.

**Codex report, not independently re-run by this ChatGPT session:** `pnpm typecheck`, `pnpm build`, 14 Playwright tests, Chromium at 320/375/430/768/1024/1440, axe-core checked test set. Screenshots linked in [PR #9 description](https://github.com/Arvex-studio/almaway-project-V1/pull/9); local `C:/Users/.../QA.md` is **not a portable artifact** without upload. Vercel preview link was reported but protected access may differ per viewer.

## 4. The COMBO decision — one superior version, not two merges

**Chosen proposed direction (owner requested comparison + best synthesis; final screenshot selection pending review):**
- **Base application = PR #9.** Its GuardShell, P0 planner, routes, data disclaimers, manual plan, map and separate styles remain primary.
- **Reuse PR #8 proven UX behaviors:** source/date distinctions, compact legible panel on 320×568, focus on title, `Escape`, restore focus to marker/list, MapTiler/OSM attribution visibility, saving and explicit no verified route.
- PR #9 **already integrated these behavioral improvements** at `cac7814`. Do not cherry-pick the entire PR #8 blindly or reintroduce `/plan` demo CTA.
- **Open design gate:** compare PR #8 and #9 screenshots of the **same selected place** and identical 320×568, 390×844, 1440×900 viewports; evaluate hierarchy, route source trust, action visibility, map area, touch/keyboard, layout, small-screen attribution, motion and legibility. If a better visual pattern exists in #8, adapt it inside `components/guard/map-home.tsx` / `app/guard.css` with screenshot+test evidence. No blanket redesign or duplicate `PlacePreviewSheet`.
- **Do not merge both PRs separately.** After code+visual review, owner may approve PR #9 merge; close PR #8 as `superseded by #9` **after** acceptance. Do not merge or close automatically.

## 5. Remaining blockers

- Full, permissioned and **independently verified continuous GPX route variants** with proper trailheads, directions, timing scope, dates, licensing, current seasonal access and hazards; field guide review.
- Human timing ground truth from actual consenting GPS/timed hikes; no validated ML. Don't claim AI predicts hiking time until hold-out tests.
- Commercial/public production weather license/provider and quota/terms decision.
- QA on **real physical devices**, weak/mobile network, assistive technology/screen readers, rights and risk review.
- No background check-in, real notifications, SOS automation, or official MЧС integration. Keep those disabled/unclaimed.
- Public release is **NOT** authorized by PR merge.

## 6. Current work split (proposal; no parallel editor conflicts)

| Role | Work | Shared files |
| --- | --- | --- |
| Integrator / PR #9 Codex | Compare PR #8/#9 visual screenshots, refine best sheet on Guard, integration tests, PR #9 updates | Own `components/guard/map-home.tsx`, `app/guard.css`, `components/map/*`, `tests/map.spec.ts` while working |
| Reference / PR #8 Codex | No new edits to its PR; respond to narrow review questions or provide screenshot evidence | Do not edit Guard integration files |
| Data/research team | Source+license proof of full GPX and actual route timings | Do not publish personal or unlicensed GPS |
| Owner (user) | Final merge/release authorization | PR approval; no blanket consent |

## 7. Next recommended steps

1. Agent reads [Handoff Protocol](HANDOFF_PROTOCOL.md), this file and last session reports; refreshes live branch statuses.
2. Integrator produces **side-by-side UI acceptance record** and makes only targeted visual changes improving PR #9; evidence on same viewport and source-data safety.
3. Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm build`, test full new UI and reduced motion; add screenshots/links to PR.
4. Record new evidence in a unique `sessions/` log and Notion task. Update this state after verification, preserve previous decision history.
5. Ask owner to review **one** PR #9. Only after owner consent merge PR #9, then close #8 as superseded.
6. Move to permissioned full GPX route data and real device QA; P0 public beta still subject to blockers.

## 8. Canonical navigation

- [ALMAWAY product HQ](https://app.notion.com/p/421d12b48f49811ba465d5fd175f3e05)
- [AG product PRD](https://app.notion.com/p/421d12b48f49812fa381f58e98ed699e)
- [AG implementation task board](https://app.notion.com/p/421d12b48f4981a19b74d2256a08449d)
- [UX Blueprint](https://app.notion.com/p/421d12b48f49817d9c38c8f748b94a5c)
- [Alpine design system](https://app.notion.com/p/421d12b48f4981108bd2e69a07e70f27)
- [Prior PR #8 screenshot proof](https://github.com/Arvex-studio/almaway-project-V1/pull/8)
- [Integrated PR #9 screenshot proof](https://github.com/Arvex-studio/almaway-project-V1/pull/9)

Updated by ChatGPT in a docs-only handoff step; code and production environment unchanged. **Do not treat this file as proving later commits or merges.**
