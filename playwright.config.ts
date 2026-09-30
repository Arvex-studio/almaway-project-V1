import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    browserName: 'chromium',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: ['--enable-unsafe-swiftshader'],
    },
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  },
  projects: [{
    name: process.env.ALMAWAY_TEST_MISSING_KEY ? 'missing-key' : 'map',
    use: { baseURL: 'http://127.0.0.1:3100' },
  }],
  webServer: {
    command: 'node scripts/prepare-maplibre.mjs && node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100',
    env: { NEXT_PUBLIC_MAPTILER_KEY: process.env.ALMAWAY_TEST_MISSING_KEY ? '' : 'almaway-test-placeholder-not-a-real-key' },
    reuseExistingServer: false,
  },
})
