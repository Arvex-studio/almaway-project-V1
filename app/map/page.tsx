import { MapHome } from '@/components/guard/map-home'
import { getTouristPlace } from '@/lib/tourist-places'

export default async function MapPage({ searchParams }: { searchParams: Promise<{ place?: string }> }) {
  const { place } = await searchParams
  const initialPlace = typeof place === 'string' && getTouristPlace(place) ? place : undefined
  return <MapHome key={initialPlace ?? 'map'} initialPlace={initialPlace} />
}
