'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Car,
  Clock3,
  Map,
  Mountain,
  Route,
  Sparkles,
} from 'lucide-react'
import { AppShell, FilterChip, PrimaryButton } from '@/components/almaway'

const preferences = [
  'Завтра',
  '15 000 ₸',
  'Авто',
  'Средне',
  'Вдвоём',
  'С видом',
]
export default function PlanPage() {
  const [generated, setGenerated] = useState(false)
  const [selected, setSelected] = useState<string[]>(preferences)
  return (
    <AppShell className="content-shell">
      <main className="content-page planner-page">
        <header className="page-header">
          <div>
            <span className="eyebrow">ALMAWAY / ПЛАН</span>
            <h1>
              Соберём день,
              <br />
              <em>который запомнится.</em>
            </h1>
            <p>Посмотри, как может выглядеть план поездки.</p>
          </div>
          <Sparkles className="page-mark" />
        </header>
        <p className="demo-notice">
          Демо планировщика · AI не подключён. Запрос и предпочтения не меняют
          пример. Время, сложность и бюджет вымышлены; погода и доступность
          маршрута не проверены.
        </p>
        <section className="planner-box">
          <div className="prompt-label">Пример запроса</div>
          <textarea
            aria-label="Запрос для планировщика"
            defaultValue="Куда можно съездить завтра возле Алматы на 15 000 ₸?"
          />
          <div className="preference-grid">
            {preferences.map((item) => (
              <FilterChip
                key={item}
                active={selected.includes(item)}
                onClick={() =>
                  setSelected((values) =>
                    values.includes(item)
                      ? values.filter((value) => value !== item)
                      : [...values, item],
                  )
                }
              >
                {item}
              </FilterChip>
            ))}
          </div>
          <PrimaryButton onClick={() => setGenerated(true)}>
            <Sparkles /> {generated ? 'Пример открыт' : 'Показать демо-план'}
          </PrimaryButton>
        </section>
        {generated && (
          <section className="plan-results" aria-live="polite">
            <div className="section-head">
              <div>
                <span className="eyebrow">ДЕМОНСТРАЦИОННЫЙ ПЛАН</span>
                <h2>День у Большого озера</h2>
              </div>
              <span className="result-count">1 пример</span>
            </div>
            <article className="plan-card">
              <div className="plan-image" />
              <div className="plan-body">
                <span className="eyebrow">АЛМАТИНСКИЙ РЕГИОН</span>
                <h3>Большое Алматинское озеро</h3>
                <div className="plan-metrics">
                  <span>
                    <Clock3 /> 3–4 часа
                  </span>
                  <span>
                    <Car /> Авто + шаттл
                  </span>
                  <span>
                    <Mountain /> Средне
                  </span>
                </div>
                <div className="timeline">
                  <div>
                    <b>08:00</b>
                    <span>Выезд из Алматы</span>
                  </div>
                  <div>
                    <b>09:10</b>
                    <span>Прогулка к озеру</span>
                  </div>
                  <div>
                    <b>13:30</b>
                    <span>Обед и возвращение</span>
                  </div>
                </div>
                <p className="budget">
                  Демо-бюджет <strong>12 500–15 000 ₸</strong>
                </p>
                <div className="card-actions">
                  <Link
                    href="/places/bolshoe-almatinskoe-ozero"
                    className="secondary-button"
                  >
                    Маршрут <ArrowRight />
                  </Link>
                  <Link href="/map" className="primary-button">
                    Открыть на карте <Map />
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}{' '}
        {!generated && (
          <section className="planner-empty">
            <Route />
            <h2>
              Твой следующий маршрут
              <br />
              начинается с вопроса
            </h2>
            <p>
              Можно попробовать ввод и предпочтения. Кнопка покажет один
              фиксированный пример; запрос никуда не отправляется.
            </p>
          </section>
        )}
      </main>
    </AppShell>
  )
}
