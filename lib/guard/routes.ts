export type RouteCategory = 'Вершина' | 'Перевал' | 'Высокогорье'

type WeatherPoint = {
  label: string
  coordinates: readonly [longitude: number, latitude: number]
  elevation?: number
}

export type GuardRoute = {
  id: string
  code: string
  title: string
  path: readonly string[]
  category: RouteCategory
  start?: string
  distance?: number
  gain?: number
  elevation?: number
  guideMinutes?: readonly [number, number]
  season: string
  conditions: string
  source: { label: string; url: string }
  geometry: 'missing' | 'fragment'
  mapPlace?: string
  weather: readonly WeatherPoint[]
}

const atlas = {
  label: 'Горный атлас Алматы · 2024',
  url: 'https://www.gov.kz/uploads/2024/9/27/c43d4cb1e894c322bfec83e54350665e_original.11731807.pdf',
}

// These points identify areas or features, separate from route geometry and trailheads.
const medeu: WeatherPoint = { label: 'Район Медеу', coordinates: [77.059452, 43.1570802] }
const furmanov: WeatherPoint = { label: 'Пик Фурманова', coordinates: [77.115667, 43.1498971], elevation: 3053 }

export const guardRoutes: readonly GuardRoute[] = [
  {
    id: 'bukreev-108', code: '108', title: 'Пик Букреева', category: 'Вершина',
    path: ['Медеу', 'перевал Лесной', 'пик Букреева'],
    start: 'Медеу', distance: 14.5, gain: 1668, elevation: 3150, guideMinutes: [390, 420],
    season: 'Круглый год по атласу. Снег, лёд и состояние тропы требуют отдельной проверки.',
    conditions: 'Атлас указывает средний трекинг. Перепад высот существенный. Справочное время требует подтверждения на местности.',
    source: atlas, geometry: 'missing', mapPlace: 'medeo', weather: [medeu],
  },
  {
    id: 'butakovsky-106', code: '106', title: 'Бутаковский перевал', category: 'Перевал',
    path: ['Медеу', 'ущелье Кимасар', 'Бутаковский перевал'],
    start: 'Медеу', distance: 18, gain: 1316, elevation: 2910, guideMinutes: [780, 840],
    season: 'Июнь–октябрь по атласу. Состояние тропы и доступ проверяйте перед выходом.',
    conditions: 'Атлас относит этот вариант к сложному трекингу. До перевала в атласе указано 8,91 км, а общая дистанция составляет 18 км.',
    source: atlas, geometry: 'missing', mapPlace: 'medeo', weather: [medeu],
  },
  {
    id: 'tuyuk-su-132', code: '132', title: 'Гляциологическая база Т1', category: 'Высокогорье',
    path: ['альплагерь Туюк-Су', 'плотина Мынжилкы', 'база Т1'],
    start: 'Альплагерь Туюк-Су', distance: 15, gain: 1060, elevation: 3650, guideMinutes: [300, 360],
    season: 'Круглый год по атласу. В снежный сезон проверяйте лавинную обстановку и местные ограничения.',
    conditions: 'Вариант проходит в высокогорье. До Т1 в атласе указано 7,62 км, а общая дистанция составляет 15 км.',
    source: atlas, geometry: 'missing', weather: [],
  },
  {
    id: 'furmanov-point', code: 'Ф', title: 'Пик Фурманова', category: 'Вершина',
    path: ['Пик Фурманова'], elevation: 3053,
    season: 'Сезон для конкретного варианта ещё не подтверждён.',
    conditions: 'На карте есть точка вершины. Тропа, старт и техническая категория конкретного варианта требуют проверки.',
    source: { label: 'OpenStreetMap · точка вершины', url: 'https://www.openstreetmap.org/node/3718134916' },
    geometry: 'missing', mapPlace: 'furmanovka', weather: [medeu, furmanov],
  },
]

export function getGuardRoute(id: string) {
  return guardRoutes.find(route => route.id === id)
}

export function searchGuardRoutes(query: string, category?: RouteCategory) {
  const words = query.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim().split(/\s+/)
  return guardRoutes.filter(route => {
    const text = [route.title, route.code, route.category, ...route.path].join(' ').toLocaleLowerCase('ru').replaceAll('ё', 'е')
    return (!category || route.category === category) && words.every(word => text.includes(word))
  })
}

export function durationLabel(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return [hours ? `${hours} ч` : '', rest || !hours ? `${rest} мин` : ''].filter(Boolean).join(' ')
}

export function guideLabel(route: GuardRoute) {
  return route.guideMinutes ? route.guideMinutes.map(durationLabel).join(' – ') : 'Нет данных'
}
