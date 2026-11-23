import type { PackingConditions } from './packing'

export type WeatherPointSnapshot = PackingConditions & {
  label: string
  elevation: number
  maxTemperature: number
}

export type WeatherSnapshot = {
  date: string
  retrievedAt: string
  stale: boolean
  points: WeatherPointSnapshot[]
}

export const weatherSource = 'https://open-meteo.com/en/docs'

export function parseWeather(payload: unknown, date: string, label: string): WeatherPointSnapshot | undefined {
  if (!payload || typeof payload !== 'object') return
  const response = payload as { elevation?: number; daily?: Record<string, unknown> }
  const dates = response.daily?.time
  if (!Array.isArray(dates)) return
  const index = dates.indexOf(date)
  if (index < 0) return
  const read = (key: string) => {
    const values = response.daily?.[key]
    return Array.isArray(values) && typeof values[index] === 'number' && Number.isFinite(values[index]) ? Number(values[index]) : undefined
  }
  const minTemperature = read('temperature_2m_min')
  const maxTemperature = read('temperature_2m_max')
  const precipitation = read('precipitation_probability_max')
  const wind = read('wind_gusts_10m_max')
  if (minTemperature === undefined || maxTemperature === undefined || precipitation === undefined || wind === undefined
    || typeof response.elevation !== 'number' || !Number.isFinite(response.elevation)) return
  if (minTemperature > maxTemperature || wind < 0 || precipitation < 0 || precipitation > 100) return
  return { label, elevation: response.elevation, minTemperature, maxTemperature, precipitation, wind }
}
