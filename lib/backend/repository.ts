import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '../supabase/database.types'
import { requireIdentity } from './auth'
import { assertUuid, BackendError } from './errors'
import { toPublicPlace } from './places'

type ProfilePatch = Pick<Tables<'profiles'>, 'display_name' | 'hometown' | 'bio'>

function validateProfile(input: unknown): asserts input is Partial<ProfilePatch> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new BackendError('invalid_input')
  const limits: Record<string, number> = { display_name: 80, hometown: 100, bio: 280 }
  for (const [key, value] of Object.entries(input)) {
    if (!Object.hasOwn(limits, key) || (value !== null &&
        (typeof value !== 'string' || [...value].length > limits[key] || (key !== 'bio' && !value.trim())))) {
      throw new BackendError('invalid_input')
    }
  }
}

/** Scope this repository to a browser session or one server request. No privileged client. */
export function createRepository(client: SupabaseClient<Database>) {
  return {
    async listPublishedPlaces() {
      const { data, error } = await client.from('places').select('*, place_sources(*)').eq('status', 'published').order('slug')
      if (error) throw new BackendError('unavailable')
      return data.flatMap(row => { const place = toPublicPlace(row); return place ? [place] : [] })
    },
    async getPublishedPlace(slug: string) {
      if (typeof slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 100) throw new BackendError('invalid_input')
      const { data, error } = await client.from('places').select('*, place_sources(*)').eq('slug', slug).eq('status', 'published').maybeSingle()
      if (error) throw new BackendError('unavailable')
      return data ? toPublicPlace(data) : null
    },
    async getMyProfile() {
      const id = await requireIdentity(client)
      const { data, error } = await client.from('profiles').select('*').eq('id', id).maybeSingle()
      if (error) throw new BackendError('unavailable')
      return data
    },
    async ensureMyProfile() {
      const id = await requireIdentity(client)
      const { error } = await client.from('profiles').insert({ id })
      // A concurrent lazy init may win. Never overwrite the existing editable values.
      if (error && error.code !== '23505') throw new BackendError('unavailable')
      const result = await client.from('profiles').select('*').eq('id', id).single()
      if (result.error) throw new BackendError('unavailable')
      return result.data
    },
    async updateMyProfile(patch: Partial<ProfilePatch>) {
      validateProfile(patch)
      const id = await requireIdentity(client)
      if (!Object.keys(patch).length) throw new BackendError('invalid_input')
      const { data, error } = await client.from('profiles').update(patch).eq('id', id).select().maybeSingle()
      if (error) throw new BackendError('unavailable')
      if (!data) throw new BackendError('not_found')
      return data
    },
    async listMySavedPlaces() {
      const userId = await requireIdentity(client)
      const { data, error } = await client.from('saved_places').select('place_id, created_at, places(*, place_sources(*))')
        .eq('user_id', userId).order('created_at', { ascending: false }).order('place_id')
      if (error) throw new BackendError('unavailable')
      return data.map(row => ({ placeId: row.place_id, savedAt: row.created_at,
        place: row.places ? toPublicPlace(row.places) : null }))
    },
    async setPlaceSaved(input: { placeId: string; saved: boolean }) {
      if (!input || typeof input.saved !== 'boolean') throw new BackendError('invalid_input')
      assertUuid(input.placeId)
      const userId = await requireIdentity(client)
      if (input.saved) {
        const visible = await client.from('places').select('id').eq('id', input.placeId).maybeSingle()
        if (visible.error) throw new BackendError('unavailable')
        if (!visible.data) throw new BackendError('not_found')
        const { error } = await client.from('saved_places').upsert({ user_id: userId, place_id: input.placeId }, {
          onConflict: 'user_id,place_id', ignoreDuplicates: true,
        })
        if (error) throw new BackendError(error.code === '42501' || error.code === '23503' ? 'not_found' : 'unavailable')
      } else {
        const { error } = await client.from('saved_places').delete().eq('user_id', userId).eq('place_id', input.placeId)
        if (error) throw new BackendError('unavailable')
      }
      const confirmation = await client.from('saved_places').select('place_id').eq('user_id', userId).eq('place_id', input.placeId).maybeSingle()
      if (confirmation.error) throw new BackendError('unavailable')
      return { placeId: input.placeId, saved: confirmation.data !== null }
    },
  }
}
