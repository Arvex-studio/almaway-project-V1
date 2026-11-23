import { calculateDay, dateLabel, dateValue, timeValue, trailTimezone, type DayInput } from './planning'
import { durationLabel, getGuardRoute } from './routes'

export type LocalTrip = DayInput & {
  id: string
  routeId: string
  checked: string[]
  updatedAt: string
}

export type HikeRecord = {
  id: string
  routeId: string
  date: string
  minutes: number
}

export function readTrips(raw: string | null): LocalTrip[] {
  return readArray<LocalTrip>(raw, (item): item is LocalTrip => {
    if (!item || typeof item !== 'object') return false
    const trip = item as LocalTrip
    const route = typeof trip.routeId === 'string' && getGuardRoute(trip.routeId)
    return Boolean(route && typeof trip.id === 'string' && typeof trip.updatedAt === 'string'
      && typeof trip.date === 'string' && typeof trip.start === 'string' && typeof trip.end === 'string'
      && 'value' in calculateDay(route, trip)
      && Array.isArray(trip.checked) && trip.checked.every(id => typeof id === 'string'))
  })
}

export function readHikes(raw: string | null): HikeRecord[] {
  return readArray<HikeRecord>(raw, (item): item is HikeRecord => {
    if (!item || typeof item !== 'object') return false
    const hike = item as HikeRecord
    return typeof hike.id === 'string' && typeof hike.routeId === 'string' && Boolean(getGuardRoute(hike.routeId))
      && typeof hike.date === 'string' && Boolean(dateValue(hike.date))
      && Number.isInteger(hike.minutes) && hike.minutes > 0 && hike.minutes <= 1440
  })
}

function readArray<T>(raw: string | null, isItem: (item: unknown) => item is T) {
  try {
    const value: unknown = JSON.parse(raw ?? '[]')
    return Array.isArray(value) ? value.filter(isItem) : []
  } catch {
    return []
  }
}

export function tripText(trip: LocalTrip) {
  const route = getGuardRoute(trip.routeId)
  if (!route || timeValue(trip.start) === undefined || timeValue(trip.end) === undefined) return ''
  return [
    'Мой план похода · Almaway Guard',
    route.title,
    `Вариант: ${route.path.join(' → ')}`,
    route.start ? `Район старта: ${route.start}` : 'Точка старта требует уточнения.',
    `${dateLabel(trip.date)} · время Алматы (${trailTimezone})`,
    `Выход: ${trip.start} · планирую вернуться: ${trip.end}`,
    `Привалы: ${durationLabel(trip.restMinutes)}`,
    'Полный трек пока не проверен. Время возвращения указано вручную.',
    `Источник: ${route.source.url}`,
    'Договоримся, когда я выйду на связь. Автоматических уведомлений нет.',
  ].join('\n')
}
