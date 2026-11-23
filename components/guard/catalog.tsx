'use client'

import { useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { searchGuardRoutes, type RouteCategory } from '@/lib/guard/routes'
import { RouteCard } from './route-ui'

const categories: RouteCategory[] = ['Вершина', 'Перевал', 'Высокогорье']

export function Catalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<RouteCategory>()
  const routes = searchGuardRoutes(query, category)
  return <>
    <div className="ag-toolbar">
      <label className="ag-search"><Search aria-hidden="true" /><span className="ag-sr">Поиск маршрутов</span>
        <input type="search" placeholder="Название, ущелье или номер" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <div className="ag-filters" role="group" aria-label="Категории">
        <button type="button" aria-pressed={!category} onClick={() => setCategory(undefined)}>Все</button>
        {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
    </div>
    <p role="status" className="ag-result-count">Найдено маршрутов и точек: {routes.length}</p>
    {routes.length ? <div className="ag-catalog-grid">{routes.map(route => <RouteCard key={route.id} route={route} />)}</div> :
      <div className="ag-card ag-empty"><SearchX aria-hidden="true" /><h2>Ничего не нашлось</h2><p>Попробуйте другое название или сбросьте фильтры.</p>
        <button className="ag-button ag-button-secondary" type="button" onClick={() => { setQuery(''); setCategory(undefined) }}>Сбросить фильтры</button>
      </div>}
  </>
}
