import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { getLoginRedirectPath, isProtectedAppPath } from '@/lib/auth/route-guards'
import { getSupabasePublicEnv } from '@/lib/supabase/env'

function getSafeNextPath(request: NextRequest): string {
  const next = request.nextUrl.searchParams.get('next')
  if (next?.startsWith('/') && !next.startsWith('//')) return next
  return '/dashboard'
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLogin = pathname === '/login'
  const isProtected = isProtectedAppPath(pathname)

  if (!isLogin && !isProtected) {
    return NextResponse.next()
  }

  const env = getSupabasePublicEnv()
  if (!env) {
    if (isLogin) return NextResponse.next()
    return NextResponse.redirect(
      new URL(getLoginRedirectPath(pathname, request.nextUrl.searchParams.toString()), request.url)
    )
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtected) {
    return NextResponse.redirect(
      new URL(getLoginRedirectPath(pathname, request.nextUrl.searchParams.toString()), request.url)
    )
  }

  if (user && isLogin) {
    return NextResponse.redirect(new URL(getSafeNextPath(request), request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/leads/:path*',
    '/crm/:path*',
    '/icp/:path*',
    '/notes/:path*',
    '/calendar/:path*',
    '/tasks/:path*',
    '/feedbacks/:path*',
    '/settings/:path*',
    '/teste-supabase/:path*',
  ],
}
