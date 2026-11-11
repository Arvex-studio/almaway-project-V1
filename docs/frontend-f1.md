# F1 — Alpine Editorial

Base: F0 d44c0e5. Branch: frontend/f1-alpine-editorial. F0 branch and preview preserved.

## Audit and direction

Fresh F0 Chromium captures showed repeated rounded containers, a weak distinction between feature and list content, and photographs pushed below lengthy copy. Desktop used the same card hierarchy as mobile. Map was blocked by missing provider configuration, not replaced by a static map.

Two independent image concepts were produced: Alpine Atlas (grotesk type, numbered index, cartographic precision) and Field Journal (serif, asymmetric photographs, magazine framing). The owner explicitly delegated selection. Atlas was selected because it gives Map, Explore and Detail a consistent tool-oriented structure. Generated decorative coordinates/facts were not implemented. The real application uses an attributed photograph rather than generated landscape imagery.

## Implemented

- Shared masthead, warm ivory/pine/sky palette, orange indexing, typographic hierarchy, fine rules, compact squared controls and reduced-motion-compatible transitions.
- Explore rebuilt as an editorial feature plus numbered destination directory, not a card grid. Existing filters and explicit place identities preserved.
- Place Detail rebuilt as photograph + story + sourced geography. Removed fictional route times, costs, safety/access directions and reviews rather than reskinning them.
- Map catalogue allows selecting sourced places even when tiles are unavailable. Detail passes a validated slug to Map. MapLibre, MapTiler Outdoor, clustering, source/layer boundary remain.
- Plan, Saved, Profile inherit the visual system and retain honest demo disclosure. No backend/Auth/data persistence changes.
- /preview has interactive 390×844 and 1440×900 frames; same-origin app supports normal clicking/navigation.
- Real Big Almaty Lake photograph by Amarkiev, Wikimedia Commons, CC BY-SA 4.0; provenance and transformations in public/images/ATTRIBUTION.md.

## Map key investigation

No local key in environment or .env files. All 19 commits across canonical remote branches searched without printing candidate values; no real key found. Earlier MapLibre code reads NEXT_PUBLIC_MAPTILER_KEY only. The old f87c6ff tree was restored in a detached sibling worktree for reference. Vercel environment lists for almaway-project-v1-f0-preview, almaway-v1 and almaway-kz were empty. No key was copied from unrelated projects. A valid allowed-domain MapTiler browser key must be supplied through environment configuration; never Git.

## Preview and verification limits

The Codex open-browser tool returned queued, not a confirmation of a visible tab. In-app browser-control tools are unavailable in this environment. Chromium browser QA is performed with Playwright; /preview is independently tested for frame sizes and interactive navigation. Do not claim the owner has seen the Codex panel until confirmed.

Map tests use a controlled style fixture; this is not proof of live MapTiler tiles. No production deployment, deletion or merge is part of F1.

Validation: Node 22.23.4 / pnpm 10.34.3. Build and typecheck passed. 16 browser tests passed (15 controlled-map tests plus one missing-key test; project-inapplicable cases skipped). Fresh captures of all six pages at 390×844 and 1440×900: HTTP 200, no console/page errors or horizontal document overflow. The preview-frame regression test clicks navigation inside the scaled iframe.
