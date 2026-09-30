import { notFound } from 'next/navigation'
import PlaceDetail from '@/components/places/place-detail'
import { place } from '@/lib/almaway-data'

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug !== place.slug) notFound()
  return <PlaceDetail />
}
