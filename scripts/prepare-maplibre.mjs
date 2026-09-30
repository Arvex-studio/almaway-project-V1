import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// MapLibre 6's ESM worker resolves a sibling module. Serve both from this origin
// rather than relying on the bundler's rewritten import.meta.url or a third-party CDN.
const dist = path.dirname(fileURLToPath(import.meta.resolve('maplibre-gl')))
const target = path.resolve('public/maplibre')
await mkdir(target, { recursive: true })
for (const name of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  await copyFile(path.join(dist, name), path.join(target, name))
}
