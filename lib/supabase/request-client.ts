import 'server-only'

import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import type { Database } from './database.types'
import { getSupabaseEnv, type SupabaseEnv } from './env'

/** One client per request. The caller owns cookie writes and response cache headers. */
export function createRequestClient(cookies: CookieMethodsServer, env: SupabaseEnv = getSupabaseEnv()) {
  return createServerClient<Database>(env.url, env.publishableKey, {
    cookies,
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  })
}
