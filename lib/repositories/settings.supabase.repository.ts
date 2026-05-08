import { settingsSeed } from '@/lib/mocks/seeds/settings.seed'
import { businessMetricsUpdateSchema, settingsSchema, settingsUpdateSchema } from '@/lib/schemas/settings'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { BusinessMetricsSettings, SettingsUpdateInput, UntdSettings } from '@/lib/types/settings'
import { nowIso } from '@/lib/utils/date'

type SupabaseError = { message: string } | null

interface SupabaseSettingsRow {
  id: string
  user_id: string
  workspace_id: string
  settings: unknown
  created_at: string
  updated_at: string
}

interface SettingsSupabaseClient {
  auth?: {
    getUser(): PromiseLike<{
      data: { user: { id: string } | null }
      error: SupabaseError
    }>
  }
  from(table: 'workspace_settings'): {
    select(columns?: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          maybeSingle(): PromiseLike<{ data: SupabaseSettingsRow | null; error: SupabaseError }>
        }
      }
    }
    insert(payload: unknown): {
      select(columns?: string): {
        single(): PromiseLike<{ data: SupabaseSettingsRow | null; error: SupabaseError }>
      }
    }
    update(payload: unknown): {
      eq(column: string, value: string): {
        eq(column: string, value: string): {
          select(columns?: string): {
            single(): PromiseLike<{ data: SupabaseSettingsRow | null; error: SupabaseError }>
          }
        }
      }
    }
  }
}

export type SettingsRepository = {
  getSettings(): Promise<UntdSettings>
  updateSettings(input: SettingsUpdateInput): Promise<UntdSettings>
  resetSettings(): Promise<UntdSettings>
  getBusinessMetricsSettings(): Promise<BusinessMetricsSettings>
  updateBusinessMetrics(input: Partial<BusinessMetricsSettings>): Promise<UntdSettings>
  subscribe(listener: () => void): () => void
}

function raise(error: SupabaseError): void {
  if (error) throw new Error(error.message)
}

async function getAuthenticatedUserId(client: SettingsSupabaseClient): Promise<string> {
  const { data, error } = (await client.auth?.getUser()) ?? {
    data: { user: null },
    error: null,
  }
  if (error) throw new Error(error.message)
  if (!data.user?.id) throw new Error('Sessao expirada. Faca login novamente.')
  return data.user.id
}

function normalizeSettingsRow(row: SupabaseSettingsRow): UntdSettings {
  const settings = row.settings && typeof row.settings === 'object' ? row.settings : settingsSeed

  return settingsSchema.parse({
    ...settingsSeed,
    ...(settings as Partial<UntdSettings>),
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

function cloneDefaults(): UntdSettings {
  return settingsSchema.parse({
    ...settingsSeed,
    id: 'settings-default',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  })
}

function mergeSettings(current: UntdSettings, patch: SettingsUpdateInput): UntdSettings {
  return settingsSchema.parse({
    ...current,
    workspace: { ...current.workspace, ...patch.workspace },
    businessMetrics: { ...current.businessMetrics, ...patch.businessMetrics },
    crm: { ...current.crm, ...patch.crm },
    tasksCalendar: { ...current.tasksCalendar, ...patch.tasksCalendar },
    productSales: { ...current.productSales, ...patch.productSales },
    integrations: patch.integrations ?? current.integrations,
    updatedAt: nowIso(),
  })
}

export function createSettingsSupabaseRepository(
  client: SettingsSupabaseClient = getSupabaseBrowserClient() as unknown as SettingsSupabaseClient,
  workspaceId = 'default'
): SettingsRepository {
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  async function findRow(userId: string): Promise<SupabaseSettingsRow | null> {
    const { data, error } = await client
      .from('workspace_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .maybeSingle()
    raise(error)
    return data
  }

  async function createDefaultRow(userId: string): Promise<UntdSettings> {
    const defaults = cloneDefaults()
    const { data, error } = await client
      .from('workspace_settings')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        settings: defaults,
      })
      .select('*')
      .single()
    raise(error)
    if (!data) throw new Error('Supabase did not return created settings')
    return normalizeSettingsRow(data)
  }

  async function readSettings(): Promise<UntdSettings> {
    const userId = await getAuthenticatedUserId(client)
    const row = await findRow(userId)
    return row ? normalizeSettingsRow(row) : createDefaultRow(userId)
  }

  async function persistSettings(userId: string, next: UntdSettings): Promise<UntdSettings> {
    const { data, error } = await client
      .from('workspace_settings')
      .update({ settings: next })
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .select('*')
      .single()
    raise(error)
    if (!data) throw new Error('Supabase did not return updated settings')
    notify()
    return normalizeSettingsRow(data)
  }

  return {
    async getSettings(): Promise<UntdSettings> {
      return readSettings()
    },

    async updateSettings(input: SettingsUpdateInput): Promise<UntdSettings> {
      const patch = settingsUpdateSchema.parse(input)
      const userId = await getAuthenticatedUserId(client)
      const row = await findRow(userId)
      const current = row ? normalizeSettingsRow(row) : await createDefaultRow(userId)
      return persistSettings(userId, mergeSettings(current, patch))
    },

    async resetSettings(): Promise<UntdSettings> {
      const userId = await getAuthenticatedUserId(client)
      const row = await findRow(userId)
      if (!row) {
        const created = await createDefaultRow(userId)
        notify()
        return created
      }
      return persistSettings(userId, cloneDefaults())
    },

    async getBusinessMetricsSettings(): Promise<BusinessMetricsSettings> {
      return (await readSettings()).businessMetrics
    },

    async updateBusinessMetrics(input: Partial<BusinessMetricsSettings>): Promise<UntdSettings> {
      const businessMetrics = businessMetricsUpdateSchema.parse(input)
      return this.updateSettings({ businessMetrics })
    },

    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
