import { notFound } from 'next/navigation'
import PlaceDetail from '@/components/places/place-detail'
import { getTouristPlace } from '@/lib/tourist-places'

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const place = getTouristPlace(slug)
  if (!place) notFound()
  return <PlaceDetail place={place} />
}
