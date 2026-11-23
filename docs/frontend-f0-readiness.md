# AlmaWay V1 — frontend F0

Base: `d9ffe3ab0d2324213a2d2c6503ec88913e5e5b9a` in `Arvex-studio/almaway-project-V1`.
Branch: `frontend/f0-preview-readiness`.

## Scope and visual audit

The existing forest/white palette, nature photography, rounded cards and five-tab navigation were preserved. The direction already fits Clean Nature Minimalism. No global redesign was needed. Photographs remain illustrative, not verified location photography.

Browser audit: Chromium, desktop 1440×1000 and mobile 390×844, all six requested routes. Regression tests additionally cover 320px and landscape 844×390. Screenshots and measurement JSON are captured by `scripts/capture-frontend.mjs` against a built app or a deployed preview.

| Step | Route | Finding and resulting behavior |
| --- | --- | --- |
| 1 | `/map` | Missing-key fallback keeps navigation available. Initial framing now keeps catalogue pins above navigation on short phones. Open sheet scrolls; controls and attribution no longer cover its links. “Suitable today” removed. Layer labelled demo. |
| 2 | `/explore` | Ayusay/Kolsay incorrectly opened and saved Big Almaty Lake. They now have distinct identities and show “coming to catalogue” without false actions. Existing lake links/saves use explicit catalogue identity. Filters actually change the list. Misleading distances/time removed. |
| 3 | `/plan` | Fixed output presented as AI/personalized recommendations. Explicit demo notice precedes input; button opens one fixed example. Time, budget, difficulty are labelled unverified demo values. |
| 4 | `/saved` | Seeded session-only save looked like account data. Explicit lifetime/reset notice; route/plan tabs explain saving is unavailable. No storage or user data migrated. |
| 5 | `/profile` | Fictional identity, statistics and achievements now clearly identified as demo. Existing settings/Journey dialogs retained. |
| 6 | `/places/bolshoe-almatinskoe-ozero` | Route parameters, price, access, season and reviews clearly marked illustrative/unverified before those sections. AI action labelled demo. |

Additional UX changes: catalogue link replaces the inert search-looking control; pressed state on filters/segments; visible textarea keyboard focus; 44px sheet-close/save controls; narrow profile layout; full-width card images; darker section links. Existing native dialogs retain Escape/focus restoration.

## What is functional

Client navigation, catalogue detail pages, Explore category filtering, session-only place save/unsave, demo plan reveal, modal interactions. MapLibre interaction (clusters, filtering, selection, layers, resize, panning, geolocation denial and retry) is covered with a controlled style response.

## Limitations / beta gates

- Preview has no `NEXT_PUBLIC_MAPTILER_KEY`: real outdoor basemap cannot load. Configure a valid public browser key restricted to the preview hostname in the Vercel project's **Preview** environment, then redeploy preview. Never put a key into Git.
- The controlled style used by tests is a flat fixture, not a live MapTiler basemap. Do not use fixture screenshots as proof of live tiles.
- AI, account/auth, persistent saves, Journey, real reviews and profile metrics remain demo/unavailable. No Supabase/Auth/backend-contract/migration changes.
- Missing catalogue cards cannot be opened/saved until verified entries exist. No invented coordinates or catalogue records added.
- Screenshots and DOM/keyboard checks are not full WCAG conformance testing. Real iOS/Android, VoiceOver/TalkBack, slow-network and field usability checks remain beta work.
- Load measurements are single-run Chromium navigation/paint observations, not a performance SLA or field Core Web Vitals.

## Reproduce

Use Node 22 and pnpm 10.34.3:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm test
pnpm build
pnpm typecheck
pnpm exec next start --hostname 0.0.0.0 --port 3200
# In another terminal:
node scripts/capture-frontend.mjs
```

For deployed screenshots, set `ALMAWAY_AUDIT_URL` to the immutable deployment origin. Optionally set `ALMAWAY_PREVIEW_SHARE` to its short-lived share token and `ALMAWAY_AUDIT_DIR` to an artifact directory. Tokens are not saved in the measurement JSON. Keep generated screenshots and tokens out of Git.

`next.config.mjs` allows only `127.0.0.1` as an additional development origin because Next 16 otherwise blocks the existing Playwright test server's JavaScript chunks. This is a development-only setting.

## Deployment record

A separate Vercel project `almaway-project-v1-f0-preview` was created for the canonical repository. Existing AlmaWay projects/domains were not modified. The initial request incorrectly supplied `target: preview`; Vercel returned `target: production` in this isolated project and finished before cancellation. This unexpected deployment was reported immediately. It is not the handoff preview. The corrected API request follows Vercel documentation: omit `target` and use the frontend branch; returned target is null (Preview). No merge or production promotion was requested. Old unintended deployment remains visible in Vercel; available connector tools do not expose deployment deletion.

Share links are explicitly limited to seven days. The final handoff must link the verified frontend commit deployment, not the initial main snapshot.

## Next frontend stage

1. Configure and test the real MapTiler preview key; review basemap loading/error, gesture and attribution behavior on devices.
2. Integrate the research participant's verified catalogue, real photos and data provenance; remove demo numeric content as verified content arrives.
3. With the backend owner, connect the agreed contract and replace demo state with explicit signed-out/loading/error/empty/live states in a separate track.
4. Run mobile device and screen-reader QA, contrast audit and throttled performance profiling; then resolve remaining beta blockers.

## Validation results

- Node 22.23.4 / pnpm 10.34.3; frozen lockfile install passed.
- `pnpm test`: 14 distinct tests passed (13 in controlled-map configuration, one missing-key fallback); configuration-inapplicable cases skipped intentionally.
- `pnpm build` and `pnpm typecheck`: passed.
- Built-app browser audit: all 12 desktop/mobile route visits HTTP 200, no console/page errors, no document horizontal overflow. Local FCP 64–152ms; settled capture 0.68–1.33s, without CPU/network throttling. These local values are not public-network performance guarantees.
- Screenshots inspected after fixes; approved visual direction preserved.
