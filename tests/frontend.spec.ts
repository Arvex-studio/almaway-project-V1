import { expect, test } from '@playwright/test'

// Run UI regressions once; map.spec covers both provider configurations.
test.beforeEach(({}, info) => test.skip(info.project.name === 'missing-key'))

test('Explore keeps unavailable places separate and saves only the actual catalogue identity', async ({
  page,
}) => {
  await page.goto('/explore')
  for (const title of ['Ущелье Аюсай', 'Кольсайские озёра']) {
    const card = page
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: title }) })
    await expect(card).toContainText('Скоро в каталоге')
    await expect(card.getByRole('link')).toHaveCount(0)
    await expect(card.getByRole('button')).toHaveCount(0)
  }
  const lake = page
    .getByRole('article')
    .filter({
      has: page.getByRole('heading', { name: 'Большое Алматинское озеро' }),
    })
  await lake.getByRole('button', { name: /Убрать из сохранённого/ }).click()
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Сохранено' })
    .click()
  await expect(page.getByRole('article')).toHaveCount(0)
  await expect(page.getByText('Здесь появятся места')).toBeVisible()
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Открытия' })
    .click()
  await lake.getByRole('button', { name: /Сохранить:/ }).click()
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Сохранено' })
    .click()
  await expect(page.getByRole('article')).toHaveCount(1)
  await page.getByRole('link', { name: /Открыть/ }).click()
  await expect(page).toHaveURL(/\/places\/bolshoe-almatinskoe-ozero$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Большое Алматинское озеро',
  )
})

test('Explore filters update the list and expose pressed state', async ({
  page,
}) => {
  await page.goto('/explore')
  await page.getByRole('button', { name: 'Рядом', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Рядом', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('article')).toHaveCount(2)
  await expect(
    page.getByRole('heading', { name: 'Кольсайские озёра' }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'На выходные', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ущелье Аюсай' })).toHaveCount(
    0,
  )
})

test('Planner, Profile and Saved disclose demo limits before interaction', async ({
  page,
}) => {
  await page.goto('/plan')
  await expect(page.locator('.demo-notice')).toContainText('AI не подключён')
  await page.getByRole('textbox').fill('Пойти сегодня пешком')
  await page.getByRole('button', { name: 'Показать демо-план' }).click()
  await expect(page.locator('.plan-results')).toContainText('1 пример')
  await expect(page.locator('.plan-results')).toContainText('Демо-бюджет')
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Профиль' })
    .click()
  await expect(page.locator('.demo-notice')).toContainText(
    'вымышленные примеры',
  )
  await page.getByRole('button', { name: 'Настройки', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Настройки', exact: true }),
  ).toBeFocused()
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Сохранено' })
    .click()
  await expect(page.locator('.demo-notice')).toContainText(
    'сбрасываются при перезагрузке',
  )
  await page.getByRole('button', { name: 'Планы', exact: true }).click()
  await expect(
    page.getByText('Сохранение маршрутов и планов пока не подключено.'),
  ).toBeVisible()
})

for (const width of [320, 390, 1440]) {
  test(`all six screens keep navigation reachable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    for (const path of [
      '/map',
      '/explore',
      '/plan',
      '/saved',
      '/profile',
      '/places/bolshoe-almatinskoe-ozero',
    ]) {
      await page.goto(path)
      await expect(page.getByRole('navigation')).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      for (const link of await page
        .getByRole('navigation')
        .getByRole('link')
        .all()) {
        const box = (await link.boundingBox())!
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(width)
        expect(box.y + box.height).toBeLessThanOrEqual(844)
      }
    }
    expect(errors).toEqual([])
  })
}

test('F1 catalogue selects the correct place and detail links back to the same map identity', async ({page}) => {
  await page.goto('/map')
  await page.getByRole('button', {name:/Каталог ·/}).click()
  await page.getByRole('complementary', {name:'Места на карте'}).getByRole('button', {name:/Медео/}).click()
  await expect(page.getByRole('region', {name:'Выбранное место'})).toContainText('Медео')
  await page.getByRole('link', {name:'Подробнее',exact:true}).click()
  await expect(page.getByRole('heading',{level:1})).toHaveText('Медео')
  await page.getByRole('link',{name:'На карте',exact:true}).click()
  await expect(page).toHaveURL(/place=medeo/)
  await expect(page.getByRole('region', {name:'Выбранное место'})).toContainText('Медео')
})

test('interactive preview uses exact mobile and desktop iframe viewports', async ({page}) => {
  await page.goto('/preview')
  await expect(page.locator('iframe')).toHaveAttribute('width','390')
  await expect(page.locator('iframe')).toHaveAttribute('height','844')
  await page.getByRole('button',{name:'Desktop 1440 × 900'}).click()
  await expect(page.locator('iframe')).toHaveAttribute('width','1440')
  await expect(page.locator('iframe')).toHaveAttribute('height','900')
  await page.frameLocator('iframe').getByRole('navigation').getByRole('link',{name:'План',exact:true}).click()
  await expect(page.frameLocator('iframe').getByRole('button',{name:'Показать демо-план'})).toBeVisible()
})
