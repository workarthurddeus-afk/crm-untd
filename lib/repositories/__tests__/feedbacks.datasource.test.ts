import { afterEach, describe, expect, it } from 'vitest'
import { feedbacksRepo, resolveFeedbacksDataSource } from '../feedbacks.repository'

const originalDataSource = process.env.NEXT_PUBLIC_DATA_SOURCE
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

afterEach(() => {
  process.env.NEXT_PUBLIC_DATA_SOURCE = originalDataSource
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalSupabaseKey
  window.localStorage.clear()
})

describe('feedbacks repository data source', () => {
  it('uses local repository by default', () => {
    expect(resolveFeedbacksDataSource(undefined)).toBe('local')
    expect(resolveFeedbacksDataSource('')).toBe('local')
  })

  it('uses Supabase only when explicitly requested', () => {
    expect(resolveFeedbacksDataSource('supabase')).toBe('supabase')
    expect(resolveFeedbacksDataSource('local')).toBe('local')
    expect(resolveFeedbacksDataSource('anything')).toBe('local')
  })

  it('exported feedbacksRepo resolves Supabase mode at call time and does not silently write localStorage', async () => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = 'supabase'
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    await expect(
      feedbacksRepo.createFeedback({
        title: 'Feedback real',
        content: 'Deve ir para Supabase.',
        type: 'other',
        source: 'manual',
        status: 'new',
        impact: 'medium',
        frequency: 'one_off',
        sentiment: 'neutral',
        priority: 'medium',
        tags: [],
        isArchived: false,
        isPinned: false,
        capturedAt: '2026-05-12T13:00:00.000Z',
      })
    ).rejects.toThrow('Variaveis do Supabase nao configuradas.')
    expect(window.localStorage.getItem('untd-feedbacks')).toBeNull()
  })
})
