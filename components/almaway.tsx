'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bookmark, Car, ChevronRight, Clock3, Compass, Flag, LocateFixed, Map, MapPinned, Mountain, Navigation, Route, Search, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { DemoAction } from '@/components/future/demo-dialog'

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
export function MapControls({ onLocate, onLayers, locationDisabled = false, raised = false }: { onLocate: () => void; onLayers: () => void; locationDisabled?: boolean; raised?: boolean }) { return <div className={`map-controls ${raised ? 'raised' : ''}`}><button type="button" aria-label="Слои карты" onClick={onLayers}><MapPinned /></button><button type="button" aria-label="Моё местоположение" onClick={onLocate} disabled={locationDisabled}><LocateFixed /></button></div> }

export { MapSurface } from '@/components/map/map-surface'

export function MetricItem({ icon: Icon, label, value }: { icon: typeof Mountain; label: string; value: string }) { return <div className="metric-chip"><Icon /><div><span>{label}</span><strong>{value}</strong></div></div> }
export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { return <button type="button" className="primary-button" onClick={onClick}>{children}</button> }
export function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) { return <button type="button" className="secondary-button" onClick={onClick}>{children}</button> }

export function InfoSection({ icon: Icon, title, children }: { icon: typeof Route; title: string; children: React.ReactNode }) { return <section className="info-section"><div className="info-heading"><span><Icon /></span><h2>{title}</h2></div><p>{children}</p><DemoAction className="inline-link" title={title} description={typeof children === 'string' ? children : 'Подробности маршрута появятся в следующей версии.'}>Подробнее <ChevronRight /></DemoAction></section> }
export const detailIcons = { difficulty: Mountain, duration: Clock3, route: Route, elevation: Navigation, access: Car, safety: ShieldCheck, take: Bookmark }
export { Bookmark, Car, Clock3, Compass, ChevronRight, Flag, LocateFixed, Map, Mountain, Route, Search, ShieldCheck, Sparkles, UserRound }
