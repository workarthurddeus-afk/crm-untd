const protectedPrefixes = [
  '/dashboard',
  '/leads',
  '/crm',
  '/icp',
  '/notes',
  '/calendar',
  '/tasks',
  '/feedbacks',
  '/settings',
  '/teste-supabase',
]

export function isProtectedAppPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/login') return false
  if (pathname.startsWith('/_next/')) return false
  if (pathname.startsWith('/api/')) return false
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function getLoginRedirectPath(pathname: string, search = ''): string {
  const nextPath = search ? `${pathname}?${search}` : pathname
  return `/login?next=${encodeURIComponent(nextPath)}`
}
