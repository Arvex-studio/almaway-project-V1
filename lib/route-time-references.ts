import type { PublishedRouteTime } from './human-route-times'

/**
 * Visit Almaty, Atlas of Mountain Routes, source hosted on gov.kz.
 * The atlas explicitly describes average/approximate hiking time.
 * These numbers are NOT individual GPS observations or ML training labels.
 * Route geometry and timing basis (moving/elapsed) remain unverified.
 */
const atlas = 'https://www.gov.kz/uploads/2024/9/27/997d7056df662c6a94c27686d61b18f4_original.11504216.pdf'
const common = {
  kind: 'published-guide-estimate',
  sourceTitle: 'Visit Almaty — Atlas of Mountain Routes',
  sourceUrl: atlas,
  publishedAt: '2024-09-27',
  basis: 'unknown',
  caveat: 'Published average estimate, not measured GPS time. Moving vs elapsed is unspecified. Check route geometry before comparing.',
} as const

export const publishedRouteTimeReferences: readonly PublishedRouteTime[] = [
  {
    ...common, id: 'visit-almaty-atlas-106', routeVariantId: 'atlas-106-medeu-kimasar-butakovsky-pass',
    routeName: '№106 Медеу — Кимасар — Бутаковский перевал',
    direction: 'out-and-back', minutesLower: 780, minutesUpper: 840,
    distanceKm: 18, ascentM: 1316,
  },
  {
    ...common, id: 'visit-almaty-atlas-108', routeVariantId: 'atlas-108-medeu-lesnoy-pass-bukreev',
    routeName: '№108 Медеу — Лесной перевал — пик Букреева',
    direction: 'out-and-back', minutesLower: 390, minutesUpper: 420,
    distanceKm: 14.5, ascentM: 1668,
    caveat: 'Published estimate, NOT GPS measured. Return direction inferred; verify exact track and moving vs elapsed basis.',
  },
  {
    ...common, id: 'visit-almaty-atlas-132', routeVariantId: 'atlas-132-tuyuksu-mynzhylky-t1',
    routeName: '№132 Альплагерь Туюк-Су — Мынжылкы — Т1',
    direction: 'out-and-back', minutesLower: 300, minutesUpper: 360,
    distanceKm: 15, ascentM: 1060,
  },
  {
    ...common, id: 'visit-almaty-atlas-136', routeVariantId: 'atlas-136-tuyuksu-titov-pass-gorelnik',
    routeName: '№136 Туюк-Су — Мынжылкы — перевал Титова — Горельник',
    direction: 'point-to-point', minutesLower: 360, minutesUpper: 480,
    distanceKm: 16.86, ascentM: 1292,
  },
]

// №134 omitted pending clarification of published itinerary length and route geometry.
