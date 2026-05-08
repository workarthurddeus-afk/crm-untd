import { describe, expect, it } from 'vitest'
import { getLoginRedirectPath, isProtectedAppPath } from '../route-guards'

describe('auth route guards', () => {
  it('protects internal app routes', () => {
    expect(isProtectedAppPath('/dashboard')).toBe(true)
    expect(isProtectedAppPath('/leads/123')).toBe(true)
    expect(isProtectedAppPath('/crm')).toBe(true)
    expect(isProtectedAppPath('/teste-supabase')).toBe(true)
  })

  it('keeps public and static paths open', () => {
    expect(isProtectedAppPath('/login')).toBe(false)
    expect(isProtectedAppPath('/')).toBe(false)
    expect(isProtectedAppPath('/_next/static/file.js')).toBe(false)
  })

  it('preserves the requested path in the login redirect', () => {
    expect(getLoginRedirectPath('/leads/123', 'tab=timeline')).toBe(
      '/login?next=%2Fleads%2F123%3Ftab%3Dtimeline'
    )
  })
})
