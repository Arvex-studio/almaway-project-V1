import { expect, test } from '@playwright/test'
import { calculateDay, dateValue, daylight, trailDate } from '../lib/guard/planning'
import { packingList } from '../lib/guard/packing'
import { getGuardRoute, searchGuardRoutes } from '../lib/guard/routes'
import { parseWeather } from '../lib/guard/weather'

test.beforeEach(({}, info) => test.skip(info.project.name !== 'missing-key'))

test('source-backed lookup, manual window and winter daylight', () => {
  const route = getGuardRoute('bukreev-108')!
  expect(route.geometry).toBe('missing')
  expect(searchGuardRoutes('лесной БУКРЕЕВА', 'Вершина')).toEqual([route])
  expect(trailDate(new Date('2026-11-23T20:00:00Z'))).toBe('2026-11-24')
  expect(dateValue('2026-02-30')).toBeUndefined()
  expect(calculateDay(route, { date: '2026-12-21', start: '09:00', end: '09:00', restMinutes: 0 })).toHaveProperty('error')
  expect(calculateDay(route, { date: '2026-12-21', start: '09:00', end: '08:00', restMinutes: -5 })).toHaveProperty('error')
  expect(calculateDay(route, { date: '2026-12-21', start: '09:00', end: '18:00', restMinutes: 30 }))
    .toMatchObject({ value: { total: 540, walking: 510, afterDark: true } })
  const winter = daylight(dateValue('2026-12-21')!, [77.06, 43.16])
  expect(winter.sunrise).toBeGreaterThanOrEqual(435)
  expect(winter.sunrise).toBeLessThan(450)
  expect(winter.sunset).toBeGreaterThan(970)
  expect(winter.sunset).toBeLessThan(1000)
})

test('unavailable forecast does not become clear weather or false measurements', () => {
  const date = '2026-11-23'
  expect(parseWeather({ elevation: 1600, daily: { time: [date], temperature_2m_min: [null] } }, date, 'Медеу')).toBeUndefined()
  expect(packingList(300).map(item => item.id)).toEqual(expect.arrayContaining(['water', 'food', 'warm', 'shell']))
  expect(packingList(80, { minTemperature: 16, precipitation: 0, wind: 10 }).map(item => item.id)).not.toContain('warm')
})

test('search, route details, plan, keyboard checklist, persistence and private export', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/guard/weather?*', route => route.fulfill({ status: 502, json: { error: 'unavailable' } }))
  await page.goto('/routes')
  const query = page.getByRole('searchbox', { name: 'Поиск маршрутов' })
  await query.fill('нет такого')
  await expect(page.getByRole('heading', { name: 'Ничего не нашлось' })).toBeVisible()
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click()
  await page.getByRole('button', { name: 'Вершина', exact: true }).click()
  await query.fill('Букреева')
  await page.getByRole('link', { name: 'Пик Букреева', exact: true }).click()
  await expect(page.getByText('Профиль высот пока недоступен')).toBeVisible()
  await page.getByRole('link', { name: 'Подготовить поход' }).click()
  await expect(page.getByText('Не удалось получить прогноз.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Сохранить план' })).toBeDisabled()
  await page.getByLabel('Старт', { exact: true }).fill('08:30')
  await page.getByLabel('Возвращение', { exact: true }).fill('16:30')
  const item = page.getByRole('checkbox', { name: /Вода и запас/ })
  await item.focus()
  await item.press('Space')
  await expect(item).toBeChecked()
  await page.getByRole('button', { name: 'Сохранить план' }).click()
  await page.getByRole('link', { name: 'Открыть мой поход' }).click()
  await expect(page.getByRole('heading', { name: 'Пик Букреева' })).toBeVisible()
  await page.getByText('Посмотреть текст для близкого').click()
  await expect(page.locator('pre')).toContainText('Автоматических уведомлений нет')
  await page.getByRole('button', { name: 'Скопировать план' }).click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('16:30')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Скачать TXT' }).click()
  expect((await download).suggestedFilename()).toMatch(/^almaway-bukreev-108-.*\.txt$/)
  await page.reload()
  await page.getByRole('link', { name: 'Изменить' }).click()
  await expect(page.getByLabel('Возвращение', { exact: true })).toHaveValue('16:30')
  await expect(item).toBeChecked()
  expect(errors).toEqual([])
})

test('map fallback uses a keyboard-accessible sheet with restored focus', async ({ page }) => {
  await page.goto('/map')
  const input = page.getByRole('searchbox', { name: 'Поиск мест на карте' })
  await input.fill('Фурмановка')
  const place = page.getByRole('button', { name: /Фурмановка/ })
  await place.press('Enter')
  const sheet = page.getByRole('region', { name: 'Выбранное место' })
  await expect(sheet).toBeFocused()
  expect(await sheet.evaluate(element => getComputedStyle(element).animationDuration)).toBe('0s')
  await sheet.press('Escape')
  await expect(sheet).toHaveCount(0)
  await expect(place).toBeFocused()
})

test('stale weather and offline state remain explicit', async ({ page, context }) => {
  await page.route('**/api/guard/weather?*', route => route.fulfill({
    json: { date: new URL(route.request().url()).searchParams.get('date'), retrievedAt: '2026-11-23T10:00:00Z', stale: true,
      points: [{ label: 'Район Медеу', elevation: 1600, minTemperature: 0, maxTemperature: 4, precipitation: 30, wind: 22 }] },
  }))
  await page.goto('/prepare/bukreev-108')
  await expect(page.getByText('Прогноз устарел.', { exact: false })).toBeVisible()
  await context.setOffline(true)
  await expect(page.getByText('Нет сети.', { exact: false })).toBeVisible()
  await expect(page.getByText('Нет подключения для получения прогноза.')).toBeVisible()
})
