import { describe, expect, it } from 'vitest'
import { resolveLeadsDataSource } from '../leads.repository'

describe('leads repository data source', () => {
  it('uses local repository by default', () => {
    expect(resolveLeadsDataSource(undefined)).toBe('local')
    expect(resolveLeadsDataSource('')).toBe('local')
  })

  it('uses Supabase only when explicitly requested', () => {
    expect(resolveLeadsDataSource('supabase')).toBe('supabase')
    expect(resolveLeadsDataSource('local')).toBe('local')
    expect(resolveLeadsDataSource('anything-else')).toBe('local')
  })
})
