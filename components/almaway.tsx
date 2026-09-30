'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Car, ChevronRight, Clock3, Compass, Flag, LocateFixed, Map, MapPinned, Mountain, Navigation, Route, Search, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { SaveButton } from '@/components/demo-state'
import { DemoAction } from '@/components/future/demo-dialog'
import { place } from '@/lib/almaway-data'

const navItems = [
  { href: '/explore', label: 'Открытия', icon: Compass },
  { href: '/plan', label: 'План', icon: Sparkles },
  { href: '/map', label: 'Карта', icon: Map },
  { href: '/saved', label: 'Сохранено', icon: Bookmark },
  { href: '/profile', label: 'Профиль', icon: UserRound },
]

export function BottomNav() {
  const pathname = usePathname()
  return <nav className="bottom-nav" aria-label="Основная навигация">{navItems.map(({ href, label, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`); return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`nav-item ${active ? 'active' : ''} ${href === '/map' ? 'map-tab' : ''}`}><span className="nav-icon"><Icon /></span><span>{label}</span></Link> })}</nav>
}

export function AppShell({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className="app-shell"><div className={`phone-frame ${className}`}>{children}<BottomNav /></div></div> }
export function SearchBar() { return <div className="search-bar"><Search /><span>Куда хочешь отправиться?</span><span className="avatar-mini">AK</span></div> }
export function FilterChip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) { return <button type="button" onClick={onClick} className={`filter-chip ${active ? 'active' : ''}`}>{children}</button> }

export function MapPin({ className = '', selected, saved, routePoint, onClick }: { className?: string; selected?: boolean; saved?: boolean; routePoint?: boolean; onClick?: () => void }) { return <button type="button" aria-label="Открыть место" onClick={onClick} className={`map-pin ${className} ${selected ? 'selected' : ''} ${saved ? 'saved' : ''} ${routePoint ? 'route-point' : ''}`}><span>{saved ? <Bookmark /> : routePoint ? <Flag /> : selected ? <Mountain /> : <Navigation />}</span></button> }
export function ClusterPin({ count, onClick }: { count: number; onClick?: () => void }) { return <button type="button" className="cluster-pin" onClick={onClick} aria-label={`${count} мест`}>{count}</button> }
export function MapControls() { return <div className="map-controls"><DemoAction className="map-control" label="Слои карты" title="Слои карты" description="Сейчас показана демонстрационная карта. Выбор слоёв появится при подключении карт."><MapPinned /></DemoAction><DemoAction className="map-control" label="Моё местоположение" title="Моё местоположение" description="В демо показан Алматинский регион. Геолокация появится при подключении карт."><LocateFixed /></DemoAction></div> }

export function MapSurface({ selected, onSelect }: { selected: boolean; onSelect: () => void }) { return <div className="map-canvas" aria-label="Стилизованная карта Алматинского региона" role="region"><div className="terrain terrain-a"/><div className="terrain terrain-b"/><div className="terrain terrain-c"/><svg className="topo-lines" viewBox="0 0 400 800" preserveAspectRatio="none" aria-hidden="true"><path d="M-40 180C70 110 90 260 210 180s170 40 250-30M-30 210C80 140 110 285 220 210s160 35 240-25M-40 245C70 180 130 310 235 240s155 30 230-20M-60 500c90-100 150 30 235-60s180 15 270-80M-50 540c100-100 160 35 245-55s170 20 260-70M-30 580c100-95 150 30 250-45s150 20 230-60"/><path className="river" d="M325-30c-80 120-35 190-110 280s-20 175-120 260S70 700-10 850"/><path className="trail" d="M45 680c45-90 140-60 145-170s130-85 105-210 55-145 90-205"/></svg><div className="map-label peak-label"><Mountain /> пик Молодёжный <small>4147 м</small></div><div className="map-label lake-label">Большое Алматинское озеро</div><div className="route-mark r1"/><div className="route-mark r2"/><div className="route-mark r3"/><MapPin className="pin-one" selected={selected} onClick={onSelect}/><MapPin className="pin-two" saved onClick={onSelect}/><MapPin className="pin-three" routePoint onClick={onSelect}/><ClusterPin count={8} onClick={onSelect}/></div> }

export function MetricItem({ icon: Icon, label, value }: { icon: typeof Mountain; label: string; value: string }) { return <div className="metric-chip"><Icon /><div><span>{label}</span><strong>{value}</strong></div></div> }
export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { return <button type="button" className="primary-button" onClick={onClick}>{children}</button> }
export function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { return <button type="button" className="secondary-button" onClick={onClick}>{children}</button> }

export function PlacePreviewSheet({ onClose }: { onClose: () => void }) { return <section className="place-sheet" aria-label="Выбранное место"><button className="sheet-handle" onClick={onClose} aria-label="Закрыть карточку" type="button"/><div className="sheet-content"><div className="sheet-photo" style={{ backgroundImage: `url(${place.image})` }}><span className="photo-tag">Выбор AlmaWay</span></div><div className="sheet-info"><div className="sheet-title-row"><div><div className="place-name">{place.title}</div><div className="place-location">{place.region} · {place.distance}</div></div><SaveButton className="save-round"><Bookmark /></SaveButton></div><div className="mini-metrics"><span>Средне</span><span>3–4 часа</span><span>8,4 км</span><span>+420 м</span></div><p className="why">{place.why}</p><div className="sheet-actions"><SaveButton /><Link href="/plan" className="primary-button">План</Link><Link href={`/places/${place.slug}`} className="detail-link">Подробнее <ChevronRight /></Link></div></div></div></section> }

export function InfoSection({ icon: Icon, title, children }: { icon: typeof Route; title: string; children: React.ReactNode }) { return <section className="info-section"><div className="info-heading"><span><Icon /></span><h2>{title}</h2></div><p>{children}</p><DemoAction className="inline-link" title={title} description={typeof children === 'string' ? children : 'Подробности маршрута появятся в следующей версии.'}>Подробнее <ChevronRight /></DemoAction></section> }
export const detailIcons = { difficulty: Mountain, duration: Clock3, route: Route, elevation: Navigation, access: Car, safety: ShieldCheck, take: Bookmark }
export { Bookmark, Car, Clock3, Compass, ChevronRight, Flag, LocateFixed, Map, Mountain, Route, Search, ShieldCheck, Sparkles, UserRound }
