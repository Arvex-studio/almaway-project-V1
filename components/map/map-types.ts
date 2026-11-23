import type { FeatureCollection, LineString } from 'geojson'
import type { TouristPlace } from '@/lib/tourist-places'

export interface MapSurfaceHandle {
  locate: () => void
  focus: (coordinates: readonly [longitude: number, latitude: number]) => void
}

export interface MapSurfaceProps {
  places: readonly TouristPlace[]
  selectedSlug: string | null
  savedSlugs: readonly string[]
  onSelect: (slug: string, trigger: HTMLButtonElement) => void
  showPlaces?: boolean
  routes?: FeatureCollection<LineString>
  showRoutes?: boolean
  onReadyChange?: (ready: boolean) => void
}
