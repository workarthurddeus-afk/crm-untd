import { describe, expect, it } from 'vitest'
import { createInteractionsSupabaseRepository } from '../interactions.supabase.repository'
import type { SupabaseInteractionRow } from '../supabase/interactions.mapper'

const leadId = '4e2f4d7e-5b1a-4d90-8f6b-2a184fba5ed1'
const row: SupabaseInteractionRow = {
  id: '2c83b471-15b2-4e77-bc8a-bdcb9c13f4f9',
  lead_id: leadId,
  workspace_id: 'default',
  owner_id: 'arthur',
  type: 'note',
  title: null,
  description: 'Nota interna.',
  occurred_at: '2026-05-08T12:30:00.000Z',
  created_at: '2026-05-08T12:31:00.000Z',
  updated_at: '2026-05-08T12:32:00.000Z',
}

function createFakeClient(data: SupabaseInteractionRow[] = [row]) {
  const calls: Array<{ method: string; payload?: unknown }> = []

  return {
    calls,
    from(table: string) {
      calls.push({ method: 'from', payload: table })
      return {
        select() {
          calls.push({ method: 'select' })
          return {
            order(column: string) {
              calls.push({ method: 'order', payload: column })
              return Promise.resolve({ data, error: null })
            },
            eq(column: string, value: string) {
              calls.push({ method: 'eq', payload: { column, value } })
              return {
                maybeSingle() {
                  calls.push({ method: 'maybeSingle' })
                  return Promise.resolve({
                    data: data.find((item) => item.id === value) ?? null,
                    error: null,
                  })
                },
                order(orderColumn: string) {
                  calls.push({ method: 'order', payload: orderColumn })
                  return Promise.resolve({
                    data: data.filter((item) => item.lead_id === value),
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

describe('interactions Supabase repository', () => {
  it('lists interactions through the internal model', async () => {
    const fake = createFakeClient()
    const repo = createInteractionsSupabaseRepository(fake)

    await expect(repo.list()).resolves.toEqual([
      expect.objectContaining({ id: row.id, leadId, type: 'note' }),
    ])
  })

  it('lists interactions by lead id', async () => {
    const fake = createFakeClient()
    const repo = createInteractionsSupabaseRepository(fake)

    await expect(repo.getByLeadId(leadId)).resolves.toEqual([
      expect.objectContaining({ id: row.id, leadId }),
    ])
    expect(fake.calls).toContainEqual({
      method: 'eq',
      payload: { column: 'lead_id', value: leadId },
    })
  })

  it('creates interactions with Supabase column names', async () => {
    const fake = createFakeClient()
    const repo = createInteractionsSupabaseRepository(fake)

    await repo.create({
      leadId,
      type: 'replied',
      description: 'Lead respondeu no WhatsApp.',
      occurredAt: '2026-05-08T13:00:00.000Z',
    })

    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({
        lead_id: leadId,
        type: 'replied',
        description: 'Lead respondeu no WhatsApp.',
        occurred_at: '2026-05-08T13:00:00.000Z',
      }),
    })
  })

  it('notifies subscribers after mutations', async () => {
    const fake = createFakeClient()
    const repo = createInteractionsSupabaseRepository(fake)
    let calls = 0

    const unsubscribe = repo.subscribe(() => calls++)
    await repo.update(row.id, { description: 'Atualizado.' })
    unsubscribe()
    await repo.delete(row.id)

    expect(calls).toBe(1)
  })
})
