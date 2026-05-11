import { afterEach, describe, expect, it } from 'vitest'
import { resolveTasksDataSource, tasksRepo } from '../tasks.repository'

const originalDataSource = process.env.NEXT_PUBLIC_DATA_SOURCE
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

afterEach(() => {
  process.env.NEXT_PUBLIC_DATA_SOURCE = originalDataSource
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalSupabaseKey
  window.localStorage.clear()
})

describe('tasks repository data source', () => {
  it('uses local repository by default', () => {
    expect(resolveTasksDataSource(undefined)).toBe('local')
    expect(resolveTasksDataSource('')).toBe('local')
  })

  it('uses Supabase only when explicitly requested', () => {
    expect(resolveTasksDataSource('supabase')).toBe('supabase')
    expect(resolveTasksDataSource('local')).toBe('local')
    expect(resolveTasksDataSource('anything')).toBe('local')
  })

  it('exported tasksRepo resolves Supabase mode at call time and does not silently write localStorage', async () => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = 'supabase'
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    await expect(
      tasksRepo.create({
        title: 'Tarefa real',
        importance: 'medium',
        status: 'pending',
        category: 'ops',
        tagIds: [],
      })
    ).rejects.toThrow('Variaveis do Supabase nao configuradas.')
    expect(window.localStorage.getItem('untd-tasks')).toBeNull()
  })
})
