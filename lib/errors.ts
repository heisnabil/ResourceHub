export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR'
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function parseSupabaseError(error: { message: string; code?: string }): AppError {
  const msg = error.message

  if (msg.includes('INSUFFICIENT_STOCK')) {
    return new AppError('Not enough stock available for this request.', 'INSUFFICIENT_STOCK')
  }
  if (msg.includes('REQUEST_ALREADY_PROCESSED')) {
    return new AppError('This request has already been processed.', 'REQUEST_ALREADY_PROCESSED')
  }
  if (msg.includes('FORBIDDEN')) {
    return new AppError('You do not have permission to perform this action.', 'FORBIDDEN')
  }
  if (msg.includes('REQUEST_NOT_FOUND')) {
    return new AppError('Request not found.', 'NOT_FOUND')
  }

  return new AppError(msg, error.code ?? 'DATABASE_ERROR')
}

export function toActionError(err: unknown): { error: string; code?: string } {
  if (err instanceof AppError) {
    return { error: err.message, code: err.code }
  }
  if (err instanceof Error) {
    if (err.message === 'PROFILE_NOT_FOUND') {
      return {
        error: 'Your account profile is missing. Refresh the page or contact support.',
        code: 'PROFILE_NOT_FOUND',
      }
    }
    if (err.message === 'UNAUTHORIZED') {
      return { error: 'Please sign in again.', code: 'UNAUTHORIZED' }
    }
    return { error: err.message }
  }
  return { error: 'An unexpected error occurred' }
}
