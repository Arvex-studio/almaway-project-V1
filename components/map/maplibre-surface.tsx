'use client'

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import Link from 'next/link'
import { AttributionControl, Map as LibreMap, Marker, setWorkerUrl, type GeoJSONSource, type FilterSpecification } from 'maplibre-gl'
import type { FeatureCollection, Point, LineString } from 'geojson'
import { createMarkerRenderer } from './map-markers'
import type { MapSurfaceHandle, MapSurfaceProps } from './map-types'

setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

const key = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim()
const emptyRoutes: FeatureCollection<LineString> = { type: 'FeatureCollection', features: [] }
const initialView = { center: [77.03, 43.15] as [number, number], zoom: 10.2 }

function placeFeatures(places: MapSurfaceProps['places']): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: places.map(place => ({
      type: 'Feature', id: place.slug,
      properties: { slug: place.slug },
      geometry: { type: 'Point', coordinates: [...place.coordinates] },
    })),
  }
}

export default function MapLibreSurface(props: MapSurfaceProps & { ref?: Ref<MapSurfaceHandle> }) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LibreMap | null>(null)
  const current = useRef<MapSurfaceProps>(props)
  const markersRef = useRef<ReturnType<typeof createMarkerRenderer> | null>(null)
  const locationRef = useRef<Marker | null>(null)
  const readyRef = useRef(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(key ? 'loading' : 'error')
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(0)
  // Event handlers use current props without reinitializing the map.
  useEffect(() => { current.current = props; markersRef.current?.render() })

  useImperativeHandle(props.ref, () => ({
    locate() {
      const map = mapRef.current
      if (!map || !readyRef.current) return
      if (!navigator.geolocation) { setNotice('Геолокация недоступна в этом браузере.'); return }
      setNotice('Определяем местоположение…')
      navigator.geolocation.getCurrentPosition(position => {
        if (mapRef.current !== map) return
        const coordinates: [number, number] = [position.coords.longitude, position.coords.latitude]
        locationRef.current?.remove()
        const dot = document.createElement('div')
        dot.className = 'almaway-location'
        dot.setAttribute('aria-label', 'Ваше местоположение')
        locationRef.current = new Marker({ element: dot }).setLngLat(coordinates).addTo(map)
        map.flyTo({ center: coordinates, zoom: 13, duration: 700 })
        setNotice('')
      }, error => {
        if (mapRef.current !== map) return
        setNotice(error.code === 1 ? 'Доступ к местоположению запрещён. Карту можно перемещать вручную.' : 'Не удалось определить местоположение. Попробуй ещё раз.')
      }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 })
    },
  }), [])

  useEffect(() => {
    if (!container.current || !key) return
    let disposed = false
    let map: LibreMap
    setStatus('loading')
    setNotice('')
    try {
      map = new LibreMap({
        container: container.current,
        style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${encodeURIComponent(key)}`,
        ...initialView,
        minZoom: 3, maxZoom: 18,
        renderWorldCopies: false,
        attributionControl: false,
      })
    } catch {
      setStatus('error')
      return
    }
    mapRef.current = map
    map.addControl(new AttributionControl({ compact: true, customAttribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>' }), 'bottom-left')
    const markers = createMarkerRenderer(map, () => current.current)
    markersRef.current = markers
    const onLoad = () => {
      if (disposed) return
      map.addSource('almaway-places', {
        type: 'geojson', data: placeFeatures(current.current.places),
        cluster: true, clusterRadius: 52, clusterMaxZoom: 12,
      })
      // Queryable circles drive DOM marker visibility without default provider pins/popups.
      const markerLayers: { id: string; filter: FilterSpecification }[] = [
        { id: 'almaway-cluster-points', filter: ['has', 'point_count'] },
        { id: 'almaway-place-points', filter: ['!', ['has', 'point_count']] },
      ]
      for (const { id, filter } of markerLayers) {
        map.addLayer({ id, type: 'circle', source: 'almaway-places', filter, paint: { 'circle-radius': 1, 'circle-opacity': 0 } })
      }
      map.addSource('almaway-routes', { type: 'geojson', data: current.current.routes ?? emptyRoutes })
      map.addLayer({
        id: 'almaway-route-lines', type: 'line', source: 'almaway-routes',
        layout: { 'line-cap': 'round', 'line-join': 'round', visibility: current.current.showRoutes === false ? 'none' : 'visible' },
        paint: { 'line-color': '#2f7d5b', 'line-width': 4, 'line-opacity': 0.85 },
      })
      readyRef.current = true
      setStatus('ready')
      current.current.onReadyChange?.(true)
      markers.render()
    }
    const onError = () => {
      if (disposed) return
      // MapLibre error URLs can contain the public key; never forward them to UI/logs.
      if (!readyRef.current) setStatus('error')
      else setNotice('Некоторые участки карты не загрузились. Проверь подключение.')
    }
    map.on('load', onLoad)
    map.on('error', onError)
    map.on('render', markers.render)
    const observer = new ResizeObserver(() => { if (!disposed) map.resize() })
    observer.observe(container.current)
    const timeout = window.setTimeout(() => { if (!disposed && !readyRef.current) setStatus('error') }, 20_000)
    return () => {
      disposed = true
      readyRef.current = false
      current.current.onReadyChange?.(false)
      window.clearTimeout(timeout)
      observer.disconnect()
      map.off('load', onLoad)
      map.off('error', onError)
      map.off('render', markers.render)
      markers.remove()
      locationRef.current?.remove()
      locationRef.current = null
      markersRef.current = null
      mapRef.current = null
      map.remove()
    }
  }, [attempt])

  useEffect(() => {
    if (!readyRef.current) return
    const source = mapRef.current?.getSource('almaway-places') as GeoJSONSource | undefined
    source?.setData(placeFeatures(props.places))
  }, [props.places])

  useEffect(() => {
    if (!readyRef.current) return
    const source = mapRef.current?.getSource('almaway-routes') as GeoJSONSource | undefined
    source?.setData(props.routes ?? emptyRoutes)
  }, [props.routes])

  useEffect(() => {
    const map = mapRef.current
    if (map?.getLayer('almaway-route-lines')) map.setLayoutProperty('almaway-route-lines', 'visibility', props.showRoutes === false ? 'none' : 'visible')
  }, [props.showRoutes])

  useEffect(() => {
    const map = mapRef.current
    const place = props.places.find(item => item.slug === props.selectedSlug)
    if (!map || !readyRef.current || !place) return
    map.easeTo({ center: [...place.coordinates], offset: [0, -Math.min(120, map.getContainer().clientHeight * 0.15)], duration: 300 })
  }, [props.selectedSlug, props.places, status])


  return <div className="map-canvas real-map" role="region" aria-label="Туристическая карта Алматинского региона">
    <div ref={container} className="map-engine" />
    {status !== 'ready' && <div className="map-message" role="status" aria-live="polite">
      {status === 'loading' ? <strong>Загружаем карту…</strong> : <><strong>Карта пока недоступна</strong><p>Открой Открытия, чтобы посмотреть места.</p>{key && <button type="button" className="secondary-button" onClick={() => setAttempt(value => value + 1)}>Повторить</button>}<Link href="/explore" className="secondary-button">Открытия</Link></>}
    </div>}
    {notice && status === 'ready' && <div className="map-notice" role="status">{notice}<button type="button" aria-label="Закрыть сообщение" onClick={() => setNotice('')}>×</button></div>}
  </div>
}
