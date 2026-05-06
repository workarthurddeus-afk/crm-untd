import { settingsRepo } from '@/lib/repositories/settings.repository'
import type { BusinessMetricsSettings, SettingsUpdateInput, UntdSettings } from '@/lib/types/settings'

export async function getSettings(): Promise<UntdSettings> {
  return settingsRepo.getSettings()
}

export async function updateSettings(input: SettingsUpdateInput): Promise<UntdSettings> {
  return settingsRepo.updateSettings(input)
}

export async function resetSettings(): Promise<UntdSettings> {
  return settingsRepo.resetSettings()
}

export async function getBusinessMetricsSettings(): Promise<BusinessMetricsSettings> {
  return settingsRepo.getBusinessMetricsSettings()
}

export async function updateBusinessMetrics(
  input: Partial<BusinessMetricsSettings>
): Promise<UntdSettings> {
  return settingsRepo.updateBusinessMetrics(input)
}
