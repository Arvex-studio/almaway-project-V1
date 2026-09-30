import { place, type PlaceDetails } from './almaway-data'

export type MapFilter = 'Рядом' | 'Горы' | 'Озёра' | 'Маршруты' | 'Лёгкие' | 'С видом' | 'На выходные'

export interface CoordinateSource {
  provider: 'OpenStreetMap'
  url: string
  retrievedAt: string
  method: 'node' | 'bounding-box-center'
  feature: string
}

export interface TouristPlace extends PlaceDetails {
  coordinates: readonly [longitude: number, latitude: number]
  category: string
  filters: readonly MapFilter[]
  coordinateSource: CoordinateSource
}

// OSM points identify geographic features, not entrances, trailheads, or safe routes.
// Area centers are Overpass bounding-box centers, not surveyed access points.
const source = (path: string, feature: string, method: CoordinateSource['method']): CoordinateSource => ({
  provider: 'OpenStreetMap', url: `https://www.openstreetmap.org/${path}`,
  retrievedAt: '2026-09-30', method, feature,
})

export const touristPlaces: readonly TouristPlace[] = [
  {
    ...place,
    coordinates: [76.9853383, 43.0510419], category: 'Озеро',
    filters: ['Озёра', 'С видом', 'На выходные'],
    coordinateSource: source('relation/3427772', 'Big Almaty Lake; natural=water; water=lake', 'bounding-box-center'),
  },
  {
    slug: 'medeo', title: 'Медео', region: 'Заилийский Алатау',
    description: 'Высокогорный спортивный комплекс в Малоалматинском ущелье.',
    why: 'Горное окружение и отправная точка для знакомства с Малоалматинским ущельем.',
    metrics: [], coordinates: [77.059452, 43.1570802], category: 'Спортивный комплекс',
    filters: ['Горы', 'С видом'],
    coordinateSource: source('way/171504564', 'Medeu; leisure=sports_centre; Wikidata Q864796', 'bounding-box-center'),
  },
  {
    slug: 'kok-tobe', title: 'Кок-Тобе', region: 'Алматы',
    description: 'Гора Кок-Тобе с видом на Алматы.',
    why: 'Панорама города на фоне гор Заилийского Алатау.',
    metrics: [], coordinates: [76.9760743, 43.2328701], category: 'Гора',
    filters: ['Горы', 'С видом'],
    coordinateSource: source('node/12985379969', 'Kok-Tobe; natural=peak; ele=1130', 'node'),
  },
  {
    slug: 'butakovskiy-vodopad', title: 'Бутаковский водопад', region: 'Заилийский Алатау',
    description: 'Водопад в Бутаковском ущелье.',
    why: 'Природная точка в горном ущелье рядом с Алматы.',
    metrics: [], coordinates: [77.1140067, 43.1723059], category: 'Водопад',
    filters: ['Горы', 'С видом'],
    coordinateSource: source('node/1843570839', 'Butakovskiy waterfall; tourism=attraction', 'node'),
  },
  {
    slug: 'furmanovka', title: 'Фурмановка', region: 'Заилийский Алатау',
    description: 'Вершина Фурманова в Заилийском Алатау.',
    why: 'Горная вершина над Малоалматинским ущельем.',
    metrics: [], coordinates: [77.115667, 43.1498971], category: 'Вершина',
    filters: ['Горы', 'С видом'],
    coordinateSource: source('node/3718134916', 'Furmanov; natural=peak; loc_name=Фурмановка', 'node'),
  },
]

export function getTouristPlace(slug: string) {
  return touristPlaces.find(item => item.slug === slug)
}

export function filterTouristPlaces(filter: MapFilter) {
  // "Рядом" uses the initial Almaty-region catalogue. No unverified difficulty tags.
  return filter === 'Рядом' ? touristPlaces : touristPlaces.filter(item => item.filters.includes(filter))
}
