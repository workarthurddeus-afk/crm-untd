import { settingsSeed } from '@/lib/mocks/seeds/settings.seed'
import type { BusinessMetrics } from '@/lib/types/business-metrics'
import type { BusinessMetricsSettings } from '@/lib/types/settings'

interface DashboardBusinessMetricsOptions {
  monthIso?: string
  updatedAt?: string
}

function getCurrentMonthIso(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getDashboardBusinessMetrics(
  settingsMetrics: BusinessMetricsSettings | null | undefined,
  options: DashboardBusinessMetricsOptions = {}
): BusinessMetrics {
  const source = settingsMetrics ?? settingsSeed.businessMetrics

  return {
    monthIso: options.monthIso ?? getCurrentMonthIso(),
    activeSubscribers: source.activeSubscribers,
    mrr: source.currentMRR,
    revenueReceived: source.revenueReceivedThisMonth,
    cancellations: source.cancellationsThisMonth,
    newSubscribers: source.newSubscribersThisMonth,
    investment: source.investmentThisMonth,
    updatedAt: options.updatedAt ?? new Date().toISOString(),
  }
}
