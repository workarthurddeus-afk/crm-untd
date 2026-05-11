import { afterEach, describe, expect, it } from 'vitest'
import { calendarEventsRepo, resolveCalendarEventsDataSource } from '../calendar-events.repository'

const originalDataSource = process.env.NEXT_PUBLIC_DATA_SOURCE
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

afterEach(() => {
  process.env.NEXT_PUBLIC_DATA_SOURCE = originalDataSource
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalSupabaseKey
  window.localStorage.clear()
})

describe('calendar events repository data source', () => {
  it('uses local repository by default', () => {
    expect(resolveCalendarEventsDataSource(undefined)).toBe('local')
    expect(resolveCalendarEventsDataSource('')).toBe('local')
  })

  it('uses Supabase only when explicitly requested', () => {
    expect(resolveCalendarEventsDataSource('supabase')).toBe('supabase')
    expect(resolveCalendarEventsDataSource('local')).toBe('local')
    expect(resolveCalendarEventsDataSource('anything')).toBe('local')
  })

  it('exported calendarEventsRepo resolves Supabase mode at call time and does not silently write localStorage', async () => {
    process.env.NEXT_PUBLIC_DATA_SOURCE = 'supabase'
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    await expect(
      calendarEventsRepo.createEvent({
        title: 'Evento real',
        startAt: '2026-05-13T09:00:00.000Z',
        allDay: false,
        type: 'task',
        status: 'scheduled',
        priority: 'medium',
        importance: 'medium',
        color: 'blue',
        attendees: [],
        tags: [],
        source: 'manual',
        isReminder: false,
      })
    ).rejects.toThrow('Variaveis do Supabase nao configuradas.')
    expect(window.localStorage.getItem('untd-calendar-events')).toBeNull()
  })
})
