const HOSTED_ORIGIN = 'https://nwmmqtyfaumuaocspsur.supabase.co'
export const LOCAL_SUPABASE_ORIGIN = 'http://127.0.0.1:55431'

export type SupabaseEnv = Readonly<{ url: string; publishableKey: string; local: boolean }>

/** Lazy validation: a demo-only build needs no Supabase credentials. Never echo values. */
export function parseSupabaseEnv(urlValue?: string, keyValue?: string): SupabaseEnv {
  let url: URL
  try { url = new URL(urlValue ?? '') } catch { throw new Error('Invalid Supabase configuration') }
  const local = url.origin === LOCAL_SUPABASE_ORIGIN
  if ((!local && url.origin !== HOSTED_ORIGIN) || url.username || url.password ||
      url.search || url.hash || url.pathname !== '/') {
    throw new Error('Invalid Supabase project origin')
  }
  if (!keyValue || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(keyValue)) {
    throw new Error('A Supabase publishable key is required')
  }
  return { url: url.origin, publishableKey: keyValue, local }
}

export function getSupabaseEnv(): SupabaseEnv {
  // Keep static property access: Next replaces these public values at build time.
  return parseSupabaseEnv(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )
}

export function localAuthEnabled(): boolean {
  const flag = process.env.ALMAWAY_LOCAL_AUTH_ENABLED
  if (!flag || flag === 'false') return false
  if (flag !== 'true' || !getSupabaseEnv().local) {
    throw new Error('Session refresh is gated to the isolated local Supabase project')
  }
  return true
}
