import type { TouristPlace, MapFilter } from '../tourist-places'
import type { Tables } from '../supabase/database.types'

export type SourceCitation = Readonly<{
  id: string; kind: string; fieldKey: string; provider: string; sourceUrl: string
  retrievedAt: string; isPrimary: boolean; method: string | null; feature: string | null
  attribution: string; license: string
}>
export type PublicPlace = TouristPlace & { id: string; categoryCode: string; sources: readonly SourceCitation[] }
export type PlaceWithSources = Tables<'places'> & { place_sources: Tables<'place_sources'>[] }

const labels: Record<string, string> = {
  lake: 'Озеро', lake_group: 'Озёрная группа', waterfall: 'Водопад', waterfall_group: 'Группа водопадов',
  mountain: 'Гора', peak: 'Вершина', summit: 'Вершина', sports_complex: 'Спортивный комплекс',
  gorge: 'Ущелье', canyon: 'Каньон', plateau: 'Плато', mountain_resort: 'Горный курорт',
  viewpoint_area: 'Видовая зона', national_park: 'Национальный парк',
}
const tagFilters: Record<string, MapFilter> = {
  mountains: 'Горы', lakes: 'Озёра', scenic: 'С видом', weekend: 'На выходные',
}

/** Editorial integrity check; RLS independently enforces confidentiality on every API row. */
export function toPublicPlace(row: PlaceWithSources): PublicPlace | null {
  const primaries = row.place_sources.filter(s => s.kind === 'coordinates' && s.field_key === 'coordinates' && s.is_primary)
  const primary = primaries[0]
  if (row.status !== 'published' || primaries.length !== 1 || !primary ||
      !Number.isFinite(row.latitude) || !Number.isFinite(row.longitude) ||
      primary.provider !== 'OpenStreetMap' || !primary.feature ||
      !/^https:\/\/www\.openstreetmap\.org\/(node|way|relation)\/[0-9]+$/.test(primary.source_url) ||
      (primary.method !== 'node' && primary.method !== 'bounding-box-center')) return null
  // No image is exposed until its own primary citation and rights are reviewed.
  if (row.image_url && !row.place_sources.some(s => s.kind === 'image' && s.field_key === 'image_url' && s.is_primary && s.license.trim())) return null
  return {
    id: row.id, slug: row.slug, title: row.title, region: row.region,
    description: row.description, why: row.why, metrics: [],
    categoryCode: row.category, category: Object.hasOwn(labels, row.category) ? labels[row.category] : row.category,
    coordinates: [row.longitude, row.latitude],
    filters: Array.from(new Set(row.tags.flatMap(tag => Object.hasOwn(tagFilters, tag) ? [tagFilters[tag]] : []))),
    ...(row.image_url ? { image: row.image_url } : {}),
    coordinateSource: { provider: 'OpenStreetMap', url: primary.source_url,
      retrievedAt: primary.retrieved_at, method: primary.method, feature: primary.feature },
    sources: row.place_sources.map(s => ({ id: s.id, kind: s.kind, fieldKey: s.field_key,
      provider: s.provider, sourceUrl: s.source_url, retrievedAt: s.retrieved_at,
      isPrimary: s.is_primary, method: s.method, feature: s.feature,
      attribution: s.attribution, license: s.license })),
  }
}
