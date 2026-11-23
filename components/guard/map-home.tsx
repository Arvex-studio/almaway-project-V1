'use client'

import Link from 'next/link'
import { ArrowRight, Compass, MapPin, Mountain, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapControls } from '@/components/almaway'
import { DemoDialog } from '@/components/future/demo-dialog'
import { MapSurface, type MapSurfaceHandle } from '@/components/map/map-surface'
import { useDemoSaved } from '@/components/demo-state'
import { demoRoute } from '@/lib/demo-route'
import { guardRoutes } from '@/lib/guard/routes'
import { filterTouristPlaces, getTouristPlace, type MapFilter } from '@/lib/tourist-places'
import { GuardShell } from './shell'

const filters: readonly MapFilter[] = ['Рядом', 'Горы', 'Озёра']

export function MapHome({ initialPlace }: { initialPlace?: string }) {
  const map = useRef<MapSurfaceHandle>(null)
  const sheet = useRef<HTMLElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const search = useRef<HTMLInputElement>(null)
  const [selectedSlug, setSelectedSlug] = useState(initialPlace ?? null)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<MapFilter>('Рядом')
  const [ready, setReady] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [showPlaces, setShowPlaces] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const { savedSlugs } = useDemoSaved()
  const places = useMemo(() => filterTouristPlaces(activeFilter).filter(place =>
    `${place.title} ${place.region} ${place.category}`.toLocaleLowerCase('ru').replaceAll('ё', 'е')
      .includes(query.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е'))), [activeFilter, query])
  const selected = selectedSlug ? getTouristPlace(selectedSlug) : undefined
  const areaRoutes = guardRoutes.filter(route => route.mapPlace === selectedSlug)

  function select(slug: string, center = false) {
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSelectedSlug(slug)
    if (center) {
      const place = getTouristPlace(slug)
      if (place) map.current?.focus(place.coordinates)
    }
  }

  function close() {
    setSelectedSlug(null)
    if (trigger.current?.isConnected) trigger.current.focus()
    else search.current?.focus()
  }

  useEffect(() => {
    if (selectedSlug && trigger.current) sheet.current?.focus()
  }, [selectedSlug])

  useEffect(() => {
    if (!ready || !initialPlace) return
    const place = getTouristPlace(initialPlace)
    if (place) map.current?.focus(place.coordinates)
  }, [ready, initialPlace])

  return <GuardShell><div className="ag-map-layout">
    <header className="ag-map-intro">
      <span className="ag-kicker"><Compass aria-hidden="true" /> Заилийский Алатау</span>
      <h1>Карта маршрутов</h1>
      <p>Выберите место на карте или откройте каталог с данными горного атласа.</p>
      <label className="ag-search"><Search aria-hidden="true" /><span className="ag-sr">Поиск мест на карте</span>
        <input ref={search} type="search" placeholder="Вершина, ущелье или озеро" value={query} onChange={event => { setQuery(event.target.value); setSelectedSlug(null) }} />
      </label>
      <div className="ag-filters" aria-label="Места на карте">
        {filters.map(filter => <button type="button" key={filter} aria-pressed={filter === activeFilter}
          onClick={() => { setActiveFilter(filter); setSelectedSlug(null) }}>{filter === 'Рядом' ? 'Все места' : filter}</button>)}
      </div>
    </header>
    <section className="ag-map-stage" aria-label="Интерактивная карта Алматы">
      <div className="ag-map-engine">
        <MapSurface ref={map} places={places} selectedSlug={selectedSlug} savedSlugs={savedSlugs} onSelect={select}
          onReadyChange={setReady} showPlaces={showPlaces} routes={demoRoute} showRoutes={showRoutes} />
        {ready && <MapControls onLayers={() => setLayersOpen(true)} onLocate={() => map.current?.locate()} />}
        {selected && <section className="ag-map-sheet" ref={sheet} tabIndex={-1} aria-label="Выбранное место"
          onKeyDown={event => { if (event.key === 'Escape') close() }}>
          <div className="ag-map-sheet-heading">
            <div><p className="ag-kicker">{selected.category} · точка OSM</p><h2>{selected.title}</h2></div>
            <button className="ag-icon-button" type="button" aria-label="Закрыть карточку" onClick={close}><X aria-hidden="true" /></button>
          </div>
          <p>Географическая точка. Начало тропы и доступ уточняйте отдельно.</p>
          <div className="ag-map-sheet-actions">
            {areaRoutes.map(route => <Link key={route.id} href={`/routes/${route.id}`} className="ag-button ag-button-secondary">{route.title}<ArrowRight aria-hidden="true" /></Link>)}
            <Link href={`/places/${selected.slug}`} className={areaRoutes.length ? 'ag-source' : 'ag-button ag-button-secondary'}>Подробнее<ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>}
      </div>
      <footer className="ag-map-legend">
        <a href="https://www.openstreetmap.org/way/1324066198" target="_blank" rel="noreferrer"><i /> Фрагмент тропы OSM</a>
        <span>Линия не показывает путь целиком</span>
      </footer>
    </section>
    <section className="ag-map-list" aria-label="Список мест">
      <div className="ag-map-list-heading"><h2>Места на карте</h2><span role="status" className="ag-code" aria-label="Количество мест">{places.length}</span></div>
      {places.length ? <ul>{places.map(place => <li key={place.slug}>
        <button type="button" aria-pressed={selectedSlug === place.slug} onClick={() => select(place.slug, true)}>
          <span className="ag-place-icon"><MapPin aria-hidden="true" /></span><span><strong>{place.title}</strong><small>{place.category}</small></span><ArrowRight aria-hidden="true" />
        </button>
      </li>)}</ul> : <p className="ag-empty-inline">Места не найдены. Измените запрос или фильтр.</p>}
      <Link className="ag-button ag-map-catalog" href="/routes"><Mountain aria-hidden="true" />Каталог маршрутов<ArrowRight aria-hidden="true" /></Link>
    </section>
    {layersOpen && <DemoDialog eyebrow="КАРТА" title="Слои карты" onClose={() => setLayersOpen(false)}>
      <span className="map-layer-option"><label><input type="checkbox" checked={showPlaces} onChange={event => { setShowPlaces(event.target.checked); setSelectedSlug(null) }} /> Места</label></span>
      <span className="map-layer-option"><label><input type="checkbox" checked={showRoutes} onChange={event => setShowRoutes(event.target.checked)} /> Фрагмент тропы</label></span>
    </DemoDialog>}
  </div></GuardShell>
}
