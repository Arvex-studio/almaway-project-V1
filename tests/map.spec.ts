import { expect, test } from '@playwright/test'

const fixtureStyle = {
  version: 8,
  sources: {},
  layers: [{ id: 'test-background', type: 'background', paint: { 'background-color': '#dce8d9' } }],
}

test('missing key preserves navigation and gives a safe map fallback', async ({ page }, info) => {
  test.skip(info.project.name !== 'missing-key')
  await page.goto('/map')
  await expect(page.getByRole('status')).toContainText('Карта пока недоступна')
  await expect(page.locator('.maplibregl-canvas')).toHaveCount(0)
  await page.getByRole('navigation').getByRole('link', { name: 'Открытия', exact: true }).click()
  await expect(page).toHaveURL(/\/explore$/)
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
    await expect(page.getByRole('region', { name: 'Выбранное место' })).toContainText(title!.replace('Открыть место: ', ''))
    await page.getByRole('link', { name: 'Подробнее', exact: true }).click()
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
      await expect.poll(() => canvas.evaluate(element => Math.round(element.getBoundingClientRect().width))).toBe(Math.min(width, 1440))
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
    await expect(lake).toHaveClass(/saved/)
    await lake.click()
    await expect(lake).toHaveClass(/selected/)
    const sheet = page.getByRole('region', { name: 'Выбранное место' })
    await sheet.getByRole('button', { name: /Убрать из сохранённого/ }).last().click()
    await sheet.getByRole('button', { name: 'Закрыть карточку', exact: true }).click()
    await expect(lake).not.toHaveClass(/saved|selected/)
    await expect(canvas).toHaveAttribute('data-instance-check', 'original')
    await page.getByRole('button', { name: 'Лёгкие', exact: true }).click()
    await expect(page.locator('.almaway-marker')).toHaveCount(0)
    await expect(page.getByText('Попробуй другую подборку')).toBeVisible()
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

  test('route view toggles rendered geometry and geolocation denial is graceful', async ({ page, context }) => {
    await context.clearPermissions()
    await page.goto('/map')
    const canvas = page.locator('.maplibregl-canvas')
    await expect(page.locator('.almaway-marker').first()).toBeVisible()
    const withRoute = await canvas.screenshot()
    await page.getByRole('button', { name: 'Слои карты', exact: true }).click()
    await page.getByRole('checkbox', { name: 'Маршруты', exact: true }).uncheck()
    await page.getByRole('button', { name: 'Понятно', exact: true }).click()
    await expect.poll(async () => Buffer.compare(withRoute, await canvas.screenshot())).not.toBe(0)
    await page.getByRole('button', { name: 'Моё местоположение', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Доступ к местоположению запрещён', { timeout: 15_000 })
  })

  test('style failure gives a recoverable state without leaking a URL/key', async ({ page }) => {
    await page.unroute('https://api.maptiler.com/maps/**/style.json?*')
    await page.route('https://api.maptiler.com/maps/**/style.json?*', route => route.fulfill({ status: 403, body: 'Forbidden' }))
    await page.goto('/map')
    await expect(page.getByRole('status')).toContainText('Карта пока недоступна')
    await expect(page.locator('body')).not.toContainText('almaway-test-placeholder-not-a-real-key')
    await page.route('https://api.maptiler.com/maps/**/style.json?*', route => route.fulfill({ json: fixtureStyle }))
    await page.getByRole('button', { name: 'Повторить', exact: true }).click()
    await expect(page.locator('.almaway-marker').first()).toBeVisible()
  })
})
