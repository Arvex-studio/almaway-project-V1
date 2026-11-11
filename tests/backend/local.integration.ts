import assert from 'node:assert/strict'
import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'
import type { Database } from '../../lib/supabase/database.types'
import { createRequestClient } from '../../lib/supabase/request-client'
import { refreshSession } from '../../lib/supabase/proxy'
import { parseSupabaseEnv } from '../../lib/supabase/env'
import { createRepository } from '../../lib/backend/repository'
import { requireIdentity } from '../../lib/backend/auth'
import manifest from '../../supabase/seeds/reviewed-five.json'

const status = JSON.parse(process.env.ALMAWAY_LOCAL_FIXTURE ?? '{}') as Record<string, string>
// No opt-out or remote test target. Obtain credentials through the guarded local runner.
assert.equal(status.API_URL, 'http://127.0.0.1:55431', 'Use scripts/backend/local.mjs test')
const url = status.API_URL
const key = status.PUBLISHABLE_KEY
const env = parseSupabaseEnv(url, key)
const admin = createClient<Database>(url, status.SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const newClient = () => createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const P = manifest.places[0].id
const Q = manifest.places[1].id

function signed(claims: Record<string, unknown>) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const p = Buffer.from(JSON.stringify(claims)).toString('base64url')
  return `${h}.${p}.${createHmac('sha256', status.JWT_SECRET).update(`${h}.${p}`).digest('base64url')}`
}
function claimsOf(session: Session) { return JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64url').toString()) }

async function api(jwt: string | null, path: string, method = 'GET', body?: unknown, prefer = 'return=representation') {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method, headers: { apikey: key, ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      'Content-Type': 'application/json', Prefer: prefer },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
}
function ok(result: { status: number; body?: { code?: string } }) { assert.ok(result.status >= 200 && result.status < 300, `Expected success, HTTP ${result.status} (${result.body?.code ?? "no code"})`) }
function denied(result: { status: number; body?: { code?: string } }) { assert.ok([401, 403].includes(result.status), `Expected permission denial, HTTP ${result.status} (${result.body?.code ?? "no code"})`) }

class Jar {
  values = new Map<string, { value: string; options: CookieOptions }>()
  headers = new Headers()
  getAll = () => [...this.values].map(([name, cookie]) => ({ name, value: cookie.value }))
  setAll = (cookies: { name: string; value: string; options: CookieOptions }[], headers: Record<string, string>) => {
    for (const c of cookies) {
      if (c.options.maxAge === 0) this.values.delete(c.name)
      else this.values.set(c.name, { value: c.value, options: c.options })
    }
    Object.entries(headers).forEach(([name, value]) => this.headers.set(name, value))
  }
  client() { return createRequestClient({ getAll: this.getAll, setAll: this.setAll }, env) }
  cookieHeader() { return this.getAll().map(c => `${c.name}=${c.value}`).join('; ') }
  replace(session: Session) {
    const baseName = [...this.values.keys()].find(name => name.includes('auth-token'))!.replace(/\.\d+$/, '')
    this.values.clear()
    this.values.set(baseName, { value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url'), options: { path: '/', sameSite: 'lax' } })
  }
  expire(session: Session, invalidRefresh = false) {
    const baseName = [...this.values.keys()].find(name => name.includes('auth-token'))!.replace(/\.\d+$/, '')
    const old = Math.floor(Date.now() / 1000) - 120
    const expired = { ...session, expires_at: old, expires_in: 0,
      access_token: signed({ ...claimsOf(session), exp: old }),
      ...(invalidRefresh ? { refresh_token: 'invalid-local-refresh-token' } : {}) }
    this.values.clear()
    this.values.set(baseName, { value: 'base64-' + Buffer.from(JSON.stringify(expired)).toString('base64url'), options: { path: '/', sameSite: 'lax' } })
  }
}

test('isolated Supabase: real Data API authorization and session matrix', async t => {
  const users: string[] = []
  const extraPlaces: string[] = []
  const extraSources: string[] = []
  const password = randomBytes(24).toString('base64url')
  async function user(label: string) {
    const email = `almaway-${label}-${randomUUID()}@example.invalid`
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true })
    assert.equal(created.error, null); assert.ok(created.data.user)
    const id = created.data.user.id; users.push(id)
    const client = newClient()
    const login = await client.auth.signInWithPassword({ email, password })
    assert.equal(login.error, null); assert.ok(login.data.session)
    return { id, email, client, session: login.data.session, jwt: login.data.session.access_token, repo: createRepository(client) }
  }
  try {
    const a = await user('a'); const b = await user('b')
    const anon = newClient()
    const draft = randomUUID(); extraPlaces.push(draft)
    const { source: _source, ...base } = manifest.places[2]
    const draftInsert = await admin.from('places').insert({ ...base, id: draft, slug: `draft-${draft}`, status: 'draft' })
    assert.equal(draftInsert.error, null)
    const draftSource = { ...manifest.places[2].source, id: randomUUID(), place_id: draft }
    assert.equal((await admin.from('place_sources').insert(draftSource)).error, null)
    const alt = { ...manifest.places[0].source, id: randomUUID(), place_id: P, is_primary: false, source_url: 'https://example.invalid/alternative' }
    extraSources.push(alt.id)
    assert.equal((await admin.from('place_sources').insert(alt)).error, null)

    await t.test('catalog and all citations are public; draft by ID/slug and child ID are hidden', async () => {
      for (const token of [null, a.jwt, b.jwt]) {
        const published = await api(token, 'places?select=*,place_sources(*)'); ok(published)
        assert.equal(published.body.length, 5)
        for (const seed of manifest.places) {
          const row = published.body.find((p: { id: string }) => p.id === seed.id)
          assert.equal(row.slug, seed.slug); assert.equal(row.latitude, seed.latitude); assert.equal(row.longitude, seed.longitude)
          assert.equal(row.category, seed.category); assert.equal(row.image_url, null); assert.deepEqual(row.tags, seed.tags)
          const primary = row.place_sources.find((s: { is_primary: boolean }) => s.is_primary)
          for (const field of ['source_url', 'retrieved_at', 'method', 'feature', 'license', 'attribution'] as const) assert.equal(primary[field], seed.source[field])
        }
        assert.equal(published.body.find((p: { id: string }) => p.id === P).place_sources.length, 2)
        for (const query of [`places?id=eq.${draft}`, `places?slug=eq.draft-${draft}`, `place_sources?id=eq.${draftSource.id}`, `place_sources?place_id=eq.${draft}`]) {
          const hidden = await api(token, query); ok(hidden); assert.deepEqual(hidden.body, [])
        }
      }
      const places = await createRepository(anon).listPublishedPlaces()
      assert.equal(places.length, 5); assert.equal(places.find(p => p.id === P)!.sources.length, 2)
      assert.equal(await createRepository(anon).getPublishedPlace(`draft-${draft}`), null)
    })

    await t.test('anon has no private table grants or private repository access', async () => {
      for (const table of ['profiles', 'saved_places']) {
        denied(await api(null, table))
        denied(await api(null, table, 'POST', table === 'profiles' ? { id: a.id } : { user_id: a.id, place_id: P }))
        denied(await api(null, `${table}?${table === 'profiles' ? 'id' : 'user_id'}=not.is.null`, 'PATCH', table === 'profiles' ? { bio: 'x' } : { place_id: Q }))
        denied(await api(null, `${table}?${table === 'profiles' ? 'id' : 'user_id'}=not.is.null`, 'DELETE'))
      }
      await assert.rejects(createRepository(anon).getMyProfile(), { code: 'unauthenticated' })
    })

    await t.test('lazy own profile creation is concurrent-safe and never overwrites existing data', async () => {
      await Promise.all([a.repo.ensureMyProfile(), a.repo.ensureMyProfile(), b.repo.ensureMyProfile()])
      await a.repo.updateMyProfile({ display_name: 'User A', hometown: 'Алматы', bio: 'A only' })
      await b.repo.updateMyProfile({ display_name: 'User B', bio: 'B only' })
      assert.equal((await a.repo.ensureMyProfile()).bio, 'A only')
      const allA = await api(a.jwt, 'profiles'); ok(allA); assert.deepEqual(allA.body.map((r: { id: string }) => r.id), [a.id])
    })

    await t.test('A cannot read/insert/update B profile, including unfiltered bulk UPDATE', async () => {
      const hidden = await api(a.jwt, `profiles?id=eq.${b.id}`); ok(hidden); assert.deepEqual(hidden.body, [])
      denied(await api(a.jwt, 'profiles', 'POST', { id: b.id, bio: 'forged' }))
      const update = await api(a.jwt, `profiles?id=eq.${b.id}`, 'PATCH', { bio: 'forged' }); ok(update); assert.deepEqual(update.body, [])
      const unfiltered = await api(a.jwt, 'profiles', 'PATCH', { bio: 'A bulk' }); assert.equal(unfiltered.status, 400); assert.equal(unfiltered.body.code, '21000')
      const bulk = await api(a.jwt, 'profiles?id=not.is.null', 'PATCH', { bio: 'A bulk' }); ok(bulk)
      assert.deepEqual(bulk.body.map((r: { id: string }) => r.id), [a.id])
      assert.equal((await b.repo.getMyProfile())!.bio, 'B only')
    })

    await t.test('profile column privileges reject ID/timestamp writes and DELETE; valid nullable fields work', async () => {
      for (const patch of [{ id: b.id }, { created_at: '2000-01-01T00:00:00Z' }]) denied(await api(a.jwt, `profiles?id=eq.${a.id}`, 'PATCH', patch))
      denied(await api(a.jwt, `profiles?id=eq.${a.id}`, 'DELETE'))
      const invalid = await api(a.jwt, `profiles?id=eq.${a.id}`, 'PATCH', { display_name: 'x'.repeat(81) }); assert.equal(invalid.status, 400)
      const valid = await a.repo.updateMyProfile({ hometown: null, display_name: null, bio: null }); assert.equal(valid.bio, null)
      await assert.rejects(a.repo.updateMyProfile({ id: b.id } as never), { code: 'invalid_input' })
      assert.equal((await b.repo.getMyProfile())!.bio, 'B only')
    })

    await t.test('save retries, concurrent duplicates and users are independent; timestamp is retained', async () => {
      await Promise.all(Array.from({ length: 6 }, () => a.repo.setPlaceSaved({ placeId: P, saved: true })))
      const before = (await a.repo.listMySavedPlaces())[0].savedAt
      await a.repo.setPlaceSaved({ placeId: P, saved: true })
      await b.repo.setPlaceSaved({ placeId: P, saved: true })
      const list = await a.repo.listMySavedPlaces()
      assert.equal(list.length, 1); assert.equal(list[0].savedAt, before)
      assert.equal(list[0].place!.sources.length, 2)
      assert.equal((await b.repo.listMySavedPlaces()).length, 1)
    })

    await t.test('A cannot save as B, see B saves, update ownership/place/timestamp or delete B links', async () => {
      denied(await api(a.jwt, 'saved_places', 'POST', { user_id: b.id, place_id: Q }))
      const hidden = await api(a.jwt, `saved_places?user_id=eq.${b.id}`); ok(hidden); assert.deepEqual(hidden.body, [])
      const own = await api(a.jwt, 'saved_places'); ok(own); assert.ok(own.body.every((r: { user_id: string }) => r.user_id === a.id))
      for (const patch of [{ user_id: b.id }, { place_id: Q }, { created_at: '2000-01-01T00:00:00Z' }]) denied(await api(a.jwt, 'saved_places?user_id=not.is.null', 'PATCH', patch))
      const deletion = await api(a.jwt, `saved_places?user_id=eq.${b.id}&place_id=eq.${P}`, 'DELETE'); ok(deletion); assert.deepEqual(deletion.body, [])
      assert.equal((await b.repo.listMySavedPlaces()).length, 1)
      for (const id of [draft, randomUUID()]) {
        denied(await api(a.jwt, 'saved_places', 'POST', { user_id: a.id, place_id: id }))
        await assert.rejects(a.repo.setPlaceSaved({ placeId: id, saved: true }), { code: 'not_found' })
      }
    })

    await t.test('catalog/source INSERT UPDATE DELETE and user_metadata admin claims give no write rights', async () => {
      assert.equal((await a.client.auth.updateUser({ data: { role: 'admin', is_admin: true } })).error, null)
      for (const token of [null, a.jwt, b.jwt]) {
        denied(await api(token, `places?id=eq.${P}`, 'PATCH', { category: 'national_park', status: 'published' }))
        denied(await api(token, `places?id=eq.${P}`, 'DELETE'))
        denied(await api(token, 'places', 'POST', { ...base, id: randomUUID(), slug: `forged-${randomUUID()}` }))
        denied(await api(token, 'place_sources', 'POST', { ...alt, id: randomUUID() }))
        denied(await api(token, `place_sources?id=eq.${alt.id}`, 'PATCH', { is_primary: true }))
        denied(await api(token, `place_sources?id=eq.${alt.id}`, 'DELETE'))
      }
    })

    await t.test('authenticated JWTs with anonymous or missing claim fail private RLS; invalid/expired JWTs fail API', async () => {
      for (const anonymous of [true, undefined]) {
        const claims = { ...claimsOf(a.session), exp: Math.floor(Date.now() / 1000) + 600, is_anonymous: anonymous }
        const token = signed(claims)
        const publicRead = await api(token, 'places?limit=1'); ok(publicRead)
        const privateRead = await api(token, 'profiles'); ok(privateRead); assert.deepEqual(privateRead.body, [])
        const saves = await api(token, 'saved_places'); ok(saves); assert.deepEqual(saves.body, [])
        denied(await api(token, 'saved_places', 'POST', { user_id: a.id, place_id: Q }))
        const update = await api(token, 'profiles?id=not.is.null', 'PATCH', { bio: 'forged' }); ok(update); assert.deepEqual(update.body, [])
        const remove = await api(token, 'saved_places?user_id=not.is.null', 'DELETE'); ok(remove); assert.deepEqual(remove.body, [])
      }
      assert.equal((await api('invalid.jwt.value', 'profiles')).status, 401)
      assert.equal((await api(signed({ ...claimsOf(a.session), exp: 1 }), 'profiles')).status, 401)
    })

    await t.test('unpublished place hides joined DTO and sources but owner can remove stale link repeatedly', async () => {
      assert.equal((await admin.from('places').update({ status: 'draft' }).eq('id', P)).error, null)
      try {
        const saved = await a.repo.listMySavedPlaces(); assert.equal(saved.length, 1); assert.equal(saved[0].place, null)
        const hiddenSources = await api(a.jwt, `place_sources?place_id=eq.${P}`); ok(hiddenSources); assert.deepEqual(hiddenSources.body, [])
        assert.equal((await a.repo.setPlaceSaved({ placeId: P, saved: false })).saved, false)
        assert.equal((await a.repo.setPlaceSaved({ placeId: P, saved: false })).saved, false)
        assert.equal((await a.repo.listMySavedPlaces()).length, 0)
        assert.equal((await b.repo.listMySavedPlaces()).length, 1)
      } finally { assert.equal((await admin.from('places').update({ status: 'published' }).eq('id', P)).error, null) }
    })

    await t.test('request-scoped SSR clients isolate parallel A/B reads; real refresh keeps cookies and cache headers separate', async () => {
      const ja = new Jar(); const jb = new Jar()
      const la = await ja.client().auth.signInWithPassword({ email: a.email, password })
      const lb = await jb.client().auth.signInWithPassword({ email: b.email, password })
      assert.equal(la.error, null); assert.equal(lb.error, null)
      assert.notEqual(ja.client(), jb.client())
      const ids = await Promise.all(Array.from({ length: 12 }, (_, i) => requireIdentity((i % 2 ? jb : ja).client())))
      assert.deepEqual(ids, Array.from({ length: 12 }, (_, i) => i % 2 ? b.id : a.id))
      ja.expire(la.data.session!); jb.expire(lb.data.session!)
      process.env.NEXT_PUBLIC_SUPABASE_URL = url; process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key
      const requests = [ja, jb].map(jar => new NextRequest('http://127.0.0.1:3000/saved', { headers: { cookie: jar.cookieHeader() } }))
      const responses = await Promise.all(requests.map(request => refreshSession(request)))
      for (const [i, response] of responses.entries()) {
        assert.match(response.headers.get('Cache-Control')!, /private.*no-store/)
        assert.equal(response.headers.get('Pragma'), 'no-cache'); assert.equal(response.headers.get('Expires'), '0')
        assert.ok(response.cookies.getAll().length > 0)
        assert.ok(response.cookies.getAll().every(cookie => cookie.path === '/' && cookie.sameSite === 'lax'))
        assert.match(response.headers.get('x-middleware-request-cookie')!, /auth-token/)
        const jar = i ? jb : ja
        jar.setAll(response.cookies.getAll().map(c => ({ name: c.name, value: c.value, options: { ...c, expires: typeof c.expires === 'number' ? new Date(c.expires) : c.expires } })), {})
        assert.equal(await requireIdentity(jar.client()), i ? b.id : a.id)
        assert.equal((await createRepository(jar.client()).getMyProfile())!.id, i ? b.id : a.id)
      }
      // A plausible cookie/user object is never sufficient evidence of identity.
      for (const claim of [true, undefined]) {
        const jar = new Jar(); await jar.client().auth.signInWithPassword({ email: a.email, password })
        jar.replace({ ...la.data.session!, access_token: signed({ ...claimsOf(la.data.session!), is_anonymous: claim }), expires_at: Math.floor(Date.now() / 1000) + 3600 })
        await assert.rejects(requireIdentity(jar.client()), { code: 'unauthenticated' })
      }
      const invalid = new Jar(); await invalid.client().auth.signInWithPassword({ email: a.email, password })
      invalid.replace({ ...la.data.session!, access_token: 'invalid.jwt.cookie', expires_at: Math.floor(Date.now() / 1000) + 3600 })
      await assert.rejects(requireIdentity(invalid.client()), { code: 'unauthenticated' })
      const noSession = new Jar()
      await assert.rejects(requireIdentity(noSession.client()), { code: 'unauthenticated' })
      ja.expire(la.data.session!, true)
      const expired = await refreshSession(new NextRequest('http://127.0.0.1:3000/profile', { headers: { cookie: ja.cookieHeader() } }))
      assert.match(expired.headers.get('Cache-Control')!, /no-store/)
      ja.setAll(expired.cookies.getAll().map(c => ({ name: c.name, value: c.value, options: { ...c, expires: typeof c.expires === 'number' ? new Date(c.expires) : c.expires } })), {})
      await assert.rejects(requireIdentity(ja.client()), { code: 'unauthenticated' })
      // Same browser switches from a signed-out A context to B. No shared server state.
      await ja.client().auth.signOut({ scope: 'local' })
      const switched = ja.client()
      assert.equal((await switched.auth.signInWithPassword({ email: b.email, password })).error, null)
      assert.equal((await createRepository(ja.client()).getMyProfile())!.id, b.id)
      assert.equal((await createRepository(ja.client()).listMySavedPlaces()).length, 1)
    })

    await t.test('schema/ACL/constraints are verified independently from user-level RLS proofs', () => {
      execFileSync(fileURLToPath(new URL('../../node_modules/.bin/supabase', import.meta.url)),
        ['db', 'query', '--file', fileURLToPath(new URL('./catalog.sql', import.meta.url))],
        { stdio: ['ignore', 'pipe', 'pipe'] })
    })

    await t.test('deleting a local Auth fixture cascades only its profile/saves', async () => {
      await a.repo.setPlaceSaved({ placeId: Q, saved: true })
      assert.equal((await admin.auth.admin.deleteUser(a.id)).error, null)
      assert.equal((await admin.from('profiles').select('id').eq('id', a.id)).data!.length, 0)
      assert.equal((await admin.from('saved_places').select('place_id').eq('user_id', a.id)).data!.length, 0)
      assert.equal((await b.repo.getMyProfile())!.id, b.id)
      assert.equal((await b.repo.listMySavedPlaces()).length, 1)
      users.splice(users.indexOf(a.id), 1)
    })
  } finally {
    // Fixture/admin operations only, never used as evidence for RLS decisions.
    for (const id of users) await admin.auth.admin.deleteUser(id)
    for (const id of extraSources) await admin.from('place_sources').delete().eq('id', id)
    for (const id of extraPlaces) await admin.from('places').delete().eq('id', id)
    await admin.from('places').update({ status: 'published' }).eq('id', P)
  }
})
