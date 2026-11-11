import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Run against a built app or preview. Never record the share token in artifacts.
const baseURL = process.env.ALMAWAY_AUDIT_URL || 'http://127.0.0.1:3200'
const output = resolve(process.env.ALMAWAY_AUDIT_DIR || 'test-results/frontend-audit')
const paths = ['/map', '/explore', '/plan', '/saved', '/profile', '/places/bolshoe-almatinskoe-ozero', '/journal']
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const results = []
try {
  for (const [device, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' })
    if (process.env.ALMAWAY_PREVIEW_SHARE) {
      const url = new URL('/map', baseURL)
      url.searchParams.set('_vercel_share', process.env.ALMAWAY_PREVIEW_SHARE)
      await page.goto(url.toString())
    }
    let errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    for (const [index, path] of paths.entries()) {
      errors = []
      const start = Date.now()
      const response = await page.goto(new URL(path, baseURL).toString())
      await page.getByRole('navigation', { name: 'Основная навигация' }).waitFor()
      if (path === '/map') await page.getByText('Загружаем карту…', { exact: true }).waitFor({ state: 'hidden' })
      await page.waitForLoadState('networkidle')
      const name = `${index + 1}-${device}-${path.split('/').at(-1)}`
      await page.screenshot({ path: `${output}/${name}.png`, fullPage: true })
      await page.screenshot({ path: `${output}/${name}-viewport.png` })
      results.push({ device, path, status: response.status(), settledMs: Date.now() - start,
        ...await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          paints: performance.getEntriesByType('paint').map(({ name, startTime }) => ({ name, ms: Math.round(startTime) })),
        })), errors: [...errors] })
    }
    await page.goto(new URL('/plan', baseURL).toString())
    await page.getByRole('button', { name: 'Показать демо-план' }).click()
    await page.screenshot({ path: `${output}/7-${device}-planner-example.png`, fullPage: true })
    await page.close()
  }
} finally {
  await browser.close()
}
await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
