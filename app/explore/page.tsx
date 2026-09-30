'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SaveButton } from '@/components/demo-state'
import { Bookmark, ChevronRight, Map, Route, Sparkles } from 'lucide-react'
import { AppShell, FilterChip } from '@/components/almaway'
import { place } from '@/lib/almaway-data'

const cards = [
  { title: place.title, slug: place.slug, eyebrow: 'Рядом с Алматы', meta: '28 км · 3–4 часа', image: place.image, text: 'Бирюзовая вода, хвойные склоны и воздух, ради которого хочется выйти пораньше.' },
  { title: 'Ущелье Аюсай', slug: place.slug, eyebrow: 'Скрытое место', meta: '18 км · легко', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85', text: 'Тихая тропа вдоль реки с видом на снежные вершины.' },
  { title: 'Кольсайские озёра', slug: place.slug, eyebrow: 'На выходные', meta: '285 км · 2 дня', image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85', text: 'Маршрут для тех, кому хочется сменить ритм и остаться у воды.' },
]

export default function ExplorePage() {
  const [filter, setFilter] = useState('Для тебя')
  return <AppShell className="content-shell"><main className="content-page"><header className="page-header"><div><span className="eyebrow">ALMAWAY / ОТКРЫТИЯ</span><h1>Места, которые<br /><em>хочется запомнить.</em></h1><p>Собрали идеи для сегодняшнего дня и ближайших выходных.</p></div><Link href="/profile" className="avatar-large">AK</Link></header><div className="chip-row">{['Для тебя', 'Рядом', 'На выходные', 'С видом'].map(item => <FilterChip key={item} active={filter === item} onClick={() => setFilter(item)}>{item}</FilterChip>)}</div><section className="editorial-intro"><div><Sparkles /><span>Подборка дня</span><h2>Горы после<br />первого снега</h2><Link href="/places/bolshoe-almatinskoe-ozero">Смотреть маршрут <ChevronRight /></Link></div><div className="intro-image" /></section><div className="section-head"><div><span className="eyebrow">ИЗБРАННОЕ РЕДАКЦИЕЙ</span><h2>Идеи рядом</h2></div><Link href="/map">На карте <Map /></Link></div><div className="place-grid">{cards.map(card => <article className="editorial-card" key={card.title}><Link href={`/places/${card.slug}`} className="card-image" style={{ backgroundImage: `url(${card.image})` }}><span className="card-save"><Bookmark /></span></Link><div className="card-copy"><span className="eyebrow">{card.eyebrow}</span><Link href={`/places/${card.slug}`}><h3>{card.title}</h3></Link><p>{card.text}</p><div className="card-meta"><span>{card.meta}</span><Link href="/map">На карте</Link></div><div className="card-actions"><SaveButton /><Link href="/plan" className="primary-button">Спланировать</Link></div></div></article>)}</div><section className="route-banner"><Route /><div><span className="eyebrow">КУРАТОРСКИЙ МАРШРУТ</span><h2>Тихий день в Заилийском Алатау</h2><p>Озеро, лесная тропа и место для позднего обеда.</p></div><Link href="/plan"><ChevronRight /></Link></section></main></AppShell>
}
