import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { createRequestClient } from './request-client'
import { isInvalidSessionError } from './auth-errors'

/** No redirect/login UX here. Private handlers must independently verify identity. */
export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  response.headers.set('Cache-Control', 'private, no-store')
  const client = createRequestClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet, cacheHeaders) => {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      // Rebuild forwarded request headers without dropping earlier cookie/header writes.
      const previous = response
      response = NextResponse.next({ request })
      previous.headers.forEach((value, name) => {
        if (name !== 'set-cookie' && !name.startsWith('x-middleware-')) response.headers.set(name, value)
      })
      previous.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
      cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      Object.entries(cacheHeaders ?? {}).forEach(([name, value]) => response.headers.set(name, value))
      response.headers.set('Cache-Control', 'private, no-store')
    },
  })
  try {
    const { error } = await client.auth.getClaims()
    if (error && !isInvalidSessionError(error)) throw new Error('Authentication service unavailable')
  } catch (error) {
    if (!isInvalidSessionError(error)) throw new Error('Authentication service unavailable')
  }
  return response
}
