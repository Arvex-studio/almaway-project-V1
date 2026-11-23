# Almaway Guard — Multi-Agent Handoff & Evidence Protocol
**Version:** 1.0 · **Adopted:** 2026-11-23 · **Applies to:** Codex chats, ChatGPT, and other agents working on AG.

> Start every new chat by reading `AGENTS.md`, `docs/coordination/PROJECT_STATE.md`, the latest session reports in `docs/coordination/sessions/`, active GitHub PRs, and the Notion engineering control page. Do not rely on a previous assistant's summary as proof of current code or tests.

## Why
Two parallel agents built PR #8 (route-preview card) and PR #9 (Guard P0). PR #9 now incorporates the useful behavior of #8, but the branches are not both to be merged independently. We want **one best integrated product**, with an inspectable history so a new conversation can resume accurately.

## Sources of truth — different responsibilities
1. **Code reality:** GitHub branch/commit hash, PR diff, CI/build output and actual deployment. A statement in chat or Notion never proves a feature was shipped.
2. **Product/UX/safety decisions:** [ALMAWAY product HQ](https://app.notion.com/p/421d12b48f49811ba465d5fd175f3e05) and [active PRD](https://app.notion.com/p/421d12b48f49812fa381f58e98ed699e). Decision changes must be dated and explained.
3. **Task ownership/status:** [AG Release Task Board](https://app.notion.com/p/421d12b48f4981a19b74d2256a08449d). `Done` requires an evidence link and actual acceptance criteria.
4. **Current integration baseline:** `docs/coordination/PROJECT_STATE.md` (one integrator updates after reading GitHub + Notion, never an unverified claim).
5. **Append-only evidence:** this project's `docs/coordination/sessions/<date>-<chat-role>-<topic>.md` files, one unique file per meaningful session. Do not overwrite another agent's session record.

No "global memory" from a chat overrides a currently verifiable commit or Notion decision.

## Rule for every working session

### At start
- Read `AGENTS.md`, `docs/coordination/PROJECT_STATE.md`, the last **relevant** session records and target UX/tech spec.
- Fetch live `main`, active PRs and your working branch; state exactly which branch, HEAD and known blockers.
- Check existing Notion tasks and coordinate ownership; do **not** silently overwrite the same shared UI files another agent is editing.
- Choose a narrow task and record dependencies. Prefer one integration owner for `app/map/page.tsx`, `components/guard/map-home.tsx`, `components/map/*`, `app/guard.css` and `tests/map.spec.ts`.

### During work
- Commit in reviewable slices; link issues/PRs to tasks. Keep source/verified route data separate from demos.
- Do not reset others' branches, force-push, duplicate map engines, erase user changes, or merge without explicit owner approval.
- Use `pnpm typecheck`, `pnpm test`, `pnpm build` and viewport/keyboard checks as relevant. "Passed" needs actual logs; distinguish report-only vs independently verified CI.
- No unverified official emergency status, live GPS or ML accuracy claims, and no production use of weather providers without license review.

### At end or major milestone — MANDATORY
1. Write a **new uniquely named Markdown report** under `docs/coordination/sessions/` (append-only convention). Include the template below.
2. Update the associated Notion task statuses and evidence only for verified work. If Notion is unavailable, record `not_synced` and follow up; do not falsely claim update.
3. Update [Engineering Control Room](https://app.notion.com/p/421d12b48f49811ba465d5fd175f3e05) / its linked Dev HQ: add a **dated child session entry**, not a concurrent rewrite of another agent's report.
4. The **integration owner only** updates `PROJECT_STATE.md` after checking current branches/PR statuses; replace stale SHA and status with real readback. Other agents may propose an update in their session log.
5. In the final chat reply link **PR, commit, report, Notion task/session and preview** (if real). Explicitly say what was NOT tested or deployed.
6. For a new chat, give a brief handoff that points to the canonical files rather than copying long speculative status.

## Session-report template

Use a filename such as `2026-11-23T20-05+05-codex-integration-pr9.md` (ensure unique even if two jobs start simultaneously). Times in ISO-8601 **Asia/Almaty / +05:00**, not invented from local UTC.

```md
# [Date/time UTC+05] — [Agent / session] — [work title]
- Actor/role:
- Actual start/end (if known; otherwise "not recorded"):
- Repo/branch and starting HEAD:
- Ending HEAD / commit(s), PR(s) / preview:
- Task IDs and links:
- Intent and exact files changed:
- Decision (chosen/rejected alternatives and why):
- Tests actually executed (commands, counts, environment, links):
- Visual UX evidence (viewports, screenshots, a11y findings):
- Data safety/source/licensing checks:
- GitHub/Notion write verified? yes/no and links:
- What remains incomplete / risky:
- Conflicts or overlapping agent work:
- Next action, owner, and blocker:
- Release status: prototype / review / merged / staging / public (only if confirmed)
```

## Conflict and handoff ownership
- **PR #9** is the intended integration base (Guard route catalogue, day plan, weather, checklist and local trip export). **PR #8** is a source of validated card/keyboard/attribution patterns.
- Compare corresponding screenshots and behavior **at the same viewport** before calling it the best version. Keep best features rather than duplicating components.
- Do **not** merge PR #8 separately after its valuable features are in #9. Close #8 as superseded **only after review and after owner accepts the single PR strategy**.
- For concurrent tasks, split by file ownership or worktree; one integrator resolves shared UI. Write who owns overlap in a new session record.
- New chats may be different agents. Always rediscover real MCP/tools and recheck the current repo, not simply accept another chat's "already configured" claim.

## Notion synchronization
Create a separate session child page under Dev HQ titled `YYYY-MM-DD HH:mm UTC+05 | Agent | result`; include links to the same GitHub report and PR, plus checks, blockers and next steps. Avoid duplicating the full code diff. Task board statuses are separate from activity history. If a result is in Review, keep it in Review until independently accepted. 

## Do not log
API keys, contacts/private GPS, tokens, screenshots with personal data, real passwords or confidential user data. Do not publish large binary test artifacts unless licensing and privacy permit.
