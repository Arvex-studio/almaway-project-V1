'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, ChevronRight, Map, Route } from 'lucide-react'
import { AppShell } from '@/components/almaway'
import { useDemoSaved } from '@/components/demo-state'
import { place } from '@/lib/almaway-data'
export default function SavedPage() { const [tab, setTab] = useState('Места'); const { saved } = useDemoSaved(); return <AppShell className="content-shell"><main className="content-page"><header className="page-header"><div><span className="eyebrow">ALMAWAY / ТВОЁ</span><h1>Сохранённое</h1><p>Места и планы, к которым хочется вернуться.</p></div><Bookmark className="page-mark" /></header><div className="segmented">{['Места', 'Маршруты', 'Планы'].map(item => <button type="button" className={tab === item ? 'selected' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>{tab === 'Места' && saved ? <article className="saved-card"><div className="saved-image" style={{ backgroundImage: `url(${place.image})` }} /><div><span className="eyebrow">ЗАИЛИЙСКИЙ АЛАТАУ</span><h2>{place.title}</h2><p>28 км · Средне · 3–4 часа</p><div className="card-actions"><Link href={`/places/${place.slug}`} className="secondary-button">Открыть <ChevronRight /></Link><Link href="/map" className="primary-button">На карте <Map /></Link></div></div></article> : <div className="empty-state"><Route /><h2>Здесь появятся {tab.toLowerCase()}</h2><p>Сохраняй идеи из Открытий и планы из Планировщика — они будут ждать тебя здесь.</p><Link href={tab === 'Планы' ? '/plan' : '/explore'} className="primary-button">Найти идеи</Link></div>}<section className="saved-note"><span>Совет AlmaWay</span><p>Сохраняй не только места, но и настроение поездки — так проще собрать маршрут позже.</p></section></main></AppShell> }
