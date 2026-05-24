/** Resolve public site origin behind Vercel / reverse proxies. */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'

  if (forwardedHost) {
    const host = forwardedHost.split(',')[0]?.trim()
    if (host) {
      return `${forwardedProto}://${host}`.replace(/\/$/, '')
    }
  }

  return new URL(request.url).origin.replace(/\/$/, '')
}
