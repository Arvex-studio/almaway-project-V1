import { NextResponse, type NextRequest } from 'next/server'
import { localAuthEnabled } from './lib/supabase/env'
import { refreshSession } from './lib/supabase/proxy'

export function proxy(request: NextRequest) {
  return localAuthEnabled() ? refreshSession(request) : NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)'],
}
