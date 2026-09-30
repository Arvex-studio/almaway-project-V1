# AlmaWay V1

**Current stage:** V1 Investor Beta.

**Frontend stack:** Next.js, React, TypeScript, Tailwind CSS; shadcn/ui component scaffold included.

**Current status:** Frontend UI/UX complete with mock/demo data. MapSurface uses MapLibre GL JS + MapTiler Outdoor with verified local demo points; planning is simulated. Save state is shared only during the current session and resets on refresh. Explore cards still use the original demo detail. MapTiler is the only external integration.

Use Node.js 22 and pnpm 10.34.3 (`.mise.toml`). Run `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm build`, and `pnpm typecheck`. Configure `NEXT_PUBLIC_MAPTILER_KEY` through your environment. See [map setup and coordinate provenance](docs/map-integration.md). `/` redirects to `/map`.

**Next engineering phase:**
- Supabase
- Auth
- Real places/routes
- Saved/Profile persistence
- AI Planner
- Contextual AI
- Analytics
- Deployment
