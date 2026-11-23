'use client'

import Link from 'next/link'
import { ArrowUpRight, Bookmark, ChevronRight, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { SaveButton } from '@/components/demo-state'
import type { TouristPlace } from '@/lib/tourist-places'

const sourceDateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeZone: 'UTC' })

export function PlacePreviewSheet({ selectedPlace, onClose }: { selectedPlace: TouristPlace; onClose: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const { category, coordinateSource, image, metrics, region, slug, title, why } = selectedPlace

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [slug])

  return (
    <section className="place-sheet" aria-labelledby={titleId}>
      <header className="sheet-heading">
        {image && <div className="sheet-photo" aria-hidden="true" style={{ backgroundImage: `url(${image})` }} />}
        <div className="sheet-identity">
          <p>{category} · {region}</p>
          <h2 id={titleId} ref={heading} tabIndex={-1}>{title}</h2>
        </div>
        <button className="sheet-close" onClick={onClose} aria-label="Закрыть карточку" type="button">
          <X aria-hidden="true" />
        </button>
      </header>

      {metrics.length > 0 ? (
        <div className="sheet-route">
          <p>Параметры маршрута · демо</p>
          <dl className="sheet-metrics">
            {metrics.map(metric => (
              <div key={metric.key}>
                <dt>{metric.key === 'route' ? 'Длина' : metric.label}</dt>
                <dd>{metric.key === 'elevation' ? `+${metric.value}` : metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : <p className="sheet-route-empty">Для этой точки пока нет данных о маршруте.</p>}
      <p className="sheet-summary">{why}</p>

      <div className="sheet-actions">
        <Link href={`/places/${slug}`} className="primary-button">Подробнее <ChevronRight aria-hidden="true" /></Link>
        <Link href="/plan" className="secondary-button">План</Link>
        <SaveButton slug={slug} title={title} className="secondary-button sheet-save">
          <Bookmark aria-hidden="true" />
        </SaveButton>
      </div>

      <p className="sheet-source">
        <a href={coordinateSource.url}>Координаты: {coordinateSource.provider} <ArrowUpRight aria-hidden="true" /></a>
        <time dateTime={coordinateSource.retrievedAt}>{sourceDateFormat.format(new Date(coordinateSource.retrievedAt))}</time>
      </p>
    </section>
  )
}
