import type { FeatureCollection, LineString } from 'geojson'
import type { RefObject } from 'react'
import type { TouristPlace } from '@/lib/tourist-places'

export interface MapSurfaceHandle {
  locate: () => void
}

export interface MapSelection {
  slug: string
  zoomIn: boolean
}

export interface MapSurfaceProps {
  places: readonly TouristPlace[]
  selection: MapSelection | null
  selectionPanel: RefObject<HTMLElement | null>
  savedSlugs: readonly string[]
  onSelect: (slug: string, trigger: HTMLButtonElement) => void
  showPlaces?: boolean
  routes?: FeatureCollection<LineString>
  showRoutes?: boolean
  onReadyChange?: (ready: boolean) => void
}
