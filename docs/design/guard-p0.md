# Almaway Guard P0 design

The map leads with local terrain and a compact index of places. On phones, a selected feature opens a nonmodal bottom panel above the attribution. On desktop, search and the place list sit alongside the map. The four navigation tabs use the same labels at both sizes. Preparation is accessed from a variant card.

The Alpine palette remains the brand foundation. Cream and near-white separate the page and cards. Forest anchors links and the primary action. Sage groups trail metrics and selected controls. Sand and its lighter companion support caution. The CSS uses 4/8px spacing, two main elevation levels, local Manrope, IBM Plex Sans and IBM Plex Mono. Font license notices ship in `public/guard/fonts`. The catalogue panorama is [Le Alatau Mountains by Danatleg122](https://commons.wikimedia.org/wiki/File:Le_Alatau_Mountains,_Almaty,_Kazakhstan.jpg) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), resized and cropped for display. It illustrates the region, rather than a specific variant.

## References and decisions

| Surface | References and implementation |
| --- | --- |
| Map and preview | [AllTrails map view](https://support.alltrails.com/hc/en-us/articles/37200401098516-Getting-started-on-AllTrails), [shadcn Sheet](https://ui.shadcn.com/docs/components/base/sheet) and [Wensity Drawer](https://ui.wensity.com/r/drawer.json). The map keeps its own controls. The preview is nonmodal so the user can pan and use the list while it is open. |
| Discovery and route reading | [AllTrails filtering](https://support.alltrails.com/hc/en-us/articles/37227964040852-How-to-use-filters-to-find-trails) and [Gaia GPS distance and elevation](https://help.gaiagps.com/hc/en-us/articles/115003640568-Create-and-Measure-Routes-on-gaiagps-com). Catalogue filters model the available categories. Numbers link to their source. Elevation profiles require an approved continuous track. |
| Schedule and export | [Cairn's roadbook and route stages](https://github.com/VictorGoubet/cairn) and [Mountaineering Scotland's planning checklist](https://www.mountaineering.scot/assets/contentfiles/media-upload/Planning_Checklist.pdf). The timeline prioritizes user-provided start, rest and return. The export preview shows what will be copied. |
| Packing and prior experience | [REI day-hike packing checklist](https://www.rei.com/dam/Day-Hiking-Checklist-Over-2-Hours) and [shadcn Checkbox](https://ui.shadcn.com/docs/components/base/checkbox). Use native checkbox and fieldset semantics and concise item reasons. Compare local diary records only with the selected variant and make timing differences explicit. |

## 21st reference shortlist

Authenticated metadata searches returned four results each. None of the reviewed metadata was used as permission to copy a component. No registry component was installed into the application.

| Surface | Options reviewed | Decision |
| --- | --- | --- |
| Preview | [Astryx Bottom Sheet · Astryxdesign](https://cdn.21st.dev/larsen66/astryx-bottom-sheet/bottom-sheet-mobile-keyboard/preview.1794427533204-be3129cd-1eae-4ec2-93bd-647cf9b490cd.png), [BeUI Bottom Sheet · starc007](https://cdn.21st.dev/larsen66/beui-bottom-sheet/default/preview.1782299659191.png), [Drawer · Wensity](https://cdn.21st.dev/user_3JFJF7Mbb5ImA8DO9hE1FECx2fT/drawer/default/preview.1790329202394.webp) | Astryx and BeUI have unverified item licenses and dependencies. The Wensity public registry is MIT and the drawer is built around a drag gesture. Keep a native inline panel with an explicit close button and Escape. |
| Route card | [Planner Card · ravikatiyar162](https://cdn.21st.dev/ravikatiyar162/planner-card/default/preview.1759251659290.png), [Travel Route Card · kavikatiyar](https://cdn.21st.dev/kavikatiyar/card-7/default/preview.1758073775405.png), [Trail Card · ravikatiyar162](https://cdn.21st.dev/ravikatiyar162/trail-card/default/preview.1758825195589.png) | Planner Card emphasizes an animated graph. Travel Route Card lists Framer Motion. Trail Card emphasizes a prominent image. All have unverified item licenses. Use compact app cards with room for source and scope. |
| Checklist | [Welcome Checklist · olewandowski1](https://cdn.21st.dev/user_registry_7ovr_1782691739820/onboarding-1/default/preview.1790088668181.webp), [Sprint Task Checklist · cnippet-dev](https://cdn.21st.dev/user_36Tbt0v8JdD4jEycmBFhR8tojnR/sprint-task-checklist/default/preview.1787692893453.png) | Onboarding progress and completion celebrations do not fit mountain preparation. Item licenses and dependencies were unverified. Use native controls without a celebratory state. |

## Tooling check

- **21st** — configured bearer-token MCP. A short-lived PowerShell process read the Windows user-level environment entry, completed `initialize`, listed the tools, and invoked `search` for all three surfaces. Metadata search only.
- **shadcn** — MIT CLI 4.23.0, Windows stdio through `cmd.exe`. An actual `search_items_in_registries` request returned official Sheet entries from `@shadcn`. The application package and lockfile receive no dependency from this setup.
- **UI UX Pro Max** — MIT v2.2.1 installed from tag commit `bedc435`. On Windows Python 3.12 ran the UX and Next.js data searches. Keyboard focus, feedback and reduced motion carried through to the design.
- **Wensity** — [MIT public registry](https://github.com/wensity/registry). shadcn CLI read the Drawer payload through `view`. It declares Base UI, Tabler Icons, clsx and Tailwind Merge. The map already uses Lucide and its own controls.
- **Marvelous UI / Awwwards / Lazyweb** — [framework-agnostic MIT free pack](https://github.com/marvelous-ui/marvelous-ui), [MIT reference MCP](https://github.com/INSANE0777/Awwwards-mcp), [research catalog](https://www.lazyweb.com/). The existing components and outdoor references covered P0. These were not installed.
