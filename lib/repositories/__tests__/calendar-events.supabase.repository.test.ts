import { describe, expect, it } from 'vitest'
import { createCalendarEventsSupabaseRepository } from '../calendar-events.supabase.repository'
import type { SupabaseCalendarEventRow } from '../supabase/calendar-events.mapper'

const user = { id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af' }
const taskId = '508c4548-d218-4b0b-8844-df3303c2c7cb'
const row: SupabaseCalendarEventRow = {
  id: 'a3fc2a2c-0583-4094-8fe6-77f2a9ed2c32',
  user_id: user.id,
  workspace_id: 'default',
  title: 'Evento Supabase',
  description: 'Persistido no banco.',
  type: 'task',
  status: 'scheduled',
  priority: 'high',
  importance: 'high',
  color: 'blue',
  location: null,
  meeting_url: null,
  start_at: '2026-05-12T12:00:00.000Z',
  end_at: '2026-05-12T13:00:00.000Z',
  all_day: false,
  attendees: [],
  tags: ['task'],
  related_lead_id: null,
  related_task_id: taskId,
  related_note_id: null,
  related_feedback_id: null,
  related_project_id: null,
  source: 'task',
  is_reminder: false,
  reminder_at: null,
  completed_at: null,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

function createFakeClient(data: SupabaseCalendarEventRow[] = [row], authUser: typeof user | null = user) {
  const calls: Array<{ method: string; payload?: unknown }> = []

  return {
    calls,
    auth: {
      getUser() {
        calls.push({ method: 'getUser' })
        return Promise.resolve({ data: { user: authUser }, error: null })
      },
    },
    from(table: string) {
      calls.push({ method: 'from', payload: table })
      return {
        select() {
          calls.push({ method: 'select' })
          return {
            order() {
              calls.push({ method: 'order' })
              return Promise.resolve({ data, error: null })
            },
            eq(_column: string, value: string) {
              calls.push({ method: 'eq', payload: value })
              return {
                maybeSingle() {
                  calls.push({ method: 'maybeSingle' })
                  return Promise.resolve({
                    data: data.find((item) => item.id === value) ?? null,
                    error: null,
                  })
                },
              }
            },
          }
        },
        insert(payload: unknown) {
          calls.push({ method: 'insert', payload })
          return {
            select() {
              return {
                single() {
                  calls.push({ method: 'single' })
                  return Promise.resolve({ data: { ...row, ...(payload as object) }, error: null })
                },
              }
            },
          }
        },
        update(payload: unknown) {
          calls.push({ method: 'update', payload })
          return {
            eq(_column: string, id: string) {
              calls.push({ method: 'eq', payload: id })
              return {
                select() {
                  return {
                    single() {
                      calls.push({ method: 'single' })
                      return Promise.resolve({ data: { ...row, ...(payload as object) }, error: null })
                    },
                  }
                },
              }
            },
          }
        },
        delete() {
          calls.push({ method: 'delete' })
          return {
            eq(_column: string, id: string) {
              calls.push({ method: 'eq', payload: id })
              return Promise.resolve({ error: null })
            },
          }
        },
      }
    },
  }
}

describe('calendar events Supabase repository', () => {
  it('lists events through the internal CalendarEvent model', async () => {
    const repo = createCalendarEventsSupabaseRepository(createFakeClient())

    await expect(repo.listEvents()).resolves.toEqual([
      expect.objectContaining({ id: row.id, title: 'Evento Supabase', relatedTaskId: taskId }),
    ])
  })

  it('creates events with user ownership and canonical columns', async () => {
    const fake = createFakeClient()
    const repo = createCalendarEventsSupabaseRepository(fake)

    await repo.createEvent({
      title: 'Nova agenda',
      startAt: '2026-05-13T09:00:00.000Z',
      endAt: '2026-05-13T10:00:00.000Z',
      allDay: false,
      type: 'task',
      status: 'scheduled',
      priority: 'medium',
      importance: 'high',
      color: 'blue',
      attendees: [],
      tags: ['acao'],
      relatedTaskId: taskId,
      source: 'task',
      isReminder: false,
    })

    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({
        user_id: user.id,
        title: 'Nova agenda',
        start_at: '2026-05-13T09:00:00.000Z',
        related_task_id: taskId,
      }),
    })
  })

  it('filters range and related task with Supabase-backed data', async () => {
    const repo = createCalendarEventsSupabaseRepository(createFakeClient())

    await expect(
      repo.getEventsByRange('2026-05-12T00:00:00.000Z', '2026-05-12T23:59:59.999Z')
    ).resolves.toHaveLength(1)
    await expect(repo.getEventsByTaskId(taskId)).resolves.toHaveLength(1)
  })

  it('requires an authenticated user before creating events', async () => {
    const repo = createCalendarEventsSupabaseRepository(createFakeClient([], null))

    await expect(
      repo.createEvent({
        title: 'Nova agenda',
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
    ).rejects.toThrow('Sessao expirada. Faca login novamente.')
  })
})
