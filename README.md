# AlmaWay V1

**Current stage:** V1 Investor Beta.

**Frontend stack:** Next.js, React, TypeScript, Tailwind CSS; shadcn/ui component scaffold included.

**Current status:** Frontend UI/UX complete with mock/demo data. MapSurface is a stylized demo map; planning is simulated. Save state is shared only during the current session and resets on refresh. Explore cards use the same demo place detail. No external services are connected.

Use Node.js 22 and pnpm 10.34.3 (`.mise.toml`). Run `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm build`, and `pnpm typecheck`. `/` redirects to `/map`.

**Next engineering phase:**
- MapLibre + MapTiler
- Supabase
- Auth
- Real places/routes
- Saved/Profile persistence
- AI Planner
- Contextual AI
- Analytics
- Deployment
