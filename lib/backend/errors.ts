export type BackendErrorCode = 'unauthenticated' | 'invalid_input' | 'not_found' | 'unavailable'

/** Stable boundary errors: never attach raw SQL, JWT, keys, or upstream messages. */
export class BackendError extends Error {
  constructor(public readonly code: BackendErrorCode) { super(code); this.name = 'BackendError' }
}

export function assertUuid(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new BackendError('invalid_input')
  }
}
