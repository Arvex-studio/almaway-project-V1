import type { Tables } from '../supabase/database.types'

/** Preserve query, path case, trailing slash and PDF fragments. Never fetch this URL. */
export function canonicalSourceUrl(raw: string): string {
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid source URL')
  const canonical = url.href
  if (new TextEncoder().encode(canonical).length > 2048) throw new Error('Source URL exceeds byte limit')
  return canonical
}

/** Pure review helper: a matching key is not permission to overwrite attribution. */
export function compareCitation(existing: Tables<'place_sources'>, incoming: Tables<'place_sources'>): 'distinct' | 'duplicate' | 'conflict' {
  const identity = ['place_id', 'kind', 'field_key', 'source_url', 'retrieved_at'] as const
  if (identity.some(key => existing[key] !== incoming[key])) return 'distinct'
  const metadata = ['provider', 'method', 'feature', 'attribution', 'license', 'is_primary'] as const
  return metadata.some(key => existing[key] !== incoming[key]) ? 'conflict' : 'duplicate'
}
