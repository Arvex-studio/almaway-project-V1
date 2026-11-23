import { dateValue, trailDate, trailTimezone } from '@/lib/guard/planning'
import { getGuardRoute } from '@/lib/guard/routes'
import { parseWeather, type WeatherSnapshot } from '@/lib/guard/weather'

const freshMs = 30 * 60_000
const retentionMs = 6 * 60 * 60_000
const cache = new Map<string, WeatherSnapshot>()
const pending = new Map<string, Promise<WeatherSnapshot>>()
const fields = 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_gusts_10m_max'

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function retrieve(points: NonNullable<ReturnType<typeof getGuardRoute>>['weather'], date: string) {
  const params = new URLSearchParams({
    latitude: points.map(point => point.coordinates[1]).join(','),
    longitude: points.map(point => point.coordinates[0]).join(','),
    elevation: points.map(point => point.elevation ?? 'nan').join(','),
    daily: fields, timezone: trailTimezone, start_date: date, end_date: date,
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal: AbortSignal.timeout(7_000), cache: 'no-store',
  })
  if (!response.ok) throw new Error('Weather upstream unavailable')
  const payload: unknown = await response.json()
  const responses = Array.isArray(payload) ? payload : [payload]
  if (responses.length !== points.length) throw new Error('Weather locations missing')
  const parsed = responses.flatMap((result, index) => {
    const point = parseWeather(result, date, points[index].label)
    return point ? [point] : []
  })
  if (!parsed.length) throw new Error('Weather forecast missing')
  return { date, retrievedAt: new Date().toISOString(), stale: false, points: parsed }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const route = getGuardRoute(params.get('route') ?? '')
  const date = params.get('date') ?? ''
  const when = dateValue(date)
  if (!route || !when) return json({ error: 'invalid' }, 400)
  if (!route.weather.length) return json({ error: 'no-points' }, 422)
  const lead = (when.getTime() - dateValue(trailDate())!.getTime()) / 86_400_000
  if (lead < 0 || lead > 6) return json({ error: 'out-of-range' }, 422)
  if (process.env.NODE_ENV === 'production' && process.env.ALMAWAY_OPEN_METEO_EVALUATION !== '1') {
    return json({ error: 'disabled' }, 503)
  }

  const now = Date.now()
  for (const [key, value] of cache) {
    if (now - Date.parse(value.retrievedAt) > retentionMs) cache.delete(key)
  }
  const key = `${route.id}:${date}`
  const previous = cache.get(key)
  if (previous && now - Date.parse(previous.retrievedAt) <= freshMs) return json(previous)

  let promise = pending.get(key)
  if (!promise) {
    promise = retrieve(route.weather, date).then(snapshot => {
      cache.set(key, snapshot)
      return snapshot
    }).finally(() => pending.delete(key))
    pending.set(key, promise)
  }
  try {
    return json(await promise)
  } catch {
    return previous ? json({ ...previous, stale: true }) : json({ error: 'unavailable' }, 502)
  }
}
