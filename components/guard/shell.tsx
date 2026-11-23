'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Backpack, Map, Mountain, Route, UserRound } from 'lucide-react'
import { useSyncExternalStore, type ReactNode } from 'react'

const tabs = [
  { name: 'Карта', href: '/map', icon: Map },
  { name: 'Маршруты', href: '/routes', icon: Route },
  { name: 'Мой поход', href: '/trip', icon: Backpack },
  { name: 'Профиль', href: '/profile', icon: UserRound },
]

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function useGuardOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true)
}

export function GuardShell({ children }: { children: ReactNode }) {
  const path = usePathname()
  const online = useGuardOnline()
  return <div className="ag">
    <a className="ag-skip" href="#ag-main">К содержанию</a>
    <header className="ag-header">
      <div className="ag-header-inner">
        <Link className="ag-brand" href="/map" aria-label="Almaway Guard — карта"><span><Mountain aria-hidden="true" /></span><b>Almaway<span> Guard</span></b></Link>
        <nav aria-label="Основная навигация" className="ag-nav">
          {tabs.map(({ name, href, icon: Icon }) => {
            const active = path === href || path.startsWith(href + '/') || (href === '/routes' && path.startsWith('/prepare/'))
            return <Link key={href} href={href} aria-current={active ? 'page' : undefined}><Icon aria-hidden="true" /><span>{name}</span></Link>
          })}
        </nav>
        <span className="ag-header-region">Алматы · Казахстан</span>
      </div>
    </header>
    {!online && <p className="ag-offline" role="status">Нет сети. План на этом устройстве доступен, пока страница открыта.</p>}
    <main id="ag-main" tabIndex={-1}>{children}</main>
  </div>
}
