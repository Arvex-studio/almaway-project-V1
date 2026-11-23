# Almaway Guard AI

Almaway Guard is a hiking preparation app for the Almaty region. It includes a MapLibre map, sourced route cards, a manual day plan, a conditional gear checklist and local trip export.

Use Node.js 22 and pnpm 10.34.3 as pinned in `.mise.toml` and `package.json`.

```shell
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm test
pnpm build
```

- `/` redirects to `/map`. Configure `NEXT_PUBLIC_MAPTILER_KEY` for the Outdoor basemap. The place list and catalogue are available when the basemap fails. [Map data and attribution](docs/map-integration.md).
- `/routes` and `/routes/[id]` list three variants with figures from the 2024 Almaty mountain atlas, plus an OSM point for Furmanov. The available OSM line is a fragment. A checked continuous track and field timings are still required for elevation profiles, time-to-summit and suggested turnaround.
- `/prepare/[id]` uses a manual return time, rest duration and daylight calculated for the Almaty region in `Asia/Almaty`. Terrain shadows and trail conditions can shorten the usable window. Guide timings are displayed as source estimates.
- Weather uses fixed public route coordinates via a server adapter. Open-Meteo is used in development. Production builds require `ALMAWAY_OPEN_METEO_EVALUATION=1` for non-commercial evaluation. Commercial use requires a licensed provider option. Forecasts cover at most seven calendar days, retain the original retrieval time and show stale data explicitly if refresh fails. [Open-Meteo licensing](https://open-meteo.com/en/pricing).
- `/trip` and `/profile` store drafts and voluntary hike records locally in the browser. Plans can be copied, downloaded or passed to the system share sheet when supported. There is no automatic delivery, live location tracking or rescue service integration.

[Alpine design, references and tooling](docs/design/guard-p0.md).
