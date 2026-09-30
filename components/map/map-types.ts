import type { FeatureCollection, LineString } from 'geojson'
import type { TouristPlace } from '@/lib/tourist-places'

export interface MapSurfaceHandle { locate: () => void }

export interface MapSurfaceProps {
  places: readonly TouristPlace[]
  selectedSlug: string | null
  savedSlugs: readonly string[]
  onSelect: (slug: string) => void
  showPlaces?: boolean
  routes?: FeatureCollection<LineString>
  showRoutes?: boolean
  onReadyChange?: (ready: boolean) => void
}
