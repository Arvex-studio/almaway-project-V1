'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import {
  AppShell,
  FilterChip,
  MapControls,
  PlacePreviewSheet,
  SearchBar,
} from '@/components/almaway'
import { MapSurface, type MapSurfaceHandle } from '@/components/map/map-surface'
import { DemoDialog } from '@/components/future/demo-dialog'
import { useDemoSaved } from '@/components/demo-state'
import {
  filterTouristPlaces,
  getTouristPlace,
  type MapFilter,
} from '@/lib/tourist-places'
import { demoRoute } from '@/lib/demo-route'

const filters: readonly MapFilter[] = [
  'Рядом',
  'Горы',
  'Озёра',
  'Маршруты',
  'Лёгкие',
  'С видом',
  'На выходные',
]

export default function MapHome() {
  const map = useRef<MapSurfaceHandle>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Рядом')
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('place')
    if (slug && getTouristPlace(slug)) setSelectedSlug(slug)
  }, [])
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [showPlaces, setShowPlaces] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const { savedSlugs } = useDemoSaved()
  const places = useMemo(
    () => filterTouristPlaces(activeFilter),
    [activeFilter],
  )
  const selected = selectedSlug ? getTouristPlace(selectedSlug) : undefined

  return (
    <AppShell className="map-shell">
      <main className="map-screen">
        <MapSurface
          ref={map}
          places={places}
          selectedSlug={selectedSlug}
          savedSlugs={savedSlugs}
          onSelect={setSelectedSlug}
          onReadyChange={setReady}
          showPlaces={showPlaces}
          routes={demoRoute}
          showRoutes={showRoutes}
        />
        <div className="map-overlay">
          <div className="atlas-map-heading">
            <span className="eyebrow">АЛМАТЫ / АТЛАС МЕСТ</span>
            <button
              type="button"
              onClick={() => setCatalogOpen(!catalogOpen)}
              aria-expanded={catalogOpen}
            >
              Каталог · {places.length}
            </button>
          </div>
          <div className="filter-row">
            {filters.map((filter) => (
              <FilterChip
                key={filter}
                active={activeFilter === filter}
                onClick={() => {
                  setActiveFilter(filter)
                  setSelectedSlug(null)
                }}
              >
                {filter}
              </FilterChip>
            ))}
          </div>
        </div>
        <aside
          className={`atlas-map-catalog ${catalogOpen ? 'is-open' : ''}`}
          aria-label="Места на карте"
        >
          <h1>
            Твоя точка
            <br />
            отправления.
          </h1>
          <p>Выбери место. Найди свой путь.</p>
          {places.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => {
                setSelectedSlug(item.slug)
                setCatalogOpen(false)
              }}
            >
              <span>0{index + 1}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
          {!places.length && <p>В этой подборке пока нет мест.</p>}
        </aside>
        <MapControls
          onLayers={() => setLayersOpen(true)}
          onLocate={() => map.current?.locate()}
          locationDisabled={!ready}
          raised={Boolean(selected)}
        />
        {!selected && ready && (
          <div className="map-hint">
            <Sparkles />
            <span>
              <strong>{places.length} мест</strong>
              {places.length
                ? 'в каталоге · проверь условия перед поездкой'
                : 'Попробуй другую подборку'}
            </span>
          </div>
        )}
        {selected && (
          <PlacePreviewSheet
            selectedPlace={selected}
            onClose={() => setSelectedSlug(null)}
          />
        )}
        {layersOpen && (
          <DemoDialog title="Слои карты" onClose={() => setLayersOpen(false)}>
            <span>Туристическая карта</span>
            <label className="map-layer-option">
              <input
                type="checkbox"
                checked={showPlaces}
                onChange={(event) => {
                  setShowPlaces(event.target.checked)
                  setSelectedSlug(null)
                }}
              />
              Места
            </label>
            <label className="map-layer-option">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(event) => setShowRoutes(event.target.checked)}
              />
              Маршруты (демо)
            </label>
          </DemoDialog>
        )}
      </main>
    </AppShell>
  )
}
