import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { Prepare } from '@/components/guard/prepare'
import { trailDate } from '@/lib/guard/planning'
import { getGuardRoute } from '@/lib/guard/routes'

export default async function PreparePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ draft?: string }> }) {
  await connection()
  const route = getGuardRoute((await params).id)
  if (!route) notFound()
  const { draft } = await searchParams
  return <Prepare route={route} today={trailDate()} draftId={typeof draft === 'string' ? draft : undefined} />
}
