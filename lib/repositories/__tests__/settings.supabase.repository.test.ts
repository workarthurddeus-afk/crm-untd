import { describe, expect, it } from 'vitest'
import { settingsSeed } from '@/lib/mocks/seeds/settings.seed'
import { createSettingsSupabaseRepository } from '../settings.supabase.repository'

type SettingsRow = {
  id: string
  user_id: string
  workspace_id: string
  settings: typeof settingsSeed
  created_at: string
  updated_at: string
}

const user = { id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af' }
const row: SettingsRow = {
  id: '7f3d8c4e-9110-4cbb-923f-117d8796b24c',
  user_id: user.id,
  workspace_id: 'default',
  settings: settingsSeed,
  created_at: settingsSeed.createdAt,
  updated_at: settingsSeed.updatedAt,
}

function createFakeClient(initialRow: SettingsRow | null = row, authUser: typeof user | null = user) {
  let currentRow = initialRow
  const calls: Array<{ method: string; payload?: unknown }> = []

  const querySingle = {
    maybeSingle() {
      calls.push({ method: 'maybeSingle' })
      return Promise.resolve({ data: currentRow, error: null })
    },
  }

  const queryByWorkspace = {
    eq(_column: string, value: string) {
      calls.push({ method: 'eq', payload: value })
      return querySingle
    },
  }

  const queryByUser = {
    eq(_column: string, value: string) {
      calls.push({ method: 'eq', payload: value })
      return queryByWorkspace
    },
  }

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
          return queryByUser
        },
        insert(payload: unknown) {
          calls.push({ method: 'insert', payload })
          currentRow = {
            id: row.id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            ...(payload as object),
          } as SettingsRow
          return {
            select() {
              return {
                single() {
                  calls.push({ method: 'single' })
                  return Promise.resolve({ data: currentRow, error: null })
                },
              }
            },
          }
        },
        update(payload: unknown) {
          calls.push({ method: 'update', payload })
          currentRow = {
            ...(currentRow ?? row),
            ...(payload as object),
            updated_at: '2026-05-08T12:00:00.000Z',
          }
          return {
            eq(_column: string, value: string) {
              calls.push({ method: 'eq', payload: value })
              return {
                eq(_workspaceColumn: string, workspaceValue: string) {
                  calls.push({ method: 'eq', payload: workspaceValue })
                  return {
                    select() {
                      return {
                        single() {
                          calls.push({ method: 'single' })
                          return Promise.resolve({ data: currentRow, error: null })
                        },
                      }
                    },
                  }
                },
              }
            },
          }
        },
      }
    },
  }
}

describe('settings Supabase repository', () => {
  it('creates default settings for the authenticated user when none exist', async () => {
    const fake = createFakeClient(null)
    const repo = createSettingsSupabaseRepository(fake)

    const settings = await repo.getSettings()

    expect(settings.workspace.workspaceName).toBe('UNTD OS')
    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({
        user_id: user.id,
        workspace_id: 'default',
        settings: expect.objectContaining({
          workspace: expect.objectContaining({ workspaceName: 'UNTD OS' }),
        }),
      }),
    })
  })

  it('updates settings with a deep merge without losing existing fields', async () => {
    const fake = createFakeClient()
    const repo = createSettingsSupabaseRepository(fake)

    const updated = await repo.updateSettings({
      workspace: { workspaceName: 'UNTD Real Workspace' },
      crm: { staleLeadDays: 21 },
    })

    expect(updated.workspace.workspaceName).toBe('UNTD Real Workspace')
    expect(updated.workspace.userName).toBe('Arthur')
    expect(updated.crm.staleLeadDays).toBe(21)
    expect(updated.crm.defaultFollowUpDays).toBe(settingsSeed.crm.defaultFollowUpDays)
  })

  it('updates business metrics without changing the workspace profile', async () => {
    const fake = createFakeClient()
    const repo = createSettingsSupabaseRepository(fake)

    const updated = await repo.updateBusinessMetrics({
      currentMRR: 12000,
      activeSubscribers: 8,
    })

    expect(updated.businessMetrics.currentMRR).toBe(12000)
    expect(updated.businessMetrics.activeSubscribers).toBe(8)
    expect(updated.workspace.companyName).toBe('UNTD Studio')
  })

  it('resets Supabase settings back to defaults', async () => {
    const fake = createFakeClient({
      ...row,
      settings: {
        ...settingsSeed,
        workspace: { ...settingsSeed.workspace, workspaceName: 'Temporario' },
        businessMetrics: { ...settingsSeed.businessMetrics, currentMRR: 9999 },
      },
    })
    const repo = createSettingsSupabaseRepository(fake)

    const reset = await repo.resetSettings()

    expect(reset.workspace.workspaceName).toBe('UNTD OS')
    expect(reset.businessMetrics.currentMRR).toBe(0)
  })

  it('requires an authenticated user', async () => {
    const repo = createSettingsSupabaseRepository(createFakeClient(null, null))

    await expect(repo.getSettings()).rejects.toThrow('Sessao expirada. Faca login novamente.')
  })
})
