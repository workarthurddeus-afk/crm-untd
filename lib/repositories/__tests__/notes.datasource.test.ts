import { afterEach, describe, expect, it } from 'vitest'
import { noteFoldersRepo, resolveNoteFoldersDataSource } from '../note-folders.repository'
import { notesRepo, resolveNotesDataSource } from '../notes.repository'

const originalDataSource = process.env.NEXT_PUBLIC_DATA_SOURCE
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

afterEach(() => {
  process.env.NEXT_PUBLIC_DATA_SOURCE = originalDataSource
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalSupabaseKey
  window.localStorage.clear()
})

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

  it('exported notesRepo resolves Supabase mode at call time and does not silently write localStorage', async () => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = 'supabase'
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    await expect(
      notesRepo.createNote({
        title: 'Nota real',
        content: 'Persistir no Supabase',
        type: 'general',
        status: 'active',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        color: 'default',
      })
    ).rejects.toThrow('Variaveis do Supabase nao configuradas.')
    expect(window.localStorage.getItem('untd-notes')).toBeNull()
  })

  it('exported noteFoldersRepo resolves Supabase mode at call time and does not silently write localStorage', async () => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = 'supabase'
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    await expect(
      noteFoldersRepo.createFolder({
        name: 'Pasta real',
        color: 'purple',
        parentId: null,
        order: 0,
        isArchived: false,
      })
    ).rejects.toThrow('Variaveis do Supabase nao configuradas.')
    expect(window.localStorage.getItem('untd-note-folders')).toBeNull()
  })
})
