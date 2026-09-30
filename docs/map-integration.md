# AlmaWay tourist map

MapLibre GL JS renders MapTiler Outdoor (`outdoor-v2`) from `NEXT_PUBLIC_MAPTILER_KEY`. Set the public browser key in local or cloud environment settings before starting/building Next.js. Next.js embeds `NEXT_PUBLIC_` values at build time, so restart development or rebuild after changing the key. Keep the key restricted to intended domains in MapTiler; never commit its value.

`components/map/map-surface.tsx` loads the implementation client-side. Its contract uses local places, a selected slug, saved slugs, visibility options, and optional GeoJSON LineStrings. The only imperative command is `locate()`. The page knows no provider-specific types. Initialization is separate from source, selection, and route visibility effects; removal disconnects resize observation, listeners, workers, location markers, and place markers.

Places use a clustered GeoJSON source. DOM markers retain AlmaWay's normal/selected/saved pin classes and cluster buttons; clicking a cluster requests its expansion zoom. A selected point stays highlighted even when clustered. The existing place sheet remains the selection UI. Filters operate only on the local catalogue; unverified difficulty categories can be empty. No external geocoding or routing service is connected.

MapLibre 6 ships an ESM worker and shared module. `scripts/prepare-maplibre.mjs` copies version-matched files to ignored `public/maplibre/` before dev/build. Serve that public directory with the build. The explicit same-origin worker URL avoids bundler-dependent worker paths and adds no CDN dependency.

## Geographic evidence

Coordinates in `lib/tourist-places.ts` were retrieved from the public OpenStreetMap database using Overpass on 2026-09-30. Each record stores the original object URL, feature identity, method, and retrieval date. Node coordinates identify features; Overpass area centers are bounding-box centers, not entrances or surveyed trailheads.

| Place | OSM object | Method |
| --- | --- | --- |
| Большое Алматинское озеро | [relation 3427772](https://www.openstreetmap.org/relation/3427772) | Lake bounding-box center |
| Медео | [way 171504564](https://www.openstreetmap.org/way/171504564) | Sports-complex bounding-box center |
| Кок-Тобе | [node 12985379969](https://www.openstreetmap.org/node/12985379969) | Named peak |
| Бутаковский водопад | [node 1843570839](https://www.openstreetmap.org/node/1843570839) | Named waterfall attraction |
| Фурмановка | [node 3718134916](https://www.openstreetmap.org/node/3718134916) | Named peak |

The route preview in `lib/demo-route.ts` retains the 57 original vertices from [OSM way 1324066198](https://www.openstreetmap.org/way/1324066198), tagged `highway=path`, `foot=yes`, `sac_scale=hiking`, and named Медеу-Бутаковка. It is one path fragment, not a complete, surveyed, or safety-validated itinerary. Do not interpolate routes between attraction points. Future GPX imports should be converted to GeoJSON and passed through the same route-source contract.

Contains information from [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). The map attribution remains accessible above the bottom navigation.

## Verification

Run `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm typecheck`, and `pnpm test`. For browser tests, install Chromium with `pnpm exec playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable.

The regression suite uses actual MapLibre/WebGL and workers, intercepting only the remote style response with a deterministic background style and a clearly invalid test key. It covers clustering, selection/detail navigation, saving, route visibility, map-instance preservation, resizing, error recovery, denied geolocation, and a separate missing-key server. This does not prove live MapTiler tiles or account/domain authorization. Verify those separately with the configured environment key.
