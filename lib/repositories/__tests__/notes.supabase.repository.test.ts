import { describe, expect, it } from 'vitest'
import { createNotesSupabaseRepository } from '../notes.supabase.repository'
import type { SupabaseNoteRow } from '../supabase/notes.mapper'

const user = { id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af' }
const row: SupabaseNoteRow = {
  id: 'b6ce016a-1259-4c8a-8213-9ff844515b72',
  user_id: user.id,
  workspace_id: 'default',
  folder_id: null,
  related_lead_id: null,
  related_task_id: null,
  related_feedback_id: null,
  related_project_id: null,
  title: 'Nota Supabase',
  content: 'Conteudo persistido.',
  excerpt: 'Conteudo persistido.',
  type: 'general',
  status: 'active',
  priority: 'medium',
  impact: 'medium',
  effort: 'medium',
  tags: ['operacao'],
  color: 'default',
  source: 'manual',
  is_pinned: false,
  is_favorite: false,
  is_archived: false,
  is_deleted: false,
  last_viewed_at: null,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

function createFakeClient(data: SupabaseNoteRow[] = [row], authUser: typeof user | null = user) {
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
                order() {
                  calls.push({ method: 'order' })
                  return Promise.resolve({
                    data: data.filter(
                      (item) =>
                        item.folder_id === value ||
                        item.related_lead_id === value ||
                        item.related_task_id === value
                    ),
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
                  return Promise.resolve({
                    data: { ...row, ...(payload as object) },
                    error: null,
                  })
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

describe('notes Supabase repository', () => {
  it('lists Supabase notes through the internal Note model', async () => {
    const repo = createNotesSupabaseRepository(createFakeClient())

    await expect(repo.listNotes()).resolves.toEqual([
      expect.objectContaining({ id: row.id, title: 'Nota Supabase', tags: ['operacao'] }),
    ])
  })

  it('creates notes with user ownership and canonical columns', async () => {
    const fake = createFakeClient()
    const repo = createNotesSupabaseRepository(fake)

    await repo.createNote({
      title: 'Nova nota',
      content: 'Conteudo',
      type: 'idea',
      status: 'draft',
      priority: 'medium',
      impact: 'high',
      effort: 'low',
      color: 'purple',
      tags: ['Produto'],
    })

    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({ user_id: user.id, title: 'Nova nota', tags: ['produto'] }),
    })
  })

  it('notifies subscribers after note mutations', async () => {
    const fake = createFakeClient()
    const repo = createNotesSupabaseRepository(fake)
    let calls = 0

    const unsubscribe = repo.subscribe(() => calls++)
    await repo.updateNote(row.id, { title: 'Atualizada' })
    unsubscribe()
    await repo.delete(row.id)

    expect(calls).toBe(1)
  })

  it('deletes notes through Supabase', async () => {
    const fake = createFakeClient()
    const repo = createNotesSupabaseRepository(fake)

    await repo.delete(row.id)

    expect(fake.calls).toContainEqual({ method: 'delete' })
    expect(fake.calls).toContainEqual({ method: 'eq', payload: row.id })
  })
})
