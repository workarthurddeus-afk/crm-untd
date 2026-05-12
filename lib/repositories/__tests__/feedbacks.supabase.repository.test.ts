import { describe, expect, it } from 'vitest'
import { createFeedbacksSupabaseRepository } from '../feedbacks.supabase.repository'
import type { SupabaseFeedbackRow } from '../supabase/feedbacks.mapper'

const user = { id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af' }
const leadId = '87a10f2b-3e35-49c4-b3d7-31e140da9172'

const row: SupabaseFeedbackRow = {
  id: 'f6f6bde1-5035-4397-9ec4-17fc5bf3b996',
  user_id: user.id,
  workspace_id: 'default',
  title: 'Feedback Supabase',
  content: 'Persistido no banco.',
  type: 'feature_request',
  source: 'call',
  status: 'new',
  impact: 'high',
  frequency: 'recurring',
  sentiment: 'neutral',
  priority: 'high',
  tags: ['produto'],
  related_lead_id: leadId,
  related_note_id: null,
  related_task_id: null,
  related_calendar_event_id: null,
  related_project_id: null,
  is_archived: false,
  is_pinned: false,
  captured_at: '2026-05-12T12:00:00.000Z',
  resolved_at: null,
  created_at: '2026-05-12T10:00:00.000Z',
  updated_at: '2026-05-12T11:00:00.000Z',
}

function createFakeClient(data: SupabaseFeedbackRow[] = [row], authUser: typeof user | null = user) {
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

describe('feedbacks Supabase repository', () => {
  it('lists Supabase feedbacks through the internal Feedback model', async () => {
    const repo = createFeedbacksSupabaseRepository(createFakeClient())

    await expect(repo.listFeedbacks()).resolves.toEqual([
      expect.objectContaining({ id: row.id, title: 'Feedback Supabase', relatedLeadId: leadId }),
    ])
  })

  it('creates feedback with user ownership and canonical columns', async () => {
    const fake = createFakeClient()
    const repo = createFeedbacksSupabaseRepository(fake)

    await repo.createFeedback({
      title: 'Novo feedback',
      content: 'Contexto real',
      type: 'objection',
      source: 'dm',
      status: 'new',
      impact: 'medium',
      frequency: 'one_off',
      sentiment: 'negative',
      priority: 'high',
      tags: ['pricing'],
      relatedLeadId: leadId,
      isArchived: false,
      isPinned: false,
      capturedAt: '2026-05-12T13:00:00.000Z',
    })

    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({
        user_id: user.id,
        title: 'Novo feedback',
        related_lead_id: leadId,
      }),
    })
  })

  it('persists archive, resolve and pin through update payloads', async () => {
    const fake = createFakeClient()
    const repo = createFeedbacksSupabaseRepository(fake)

    await repo.archiveFeedback(row.id)
    await repo.resolveFeedback(row.id, '2026-05-12T14:00:00.000Z')
    await repo.pinFeedback(row.id)

    expect(fake.calls).toContainEqual({
      method: 'update',
      payload: expect.objectContaining({ is_archived: true, status: 'archived' }),
    })
    expect(fake.calls).toContainEqual({
      method: 'update',
      payload: expect.objectContaining({ status: 'resolved', resolved_at: '2026-05-12T14:00:00.000Z' }),
    })
    expect(fake.calls).toContainEqual({
      method: 'update',
      payload: expect.objectContaining({ is_pinned: true }),
    })
  })

  it('filters feedbacks by lead id with Supabase-backed data', async () => {
    const repo = createFeedbacksSupabaseRepository(createFakeClient())

    await expect(repo.getFeedbacksByLeadId(leadId)).resolves.toEqual([
      expect.objectContaining({ relatedLeadId: leadId }),
    ])
  })

  it('requires an authenticated user before creating feedback', async () => {
    const repo = createFeedbacksSupabaseRepository(createFakeClient([], null))

    await expect(
      repo.createFeedback({
        title: 'Sem sessão',
        content: 'Nao deve salvar.',
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
    ).rejects.toThrow('Sessao expirada. Faca login novamente.')
  })
})
