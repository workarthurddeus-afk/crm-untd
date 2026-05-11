import { describe, expect, it } from 'vitest'
import { createTasksSupabaseRepository } from '../tasks.supabase.repository'
import type { SupabaseTaskRow } from '../supabase/tasks.mapper'

const user = { id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af' }
const row: SupabaseTaskRow = {
  id: '508c4548-d218-4b0b-8844-df3303c2c7cb',
  user_id: user.id,
  workspace_id: 'default',
  title: 'Tarefa Supabase',
  description: 'Persistida no banco.',
  status: 'pending',
  importance: 'medium',
  category: 'ops',
  source: 'manual',
  color: 'purple',
  tags: ['ops'],
  due_at: '2026-05-12T12:00:00.000Z',
  completed_at: null,
  cancelled_at: null,
  archived_at: null,
  related_lead_id: null,
  related_note_id: null,
  related_calendar_event_id: null,
  related_feedback_id: null,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

function createFakeClient(data: SupabaseTaskRow[] = [row], authUser: typeof user | null = user) {
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

describe('tasks Supabase repository', () => {
  it('lists Supabase tasks through the internal Task model', async () => {
    const repo = createTasksSupabaseRepository(createFakeClient())

    await expect(repo.list()).resolves.toEqual([
      expect.objectContaining({ id: row.id, title: 'Tarefa Supabase', tagIds: ['ops'] }),
    ])
  })

  it('creates tasks with user ownership and canonical columns', async () => {
    const fake = createFakeClient()
    const repo = createTasksSupabaseRepository(fake)

    await repo.create({
      title: 'Nova tarefa',
      description: 'Contexto',
      dueDate: '2026-05-13T09:00:00.000Z',
      importance: 'high',
      status: 'pending',
      category: 'strategy',
      source: 'note',
      color: 'violet',
      tagIds: ['acao'],
    })

    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({
        user_id: user.id,
        title: 'Nova tarefa',
        due_at: '2026-05-13T09:00:00.000Z',
        tags: ['acao'],
      }),
    })
  })

  it('persists complete/reopen/cancel/postpone through update payloads', async () => {
    const fake = createFakeClient()
    const repo = createTasksSupabaseRepository(fake)

    await repo.update(row.id, { status: 'done', completedAt: '2026-05-13T10:00:00.000Z' })
    await repo.update(row.id, { status: 'pending', completedAt: undefined, cancelledAt: undefined })
    await repo.update(row.id, { status: 'cancelled', cancelledAt: '2026-05-13T11:00:00.000Z' })
    await repo.update(row.id, { dueDate: '2026-05-14T09:00:00.000Z' })

    expect(fake.calls).toContainEqual({
      method: 'update',
      payload: expect.objectContaining({ status: 'done', completed_at: '2026-05-13T10:00:00.000Z' }),
    })
    expect(fake.calls).toContainEqual({
      method: 'update',
      payload: expect.objectContaining({ status: 'cancelled', cancelled_at: '2026-05-13T11:00:00.000Z' }),
    })
    expect(fake.calls).toContainEqual({
      method: 'update',
      payload: expect.objectContaining({ due_at: '2026-05-14T09:00:00.000Z' }),
    })
  })

  it('requires an authenticated user before creating tasks', async () => {
    const repo = createTasksSupabaseRepository(createFakeClient([], null))

    await expect(
      repo.create({
        title: 'Nova tarefa',
        importance: 'medium',
        status: 'pending',
        category: 'ops',
        tagIds: [],
      })
    ).rejects.toThrow('Sessao expirada. Faca login novamente.')
  })
})
