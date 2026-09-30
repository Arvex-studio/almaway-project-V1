'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { place } from '@/lib/almaway-data'

const SavedContext = createContext<{
  savedSlugs: readonly string[]
  toggleSaved: (slug: string) => void
} | null>(null)

// Session-only demo state. Replace this boundary with persistence in the next phase.
export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([place.slug])
  return <SavedContext.Provider value={{ savedSlugs, toggleSaved: slug => setSavedSlugs(values => values.includes(slug) ? values.filter(value => value !== slug) : [...values, slug]) }}>{children}</SavedContext.Provider>
}

export function useDemoSaved(slug: string = place.slug) {
  const value = useContext(SavedContext)
  if (!value) throw new Error('Demo save state requires DemoStateProvider')
  return { saved: value.savedSlugs.includes(slug), savedSlugs: value.savedSlugs, toggleSaved: () => value.toggleSaved(slug) }
}

export function SaveButton({ className = 'secondary-button', children, slug = place.slug, title = place.title }: { className?: string; children?: ReactNode; slug?: string; title?: string }) {
  const { saved, toggleSaved } = useDemoSaved(slug)
  return <button type="button" className={className} aria-label={saved ? `Убрать из сохранённого: ${title}` : `Сохранить: ${title}`} aria-pressed={saved} onClick={toggleSaved}>{children ?? (saved ? 'Сохранено' : 'Сохранить')}</button>
}
