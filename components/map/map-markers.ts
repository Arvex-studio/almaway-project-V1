import { Marker, type Map as LibreMap, type GeoJSONSource, type MapGeoJSONFeature } from 'maplibre-gl'
import type { MapSurfaceProps } from './map-types'

const iconPaths = {
  normal: '<path d="m5 12 14-7-5 14-2-5-7-2Z"/>',
  selected: '<path d="m2 20 7-12 3 5 3-7 7 14H2Z"/>',
  saved: '<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z"/>',
}

// DOM markers retain the approved pin shapes; clustering itself runs in the GeoJSON worker.
export function createMarkerRenderer(map: LibreMap, current: () => MapSurfaceProps) {
  const markers = new Map<string, { marker: Marker; button: HTMLButtonElement; iconState?: keyof typeof iconPaths }>()
  let disposed = false
  function clear() { markers.forEach(({ marker }) => marker.remove()); markers.clear() }
  function render() {
    if (disposed || !map.getLayer('almaway-place-points')) return
    const props = current()
    if (props.showPlaces === false) { clear(); return }
    const visible = new Set<string>()
    const features: Pick<MapGeoJSONFeature, 'geometry' | 'properties'>[] = map.queryRenderedFeatures({ layers: ['almaway-place-points', 'almaway-cluster-points'] })
    const selectedPlace = props.places.find(place => place.slug === props.selectedSlug)
    if (selectedPlace && !features.some(feature => feature.properties.slug === selectedPlace.slug)) {
      features.push({ geometry: { type: 'Point', coordinates: [...selectedPlace.coordinates] }, properties: { slug: selectedPlace.slug } })
    }
    for (const feature of features) {
      if (feature.geometry.type !== 'Point') continue
      const data = feature.properties
      const cluster = Boolean(data.cluster)
      const slug = String(data.slug ?? '')
      const place = cluster ? undefined : props.places.find(item => item.slug === slug)
      if (!cluster && !place) continue
      const id = cluster ? `cluster:${data.cluster_id}` : slug
      if (visible.has(id)) continue
      visible.add(id)
      let entry = markers.get(id)
      if (!entry) {
        const wrapper = document.createElement('div')
        wrapper.className = 'almaway-marker'
        if (cluster) wrapper.dataset.clusterId = String(data.cluster_id)
        else wrapper.dataset.slug = slug
        const button = document.createElement('button')
        button.type = 'button'
        wrapper.append(button)
        const coordinates = feature.geometry.coordinates.slice(0, 2) as [number, number]
        button.addEventListener('click', async event => {
          event.stopPropagation()
          if (disposed) return
          if (!cluster) { current().onSelect(slug); return }
          try {
            const source = map.getSource('almaway-places') as GeoJSONSource
            const zoom = await source.getClusterExpansionZoom(Number(data.cluster_id))
            if (!disposed) map.easeTo({ center: entry!.marker.getLngLat(), zoom: Math.min(zoom + 0.2, map.getMaxZoom()), duration: 350 })
          } catch { /* Source may be replaced while a cluster lookup is in flight. */ }
        })
        entry = { marker: new Marker({ element: wrapper, anchor: 'center' }).setLngLat(coordinates).addTo(map), button }
        markers.set(id, entry)
      }
      const [longitude, latitude] = feature.geometry.coordinates
      const position = entry.marker.getLngLat()
      if (position.lng !== longitude || position.lat !== latitude) entry.marker.setLngLat([longitude, latitude])
      if (cluster) {
        entry.button.className = 'cluster-pin'
        entry.button.textContent = String(data.point_count)
        entry.button.setAttribute('aria-label', `${data.point_count} мест: увеличить масштаб`)
      } else {
        const selected = props.selectedSlug === slug
        const saved = props.savedSlugs.includes(slug)
        entry.button.className = `map-pin ${selected ? 'selected' : saved ? 'saved' : ''}`
        entry.button.setAttribute('aria-label', `Открыть место: ${place!.title}`)
        entry.button.setAttribute('aria-pressed', String(selected))
        // Only constant, local icon markup enters HTML; place text stays in attributes/textContent.
        const iconState = selected ? 'selected' : saved ? 'saved' : 'normal'
        if (entry.iconState !== iconState) {
          entry.button.innerHTML = `<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[iconState]}</svg></span>`
          entry.iconState = iconState
        }
      }
    }
    for (const [id, entry] of markers) if (!visible.has(id)) { entry.marker.remove(); markers.delete(id) }
  }
  return { render, remove: () => { disposed = true; clear() } }
}
