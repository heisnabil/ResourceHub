import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getRequestOrigin } from '@/lib/supabase/request-origin'

export async function GET(request: Request) {
  const origin = getRequestOrigin(request)
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const oauthError = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const cookieStore = await cookies()
  const nextFromCookie = cookieStore.get('oauth_next')?.value
  let next = searchParams.get('next') ?? (nextFromCookie ? decodeURIComponent(nextFromCookie) : '/dashboard')
  if (!next.startsWith('/')) {
    next = '/dashboard'
  }

  if (oauthError) {
    const message = encodeURIComponent(errorDescription ?? oauthError)
    return NextResponse.redirect(`${origin}/login?error=oauth&message=${message}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  // Must attach session cookies to this response (required on Vercel/production).
  let response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  response.cookies.set('oauth_next', '', { path: '/', maxAge: 0 })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const message = encodeURIComponent(error.message)
    return NextResponse.redirect(`${origin}/login?error=exchange&message=${message}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { ProfileService } = await import('@/lib/services/profile.service')
    const { isAllowedAdminEmail } = await import('@/lib/admin-config')
    try {
      await ProfileService.ensureFromAuthUser(user)
    } catch {
      // Profile can be created on next page load via ensureUserProfile
    }

    if (isAllowedAdminEmail(user.email)) {
      await supabase.auth.signOut()
      response = NextResponse.redirect(`${origin}/admin/login?error=use_admin_portal`)
      cookieStore.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value)
      })
      return response
    }
  }

  return response
}
