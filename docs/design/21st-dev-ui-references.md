# Almaway Guard AI — 21st.dev MCP UI reference policy
**Status:** research and component-integration instructions only; 21st MCP connection in owner's Windows Codex has not yet been verified.  
**Updated:** 2026-11-23 · **Owner:** AG CEO/CTO

See [Notion 21st.dev Playbook](https://app.notion.com/p/421d12b48f49815d9633e1007c7a3acc) and [UX Blueprint V3](https://app.notion.com/p/421d12b48f49817d9c38c8f748b94a5c).

## First: test the connection, don't pretend

The owner says the `21st` MCP config exists and their Windows user environment has `API_KEY_21ST`. This does **not** yet prove a working MCP connection. Restart Codex completely so the new environment is loaded. Check `codex mcp list` for configuration, and then make a **real 21st MCP tool call**, such as `search`. The current tool names must be read from the actual Codex `tools/list` output. Never print or commit the key or include its value in logs, screenshots or prompts.

Official: https://docs.21st.dev/mcp ; https://github.com/21st-dev/magic-mcp/blob/main/llms-install.md

## Goal: pick components, not rebuild AG

Keep the existing app base: Next.js 16, React 19, Tailwind v4, TypeScript, `components/map/map-surface.tsx` / MapLibre, `components/almaway.tsx` shell, `app/map/page.tsx` and AG design tokens. No site-wide generated redesign; no 21st map replacing MapLibre; no animation package without a demonstrated need.

Target 21st searches:
1. `accessible mobile map bottom sheet React Tailwind`
2. `responsive outdoors hiking route card react`
3. `interactive packing checklist grouped items`
4. `accessible searchable combobox filter chips react`
5. `timeline trip itinerary stepper react`
6. `skeleton loading card responsive tailwind`

First make a shortlist of **2–3 references per surface** with exact title/URL, author, license, dependencies and accessibility notes. Search is free; code retrieval/install has free-tier limits and generating UI may consume AI credits. Get code only for a carefully selected candidate.

## Proposed first PRs (not yet approved or implemented)

1. Accessible `RoutePreviewSheet`: adapt the existing `PlacePreviewSheet`, not replace the map. Support full and fragment route data correctly, local sources and freshness, overlay vs tab-bar spacing, screen-reader focus, touch dragging only if robust.
2. `PackingChecklist`: conditional categories (must bring / weather-dependent / useful / optional), proper explanation of each item, clear checked state; no “safe” guarantee or confetti.
3. After these: filter/search polish, progress stepper and skeleton states. Avoid adding unrelated hero gradients, decorative counters and faux AI.

Motion baseline: CSS transitions for simple tap/hover/filter states (~120–200 ms), optional sheet open/close (~220–300 ms) if it improves navigation, progressive fallback with `prefers-reduced-motion`. Emergency/status/SOS/check-in and official MЧС messages must be immediately legible without decorative transitions. Do **not** imply active location tracking, official alerts or accurate ML time predictions.

## Integration review checklist

- Source component author, license and preview media rights recorded. Code rights do not imply permission to reuse photos/assets.
- Compatibility with React 19 / Next.js 16 / Tailwind v4 / existing `@base-ui/react`; no unneeded Motion dependency.
- Converted to approved AG Alpine colors `#073526`, `#FCF8F1`, `#9DB98A`, `#CCB78C`. Respect existing local typography and overrides.
- Handles no route, missing full geometry, source dates, offline/slow map, rejected geolocation, weather unavailable and keyboard/ESC navigation.
- Responsive at 320, 375, 430, 768, 1024, 1440 widths. Do not obscure bottom navigation or map attribution.
- Supports keyboard and focus-visible; WCAG 2.2 AA contrast targets, adequate touch targets, reduced motion. Be careful with motion on older phones.
- Run `pnpm typecheck`, `pnpm test`, `pnpm build`, then real mobile/desktop screenshot checks and PR review. Record results instead of merely saying “done.”

## Codex instruction to start

> From the **current Almaway V1 repo**, first verify the real 21st MCP tools are callable and search for accessible map bottom sheets, responsive route cards and interactive grouped checklists. Return preview URLs, licenses and a shortlist **before** installing. Choose at most two pieces fitting our existing Alpine tokens and React/Next/Tailwind stack. Avoid a full rewrite or fake data, preserve MapLibre and route provenance, and propose an isolated first PR. If the MCP is unreachable, report the error without disclosing any credentials.

**Note:** 21st is a reference and component discovery tool, not a data source for trails, weather, GPS, AI performance, emergency notifications, legal compliance or government agreements.
