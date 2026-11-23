import { expect, test } from '@playwright/test'

const fixtureStyle = {
  version: 8,
  sources: {
    credits: {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      attribution: '© MapTiler © OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'test-background', type: 'background', paint: { 'background-color': '#dce8d9' } },
    { id: 'credits', type: 'circle', source: 'credits' },
  ],
}

test('missing key preserves navigation and gives a safe map fallback', async ({ page }, info) => {
  test.skip(info.project.name !== 'missing-key')
  await page.goto('/map')
  await expect(page.locator('.map-message')).toContainText('Карта пока недоступна')
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(0)
  await page.getByRole('navigation').getByRole('link', { name: 'Маршруты', exact: true }).click()
  await expect(page).toHaveURL(/\/routes$/)
})

test.describe('real MapLibre engine with a controlled style response', () => {
  test.beforeEach(async ({ page }, info) => {
    test.skip(info.project.name !== 'map')
    await page.route('https://api.maptiler.com/maps/**/style.json?*', route => route.fulfill({ json: fixtureStyle }))
  })

  test('renders, expands clusters, selects the right place and survives navigation', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/map')
    await expect(page.locator('.maplibregl-canvas')).toBeVisible()
    const clusters = page.locator('.almaway-marker[data-cluster-id] button')
    await expect(clusters.first()).toBeVisible()
    const countBefore = Number(await clusters.first().textContent())
    await clusters.first().click()
    await expect.poll(async () => {
      const values = await clusters.allTextContents()
      return values.length === 0 || values.every(value => Number(value) < countBefore)
    }).toBe(true)
    const pin = page.locator('.almaway-marker[data-slug] button').first()
    await expect(pin).toBeVisible()
    const title = await pin.getAttribute('aria-label')
    await pin.click()
    const sheet = page.getByRole('region', { name: title!.replace('Открыть место: ', ''), exact: true })
    await expect(sheet.getByRole('heading')).toBeFocused()
    await sheet.getByRole('link', { name: 'Подробнее', exact: true }).click()
    await expect(page).toHaveURL(/\/places\//)
    await expect(page.locator('h1')).toHaveText(title!.replace('Открыть место: ', ''))
    await expect(page.locator('.maplibregl-canvas')).toHaveCount(0)
    await page.getByRole('link', { name: 'Карта', exact: true }).click()
    await expect(page.locator('.maplibregl-canvas')).toHaveCount(1)
    await expect(page.locator('.almaway-marker').first()).toBeVisible()
    expect(errors).toEqual([])
  })

  test('resizes without overflow and layer controls update the same map', async ({ page }) => {
    await page.goto('/map')
    const canvas = page.locator('.maplibregl-canvas')
    await expect(canvas).toBeVisible()
    const identity = await canvas.evaluate(element => { element.setAttribute('data-instance-check', 'original'); return true })
    expect(identity).toBe(true)
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await expect.poll(() => canvas.evaluate(element => Math.round(element.getBoundingClientRect().width))).toBeGreaterThan(250)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
    await page.getByRole('button', { name: 'Слои карты', exact: true }).click()
    await page.getByRole('checkbox', { name: 'Места', exact: true }).uncheck()
    await page.getByRole('button', { name: 'Понятно', exact: true }).click()
    await expect(page.locator('.almaway-marker')).toHaveCount(0)
    await expect(canvas).toHaveAttribute('data-instance-check', 'original')
    await page.getByRole('button', { name: 'Слои карты', exact: true }).click()
    await page.getByRole('checkbox', { name: 'Места', exact: true }).check()
    await page.getByRole('button', { name: 'Понятно', exact: true }).click()
    await expect(page.locator('.almaway-marker').first()).toBeVisible()
    await expect(canvas).toHaveAttribute('data-instance-check', 'original')
  })

  test('saved pins and local filtering update without recreating the map', async ({ page }) => {
    await page.goto('/map')
    const canvas = page.locator('.maplibregl-canvas')
    await expect(canvas).toBeVisible()
    await canvas.evaluate(element => element.setAttribute('data-instance-check', 'original'))
    await page.getByRole('button', { name: 'Озёра', exact: true }).click()
    const lake = page.locator('.almaway-marker[data-slug="bolshoe-almatinskoe-ozero"] button')
    await expect(lake).not.toHaveClass(/saved/)
    await lake.click()
    await expect(lake).toHaveClass(/selected/)
    const sheet = page.getByRole('region', { name: 'Большое Алматинское озеро', exact: true })
    await sheet.getByRole('link', { name: 'Подробнее' }).click()
    await page.getByRole('button', { name: /Сохранить:/ }).click()
    await page.getByRole('link', { name: 'Карта', exact: true }).click()
    await page.getByRole('button', { name: 'Озёра', exact: true }).click()
    await expect(lake).toHaveClass(/saved/)
    await page.getByRole('searchbox', { name: 'Поиск мест на карте' }).fill('несуществующее место')
    await expect(page.locator('.almaway-marker')).toHaveCount(0)
    await expect(page.getByText('Места не найдены.', { exact: false })).toBeVisible()
  })

  test('panning preserves marker icon DOM when its state is unchanged', async ({ page }) => {
    await page.goto('/map')
    await page.getByRole('button', { name: 'Озёра', exact: true }).click()
    const lake = page.locator('.almaway-marker[data-slug="bolshoe-almatinskoe-ozero"] button')
    await expect(lake).toBeVisible()
    await lake.locator('svg').evaluate(element => element.setAttribute('data-icon-check', 'original'))
    const before = (await lake.boundingBox())!.y
    await page.locator('.maplibregl-canvas').press('ArrowDown')
    await expect.poll(async () => Math.round((await lake.boundingBox())!.y)).not.toBe(Math.round(before))
    await expect(lake.locator('svg')).toHaveAttribute('data-icon-check', 'original')
  })

  test('preview keeps provenance, attribution and actions accessible from 320 × 568 to desktop', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/map')
    await page.getByRole('button', { name: 'Озёра', exact: true }).press('Enter')
    const layers = page.getByRole('button', { name: 'Слои карты', exact: true })
    await expect(layers).toBeVisible()
    const listPin = page.getByRole('region', { name: 'Список мест' }).getByRole('button', { name: /Большое Алматинское озеро/ })
    await listPin.press('Enter')
    const sheet = page.getByRole('region', { name: 'Большое Алматинское озеро', exact: true })
    await expect(sheet.getByRole('heading')).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(sheet).toHaveCount(0)
    await expect(listPin).toBeFocused()
    const pin = page.getByRole('button', { name: 'Открыть место: Большое Алматинское озеро' })
    await pin.press('Enter')
    const close = sheet.getByRole('button', { name: 'Закрыть карточку' })
    const details = sheet.getByRole('link', { name: 'Подробнее', exact: true })
    const save = sheet.getByRole('button', { name: 'Сохранить: Большое Алматинское озеро' })
    const source = sheet.getByRole('link', { name: 'Координаты: OpenStreetMap' })
    const attribution = page.locator('.maplibregl-ctrl-attrib')

    await expect(sheet.getByRole('heading')).toBeFocused()
    for (const target of [close, details, save, source]) {
      await page.keyboard.press('Tab')
      await expect(target).toBeFocused()
    }
    await expect(source).toHaveAttribute('href', 'https://www.openstreetmap.org/relation/3427772')
    await expect(sheet.locator('time')).toHaveAttribute('datetime', '2026-09-30')
    await expect(sheet.getByText('Полного проверенного маршрута пока нет.')).toBeInViewport({ ratio: 1 })
    await expect(sheet.locator('a[href="/plan"]')).toHaveCount(0)
    expect(await sheet.evaluate(element => getComputedStyle(element).animationDuration)).toBe('0s')
    expect(await close.evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s')
    await page.keyboard.press('Escape')
    await expect(sheet).toHaveCount(0)
    await expect(pin).toBeFocused()
    await pin.press('Enter')

    for (const width of [320, 375, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 900 })
      await expect(details).toBeInViewport({ ratio: 1 })
      await expect(save).toBeInViewport({ ratio: 1 })
      await expect(source).toBeInViewport({ ratio: 1 })
      await expect(attribution).toBeInViewport({ ratio: 1 })
      await expect(layers).toBeInViewport({ ratio: 1 })
      await expect(attribution).toContainText('© MapTiler © OpenStreetMap contributors')
      const card = (await sheet.boundingBox())!
      const credits = (await attribution.boundingBox())!
      expect(card.y + card.height).toBeLessThanOrEqual(credits.y)
      const navigation = (await page.getByRole('navigation', { name: 'Основная навигация' }).boundingBox())!
      if (width < 820) expect(credits.y + credits.height).toBeLessThanOrEqual(navigation.y)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }

    await layers.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Слои карты' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Слои карты' })).toHaveCount(0)
    await expect(sheet).toBeVisible()
    await expect(layers).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(sheet).toHaveCount(0)
    await expect(pin).toBeFocused()
    await pin.press('Enter')
    await save.press('Space')
    await expect(sheet.getByRole('button', { name: 'Убрать из сохранённого: Большое Алматинское озеро' })).toBeFocused()
    await close.press('Enter')
    await expect(pin).toBeFocused()
    await expect(pin).toHaveClass(/saved/)
  })

  test('keeps the whole selected marker above the sheet and the source date beside its link', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/map?place=bolshoe-almatinskoe-ozero')
    const pin = page.getByRole('button', { name: 'Открыть место: Большое Алматинское озеро' })
    const sheet = page.getByRole('region', { name: 'Большое Алматинское озеро', exact: true })
    const source = sheet.getByRole('link', { name: 'Координаты: OpenStreetMap' })
    const date = sheet.locator('time')
    for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
      await page.setViewportSize({ width, height })
      await expect(pin).toBeInViewport({ ratio: 1 })
      await expect.poll(async () => {
        const marker = (await pin.boundingBox())!
        const card = (await sheet.boundingBox())!
        const map = (await page.locator('.maplibregl-canvas').boundingBox())!
        return marker.y >= map.y && marker.y + marker.height <= card.y
      }).toBe(true)
      const link = (await source.boundingBox())!
      const stamp = (await date.boundingBox())!
      expect.soft(stamp.y + stamp.height / 2).toBeGreaterThanOrEqual(link.y)
      expect.soft(stamp.y + stamp.height / 2).toBeLessThanOrEqual(link.y + link.height)
      expect.soft(stamp.x).toBeGreaterThanOrEqual(link.x + link.width)
    }
  })

  test('choosing the same place from the list frames it again after a pan', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/map')
    const item = page.getByRole('region', { name: 'Список мест' }).getByRole('button', { name: /Большое Алматинское озеро/ })
    const pin = page.getByRole('button', { name: 'Открыть место: Большое Алматинское озеро' })
    await item.press('Enter')
    const canvas = page.locator('.maplibregl-canvas')
    const center = await canvas.evaluate(element => element.getBoundingClientRect().x + element.clientWidth / 2)
    const displacement = async () => {
      const box = (await pin.boundingBox())!
      return Math.abs(box.x + box.width / 2 - center)
    }
    await expect.poll(displacement).toBeLessThan(10)
    await canvas.press('ArrowRight')
    await expect.poll(displacement).toBeGreaterThan(50)
    await item.press('Enter')
    await expect.poll(displacement).toBeLessThan(10)
    await expect(page.getByRole('heading', { name: 'Большое Алматинское озеро' })).toBeFocused()
  })

  test('opens the related route and manual preparation from the same map', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.route('**/api/guard/weather?*', route => route.fulfill({ status: 503, json: { error: 'disabled' } }))
    await page.goto('/map')
    await page.getByRole('searchbox', { name: 'Поиск мест на карте' }).fill('Медео')
    await page.getByRole('button', { name: 'Открыть место: Медео' }).press('Enter')
    const sheet = page.getByRole('region', { name: 'Медео', exact: true })
    await sheet.getByRole('link', { name: 'Подробнее' }).press('Enter')
    await expect(page).toHaveURL(/\/places\/medeo$/)
    await page.getByRole('link', { name: 'Пик Букреева' }).press('Enter')
    await expect(page).toHaveURL(/\/routes\/bukreev-108$/)
    await page.getByRole('link', { name: 'Посмотреть район' }).press('Enter')
    await expect(page).toHaveURL(/\/map\?place=medeo$/)
    await expect(sheet.getByRole('heading')).toBeFocused()
    await expect(page.locator('.maplibregl-canvas')).toHaveCount(1)
    await page.keyboard.press('PageDown')
    await expect.poll(() => sheet.locator('.ag-map-sheet-content').evaluate(element => element.scrollTop)).toBeGreaterThan(0)
    await sheet.getByRole('link', { name: 'Пик Букреева' }).press('Enter')
    await page.getByRole('link', { name: 'Подготовить поход' }).press('Enter')
    await expect(page).toHaveURL(/\/prepare\/bukreev-108$/)
    await expect(page.getByText('Возвращение указывается вручную')).toBeVisible()
    await expect(page.getByText('Поставщик прогноза для этой среды не включён.')).toBeVisible()
    const end = page.getByLabel('Возвращение', { exact: true })
    const save = page.getByRole('button', { name: 'Сохранить план', exact: true })
    await end.fill('07:00')
    await expect(save).toBeDisabled()
    await end.fill('16:00')
    await expect(page.getByRole('heading', { name: 'Световой день' })).toBeVisible()
    await expect(save).toBeEnabled()
    await save.press('Enter')
    await page.getByRole('link', { name: 'Открыть мой поход' }).press('Enter')
    await expect(page).toHaveURL(/\/trip#/u)
    await expect(page.getByRole('heading', { name: 'Пик Букреева' })).toBeVisible()
    await page.getByRole('link', { name: 'Изменить' }).press('Enter')
    await expect(end).toHaveValue('16:00')
    await page.getByRole('link', { name: 'К маршруту' }).press('Enter')
    await expect(page).toHaveURL(/\/routes\/bukreev-108$/)
    await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'План', exact: true })).toHaveCount(0)
  })

  test('route view toggles rendered geometry and geolocation denial is graceful', async ({ page, context }) => {
    await context.clearPermissions()
    await page.goto('/map')
    const canvas = page.locator('.maplibregl-canvas')
    await expect(page.locator('.almaway-marker').first()).toBeVisible()
    const withRoute = await canvas.screenshot()
    await page.getByRole('button', { name: 'Слои карты', exact: true }).click()
    await page.getByRole('checkbox', { name: 'Фрагмент тропы', exact: true }).uncheck()
    await page.getByRole('button', { name: 'Понятно', exact: true }).click()
    await expect.poll(async () => Buffer.compare(withRoute, await canvas.screenshot())).not.toBe(0)
    await page.getByRole('button', { name: 'Моё местоположение', exact: true }).click()
    await expect(page.locator('.map-notice')).toContainText('Доступ к местоположению запрещён', { timeout: 15_000 })
  })

  test('style failure gives a recoverable state without leaking a URL/key', async ({ page }) => {
    await page.unroute('https://api.maptiler.com/maps/**/style.json?*')
    await page.route('https://api.maptiler.com/maps/**/style.json?*', route => route.fulfill({ status: 403, body: 'Forbidden' }))
    await page.goto('/map')
    await expect(page.locator('.map-message')).toContainText('Карта пока недоступна')
    await expect(page.locator('body')).not.toContainText('almaway-test-placeholder-not-a-real-key')
    await page.route('https://api.maptiler.com/maps/**/style.json?*', route => route.fulfill({ json: fixtureStyle }))
    await page.getByRole('button', { name: 'Повторить', exact: true }).click()
    await expect(page.locator('.almaway-marker').first()).toBeVisible()
  })
})
