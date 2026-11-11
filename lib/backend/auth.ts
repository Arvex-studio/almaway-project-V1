import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase/database.types'
import { BackendError } from './errors'
import { isInvalidSessionError } from '../supabase/auth-errors'

export async function requireIdentity(client: SupabaseClient<Database>): Promise<string> {
  try {
    const { data, error } = await client.auth.getClaims()
    if (error) {
      if (isInvalidSessionError(error)) {
        throw new BackendError('unauthenticated')
      }
      throw new BackendError('unavailable')
    }
    const claims = data?.claims
    if (!claims || claims.role !== 'authenticated' || claims.is_anonymous !== false ||
        typeof claims.sub !== 'string' || !claims.sub) throw new BackendError('unauthenticated')
    return claims.sub
  } catch (error) {
    if (error instanceof BackendError) throw error
    if (isInvalidSessionError(error)) throw new BackendError('unauthenticated')
    throw new BackendError('unavailable')
  }
}
