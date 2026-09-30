# AlmaWay V1

Canonical frontend: Next.js App Router, React, TypeScript, Tailwind CSS v4.
The approved V1 design and mock/demo state must be preserved.

- Application routes live in `app/`; `/` redirects to `/map`.
- Shared components live in `components/`; the mock `MapSurface` is the future map integration boundary.
- Mock place data lives in `lib/almaway-data.ts`; global design tokens/styles live in `app/globals.css`.
- Use pnpm (version in `.mise.toml` and `package.json`).
- Run `pnpm install --frozen-lockfile`, `pnpm build`, and `pnpm typecheck`.
- `pnpm dev` listens on `$PORT` or port 3000; do not assume a server is already running.
- Do not add production maps, AI, authentication, or database integrations without an explicit task.
- Keep secrets, dependencies, and build outputs out of Git.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
