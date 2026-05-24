import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/inventory',
  '/requests',
  '/reports',
  '/profile',
]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const pathname = request.nextUrl.pathname

  // Supabase may redirect to Site URL with ?code= on / — forward to our callback handler.
  const authCode = request.nextUrl.searchParams.get('code')
  if (authCode && !pathname.startsWith('/auth/callback')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    return NextResponse.redirect(url)
  }

  if (!isSupabaseConfigured()) {
    if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) || pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes session cookies on the response (keeps auth alive on Vercel).
  await supabase.auth.getSession()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthCallback = pathname.startsWith('/auth/callback')
  if (isAuthCallback) {
    return supabaseResponse
  }

  const isAdminLogin = pathname.startsWith('/admin/login')
  const isAdminRoute = pathname.startsWith('/admin') && !isAdminLogin
  const isProtectedRoute =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || isAdminRoute

  const isEmployeeLogin = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = isAdminRoute ? '/admin/login' : '/login'
    if (!isAdminRoute) {
      url.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(url)
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(url)
    }
  }

  if (isAdminLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  if (isEmployeeLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
