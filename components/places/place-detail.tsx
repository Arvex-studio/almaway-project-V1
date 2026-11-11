'use client'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react'
import { AppShell } from '@/components/almaway'
import { SaveButton } from '@/components/demo-state'
import { PhotoCredit } from '@/components/editorial'
import { place as lake, type PlaceDetails } from '@/lib/almaway-data'
import { getTouristPlace } from '@/lib/tourist-places'
export default function PlaceDetail({
  place = lake,
}: {
  place?: PlaceDetails
}) {
  const record = getTouristPlace(place.slug)
  const isLake = place.slug === lake.slug
  return (
    <AppShell className="detail-shell">
      <main className="atlas-detail">
        <div className="atlas-breadcrumb">
          <Link href="/explore">
            <ArrowLeft /> Все открытия
          </Link>
          <span>АТЛАС / {record?.category || 'МЕСТО'}</span>
        </div>
        <header className="atlas-detail-title">
          <span className="eyebrow">{place.region}</span>
          <h1>{place.title}</h1>
        </header>
        <div className="atlas-detail-layout">
          <figure className="atlas-detail-photo">
            {isLake ? (
              <>
                <img
                  src="/images/bao.webp"
                  alt="Большое Алматинское озеро в окружении снежных гор"
                  fetchPriority="high"
                />
                <PhotoCredit />
              </>
            ) : (
              <div className="atlas-no-photo">
                <MapPin />
                <p>Фотография места ещё готовится.</p>
              </div>
            )}
          </figure>
          <div className="atlas-place-story">
            <span className="eyebrow">ПОЛЕВЫЕ ЗАМЕТКИ</span>
            <h2>
              {isLake ? 'Место, чтобы остановиться.' : 'Открой для себя.'}
            </h2>
            <p className="atlas-lead">{place.description}</p>
            <div className="card-actions">
              <SaveButton slug={place.slug} title={place.title} />
              <Link
                className="primary-button"
                href={`/map?place=${place.slug}`}
              >
                На карте <ArrowUpRight />
              </Link>
            </div>
            <p className="demo-notice">
              Сохранения — только в текущей сессии. Аккаунт не подключён.
            </p>
            <section className="atlas-facts">
              <h2>Перед поездкой</h2>
              <p>
                Время в пути, сложность, стоимость и условия доступа пока не
                подтверждены. Проверь актуальную погоду и ограничения у
                администрации территории.
              </p>
              <dl>
                <div>
                  <dt>Регион</dt>
                  <dd>{place.region}</dd>
                </div>
                <div>
                  <dt>Тип места</dt>
                  <dd>{record?.category || 'Уточняется'}</dd>
                </div>
                <div>
                  <dt>Маршрутные данные</dt>
                  <dd>На проверке</dd>
                </div>
              </dl>
            </section>
            {record && (
              <p className="atlas-source">
                Географический объект:{' '}
                <a
                  href={record.coordinateSource.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenStreetMap ↗
                </a>
                . Координата обозначает объект, а не вход или безопасный
                маршрут.
              </p>
            )}
            <Link className="atlas-text-link" href="/plan">
              Посмотреть демо планировщика <ArrowUpRight />
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
