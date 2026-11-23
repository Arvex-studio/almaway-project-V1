'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, LockKeyhole, TriangleAlert } from 'lucide-react'
import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { packingList } from '@/lib/guard/packing'
import { calculateDay, dateValue, daylight, clockLabel } from '@/lib/guard/planning'
import { guideLabel, type GuardRoute } from '@/lib/guard/routes'
import type { LocalTrip } from '@/lib/guard/trips'
import type { WeatherSnapshot } from '@/lib/guard/weather'
import { DayTimeline } from './day-timeline'
import { useLocalTrips } from './local-data'
import { PackingList } from './packing-list'
import { RouteSource } from './route-ui'
import { GuardShell } from './shell'
import { WeatherPanel } from './weather-panel'

const noSubscription = () => () => {}

export function Prepare({ route, today, draftId }: { route: GuardRoute; today: string; draftId?: string }) {
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false)
  const [trips] = useLocalTrips()
  const draft = trips.find(item => item.id === draftId && item.routeId === route.id)
  return <GuardShell><div className="ag-page">
    <Link className="ag-back" href={`/routes/${route.id}`}><ArrowLeft aria-hidden="true" />К маршруту</Link>
    <header className="ag-page-header"><span className="ag-kicker">{route.title}</span><h1>Подготовка похода</h1>
      <p>Сверьте своё время со световым днём и соберите снаряжение по условиям.</p>
    </header>
    {draftId && !hydrated ? <p role="status">Открываем локальный план…</p> :
      draftId && !draft ? <div className="ag-card ag-panel"><h2>План недоступен на этом устройстве</h2><Link className="ag-button" href={`/prepare/${route.id}`}>Создать новый</Link></div> :
        <PrepareForm key={draft?.id ?? 'new'} route={route} today={today} draft={draft} hydrated={hydrated} />}
  </div></GuardShell>
}

function PrepareForm({ route, today, draft, hydrated }: { route: GuardRoute; today: string; draft?: LocalTrip; hydrated: boolean }) {
  const [, updateTrips] = useLocalTrips()
  const [date, setDate] = useState(draft?.date ?? today)
  const [starts, setStarts] = useState(draft?.start ?? '08:00')
  const [returns, setReturns] = useState(draft?.end ?? '')
  const [rest, setRest] = useState(String(draft?.restMinutes ?? 30))
  const [checked, setChecked] = useState(draft?.checked ?? [])
  const [snapshot, setSnapshot] = useState<WeatherSnapshot>()
  const [savedId, setSavedId] = useState(draft?.id)
  const [feedback, setFeedback] = useState<'idle' | 'saved' | 'error'>('idle')
  const data = { date, start: starts, end: returns, restMinutes: rest.trim() ? Number(rest) : NaN }
  const result = calculateDay(route, data)
  const valid = 'value' in result && date >= today
  const day = 'value' in result ? result.value : undefined
  const chosenDate = dateValue(date)
  const sun = chosenDate && daylight(chosenDate, route.weather[0]?.coordinates ?? [77.059452, 43.1570802])
  const forecast = snapshot?.date === date && !snapshot.stale && route.weather.length > 1
    && snapshot.points.length === route.weather.length ? snapshot.points : undefined
  const pack = packingList(day?.total ?? 0, forecast && {
    minTemperature: Math.min(...forecast.map(point => point.minTemperature)),
    precipitation: Math.max(...forecast.map(point => point.precipitation)),
    wind: Math.max(...forecast.map(point => point.wind)),
  })

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid) return
    const id = savedId ?? crypto.randomUUID()
    const trip: LocalTrip = { ...data, routeId: route.id, id, checked, updatedAt: new Date().toISOString() }
    const saved = updateTrips(items => [trip, ...items.filter(item => item.id !== id)])
    if (saved) setSavedId(id)
    setFeedback(saved ? 'saved' : 'error')
  }

  return <div className="ag-prepare-grid">
      <form className="ag-card ag-panel ag-prepare-form" onSubmit={save} onChange={() => setFeedback('idle')}>
        <div className="ag-panel-heading"><h2><CalendarDays aria-hidden="true" /> Время выхода</h2><span className="ag-code">Алматы</span></div>
        <div className="ag-notice"><TriangleAlert aria-hidden="true" /><div>
          <strong>Возвращение указывается вручную</strong>
          <p>{route.guideMinutes ? `Справка по атласу: ${guideLabel(route)}. ` : ''}Полного проверенного трека нет. Время до вершины и разворота пока не рассчитывается.</p>
          <RouteSource route={route} />
        </div></div>
        <div className="ag-field-grid">
          <label>Дата<input type="date" value={date} min={today} required disabled={!hydrated} onChange={event => setDate(event.target.value)} /></label>
          <label>Привал, мин<input type="number" min="0" max="1438" step="1" value={rest} required disabled={!hydrated} onChange={event => setRest(event.target.value)} /></label>
          <label>Старт<input type="time" value={starts} required disabled={!hydrated} onChange={event => setStarts(event.target.value)} /></label>
          <label>Возвращение<input type="time" value={returns} required disabled={!hydrated} onChange={event => setReturns(event.target.value)} /></label>
        </div>
        <p id="ag-save-note" className={!valid && returns ? 'ag-warning-text' : 'ag-muted'}>
          {date && date < today ? 'Выберите дату сегодня или позже.' : !returns ? 'Укажите время возвращения, чтобы сохранить план.' : 'error' in result ? result.error : 'План сохранится в этом браузере.'}</p>
        <div className="ag-actions">
          <button className="ag-button" type="submit" disabled={!hydrated || !valid} aria-describedby="ag-save-note"><LockKeyhole aria-hidden="true" />{savedId ? 'Сохранить изменения' : 'Сохранить план'}</button>
          {feedback === 'saved' && <Link className="ag-source" href={`/trip#${savedId}`}>Открыть мой поход<ArrowRight aria-hidden="true" /></Link>}
        </div>
        <p role="status">{feedback === 'saved' ? 'План сохранён на устройстве.' : feedback === 'error' ? 'Не удалось сохранить. Проверьте доступ к хранилищу браузера.' : ''}</p>
      </form>
    <div className="ag-stack ag-prepare-summary">
      {day ? <DayTimeline day={day} restMinutes={data.restMinutes} /> : <section className="ag-card ag-panel">
        <h2>Световой день</h2>
        {sun && <p className="ag-code">{clockLabel(sun.sunrise)} — {clockLabel(sun.sunset)} · Алматы</p>}
        <p>Укажите время возвращения, чтобы сравнить план со световым днём. Расчёт без поправки на рельеф.</p>
      </section>}
      <WeatherPanel route={route} date={date} onSnapshot={setSnapshot} />
    </div>
    <PackingList items={pack} checked={checked} onChange={(id, value) => {
      setChecked(previous => value ? [...previous, id] : previous.filter(item => item !== id))
      setFeedback('idle')
    }} />
  </div>
}
