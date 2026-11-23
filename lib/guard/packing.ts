export const packingGroups = ['Основное', 'По условиям', 'Полезное', 'По желанию'] as const

export type PackingItem = { id: string; name: string; reason: string; group: typeof packingGroups[number] }
export type PackingConditions = { minTemperature: number; precipitation: number; wind: number }

export function packingList(minutes: number, conditions?: PackingConditions): PackingItem[] {
  const items: PackingItem[] = [
    { id: 'water', name: 'Вода и запас', reason: 'Возьмите воду на весь путь. Наличие питьевых источников не подтверждено.', group: 'Основное' },
    { id: 'food', name: 'Еда и перекус', reason: minutes >= 240 ? 'Запланируйте еду на длинный выход и дополнительный перекус на случай задержки.' : 'Возьмите перекус и резерв на случай задержки.', group: 'Основное' },
    { id: 'boots', name: 'Треккинговая обувь', reason: 'Подберите обувь с цепкой подошвой под фактическое покрытие.', group: 'Основное' },
    { id: 'navigation', name: 'Офлайн-карта / компас', reason: 'Заранее загрузите актуальную карту и проверьте доступ без сети.', group: 'Основное' },
    { id: 'first-aid', name: 'Аптечка и налобный фонарь', reason: 'Держите под рукой на случай травмы или задержки.', group: 'Основное' },
    { id: 'battery', name: 'Заряженный внешний аккумулятор', reason: 'Для телефона с картой и связи, где есть покрытие.', group: 'Полезное' },
    { id: 'poles', name: 'Треккинговые палки', reason: 'Если привыкли к ним, они могут пригодиться на спусках.', group: 'По желанию' },
  ]
  if (!conditions || conditions.minTemperature <= 7) {
    items.push({ id: 'warm', name: 'Утепляющий слой', reason: conditions ? 'В выбранной точке прогнозируется прохладная погода.' : 'Условия неизвестны. Подберите слой после местной проверки.', group: 'По условиям' })
  }
  if (!conditions || conditions.precipitation >= 25 || conditions.wind >= 25) {
    items.push({ id: 'shell', name: 'Ветровлагозащитный слой', reason: conditions ? 'По прогнозу возможны осадки или сильный ветер.' : 'Проверьте ветер и осадки на высоте перед выходом.', group: 'По условиям' })
  }
  return items
}
