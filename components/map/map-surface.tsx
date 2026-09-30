'use client'

import dynamic from 'next/dynamic'
import type { Ref } from 'react'
import type { MapSurfaceHandle, MapSurfaceProps } from './map-types'

const MapLibreSurface = dynamic(() => import('./maplibre-surface'), {
  ssr: false,
  loading: () => <div className="map-canvas"><div className="map-message" role="status">Загружаем карту…</div></div>,
})

export function MapSurface(props: MapSurfaceProps & { ref?: Ref<MapSurfaceHandle> }) {
  return <MapLibreSurface {...props} />
}

export type { MapSurfaceHandle, MapSurfaceProps } from './map-types'
