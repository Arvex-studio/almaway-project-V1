'use client'

import Link from 'next/link'
import { SaveButton } from '@/components/demo-state'
import { DemoAction } from '@/components/future/demo-dialog'
import { ChevronLeft, Clock3, Compass, MapPin, Mountain, Route, Send, ShieldCheck, Sparkles, Car, Navigation } from 'lucide-react'
import { AppShell, MetricItem, InfoSection, detailIcons } from '@/components/almaway'
import { place } from '@/lib/almaway-data'

export default function PlaceDetail() {

  return (
    <AppShell className="detail-shell">
      <main className="detail-page">
        <div className="hero-photo" style={{ backgroundImage: `url(${place.image})` }}>
          <div className="hero-top">
            <Link href="/map" className="floating-icon" aria-label="Назад">
              <ChevronLeft />
            </Link>
            <div>
              <DemoAction className="floating-icon" label="Поделиться" title="Поделиться" description={`Ссылка на место: /places/${place.slug}`}><Send /></DemoAction>
              <SaveButton className="floating-icon"><MapPin /></SaveButton>
            </div>
          </div>
          <div className="hero-caption">
            <span>{place.region}</span>
            <h1>{place.title}</h1>
          </div>
        </div>

        <div className="detail-body">
          <p className="lead">{place.description}</p>

          <div className="metrics-scroll">
            {place.metrics.map(metric => {
              const Icon = detailIcons[metric.key as keyof typeof detailIcons]
              return (
                <MetricItem
                  key={metric.key}
                  icon={Icon}
                  label={metric.label}
                  value={metric.value}
                />
              )
            })}
          </div>

          <div className="season-note">
            <Compass />
            <div>
              <span>Лучшее время</span>
              <strong>Май — октябрь · утром меньше людей</strong>
            </div>
            <b>≈ 8 000 ₸</b>
          </div>

          <div className="action-grid">
            <SaveButton />
            <Link href="/plan" className="primary-button">Спланировать</Link>
            <Link href="/plan" className="secondary-button">
              <Sparkles /> Спросить AI
            </Link>
          </div>

          <InfoSection icon={Route} title="Почему стоит поехать">
            {place.why}
          </InfoSection>

          <InfoSection icon={Car} title="Как добраться">
            Из Алматы по улице Дулати до поста нацпарка. Последние 8 км — пешком или на экотранспорте.
          </InfoSection>

          <div className="info-grid">
            <InfoTile icon={Car} title="Транспорт" text="Авто + шаттл" />
            <InfoTile icon={ShieldCheck} title="Безопасность" text="Погода меняется быстро" />
            <InfoTile icon={Mountain} title="Что взять" text="Вода, ветровка, SPF" />
            <InfoTile icon={Clock3} title="Выход" text="До 08:00" />
          </div>

          <div className="route-preview">
            <div className="route-line">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div>
              <span>Пеший участок</span>
              <strong>Визит-центр → озеро</strong>
              <small>4,2 км в одну сторону · плавный подъём</small>
            </div>
            <Navigation />
          </div>

          <section className="nearby">
            <div className="section-head">
              <h2>Рядом по пути</h2>
              <Link href="/explore">Все места</Link>
            </div>
            <div className="nearby-card">
              <div>
                <small>По пути</small>
                <strong>Космостанция</strong>
                <span>6 км</span>
              </div>
              <div>
                <small>Водопад</small>
                <strong>Аюсай</strong>
                <span>11 км</span>
              </div>
            </div>
          </section>

          <section className="community-block">
            <h2>Глазами путешественников</h2>
            <div className="community-row">
              <div className="people">
                <span>AM</span>
                <span>DI</span>
                <span>+38</span>
              </div>
              <div>
                <strong>4,8</strong>
                <span>126 отзывов</span>
              </div>
              <DemoAction title="Отзывы" description="Добавление отзывов появится после подключения аккаунтов."><Navigation /> Добавить</DemoAction>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  )
}

function InfoTile({ icon: Icon, title, text }: { icon: typeof Car; title: string; text: string }) {
  return (
    <div className="info-tile">
      <Icon />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  )
}
