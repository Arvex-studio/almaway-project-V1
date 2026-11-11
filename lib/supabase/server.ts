import 'server-only'

import { cookies } from 'next/headers'
import type { CookieMethodsServer } from '@supabase/ssr'
import { createRequestClient } from './request-client'

/** RSC read-only factory. Proxy must refresh before rendering; unexpected writes fail visibly. */
export async function createClient() {
  const store = await cookies()
  return createRequestClient({
    getAll: () => store.getAll(),
    setAll: () => { throw new Error('Session refresh requires the request Proxy before rendering') },
  })
}

/** Actions/handlers supply a response-bound writer that preserves SDK cache headers as well. */
export async function createWritableClient(setAll: NonNullable<CookieMethodsServer['setAll']>) {
  const store = await cookies()
  return createRequestClient({ getAll: () => store.getAll(), setAll })
}
