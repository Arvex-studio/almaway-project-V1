'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Bookmark, Compass, MapPin, Mountain, Search, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { MapControls } from '@/components/almaway'
import { DemoDialog } from '@/components/future/demo-dialog'
import { MapSurface, type MapSurfaceHandle } from '@/components/map/map-surface'
import type { MapSelection } from '@/components/map/map-types'
import { SaveButton, useDemoSaved } from '@/components/demo-state'
import { demoRoute } from '@/lib/demo-route'
import { guardRoutes } from '@/lib/guard/routes'
import { filterTouristPlaces, getTouristPlace, type MapFilter } from '@/lib/tourist-places'
import { GuardShell } from './shell'

const filters: readonly MapFilter[] = ['Рядом', 'Горы', 'Озёра']
const sourceDate = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeZone: 'UTC' })

export function MapHome({ initialPlace }: { initialPlace?: string }) {
  const map = useRef<MapSurfaceHandle>(null)
  const engine = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const trigger = useRef<{ button: HTMLButtonElement; fromMap: boolean } | null>(null)
  const search = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<MapSelection | null>(initialPlace ? { slug: initialPlace, zoomIn: true } : null)
  const selectedSlug = selection?.slug
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
  const areaRoutes = selected ? guardRoutes.filter(route => route.mapPlace === selected.slug) : []

  const focusPreview = useCallback(() => {
    const stage = engine.current
    if (stage && window.matchMedia('(max-width: 819px)').matches) {
      const mapBounds = stage.getBoundingClientRect()
      const navigation = stage.closest('.ag')?.querySelector('.ag-nav')?.getBoundingClientRect()
      if (navigation && (mapBounds.bottom > navigation.top || mapBounds.top < 0)) {
        stage.scrollIntoView({ block: 'start', behavior: 'instant' })
      }
    }
    content.current?.scrollTo({ top: 0 })
    heading.current?.focus({ preventScroll: true })
  }, [])

  function select(slug: string, button: HTMLButtonElement, fromMap = true) {
    trigger.current = { button, fromMap }
    setSelection({ slug, zoomIn: !fromMap })
  }

  function close() {
    setSelection(null)
    const origin = trigger.current
    trigger.current = null
    if (origin?.button.isConnected) origin.button.focus({ preventScroll: origin.fromMap })
    else search.current?.focus()
  }

  useEffect(() => {
    if (selection) focusPreview()
  }, [selection, focusPreview])

  return <GuardShell><div className="ag-map-layout" onKeyDown={event => {
    if (event.key === 'Escape' && selected && !layersOpen) {
      event.preventDefault()
      close()
    }
  }}>
    <header className="ag-map-intro">
      <span className="ag-kicker"><Compass aria-hidden="true" /> Заилийский Алатау</span>
      <h1>Карта маршрутов</h1>
      <p>Выберите место на карте или откройте каталог с данными горного атласа.</p>
      <label className="ag-search"><Search aria-hidden="true" /><span className="ag-sr">Поиск мест на карте</span>
        <input ref={search} type="search" placeholder="Вершина, ущелье или озеро" value={query} onChange={event => { setQuery(event.target.value); setSelection(null) }} />
      </label>
      <div className="ag-filters" role="group" aria-label="Места на карте">
        {filters.map(filter => <button type="button" key={filter} aria-pressed={filter === activeFilter}
          onClick={() => { setActiveFilter(filter); setSelection(null) }}>{filter === 'Рядом' ? 'Все места' : filter}</button>)}
      </div>
    </header>
    <section className="ag-map-stage" aria-label="Интерактивная карта Алматы">
      <div className="ag-map-engine" ref={engine}>
        <MapSurface ref={map} places={places} selection={selection} selectionPanel={panel} savedSlugs={savedSlugs} onSelect={select}
          onReadyChange={setReady} showPlaces={showPlaces} routes={demoRoute} showRoutes={showRoutes} />
        {ready && <MapControls onLayers={() => setLayersOpen(true)} onLocate={() => map.current?.locate()} />}
        {selected && <section ref={panel} className="ag-map-sheet" aria-labelledby={titleId}>
          <div className="ag-map-sheet-content" ref={content}>
            <header className="ag-map-sheet-heading">
              <div><p className="ag-kicker">{selected.category} · точка OSM</p>
                <h2 id={titleId} ref={heading} tabIndex={-1}>{selected.title}</h2></div>
              <button className="ag-icon-button" type="button" aria-label="Закрыть карточку" onClick={close}><X aria-hidden="true" /></button>
            </header>
            <p className="ag-map-sheet-status">Полного проверенного маршрута пока нет.</p>
            <p>Начало тропы и доступ уточняйте отдельно.</p>
            {areaRoutes.length > 0 && <ul className="ag-map-related" aria-label="Варианты из каталога">
              {areaRoutes.map(route => <li key={route.id}><Link href={`/routes/${route.id}`} className="ag-source">{route.title}<ArrowRight aria-hidden="true" /></Link></li>)}
            </ul>}
          </div>
          <footer className="ag-map-sheet-footer">
            <div className="ag-map-sheet-actions">
              <Link href={`/places/${selected.slug}`} className="ag-button">Подробнее<ArrowRight aria-hidden="true" /></Link>
              <SaveButton slug={selected.slug} title={selected.title} className="ag-icon-button"><Bookmark aria-hidden="true" /></SaveButton>
            </div>
            <div className="ag-map-sheet-source">
              <a href={selected.coordinateSource.url} className="ag-source" target="_blank" rel="noreferrer">
                Координаты: {selected.coordinateSource.provider}<ArrowUpRight aria-hidden="true" />
              </a>
              <span><span className="ag-map-date-label">Данные от </span><time dateTime={selected.coordinateSource.retrievedAt}>{sourceDate.format(new Date(selected.coordinateSource.retrievedAt))}</time></span>
            </div>
          </footer>
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
        <button type="button" aria-pressed={selectedSlug === place.slug} onClick={event => select(place.slug, event.currentTarget, false)}>
          <span className="ag-place-icon"><MapPin aria-hidden="true" /></span><span><strong>{place.title}</strong><small>{place.category}</small></span><ArrowRight aria-hidden="true" />
        </button>
      </li>)}</ul> : <p className="ag-empty-inline">Места не найдены. Измените запрос или фильтр.</p>}
      <Link className="ag-button ag-map-catalog" href="/routes"><Mountain aria-hidden="true" />Каталог маршрутов<ArrowRight aria-hidden="true" /></Link>
    </section>
    {layersOpen && <DemoDialog eyebrow="КАРТА" title="Слои карты" onClose={() => setLayersOpen(false)}>
      <span className="map-layer-option"><label><input type="checkbox" checked={showPlaces} onChange={event => { setShowPlaces(event.target.checked); setSelection(null) }} /> Места</label></span>
      <span className="map-layer-option"><label><input type="checkbox" checked={showRoutes} onChange={event => setShowRoutes(event.target.checked)} /> Фрагмент тропы</label></span>
    </DemoDialog>}
  </div></GuardShell>
}
