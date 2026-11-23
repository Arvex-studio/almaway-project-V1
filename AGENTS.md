# AlmaWay V1

Canonical frontend: Next.js App Router, React, TypeScript, Tailwind CSS v4.
Almaway Guard P0 sits on the existing V1 frontend. Keep the Alpine design and label incomplete or sourced data explicitly.

- Application routes live in `app/`; `/` redirects to `/map`.
- Shared components live in `components/`; `components/map/map-surface.tsx` is the provider-independent map boundary.
- Geographic points live in `lib/tourist-places.ts`. Guard route metadata and calculations live in `lib/guard/`. The Alpine UI uses `app/guard.css` and `components/guard/`.
- Use `.agents/skills/almaway-design/SKILL.md` for Guard design and QA. Keep source figures, geographic points and complete route geometry distinct.
- Use pnpm (version in `.mise.toml` and `package.json`).
- Run `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm typecheck`, and `pnpm test`.
- `pnpm dev` listens on `$PORT` or port 3000; do not assume a server is already running.
- Do not add production maps, AI, authentication, or database integrations without an explicit task.
- Keep secrets, dependencies, and build outputs out of Git.

## Cross-chat handoff and evidence — REQUIRED FOR ALL AG AGENTS

- At the **start** of any task read [current state](docs/coordination/PROJECT_STATE.md), [handoff protocol](docs/coordination/HANDOFF_PROTOCOL.md), and the most recent relevant files in `docs/coordination/sessions/`. Fetch current GitHub branches/PRs and Notion engineering task state before accepting a prior agent's claims.
- The canonical Notion engineering log is [AG Engineering Control Room](https://app.notion.com/p/421d12b48f49813ba5d4cc384c252938); tasks live in [AG Release Task Board](https://app.notion.com/p/421d12b48f4981a19b74d2256a08449d). Product specs remain in [ALMAWAY HQ](https://app.notion.com/p/421d12b48f49811ba465d5fd175f3e05).
- At **every meaningful session end / PR update**, commit a NEW uniquely named report `docs/coordination/sessions/YYYY-MM-DDTHH-mm+05-<agent>-<topic>.md` including actual Asia/Almaty time, branch+before/after SHAs, files changed, PR/preview, tests actually run, screenshots/evidence links, blockers, decisions and next owner. Don't edit another agent's session report.
- Create a corresponding dated **Notion child log** in AG Engineering Control Room and update **existing** task statuses with evidence. If Notion is unavailable, note `Notion sync pending` in the GitHub report and inform the owner; never claim it was updated.
- The **PR integration owner only** updates `docs/coordination/PROJECT_STATE.md` after live GitHub verification. Other agents record their own work and recommend changes in the session report to prevent races.
- Keep one canonical Guard MapLibre implementation. For PR #8 and #9, work on **PR #9** as the Guard P0 base; compare same-viewport visuals before adapting proven PR #8 patterns. Do not merge/close PRs, deploy publicly, make paid calls or enable emergency automation without explicit owner approval.
- A local test passing, a reported 14/14 result, a Vercel build, an approved PR and a publicly released app are different states. Never conflate them. Use exact evidence and note what was **not** checked.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
