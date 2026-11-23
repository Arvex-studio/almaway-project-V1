'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { LockKeyhole, Plus } from 'lucide-react'
import { dateLabel, dateValue, trailDate } from '@/lib/guard/planning'
import { durationLabel, getGuardRoute, guardRoutes, guideLabel } from '@/lib/guard/routes'
import { useLocalHikes } from './local-data'

export function Profile() {
  const [records, update] = useLocalHikes()
  const [recordRoute, setRecordRoute] = useState('')
  const [feedback, setFeedback] = useState('')
  const selectedRoute = getGuardRoute(recordRoute)
  const comparable = records.filter(item => item.routeId === selectedRoute?.id)
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const date = String(fields.get('date') ?? '')
    const minutes = Number(fields.get('minutes'))
    if (!selectedRoute || !dateValue(date) || date > trailDate() || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      setFeedback('Проверьте дату, вариант и длительность.')
      return
    }
    const record = { id: crypto.randomUUID(), routeId: selectedRoute.id, date, minutes }
    setFeedback(update(current => [record, ...current]) ? 'Запись сохранена на устройстве.' : 'Не удалось сохранить запись.')
  }
  return <div className="ag-stack">
    <section className="ag-card ag-panel">
      <h2>Мой темп</h2><p>Запишите полное время своего похода вместе с привалами. При сравнении учитывайте сезон, покрытие и состояние группы.</p>
      <form className="ag-stack ag-stack-tight" onSubmit={add}>
        <label className="ag-field">Маршрут<select value={recordRoute} required onChange={event => setRecordRoute(event.target.value)}>
          <option value="">Выберите вариант</option>
          {guardRoutes.filter(route => route.guideMinutes).map(route => <option key={route.id} value={route.id}>{route.title}</option>)}
        </select></label>
        <div className="ag-field-grid">
          <label>Дата похода<input name="date" type="date" required /></label>
          <label>Прошло минут<input name="minutes" type="number" min="1" max="1440" required /></label>
        </div>
        <button className="ag-button" type="submit"><Plus aria-hidden="true" />Добавить запись</button>
      </form>
      {comparable.length > 0 && selectedRoute && <div className="ag-notice">
        <div><strong>Сравнение для этого варианта</strong><p>Последняя личная запись — {durationLabel(comparable[0].minutes)}. Атлас — {guideLabel(selectedRoute)}. Различия в условиях и подсчёте привалов могут менять результат.</p></div>
      </div>}
    </section>
    <section className="ag-card ag-panel"><h2>Прошлые походы</h2>
      {records.length ? <ul className="ag-history">{records.map(record => <li key={record.id}>
        <div><strong>{getGuardRoute(record.routeId)?.title}</strong><p>{dateLabel(record.date)} · {durationLabel(record.minutes)}</p></div>
        <button type="button" className="ag-button ag-button-secondary" aria-label={`Удалить запись за ${dateLabel(record.date)}`}
          onClick={() => setFeedback(update(current => current.filter(item => item.id !== record.id)) ? 'Запись удалена.' : 'Не удалось удалить запись.')}>Удалить</button>
      </li>)}</ul> : <p>Записей пока нет.</p>}
    </section>
    <section className="ag-card ag-panel"><h2><LockKeyhole aria-hidden="true" /> Приватность</h2>
      <p>Планы и записи хранятся в этом браузере. Их можно удалить на соответствующем экране. Удаление данных сайта в настройках браузера также удалит их.</p>
      <Link href="/saved" className="ag-source">Сохранённые места</Link>
    </section>
    <p role="status">{feedback}</p>
  </div>
}
