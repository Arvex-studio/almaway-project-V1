import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Map, Mountain, TriangleAlert } from 'lucide-react'
import { GuardShell } from '@/components/guard/shell'
import { RouteMetrics, RouteSource } from '@/components/guard/route-ui'
import { getGuardRoute, guardRoutes } from '@/lib/guard/routes'

export function generateStaticParams() {
  return guardRoutes.map(({ id }) => ({ id }))
}

export default async function RoutePage({ params }: { params: Promise<{ id: string }> }) {
  const route = getGuardRoute((await params).id)
  if (!route) notFound()
  return <GuardShell><div className="ag-page ag-route-detail">
    <Link className="ag-back" href="/routes"><ArrowLeft aria-hidden="true" />Все маршруты</Link>
    <header className="ag-page-header"><span className="ag-kicker">{route.category}{route.guideMinutes && ` · Вариант № ${route.code}`}</span>
      <h1>{route.title}</h1>{route.path.length > 1 && <p>{route.path.join(' → ')}</p>}
    </header>
    <div className="ag-detail-grid">
      <div className="ag-stack">
        <section className="ag-card ag-panel"><h2>Характеристики</h2><RouteMetrics route={route} includeElevation />
          <p>{route.guideMinutes ? 'Атлас публикует общее справочное время. Состав привалов и полевые замеры для этого варианта не подтверждены.' : 'Дистанция, набор и время для конкретного варианта пока неизвестны.'}</p>
          <RouteSource route={route} />
        </section>
        <section className="ag-card ag-panel"><h2>Рельеф и условия</h2><p>{route.conditions}</p><p>{route.season}</p>
          <div className="ag-notice"><Mountain aria-hidden="true" /><div><strong>Профиль высот пока недоступен</strong><p>Для построения профиля нужен проверенный трек целиком.</p></div></div>
        </section>
      </div>
      <aside className="ag-card ag-panel ag-detail-aside">
        <h2>Подготовка</h2>
        <div className="ag-notice"><TriangleAlert aria-hidden="true" /><div><strong>Полный трек пока не проверен</strong><p>Укажите своё окно выхода и возвращения. В плане можно сверить его со световым днём и собрать снаряжение.</p></div></div>
        <Link className="ag-button" href={`/prepare/${route.id}`}>Подготовить поход<ArrowRight aria-hidden="true" /></Link>
        {route.mapPlace && <Link className="ag-button ag-button-secondary" href={`/map?place=${route.mapPlace}`}><Map aria-hidden="true" />Посмотреть район</Link>}
      </aside>
    </div>
  </div></GuardShell>
}
