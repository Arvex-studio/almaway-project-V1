# 2026-11-23 19:55–20:04 UTC+05 — ChatGPT — PR #8/#9 Combo Policy and Permanent Handoff

- **Actor/role:** ChatGPT, coordinating product/UX integration and project documentation; NOT executing Windows Codex itself.
- **Started/ended:** 2026-11-23 ~19:55 to ~20:04 Asia/Almaty (UTC+05), timestamps approximate; source GitHub commits carry exact timestamps.
- **Repo/branch:** `Arvex-studio/almaway-project-V1`, target `codex/ag-guard-p0`.
- **Beginning application commit:** `cac78146fa7856aa40576f29e26f5ef31a19905c` (PR #9). **Reference PR #8:** `a6cae13448bb1939d24c592f83a1084b4ff8740b`.
- **Source/PR links:** [PR #9](https://github.com/Arvex-studio/almaway-project-V1/pull/9), [PR #8](https://github.com/Arvex-studio/almaway-project-V1/pull/8).
- **Task:** [T407 — PR8+PR9 visual acceptance](https://app.notion.com/p/421d12b48f49819dbab1d3ae8fe71039), created as `Ready`, not `Done`.
- **Notion main log:** [AG Engineering Control Room](https://app.notion.com/p/421d12b48f49813ba5d4cc384c252938).
- **Notion session record:** [2026-11-23 ChatGPT combo/handoff](https://app.notion.com/p/421d12b48f4981188c8bd20a97fa510f).

## Source observations (not implementation claims)

- At read time: PR #8 and #9 were `open`, `draft=false`, `mergeable=true`, both **not merged**. `main` last observed at `f5c787271cc9d4cbbc00e691581383bbbb9af488`.
- PR #9 includes the existing application P0 and integrated PR8 map-selection accessibility/provenance behaviors. No verified full GPX variant; weather commercial provider, real devices and AI/check-ins remain outstanding.
- GitHub Vercel status was success; Codex **reported** typecheck, build, 14 Playwright tests and axe. **This ChatGPT session did not run the build, tests or real browser, and did not independently inspect side-by-side screenshots.**
- Dev task board read before creating T407: 23 Backlog, 2 Blocked, 5 Done, 2 Ready, 7 Review. New task increases Ready count; later agents must read fresh.
- The request to create the **best combined visual version** is NOT yet satisfied merely by recording the process. A source/screenshot comparison and optional targeted PR9 refinements are still required.

## Documentation changes performed (no application code edits)

1. `docs/coordination/HANDOFF_PROTOCOL.md` — new agent start/end protocol, evidence hierarchy, append-only logs, Notion sync and ownership; commit `3072864dadfcb6bdd1144278bcb7a61f59c9d8be`.
2. `docs/coordination/PROJECT_STATE.md` — current observed P0/PR baseline, statuses and public-launch blockers; commit `b1b3ef5c23a71c6a20e1ff24b5ea3c65fc09517e`.
3. `docs/superpowers/plans/2026-11-23-pr8-pr9-combo-review.md` — acceptance plan and critical QA; commit `23da3d8543fc4342f7695457bfe58db030275a6e`.
4. `AGENTS.md` — explicit mandatory GitHub + Notion evidence handoffs for all future agents; commit `32ad97fd62e67c5ab8d687bbb7ee8b4c504d2509`.
5. Created Notion [Dev HQ](https://app.notion.com/p/421d12b48f49813ba5d4cc384c252938) under Almaway Product HQ, plus dated [session log](https://app.notion.com/p/421d12b48f4981188c8bd20a97fa510f) and [T407](https://app.notion.com/p/421d12b48f49819dbab1d3ae8fe71039) in existing board.

## Decision / alternatives

- **Chosen:** one canonical Guard application based on PR9, selectively preserve PR8's best UX behaviors, then review actual same-size screenshots. PR9 already integrated most behavior; avoid merging both full branches.
- **Rejected:** merge PR8 first blindly then PR9; copy old preview component into PR9 as a duplicate; equate source coordinates with verified navigation; a new wholesale design rewrite; close PR8 before owner accepts consolidated result.
- **Merge rule:** owner approval required. Public beta requires independent route data, rights, safety/performance checks; no emergency/AI claims.

## Validation of this session's work

- GitHub API returned commit IDs for documentation writes.
- Notion API returned IDs/URLs for Dev HQ, session record, and T407. Readback/links may be checked by following agent.
- **Not run:** `pnpm install`, `pnpm typecheck`, `pnpm test`, `pnpm build`, browser/e2e; no code changed.
- **No external writes:** no changes to public deployment, keys, production DB, rescuer contacts, paid providers. No branch was merged or PR closed.

## Remaining open work / next owner

**Integrator (PR #9 Codex):** read AGENTS and coordination docs; perform the visual acceptance plan with matching PR8+PR9 screenshots at 320×568, 390×844, 1440×900, record exact chosen/declined designs; implement only targeted changes within PR9, test whole P0, attach portable evidence and create its own new session report + dated Notion child entry. Do not overwrite this record. **Owner:** review and approve one PR9 merge, then record closure of PR8 as superseded. **Data team:** GPX route evidence/licensing; weather licensing, mobile/assistive QA remain release blockers.

**After this docs-only update:** PR #9 head SHA will advance beyond app commit `cac7814`; re-read live head before claiming tests on the current SHA. This file's own creating commit cannot be included in the file content; see GitHub file history.
