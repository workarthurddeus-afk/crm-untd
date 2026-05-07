import { settingsSeed } from '@/lib/mocks/seeds/settings.seed'
import { businessMetricsUpdateSchema, settingsSchema, settingsUpdateSchema } from '@/lib/schemas/settings'
import type { BusinessMetricsSettings, SettingsUpdateInput, UntdSettings } from '@/lib/types/settings'
import { nowIso } from '@/lib/utils/date'
import { createMockRepository } from './mock-storage'

const storageRepo = createMockRepository<UntdSettings>('untd-settings', [settingsSeed], {
  autoSeed: true,
  resetToSeed: true,
})

async function readSettings(): Promise<UntdSettings> {
  const current = (await storageRepo.list())[0] ?? settingsSeed
  return settingsSchema.parse(current)
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

export const settingsRepo = {
  async getSettings(): Promise<UntdSettings> {
    return readSettings()
  },
  async updateSettings(input: SettingsUpdateInput): Promise<UntdSettings> {
    const patch = settingsUpdateSchema.parse(input)
    const current = await readSettings()
    const next = mergeSettings(current, patch)
    return storageRepo.update(current.id, next)
  },
  async resetSettings(): Promise<UntdSettings> {
    await storageRepo.reset()
    return readSettings()
  },
  async getBusinessMetricsSettings(): Promise<BusinessMetricsSettings> {
    return (await readSettings()).businessMetrics
  },
  async updateBusinessMetrics(input: Partial<BusinessMetricsSettings>): Promise<UntdSettings> {
    const businessMetrics = businessMetricsUpdateSchema.parse(input)
    return this.updateSettings({ businessMetrics })
  },
  subscribe(listener: () => void): () => void {
    return storageRepo.subscribe(listener)
  },
}
