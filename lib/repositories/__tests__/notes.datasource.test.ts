import { describe, expect, it } from 'vitest'
import { resolveNotesDataSource } from '../notes.repository'
import { resolveNoteFoldersDataSource } from '../note-folders.repository'

describe('notes repository data source', () => {
  it('uses local repositories by default', () => {
    expect(resolveNotesDataSource(undefined)).toBe('local')
    expect(resolveNotesDataSource('')).toBe('local')
    expect(resolveNoteFoldersDataSource(undefined)).toBe('local')
  })

  it('uses Supabase only when explicitly requested', () => {
    expect(resolveNotesDataSource('supabase')).toBe('supabase')
    expect(resolveNotesDataSource('local')).toBe('local')
    expect(resolveNoteFoldersDataSource('supabase')).toBe('supabase')
    expect(resolveNoteFoldersDataSource('anything')).toBe('local')
  })
})
