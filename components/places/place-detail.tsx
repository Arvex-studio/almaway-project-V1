import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import { SaveButton } from '@/components/demo-state'
import { GuardShell } from '@/components/guard/shell'
import { guardRoutes } from '@/lib/guard/routes'
import type { TouristPlace } from '@/lib/tourist-places'

export default function PlaceDetail({ place }: { place: TouristPlace }) {
  const routes = guardRoutes.filter(route => route.mapPlace === place.slug)
  return <GuardShell><div className="ag-page ag-page-narrow">
    <Link href={`/map?place=${place.slug}`} className="ag-back"><ArrowLeft aria-hidden="true" />На карту</Link>
    <header className="ag-page-header"><span className="ag-kicker">{place.region} · {place.category}</span><h1>{place.title}</h1></header>
    <section className="ag-card ag-panel">
      <h2><MapPin aria-hidden="true" /> Точка на карте</h2>
      <p>Координаты описывают географический объект. Начало тропы, доступ и условия проверяйте отдельно.</p>
      <p className="ag-code">{place.coordinates[1].toFixed(5)}° N · {place.coordinates[0].toFixed(5)}° E</p>
      <p>Дата извлечения: {place.coordinateSource.retrievedAt}</p>
      <div className="ag-actions">
        <a className="ag-source" href={place.coordinateSource.url} target="_blank" rel="noreferrer">OpenStreetMap<ArrowUpRight aria-hidden="true" /></a>
        <SaveButton slug={place.slug} title={place.title} className="ag-button ag-button-secondary" />
      </div>
    </section>
    <section className="ag-card ag-panel ag-place-related">
      <h2>Рядом в каталоге</h2>
      {routes.length ? routes.map(route => <Link key={route.id} className="ag-source" href={`/routes/${route.id}`}>{route.title}<ArrowRight aria-hidden="true" /></Link>) :
        <p>Для этого места пока нет отдельной карточки маршрута.</p>}
    </section>
  </div></GuardShell>
}
