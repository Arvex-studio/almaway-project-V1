'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { AppShell, FilterChip, MapControls, MapSurface, PlacePreviewSheet, SearchBar } from '@/components/almaway'

export default function MapHome() {
  const [selected, setSelected] = useState(false)
  const [activeFilter, setActiveFilter] = useState('Рядом')
  const filters = ['Рядом', 'Горы', 'Озёра', 'Маршруты', 'Лёгкие', 'С видом', 'На выходные']

  return (
    <AppShell className="map-shell">
      <main className="map-screen">
        <MapSurface selected={selected} onSelect={() => setSelected(true)} />
        <div className="map-overlay">
          <SearchBar />
          <div className="filter-row">
            {filters.map(filter => (
              <FilterChip
                key={filter}
                active={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </FilterChip>
            ))}
          </div>
        </div>
        <MapControls />
        {!selected && (
          <div className="map-hint">
            <Sparkles />
            <span>
              <strong>12 мест</strong> подходят для поездки сегодня
            </span>
          </div>
        )}
        {selected && <PlacePreviewSheet onClose={() => setSelected(false)} />}
      </main>
    </AppShell>
  )
}
