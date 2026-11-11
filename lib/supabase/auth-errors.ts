/** Recognized session failures from the pinned SDK; transport/internal faults stay unavailable. */
export function isInvalidSessionError(error: unknown): boolean {
  // The pinned decodeJWT implementation can throw JSON.parse/UTF-8 decoder errors.
  if (error instanceof SyntaxError) return true
  if (!(error instanceof Error)) return false
  if (error.message === 'Invalid UTF-8 sequence') return true
  if (error.name === 'AuthSessionMissingError' || error.name === 'AuthInvalidJwtError') return true
  return 'status' in error && [400, 401, 403].includes(Number(error.status))
}
