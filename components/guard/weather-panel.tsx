'use client'

import { CloudSun, RefreshCw, Wind } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dateValue, trailTimezone } from '@/lib/guard/planning'
import type { GuardRoute } from '@/lib/guard/routes'
import { weatherSource, type WeatherSnapshot } from '@/lib/guard/weather'
import { useGuardOnline } from './shell'

type State = { loading: true } | { error: string } | { data: WeatherSnapshot }

const errors: Record<string, string> = {
  'out-of-range': 'Прогноз доступен на сегодня и шесть следующих дней.',
  disabled: 'Поставщик прогноза для этой среды не включён.',
  unavailable: 'Не удалось получить прогноз. Проверьте его позднее.',
}

export function WeatherPanel({ route, date, onSnapshot }: {
  route: GuardRoute; date: string; onSnapshot: (snapshot?: WeatherSnapshot) => void
}) {
  const online = useGuardOnline()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<State>({ loading: true })

  useEffect(() => {
    onSnapshot(undefined)
    if (!route.weather.length || !dateValue(date) || !online) return
    const controller = new AbortController()
    const params = new URLSearchParams({ route: route.id, date })
    setState({ loading: true })
    async function load() {
      try {
        const response = await fetch(`/api/guard/weather?${params}`, { signal: controller.signal })
        if (controller.signal.aborted) return
        if (!response.ok) {
          const payload = await response.json()
          if (!controller.signal.aborted) setState({ error: errors[payload.error] ?? errors.unavailable })
          return
        }
        const data: WeatherSnapshot = await response.json()
        if (controller.signal.aborted) return
        setState({ data })
        onSnapshot(data)
      } catch {
        if (!controller.signal.aborted) setState({ error: errors.unavailable })
      }
    }
    void load()
    return () => controller.abort()
  }, [route, date, online, attempt, onSnapshot])

  const unavailable = !route.weather.length ? 'Для этого варианта пока нет проверенных точек прогноза.' :
    !dateValue(date) ? 'Выберите дату похода.' : !online ? 'Нет подключения для получения прогноза.' : undefined
  const snapshot = 'data' in state && state.data.date === date && !unavailable ? state.data : undefined
  const updated = snapshot && new Intl.DateTimeFormat('ru', {
    timeZone: trailTimezone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(snapshot.retrievedAt))

  return <section className="ag-card ag-panel" aria-labelledby="ag-weather-title">
    <div className="ag-panel-heading"><h2 id="ag-weather-title"><CloudSun aria-hidden="true" /> Погода</h2>
      <a href={weatherSource} target="_blank" rel="noreferrer" className="ag-source">Open-Meteo</a></div>
    {unavailable ? <p role="status">{unavailable}</p> :
      'error' in state ? <div className="ag-stack ag-stack-tight"><p role="status">{state.error}</p>
        <button className="ag-button ag-button-secondary" type="button" onClick={() => setAttempt(value => value + 1)}><RefreshCw aria-hidden="true" />Повторить</button></div> :
      !snapshot ? <div className="ag-weather-loading" role="status">Получаем прогноз…</div> :
      <>
        <p className={snapshot.stale ? 'ag-warning-text' : 'ag-muted'} role="status">
          {snapshot.stale ? 'Прогноз устарел. Проверьте условия перед выходом. ' : ''}Получен {updated}, Алматы.
        </p>
        <div className="ag-weather-grid">{snapshot.points.map(point => <div key={point.label} className="ag-weather-point">
          <strong>{point.label}</strong><small>Высота модели {Math.round(point.elevation)} м</small>
          <b>{Math.round(point.minTemperature)}…{Math.round(point.maxTemperature)} °C</b>
          <span><Wind aria-hidden="true" /> Порывы {Math.round(point.wind)} км/ч · осадки до {point.precipitation}%</span>
        </div>)}</div>
        {snapshot.points.length < route.weather.length && <p>Для части точек прогноз недоступен.</p>}
        {route.weather.length === 1 && <p>Для верхней точки варианта прогноз пока недоступен.</p>}
        <p className="ag-muted">Суточные значения для указанных точек. Условия на тропе могут отличаться.</p>
      </>}
  </section>
}
