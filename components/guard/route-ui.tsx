import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Clock3, Milestone, Mountain, TrendingUp } from 'lucide-react'
import { guideLabel, type GuardRoute } from '@/lib/guard/routes'

export function RouteMetrics({ route, includeElevation = false }: { route: GuardRoute; includeElevation?: boolean }) {
  const values = [
    { icon: Milestone, label: 'Дистанция', value: route.distance === undefined ? '—' : `${route.distance.toLocaleString('ru')} км` },
    { icon: TrendingUp, label: 'Набор', value: route.gain === undefined ? '—' : `+${route.gain} м` },
    { icon: Clock3, label: 'По атласу', value: route.guideMinutes ? guideLabel(route) : '—' },
  ]
  if (includeElevation) values.push({ icon: Mountain, label: 'Отметка по источнику', value: route.elevation === undefined ? '—' : `${route.elevation} м` })
  return <dl className="ag-metrics">
    {values.map(({ icon: Icon, label, value }) => <div key={label}><dt><Icon aria-hidden="true" />{label}</dt>
      <dd>{value === '—' ? <><span aria-hidden="true">—</span><span className="ag-sr">Нет данных</span></> : value}</dd></div>)}
  </dl>
}

export function RouteSource({ route }: { route: GuardRoute }) {
  return <a className="ag-source" href={route.source.url} target="_blank" rel="noreferrer">{route.source.label}<ArrowUpRight aria-hidden="true" /></a>
}

export function RouteCard({ route, compact = false }: { route: GuardRoute; compact?: boolean }) {
  return <article className={`ag-card ag-route-card ${compact ? 'ag-route-compact' : ''}`}>
    <div className="ag-route-top"><span className="ag-kicker">{route.category}</span><span className="ag-code">{route.id.endsWith('-point') ? 'ТОЧКА OSM' : '№ ' + route.code}</span></div>
    <h2><Link href={`/routes/${route.id}`}>{route.title}<ArrowRight aria-hidden="true" /></Link></h2>
    <p className="ag-route-path">{route.path.length > 1 ? route.path.join(' → ') : 'Географическая точка'}</p>
    <RouteMetrics route={route} />
    {!compact && <div className="ag-route-bottom"><RouteSource route={route} /><span>Без полного трека</span></div>}
  </article>
}
