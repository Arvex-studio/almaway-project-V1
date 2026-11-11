import assert from 'node:assert/strict'
import test from 'node:test'
import { parseSupabaseEnv, localAuthEnabled } from '../../lib/supabase/env'
import { toPublicPlace, type PlaceWithSources } from '../../lib/backend/places'
import { canonicalSourceUrl, compareCitation } from '../../lib/backend/sources'
import { assertUuid } from '../../lib/backend/errors'
import manifest from '../../supabase/seeds/reviewed-five.json'
import { touristPlaces } from '../../lib/tourist-places'

const fixture = (): PlaceWithSources => {
  const { source, ...place } = manifest.places[0]
  return { ...place, status: 'published', created_at: '2026-09-30T00:00:00Z', place_sources: [{ ...source, place_id: place.id }] }
}

test('env fails closed without echoing keys and permits only exact AlmaWay/local origins', () => {
  const key = 'sb_publishable_unit_test'
  for (const url of ['https://wrong.supabase.co', 'http://127.0.0.1:55432', 'https://nwmmqtyfaumuaocspsur.supabase.co/?x=1', 'https://user:pass@nwmmqtyfaumuaocspsur.supabase.co']) {
    assert.throws(() => parseSupabaseEnv(url, key))
  }
  for (const key of [undefined, '', 'sb_secret_example', 'service_role', 'eyJhbGci']) {
    assert.throws(() => parseSupabaseEnv('http://127.0.0.1:55431', key))
  }
  assert.equal(parseSupabaseEnv('http://127.0.0.1:55431', key).local, true)
  assert.equal(parseSupabaseEnv('https://nwmmqtyfaumuaocspsur.supabase.co', key).local, false)
  assert.equal(localAuthEnabled(), false)
})

test('DTO preserves category codes, all citations and longitude/latitude, with tag-only filters', () => {
  assert.equal(manifest.places.length, touristPlaces.length)
  for (const place of manifest.places) {
    const original = touristPlaces.find(p => p.slug === place.slug)!
    assert.deepEqual([place.longitude, place.latitude], original.coordinates)
    assert.equal(place.source.source_url, original.coordinateSource.url)
    assert.equal(place.source.method, original.coordinateSource.method)
    assert.equal(place.source.retrieved_at, original.coordinateSource.retrievedAt)
    assert.equal(place.source.feature, original.coordinateSource.feature)
    assert.equal(place.image_url, null)
  }
  const row = fixture()
  const extra = { ...row.place_sources[0], id: crypto.randomUUID(), source_url: 'https://example.org/alternative', is_primary: false }
  row.place_sources.unshift(extra)
  row.category = 'lake_group'
  const dto = toPublicPlace(row)!
  assert.equal(dto.categoryCode, 'lake_group'); assert.equal(dto.category, 'Озёрная группа')
  assert.equal(dto.coordinateSource.url, manifest.places[0].source.source_url)
  assert.equal(dto.sources.length, 2)
  assert.deepEqual(dto.coordinates, [row.longitude, row.latitude]); assert.deepEqual(dto.metrics, [])
  assert.equal(dto.distance, undefined); assert.equal(dto.image, undefined)
  row.category = 'future_reviewed_category'; row.tags = []
  assert.equal(toPublicPlace(row)!.category, row.category)
  assert.deepEqual(toPublicPlace(row)!.filters, [])
  row.place_sources = [extra]; assert.equal(toPublicPlace(row), null)
})

test('publication adapter rejects draft, missing/ambiguous/incompatible primary and unsourced images', () => {
  for (const change of [
    (r: PlaceWithSources) => { r.status = 'draft' },
    (r: PlaceWithSources) => { r.place_sources = [] },
    (r: PlaceWithSources) => { r.place_sources.push({ ...r.place_sources[0] }) },
    (r: PlaceWithSources) => { r.place_sources[0].provider = 'Other' },
    (r: PlaceWithSources) => { r.place_sources[0].method = 'guessed' },
    (r: PlaceWithSources) => { r.image_url = 'https://example.org/image.jpg' },
  ]) { const row = fixture(); change(row); assert.equal(toPublicPlace(row), null) }
})

test('citation canonicalization preserves query/PDF fragment; dedup never overwrites conflicts', () => {
  assert.equal(canonicalSourceUrl('https://EXAMPLE.org:443/Case/?q=1#page=9'), 'https://example.org/Case/?q=1#page=9')
  assert.throws(() => canonicalSourceUrl('http://example.org'))
  const max = 'https://example.org/' + 'a'.repeat(2048 - 'https://example.org/'.length)
  assert.equal(canonicalSourceUrl(max).length, 2048)
  assert.throws(() => canonicalSourceUrl(max + 'b'))
  const source = fixture().place_sources[0]
  assert.equal(compareCitation(source, { ...source, id: crypto.randomUUID() }), 'duplicate')
  assert.equal(compareCitation(source, { ...source, license: 'different' }), 'conflict')
  assert.equal(compareCitation(source, { ...source, is_primary: false }), 'conflict')
  assert.equal(compareCitation(source, { ...source, retrieved_at: '2026-10-01' }), 'distinct')
  assert.equal(compareCitation(source, { ...source, field_key: 'category', kind: 'content' }), 'distinct')
  assert.equal(compareCitation(source, { ...source, source_url: 'https://example.org/other' }), 'distinct')
})

test('identity input validation rejects malformed UUIDs', () => {
  assertUuid(manifest.places[0].id)
  for (const value of [null, '', 'not-a-uuid', '1 OR 1=1']) assert.throws(() => assertUuid(value))
})
