'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { AppShell, FilterChip } from '@/components/almaway'
import { SaveButton } from '@/components/demo-state'
import { PhotoCredit } from '@/components/editorial'
const ideas = [
  {
    title: 'Ущелье Аюсай',
    slug: 'ayusay',
    tag: 'Рядом',
    text: 'Ущелье в предгорьях. Собираем проверенные сведения о месте.',
  },
  {
    title: 'Кольсайские озёра',
    slug: 'kolsay-lakes',
    tag: 'На выходные',
    text: 'Озёра среди гор. Готовим карточку и источники для будущих поездок.',
  },
]
export default function Explore() {
  const [filter, setFilter] = useState('Все идеи')
  return (
    <AppShell className="content-shell">
      <main className="atlas-explore content-page">
        <header className="atlas-title">
          <span className="eyebrow">01 / ОТКРЫТИЯ</span>
          <h1>
            За пределами
            <br />
            <em>города.</em>
          </h1>
          <div>
            <p>
              Алматы заканчивается.
              <br />
              Открытия — нет.
            </p>
            <Link href="/map" className="atlas-text-link">
              Исследовать карту <ArrowUpRight />
            </Link>
          </div>
        </header>
        <div className="chip-row">
          {['Все идеи', 'Рядом', 'На выходные', 'С видом'].map((x) => (
            <FilterChip
              key={x}
              active={filter === x}
              onClick={() => setFilter(x)}
            >
              {x}
            </FilterChip>
          ))}
        </div>
        <article className="atlas-feature">
          <figure>
            <Link
              href="/places/bolshoe-almatinskoe-ozero"
              aria-label="Открыть: Большое Алматинское озеро"
            >
              <img
                src="/images/bao.webp"
                alt="Заснеженные склоны вокруг Большого Алматинского озера"
                fetchPriority="high"
              />
            </Link>
            <span className="atlas-index">01</span>
            <PhotoCredit />
          </figure>
          <div className="atlas-feature-copy">
            <span className="eyebrow">ОЗЕРО / ЗАИЛИЙСКИЙ АЛАТАУ</span>
            <Link href="/places/bolshoe-almatinskoe-ozero">
              <h2>
                Большое
                <br />
                Алматинское озеро
              </h2>
            </Link>
            <p>
              Вода, камень, тишина. Посмотри на знакомые горы с другой стороны.
            </p>
            <div className="card-actions">
              <Link
                className="primary-button"
                href="/places/bolshoe-almatinskoe-ozero"
              >
                Открыть место <ArrowUpRight />
              </Link>
              <SaveButton
                slug="bolshoe-almatinskoe-ozero"
                title="Большое Алматинское озеро"
              />
            </div>
          </div>
        </article>
        <p className="demo-notice">
          Предварительная подборка. Перед поездкой проверь погоду и ограничения.
          Сохранения — только на время сессии.
        </p>
        <section className="atlas-directory">
          <div className="section-head">
            <h2>Следующие открытия</h2>
            <span className="eyebrow">В РАБОТЕ / 02—03</span>
          </div>
          {ideas
            .filter(
              (x) =>
                filter === 'Все идеи' ||
                filter === 'С видом' ||
                filter === x.tag,
            )
            .map((x, i) => (
              <article className="atlas-row" key={x.slug}>
                <span className="atlas-number">0{ideas.indexOf(x) + 2}</span>
                <div>
                  <span className="eyebrow">{x.tag}</span>
                  <h3>{x.title}</h3>
                  <p>{x.text}</p>
                  <p className="availability-note">
                    Скоро в каталоге · открытие и сохранение пока недоступны.
                  </p>
                </div>
                <ArrowUpRight aria-hidden="true" />
              </article>
            ))}
        </section>
        <Link href="/plan" className="atlas-plan-link">
          <span className="eyebrow">ДЕМО ПЛАНИРОВЩИКА</span>
          <strong>
            Меньше планов.
            <br />
            Больше открытий.
          </strong>
          <span>
            Посмотреть пример <ArrowRight />
          </span>
        </Link>
      </main>
    </AppShell>
  )
}
