'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SaveButton } from '@/components/demo-state'
import { ChevronRight, Map, Route, Sparkles } from 'lucide-react'
import { AppShell, FilterChip } from '@/components/almaway'
import { getTouristPlace } from '@/lib/tourist-places'

const cards = [
  {
    title: 'Большое Алматинское озеро',
    slug: 'bolshoe-almatinskoe-ozero',
    eyebrow: 'Рядом с Алматы',
    filters: ['Рядом', 'На выходные', 'С видом'],
    image: getTouristPlace('bolshoe-almatinskoe-ozero')?.image,
    text: 'Бирюзовая вода, хвойные склоны и горный воздух.',
  },
  {
    title: 'Ущелье Аюсай',
    slug: 'ayusay',
    eyebrow: 'Идея для прогулки',
    filters: ['Рядом', 'С видом'],
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
    text: 'Идея для знакомства с ущельем. Проверенная карточка ещё готовится.',
  },
  {
    title: 'Кольсайские озёра',
    slug: 'kolsay-lakes',
    eyebrow: 'На выходные',
    filters: ['На выходные', 'С видом'],
    image:
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85',
    text: 'Идея для поездки к озёрам. Проверенная карточка ещё готовится.',
  },
]

export default function ExplorePage() {
  const [filter, setFilter] = useState('Все идеи')
  const visibleCards = cards.filter(
    (card) => filter === 'Все идеи' || card.filters.includes(filter),
  )
  return (
    <AppShell className="content-shell">
      <main className="content-page">
        <header className="page-header">
          <div>
            <span className="eyebrow">ALMAWAY / ОТКРЫТИЯ</span>
            <h1>
              Места, которые
              <br />
              <em>хочется запомнить.</em>
            </h1>
            <p>
              Идеи для будущих поездок. Перед выездом проверь погоду и
              доступность маршрута.
            </p>
          </div>
          <Link
            href="/profile"
            className="avatar-large"
            aria-label="Демо-профиль"
          >
            AK
          </Link>
        </header>
        <div className="chip-row">
          {['Все идеи', 'Рядом', 'На выходные', 'С видом'].map((item) => (
            <FilterChip
              key={item}
              active={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </FilterChip>
          ))}
        </div>
        <section className="editorial-intro">
          <div>
            <Sparkles />
            <span>Идея для поездки</span>
            <h2>
              Ближе к горам,
              <br />
              ближе к природе
            </h2>
            <Link href="/places/bolshoe-almatinskoe-ozero">
              Посмотреть место <ChevronRight />
            </Link>
          </div>
          <div className="intro-image" />
        </section>
        <p className="demo-notice">
          Предварительная подборка · фотографии иллюстративные. Сохранения
          работают только в текущей сессии.
        </p>
        <div className="section-head">
          <div>
            <span className="eyebrow">ВДОХНОВЕНИЕ ДЛЯ ПОЕЗДКИ</span>
            <h2>Идеи для открытий</h2>
          </div>
          <Link href="/map">
            Карта <Map />
          </Link>
        </div>
        <div className="place-grid">
          {visibleCards.map((card) => {
            const catalogPlace = getTouristPlace(card.slug)
            return (
              <article className="editorial-card" key={card.slug}>
                {catalogPlace ? (
                  <Link
                    href={`/places/${catalogPlace.slug}`}
                    aria-label={`Открыть: ${catalogPlace.title}`}
                    className="card-image"
                    style={{ backgroundImage: `url(${card.image})` }}
                  />
                ) : (
                  <div
                    className="card-image"
                    style={{ backgroundImage: `url(${card.image})` }}
                  />
                )}
                <div className="card-copy">
                  <span className="eyebrow">{card.eyebrow}</span>
                  {catalogPlace ? (
                    <Link href={`/places/${catalogPlace.slug}`}>
                      <h3>{catalogPlace.title}</h3>
                    </Link>
                  ) : (
                    <h3>{card.title}</h3>
                  )}
                  <p>{card.text}</p>
                  {catalogPlace ? (
                    <div className="card-actions">
                      <SaveButton
                        slug={catalogPlace.slug}
                        title={catalogPlace.title}
                      />
                      <Link
                        href={`/places/${catalogPlace.slug}`}
                        className="primary-button"
                      >
                        Подробнее
                      </Link>
                    </div>
                  ) : (
                    <p className="availability-note">
                      Скоро в каталоге · открытие и сохранение пока недоступны.
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
        <section className="route-banner">
          <Route />
          <div>
            <span className="eyebrow">ДЕМО ПЛАНИРОВЩИКА</span>
            <h2>Представь свой день в горах</h2>
            <p>Посмотри пример плана — без актуальных маршрутных данных.</p>
          </div>
          <Link href="/plan" aria-label="Открыть демо планировщика">
            <ChevronRight />
          </Link>
        </section>
      </main>
    </AppShell>
  )
}
