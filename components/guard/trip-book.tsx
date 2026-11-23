'use client'

import Link from 'next/link'
import { ArrowRight, Backpack, Clipboard, Download, LockKeyhole, Pencil, Share2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { dateLabel } from '@/lib/guard/planning'
import { getGuardRoute } from '@/lib/guard/routes'
import { tripText, type LocalTrip } from '@/lib/guard/trips'
import { useLocalTrips } from './local-data'

export function TripBook() {
  const [trips, update] = useLocalTrips()
  const [status, setStatus] = useState('')
  return <div className="ag-stack">
    <div className="ag-notice"><LockKeyhole aria-hidden="true" /><div><strong>Только этот браузер</strong><p>Для близких можно скопировать, скачать или передать текст вручную. Almaway Guard не следит за возвращением.</p></div></div>
    {trips.length ? trips.map(trip => <TripCard key={trip.id} trip={trip} onDelete={() => {
      setStatus(update(current => current.filter(item => item.id !== trip.id)) ? 'План удалён с устройства.' : 'Не удалось удалить план.')
    }} />) : <section className="ag-card ag-empty">
      <Backpack aria-hidden="true" /><h2>Пока нет сохранённых планов</h2><p>Выберите маршрут, чтобы спланировать время и снаряжение.</p>
      <Link className="ag-button" href="/routes">Найти маршрут<ArrowRight aria-hidden="true" /></Link>
    </section>}
    <div role="status">{status}</div>
  </div>
}

function TripCard({ trip, onDelete }: { trip: LocalTrip; onDelete: () => void }) {
  const route = getGuardRoute(trip.routeId)!
  const [feedback, setFeedback] = useState('')
  const [removing, setRemoving] = useState(false)
  const content = tripText(trip)
  async function copy() {
    try { await navigator.clipboard.writeText(content); setFeedback('План скопирован.') }
    catch { setFeedback('Не удалось скопировать. Выделите текст или скачайте файл.') }
  }
  async function share() {
    if (!navigator.share) { await copy(); return }
    try { await navigator.share({ title: 'Мой план похода', text: content }); setFeedback('Системное меню обмена завершено.') }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setFeedback('Не удалось открыть обмен. Скопируйте текст или скачайте файл.') }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `almaway-${route.id}-${trip.date}.txt`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setFeedback('Файл плана подготовлен к скачиванию.')
  }
  return <article className="ag-card ag-panel ag-trip-card" id={trip.id}>
    <div className="ag-panel-heading"><span className="ag-kicker">{dateLabel(trip.date)}</span><span className="ag-code">Личный план</span></div>
    <h2>{route.title}</h2><p className="ag-code">{trip.start} → {trip.end} · Алматы</p>
    <div className="ag-actions">
      <Link className="ag-button ag-button-secondary" href={`/prepare/${route.id}?draft=${encodeURIComponent(trip.id)}`}><Pencil aria-hidden="true" />Изменить</Link>
      <button type="button" className="ag-button ag-button-secondary" onClick={() => setRemoving(true)}><Trash2 aria-hidden="true" />Удалить</button>
    </div>
    {removing && <div className="ag-notice ag-notice-warning">
      <div><strong>Удалить план с этого устройства?</strong><div className="ag-actions">
        <button type="button" className="ag-button" onClick={onDelete}>Да, удалить</button>
        <button type="button" className="ag-button ag-button-secondary" onClick={() => setRemoving(false)}>Отмена</button>
      </div></div>
    </div>}
    <details>
      <summary>Посмотреть текст для близкого</summary>
      <pre className="ag-export-text">{content}</pre>
    </details>
    <div className="ag-actions">
      <button className="ag-button" type="button" onClick={copy}><Clipboard aria-hidden="true" />Скопировать план</button>
      <button className="ag-button ag-button-secondary" type="button" onClick={download}><Download aria-hidden="true" />Скачать TXT</button>
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' &&
        <button className="ag-button ag-button-secondary" type="button" onClick={share}><Share2 aria-hidden="true" />Поделиться</button>}
    </div>
    <p role="status">{feedback}</p>
  </article>
}
