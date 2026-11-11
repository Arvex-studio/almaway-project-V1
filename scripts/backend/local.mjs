import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import ts from 'typescript'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const cli = resolve(root, 'node_modules/.bin/supabase')
const mode = process.argv[2]
const allowed = ['start', 'reset', 'types', 'check-types', 'test', 'advisors', 'stop', 'migrate', 'history']
if (!allowed.includes(mode) || process.argv.length !== 3) throw new Error(`Use: node scripts/backend/local.mjs ${allowed.join('|')}`)
if (existsSync(resolve(root, 'supabase/.temp/project-ref')) || existsSync(resolve(root, 'supabase/.link.json'))) throw new Error('Refusing a linked Supabase directory')
const config = readFileSync(resolve(root, 'supabase/config.toml'), 'utf8')
if (!config.includes('project_id = "almaway-phase-2b-2"') || !config.includes('port = 55431') || /\[remotes[.\]]/.test(config)) {
  throw new Error('Unexpected local target configuration')
}
// Inherited remote credentials/target overrides never reach CLI or tests.
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^(SUPABASE_|NEXT_PUBLIC_SUPABASE_|ALMAWAY_LOCAL_)/.test(key)))
// CLI-generated bootstrap files must remain readable by the container Postgres UID.
// Scope the normal file mask to this setup process; fixture secrets below stay mode 0600.
process.umask(0o022)
for (const directory of [root, resolve(root, 'supabase')]) {
  for (const name of readdirSync(directory).filter(name => /^\.env(?:$|\.)/.test(name) && name !== '.env.example')) {
    if (/^\s*(?:export\s+)?SUPABASE_[A-Z0-9_]+\s*=/m.test(readFileSync(resolve(directory, name), 'utf8'))) {
      throw new Error('Refusing CLI target/credential overrides in env files')
    }
  }
}
mkdirSync(resolve(root, 'supabase/.temp'), { recursive: true })
const fixtureSecretPath = resolve(root, 'supabase/.temp/backend-fixture.json')
if (!existsSync(fixtureSecretPath)) writeFileSync(fixtureSecretPath, JSON.stringify({ jwtSecret: randomBytes(48).toString('base64url') }), { mode: 0o600 })
const { jwtSecret } = JSON.parse(readFileSync(fixtureSecretPath, 'utf8'))
env.ALMAWAY_LOCAL_JWT_SECRET = jwtSecret
const run = (args, options = {}) => execFileSync(cli, ['--workdir', root, ...args], { cwd: root, env, ...options })
if (mode === 'start') {
  // start prints local credentials; keep its output private, report only a safe outcome.
  try { run(['start'], { stdio: ['ignore', 'pipe', 'pipe'] }); console.log('Isolated local Supabase started') }
  catch { throw new Error('Local Supabase start failed; inspect Docker availability and disk capacity') }
} else if (mode === 'reset') {
  run(['db', 'reset', '--yes'], { stdio: 'inherit' })
} else if (mode === 'migrate' || mode === 'history') {
  run(['migration', mode === 'migrate' ? 'up' : 'list'], { stdio: 'inherit' })
} else if (mode === 'stop') {
  run(['stop'], { stdio: 'inherit' })
} else if (mode === 'advisors') {
  run(['db', 'advisors', '--type', 'all', '--fail-on', 'warn'], { stdio: 'inherit' })
} else if (mode === 'types' || mode === 'check-types') {
  const raw = run(['gen', 'types', 'typescript', '--schema', 'public', '--output-format', 'text'], { encoding: 'utf8' })
  const generated = '// Generated from isolated local Supabase; run scripts/backend/local.mjs types.\n' +
    ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(ts.createSourceFile('database.types.ts', raw, ts.ScriptTarget.Latest, true))
  const path = resolve(root, 'lib/supabase/database.types.ts')
  if (mode === 'types') writeFileSync(path, generated)
  else if (readFileSync(path, 'utf8') !== generated) throw new Error('Generated Database types are stale')
  console.log(mode === 'types' ? 'Database types generated from local schema' : 'Database types match local schema')
} else {
  const snapshot = JSON.parse(run(['status', '--output-format', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
  const status = { API_URL: snapshot.env.API_URL, PUBLISHABLE_KEY: snapshot.env.PUBLISHABLE_KEY, SERVICE_ROLE_KEY: snapshot.env.SERVICE_ROLE_KEY, JWT_SECRET: jwtSecret }
  if (status.API_URL !== 'http://127.0.0.1:55431') throw new Error('Refusing non-local API URL')
  if (!status.PUBLISHABLE_KEY || !status.SERVICE_ROLE_KEY || !status.JWT_SECRET) throw new Error('Local fixture credentials unavailable')
  const files = ['unit.ts', 'local.integration.ts'].map(file => resolve(root, 'tests/backend', file))
  const result = spawnSync(process.execPath, ['--conditions=react-server', '--import', 'tsx', '--test', ...files], {
    cwd: root, env: { ...env, ALMAWAY_LOCAL_FIXTURE: JSON.stringify(status) }, stdio: 'inherit',
  })
  process.exitCode = result.status ?? 1
}
