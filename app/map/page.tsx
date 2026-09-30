'use client'

import { useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { AppShell, FilterChip, MapControls, PlacePreviewSheet, SearchBar } from '@/components/almaway'
import { MapSurface, type MapSurfaceHandle } from '@/components/map/map-surface'
import { DemoDialog } from '@/components/future/demo-dialog'
import { useDemoSaved } from '@/components/demo-state'
import { filterTouristPlaces, getTouristPlace, type MapFilter } from '@/lib/tourist-places'
import { demoRoute } from '@/lib/demo-route'

const filters: readonly MapFilter[] = ['Рядом', 'Горы', 'Озёра', 'Маршруты', 'Лёгкие', 'С видом', 'На выходные']

export default function MapHome() {
  const map = useRef<MapSurfaceHandle>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Рядом')
  const [ready, setReady] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [showPlaces, setShowPlaces] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const { savedSlugs } = useDemoSaved()
  const places = useMemo(() => filterTouristPlaces(activeFilter), [activeFilter])
  const selected = selectedSlug ? getTouristPlace(selectedSlug) : undefined

  return (
    <AppShell className="map-shell">
      <main className="map-screen">
        <MapSurface ref={map} places={places} selectedSlug={selectedSlug} savedSlugs={savedSlugs} onSelect={setSelectedSlug} onReadyChange={setReady} showPlaces={showPlaces} routes={demoRoute} showRoutes={showRoutes} />
        <div className="map-overlay">
          <SearchBar />
          <div className="filter-row">
            {filters.map(filter => (
              <FilterChip key={filter} active={activeFilter === filter} onClick={() => { setActiveFilter(filter); setSelectedSlug(null) }}>{filter}</FilterChip>
            ))}
          </div>
        </div>
        <MapControls onLayers={() => setLayersOpen(true)} onLocate={() => map.current?.locate()} locationDisabled={!ready} raised={Boolean(selected)} />
        {!selected && ready && (
          <div className="map-hint">
            <Sparkles />
            <span><strong>{places.length} мест</strong>{places.length ? 'подходят для поездки сегодня' : 'Попробуй другую подборку'}</span>
          </div>
        )}
        {selected && <PlacePreviewSheet selectedPlace={selected} onClose={() => setSelectedSlug(null)} />}
        {layersOpen && <DemoDialog title="Слои карты" onClose={() => setLayersOpen(false)}>
          <span>Туристическая карта</span>
          <label className="map-layer-option"><input type="checkbox" checked={showPlaces} onChange={event => { setShowPlaces(event.target.checked); setSelectedSlug(null) }} />Места</label>
          <label className="map-layer-option"><input type="checkbox" checked={showRoutes} onChange={event => setShowRoutes(event.target.checked)} />Маршруты</label>
        </DemoDialog>}
      </main>
    </AppShell>
  )
}
