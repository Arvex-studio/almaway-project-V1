'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { place } from '@/lib/almaway-data'

const SavedContext = createContext<{
  saved: boolean
  toggleSaved: () => void
} | null>(null)

// Session-only demo state. Replace this boundary with persistence in the next phase.
export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(true)
  return <SavedContext.Provider value={{ saved, toggleSaved: () => setSaved(value => !value) }}>{children}</SavedContext.Provider>
}

export function useDemoSaved() {
  const value = useContext(SavedContext)
  if (!value) throw new Error('Demo save state requires DemoStateProvider')
  return value
}

export function SaveButton({ className = 'secondary-button', children }: { className?: string; children?: ReactNode }) {
  const { saved, toggleSaved } = useDemoSaved()
  return <button type="button" className={className} aria-label={saved ? `Убрать из сохранённого: ${place.title}` : `Сохранить: ${place.title}`} aria-pressed={saved} onClick={toggleSaved}>{children ?? (saved ? 'Сохранено' : 'Сохранить')}</button>
}
