# PR #8 + PR #9 — Best-of-Both UI Review and Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** retain the complete Guard P0 product architecture and produce the best accessible map-selection interaction by comparing and adapting the strongest visual and interaction choices from both PR #8 and PR #9, without duplicating or misleading hiking data.

**Architecture:** PR #9 (`codex/ag-guard-p0`) is the integration base. PR #8 (`codex/alpine-map-route-preview`) is a reviewed reference, not a second PR to merge mechanically. Use one MapLibre engine, `GuardShell`, `MapHome`, `app/guard.css` and the existing test suites.

**Tech Stack:** Next.js 16.3.3, React 19, TypeScript, Tailwind v4, MapLibre/MapTiler, `@base-ui/react`, Playwright; no new runtime libraries by default.

**Spec:** [AG UX Blueprint](https://app.notion.com/p/421d12b48f49817d9c38c8f748b94a5c), [Design System](https://app.notion.com/p/421d12b48f4981108bd2e69a07e70f27), [Handoff Protocol](../../coordination/HANDOFF_PROTOCOL.md), [Current State](../../coordination/PROJECT_STATE.md).

## Global Constraints
- `main` remains untouched by UI until the owner approves merge.
- The two PRs share `app/map/page.tsx`, `components/map/map-types.ts`, `tests/map.spec.ts`. Never overlay or cherry-pick the whole PR #8; preserve PR #9 map architecture.
- No claim of verified full trail, turn-by-turn navigation, AI time prediction, automatic return tracking or МЧС integration.
- `geometry: 'missing'` for catalog routes remains explicit. OSM pins ≠ trailheads.
- Fonts and Alpine tokens already exist; avoid new dependencies and unrelated redesign.
- Record every milestone in unique session log and Notion; report measured evidence, not assumptions.

## Review Focus
1. A 320×568 screen has complete visible close/details/save, source, route-not-verified status and MapTiler/OSM attribution with no overlap — assert bounding boxes and viewport visibility.
2. A keyboard user can open from map marker or list, Tab through controls, close via Escape and return to the correct trigger — assert focus.
3. Toggling layers/filters and switching routes does not recreate MapLibre, leave stale selected route, or direct to `/plan` demo — assert map instance and links.
4. Missing MapTiler key/data makes accessible route catalog available with clear error, not a blank or misleading full trail — assert fallback.
5. Motion in small screens/reduced-motion environments cannot interfere with critical navigation; source distinctions and private trip boundaries are maintained — assert CSS and rendered semantics.

---

### Task 1: Evidence-led visual comparison

**Files:**
- Read: `components/guard/map-home.tsx`, `app/guard.css`, `components/map/*`, `app/map/page.tsx`.
- Read source: PR #8 code/screenshots; PR #9 current code/screenshots.
- Create: `docs/coordination/sessions/<actual-date>-codex-pr8-pr9-visual-review.md` (one unique file).

**Interfaces:**
- Consumes: existing `MapHome` and source-labeled `guardRoutes` / `TouristPlace`.
- Produces: concrete keep/adapt/reject decision matrix with exact screenshots and PR ref.

- [ ] Compare the **same selected place** at 320×568, 390×844 and 1440×900 for both PRs (actual screenshots, not descriptions).
- [ ] Record map visible area, reading order, labels, actions, touch targets, scroll behavior, panel attribution and motion.
- [ ] Identify whether PR #9 already has the objectively better implementation or whether 1–3 focused improvements are worthwhile; don't invent a UI change solely to satisfy "combo".
- [ ] Publish a review entry linking each source, screenshot and decision, noting unverified visual cases.

### Task 2: Preserve all proven interactions, adapt selected improvements

**Files:**
- Modify **only as indicated by Task 1:** `components/guard/map-home.tsx`, `app/guard.css`, `components/map/map-markers.ts`, `components/map/map-types.ts`.
- Test: `tests/map.spec.ts`, `tests/guard.spec.ts`.

**Interfaces:**
- Consumes: `MapSurfaceProps.onSelect(slug, button)`, `GuardShell`, `guardRoutes` with source/geometry flags and `TouristPlace.coordinateSource`.
- Produces: exactly one selected-place panel with accessible closing/return focus, source attribution and links to actual Guard route detail.

- [ ] Write a failing Playwright assertion for each identified regression or improvement; reproduce first.
- [ ] Make the smallest source-preserving UI/CSS change, not a replacement of existing MapLibre.
- [ ] Verify no duplicate panel, `/plan` CTA, fake route geometry, blocked attribution or focus regression.
- [ ] Run the changed targeted test(s) until PASS, check screenshots at all target sizes.
- [ ] Commit the implementation in a focused PR #9 commit; record files and before/after evidence.

### Task 3: Final validation and integration review

**Files:**
- Verify: `tests/map.spec.ts`, `tests/guard.spec.ts`, `playwright.config.ts`.
- Write new session report under `docs/coordination/sessions/`.
- Update PR #9 description, Notion task board and (integrator only) `PROJECT_STATE.md`.

**Interfaces:**
- Produces: owner-reviewable PR #9 with exact tested SHA and no unverified safety claims.

- [ ] Confirm latest branch against `main`; resolve conflicts and verify code has not reverted the PR #9 P0 features.
- [ ] Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm build` and `git diff --check` and record exact outcomes; don't claim GitHub Actions if only local.
- [ ] Browser QA at 320/375/430/768/1024/1440; keyboard, Escape, screen reader if available, reduced motion, fallback on missing key. On actual devices where available; otherwise mark not tested.
- [ ] Verify relevant screenshots are accessible by future chat (PR attachments/repo), not just local `C:/Users` paths.
- [ ] Update Notion and add a dated session report following the handoff protocol with SHA, tests, blockers and next owner.
- [ ] Request owner approval for merging **PR #9 only**. Only after accepted merge, close #8 as superseded and record both events. Don't call that a public product launch.

## Out of Scope
- Full GPX collection, field validation, route ETA predictions, training ML, notifications, official emergency API, commercial forecast license purchase.
- New design library integrations, wholesale frontend rewrite, rebuilding map with another provider.

## Handoff
When completed, next Codex chat starts with `AGENTS.md`, `docs/coordination/PROJECT_STATE.md`, the newest `sessions/` records, PR #9 and the Notion Dev HQ. Do **not** rely on this plan as evidence that any work has been completed.
