import { describe, expect, it } from 'vitest'
import { createLeadsSupabaseRepository } from '../leads.supabase.repository'
import type { SupabaseLeadRow } from '../supabase/leads.mapper'

const row: SupabaseLeadRow = {
  id: 'lead-supabase-001',
  workspace_id: 'default',
  owner_id: 'arthur',
  name: 'Lead Supabase',
  company_name: 'Supabase Co',
  niche: 'Agencia',
  origin: 'manual',
  pipeline_stage_id: 'prospecting',
  temperature: 'cold',
  icp_score: 0,
  objections: [],
  tag_ids: [],
  result: 'open',
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-01T00:00:00.000Z',
}

function createFakeClient(
  data: SupabaseLeadRow[] = [row],
  insertError: { message: string } | null = null,
  user: { id: string } | null = { id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af' }
) {
  const calls: Array<{ method: string; payload?: unknown }> = []

  return {
    calls,
    auth: {
      getUser() {
        calls.push({ method: 'getUser' })
        return Promise.resolve({ data: { user }, error: null })
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
            eq(_column: string, id: string) {
              calls.push({ method: 'eq', payload: id })
              return {
                maybeSingle() {
                  calls.push({ method: 'maybeSingle' })
                  return Promise.resolve({
                    data: data.find((item) => item.id === id) ?? null,
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
                    data: insertError ? null : { ...row, ...(Array.isArray(payload) ? payload[0] : payload) },
                    error: insertError,
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

describe('leads Supabase repository', () => {
  it('lists Supabase leads through the internal Lead model', async () => {
    const fake = createFakeClient()
    const repo = createLeadsSupabaseRepository(fake)

    await expect(repo.list()).resolves.toEqual([
      expect.objectContaining({ id: row.id, company: 'Supabase Co', pipelineStageId: 'prospecting' }),
    ])
  })

  it('creates leads with canonical Supabase payload columns', async () => {
    const fake = createFakeClient()
    const repo = createLeadsSupabaseRepository(fake)

    await repo.create({
      name: 'Novo',
      company: 'Nova Co',
      niche: 'Clinica',
      origin: 'manual',
      pipelineStageId: 'prospecting',
      temperature: 'cold',
      icpScore: 0,
      ownerId: 'arthur',
      tagIds: [],
      result: 'open',
    })

    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({
        company_name: 'Nova Co',
        owner_name: 'Novo',
        user_id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af',
        pipeline_stage_id: 'prospecting',
        fit_score: 0,
      }),
    })
  })

  it('notifies subscribers after mutations', async () => {
    const fake = createFakeClient()
    const repo = createLeadsSupabaseRepository(fake)
    let calls = 0

    const unsubscribe = repo.subscribe(() => calls++)
    await repo.update(row.id, { temperature: 'hot' })
    unsubscribe()
    await repo.delete(row.id)

    expect(calls).toBe(1)
  })

  it('translates company_name constraint errors into a friendly message', async () => {
    const repo = createLeadsSupabaseRepository(
      createFakeClient([], {
        message:
          'null value in column "company_name" of relation "leads" violates not-null constraint',
      })
    )

    await expect(
      repo.create({
        name: 'Novo',
        company: 'Nova Co',
        niche: 'Clinica',
        origin: 'manual',
        pipelineStageId: 'prospecting',
        temperature: 'cold',
        icpScore: 0,
        ownerId: 'arthur',
        tagIds: [],
        result: 'open',
      })
    ).rejects.toThrow('Empresa obrigatoria para criar lead.')
  })

  it('requires an authenticated user before creating leads', async () => {
    const repo = createLeadsSupabaseRepository(createFakeClient([], null, null))

    await expect(
      repo.create({
        name: 'Novo',
        company: 'Nova Co',
        niche: 'Clinica',
        origin: 'manual',
        pipelineStageId: 'prospecting',
        temperature: 'cold',
        icpScore: 0,
        ownerId: 'arthur',
        tagIds: [],
        result: 'open',
      })
    ).rejects.toThrow('Sessao expirada. Faca login novamente.')
  })
})
