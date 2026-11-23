'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { readHikes, readTrips } from '@/lib/guard/trips'

const localChange = 'almaway-guard-local-change'
const keys = { trips: 'almaway.guard.trips.v1', hikes: 'almaway.guard.hikes.v1' }

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(localChange, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(localChange, callback)
  }
}

function read(key: string) {
  try { return window.localStorage.getItem(key) } catch { return null }
}

function useLocalList<T>(key: string, parse: (raw: string | null) => T[]) {
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null)
  const items = useMemo(() => parse(raw), [parse, raw])
  const update = useCallback((fn: (current: T[]) => T[]) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(fn(parse(read(key)))))
      window.dispatchEvent(new Event(localChange))
      return true
    } catch { return false }
  }, [key, parse])
  return [items, update] as const
}

export function useLocalTrips() { return useLocalList(keys.trips, readTrips) }
export function useLocalHikes() { return useLocalList(keys.hikes, readHikes) }
