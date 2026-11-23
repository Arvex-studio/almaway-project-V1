import type { GuardRoute } from './routes'

export const trailTimezone = 'Asia/Almaty'
const dayMs = 86_400_000
const almaty = [77.059452, 43.1570802] as const
const radians = Math.PI / 180

export type DayInput = { date: string; start: string; end: string; restMinutes: number }
export type DayPlan = {
  starts: number
  returns: number
  total: number
  walking: number
  sunrise: number
  sunset: number
  afterDark: boolean
  shortMargin: boolean
}

export function trailDate(now = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: trailTimezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function dateValue(date: string) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(date)) return undefined
  const value = new Date(`${date}T12:00:00Z`)
  return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date ? value : undefined
}

export function timeValue(time: string) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return undefined
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
}

export function clockLabel(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

// NOAA fractional-year solar equations. Uses a standard horizon, without local relief.
export function daylight(date: Date, [longitude, latitude]: readonly [number, number]) {
  const year = date.getUTCFullYear()
  const daysInYear = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / dayMs
  const dayIndex = Math.floor((date.getTime() - Date.UTC(year, 0, 1)) / dayMs)
  const gamma = 2 * Math.PI * dayIndex / daysInYear
  const equation = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma))
  const declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma)
  const hourAngle = Math.acos(Math.cos(90.833 * radians) / (Math.cos(latitude * radians) * Math.cos(declination))
    - Math.tan(latitude * radians) * Math.tan(declination)) / radians
  const offset = new Intl.DateTimeFormat('en', { timeZone: trailTimezone, timeZoneName: 'longOffset' })
    .formatToParts(date).find(part => part.type === 'timeZoneName')?.value.match(/^GMT([+-])(\d{2}):(\d{2})$/)
  const offsetMinutes = offset ? (offset[1] === '-' ? -1 : 1) * (Number(offset[2]) * 60 + Number(offset[3])) : 0
  const noon = 720 - 4 * longitude - equation + offsetMinutes
  return { sunrise: Math.round(noon - 4 * hourAngle), sunset: Math.round(noon + 4 * hourAngle) }
}

export function calculateDay(route: GuardRoute, input: DayInput): { value: DayPlan } | { error: string } {
  const date = dateValue(input.date)
  const starts = timeValue(input.start)
  const returns = timeValue(input.end)
  if (!date || starts === undefined || returns === undefined) return { error: 'Укажите дату, время старта и время возвращения.' }
  if (returns <= starts) return { error: 'Для однодневного плана время возвращения должно быть позже старта.' }
  const total = returns - starts
  if (!Number.isInteger(input.restMinutes) || input.restMinutes < 0 || input.restMinutes >= total) {
    return { error: 'Укажите целое число минут привала, меньшее общего времени похода.' }
  }
  const { sunrise, sunset } = daylight(date, route.weather[0]?.coordinates ?? almaty)
  return {
    value: {
      starts, returns, total, walking: total - input.restMinutes, sunrise, sunset,
      afterDark: starts < sunrise || returns >= sunset,
      shortMargin: returns < sunset && sunset - returns < 60,
    },
  }
}

export function dateLabel(date: string) {
  const value = dateValue(date)
  return value ? new Intl.DateTimeFormat('ru', { timeZone: trailTimezone, day: 'numeric', month: 'long', year: 'numeric' }).format(value) : date
}
