# AlmaWay F2 — product experience

F1 comparison: commit `029ad2706a10dfc41a68d03850352730bf71e5e8`, immutable deployment retained. Existing frontend branch and Draft PR #6 continued. No backend/Auth/Supabase/migrations or persisted user data changed.

## Product decisions
Five stable tabs: Explore, Journal, Map, Saved, Profile. Plan is contextual from place, Explore, Profile, and Saved's Plans tab. The daily loop is search → place → map → save; photo stories attach to the same geographic identity.

Explore now searches all five existing sourced objects, has category filters and honest no-result states. First mobile viewport includes a real photograph, place identity, save and map actions. Missing Ayusay/Kolsay records remain noninteractive. Detail frontloads useful actions. Saved can remove entries directly and opens the selected object on the map. Profile is guest state, no invented statistics.

Journal is a frontend prototype: one explicitly editorial example, not a user account or actual travel report. Local reactions, story bookmarks, comments, demo traveler/album sheet, photo/text/place draft composer; nothing uploaded/published. A photo can be JPEG/PNG/WebP up to8MB. Unsaved changes require discard confirmation. All state resets on full reload, including existing seeded demo place save.

## Visual system and sources
Alpine Atlas pine/ivory/orange, teal map/interaction accent; compact Manrope headings/UI, Lora for editorial journal. Both have Cyrillic coverage and bundled OFL licenses. Self-hosted WOFF2, 54KB/85KB; no runtime Google Fonts call. Real lake and historic Medeu photography credited per public/images/ATTRIBUTION.md. Original generated conceptual illustration for Journey, never geographic evidence. The third reference image was not available; only its written description informed the illustration.

## Map
MapLibre is preserved. With NEXT_PUBLIC_MAPTILER_KEY, Outdoor v2 remains configured. Without a key, OpenFreeMap Liberty loads vector tiles and required source attribution. Public service permits commercial embedded use, no key, no view/request limits; provided as-is. No bulk download/offline caching. https://openfreemap.org/ and https://openfreemap.org/tos/ (reviewed2026-11-11). No borrowed keys. The existing sourced demo route segment is off by default, opt-in under Layers. It is not a verified safe itinerary.

## Iterative critique
First real-browser audit: 7 routes ×2 viewports, no JS/console errors/overflow. Then corrected:
1. Journal reactions below fold → compressed introductory controls/photo, meaningful actions before bottom navigation.
2. Selected map sheet overlapped controls at320×568/landscape → separate vertical area and bounded scrolling sheet.
3. Duplicate provider attribution and overlapping map hint → provider-supplied attribution, separate bottom offsets.
4. Low weight in new headings diluted hierarchy → explicit750/700 font weights.
5. Removing a saved place required navigating away → direct accessible removal.
6. Historic Medeu photo absent from selected map card → consistent place photo and attribution.
7. Demo line initially on map could imply itinerary → off until explicit layer toggle.

## Validation (implementation pass)
Node22.23.4, pnpm10.34.3. Frozen install succeeded. Browser suite:22 distinct passed (21 keyed fixture,1 keyless fixture), covering real WebGL engine, clusters, marker identity, layers, geolocation denial, provider failure, narrow screens, modal focus/discard, search, session saves and journal draft flow. External tiles independently rendered in real browser audit; automated fixtures are not represented as proof of live geography. Final build/live audit/review findings recorded below before delivery.

## Remaining limits
Social publishing/accounts/sync, real AI planning, Journey GPS and verified access/weather/route details are not implemented. Three catalogue objects still lack licensed photography. Current catalogue covers five Almaty-region objects, not all Kazakhstan. OpenFreeMap availability is external; MapTiler key is still absent. Local state is intentionally temporary. No production release or merge.

## Independent review and final fixes
A fresh read-only reviewer found two important issues: a Saved image's inherited aspect-ratio expanded its grid and clipped controls at320px despite zero page overflow; an invalid first file blocked a valid text-only draft. Both now have reproducing browser tests. Two additional findings were treated as important interaction defects: reselecting a removed file did not emit change, and the global Journal tab retained a stale place-specific filter. Reset the native input, centralize photo/error cleanup, and derive the filter from reactive URL parameters within Suspense. All four regression tests were observed failing before fixes.

Review boundaries: reviewer did not independently rerun build/tests, verify live service/media licensing, deploy, or assess physical iOS keyboard behavior. Those technical checks are covered by the primary execution evidence below where available; physical-device Safari remains untested. No reviewer findings were silently deferred.

## Execution decisions
- Continue the explicitly authorized frontend branch, preserving F1 by immutable SHA/deployment; no new worktree. Cost: one branch includes both F1 and F2, review can compare029ad27 directly.
- Follow owner-delegated design/execution decisions without an additional design approval gate. Cost: owner reviews product direction in the Draft PR/preview.
- Shared shell/font/style work was validated and committed together rather than three isolated commits. Cost: larger implementation commit; focused modules and tests support review.
- Same-file reselect and stale global filter were raised from minor to important because they block ordinary creation/navigation flows; both fixed, no deferred minors.

Final source checks: `pnpm build` and `pnpm typecheck` pass. `pnpm test`:26 distinct pass (25 keyed fixture,1 keyless); no failed tests. Four independent-review regressions all RED→GREEN. Second browser audit14views zero console errors/overflow; live preview QA is reported in the PR with deployment SHA. Chromium software WebGL in this environment; not a physical-phone performance benchmark.
