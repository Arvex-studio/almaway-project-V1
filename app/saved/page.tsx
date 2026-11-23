'use client'

import Link from 'next/link'
import { ArrowLeft, Bookmark } from 'lucide-react'
import { useDemoSaved, SaveButton } from '@/components/demo-state'
import { GuardShell } from '@/components/guard/shell'
import { touristPlaces } from '@/lib/tourist-places'

export default function SavedPage() {
  const { savedSlugs } = useDemoSaved()
  const places = touristPlaces.filter(place => savedSlugs.includes(place.slug))
  return <GuardShell><div className="ag-page ag-page-narrow">
    <Link className="ag-back" href="/profile"><ArrowLeft aria-hidden="true" />Профиль</Link>
    <header className="ag-page-header"><h1>Сохранённые места</h1></header>
    <div className="ag-stack">
      {places.length ? places.map(place => <article className="ag-card ag-panel" key={place.slug}>
        <h2><Link href={`/places/${place.slug}`}>{place.title}</Link></h2><p>{place.region}</p>
        <div className="ag-actions"><SaveButton slug={place.slug} title={place.title} className="ag-button ag-button-secondary" /></div>
      </article>) : <div className="ag-card ag-empty"><Bookmark aria-hidden="true" /><h2>Пока ничего не сохранено</h2><Link className="ag-button" href="/map">Карта</Link></div>}
    </div>
  </div></GuardShell>
}
