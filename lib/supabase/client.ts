'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'
import { getSupabaseEnv } from './env'

/** SDK singleton belongs to this browser context; never imported by server code. */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv()
  return createBrowserClient<Database>(url, publishableKey)
}
