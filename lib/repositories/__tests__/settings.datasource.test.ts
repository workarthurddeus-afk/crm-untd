import { describe, expect, it } from 'vitest'
import { resolveSettingsDataSource } from '../settings.repository'

describe('settings repository data source', () => {
  it('uses local repository by default', () => {
    expect(resolveSettingsDataSource(undefined)).toBe('local')
    expect(resolveSettingsDataSource('')).toBe('local')
  })

  it('uses Supabase only when explicitly requested', () => {
    expect(resolveSettingsDataSource('supabase')).toBe('supabase')
    expect(resolveSettingsDataSource('local')).toBe('local')
    expect(resolveSettingsDataSource('anything-else')).toBe('local')
  })
})
