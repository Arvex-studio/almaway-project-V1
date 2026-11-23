import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const cli = require.resolve('@playwright/test/cli')
let status = 0
// Next dev owns one lock per repository; run the keyed fixture and missing-key cases sequentially.
for (const missing of ['', '1']) {
  const result = spawnSync(process.execPath, [cli, 'test'], {
    stdio: 'inherit',
    env: { ...process.env, ALMAWAY_TEST_MISSING_KEY: missing },
  })
  if (result.status !== 0) status = result.status ?? 1
}
process.exitCode = status
