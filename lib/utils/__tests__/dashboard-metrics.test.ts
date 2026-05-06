import { describe, expect, it } from 'vitest'
import { settingsSeed } from '@/lib/mocks/seeds/settings.seed'
import { deriveBusinessMetrics } from '@/lib/utils/business-math'
import { getDashboardBusinessMetrics } from '@/lib/utils/dashboard-metrics'
import type { BusinessMetricsSettings } from '@/lib/types/settings'

describe('getDashboardBusinessMetrics', () => {
  it('maps settings business metrics into the dashboard metrics contract', () => {
    const settingsMetrics: BusinessMetricsSettings = {
      currentMRR: 3200,
      activeSubscribers: 8,
      newSubscribersThisMonth: 3,
      cancellationsThisMonth: 1,
      revenueReceivedThisMonth: 5100,
      investmentThisMonth: 1200,
      monthlyRevenueGoal: 12000,
      monthlyProspectingGoal: 140,
      monthlyCustomerGoal: 12,
    }

    const metrics = getDashboardBusinessMetrics(settingsMetrics, {
      monthIso: '2026-05',
      updatedAt: '2026-05-06T12:00:00.000Z',
    })

    expect(metrics).toEqual({
      monthIso: '2026-05',
      activeSubscribers: 8,
      mrr: 3200,
      revenueReceived: 5100,
      cancellations: 1,
      newSubscribers: 3,
      investment: 1200,
      updatedAt: '2026-05-06T12:00:00.000Z',
    })
    expect(deriveBusinessMetrics(metrics)).toMatchObject({
      arr: 38400,
      netBalance: 3900,
      netSubscribers: 2,
    })
  })

  it('falls back to the settings seed when settings metrics are unavailable', () => {
    const metrics = getDashboardBusinessMetrics(null, {
      monthIso: '2026-05',
      updatedAt: '2026-05-06T12:00:00.000Z',
    })

    expect(metrics).toMatchObject({
      mrr: settingsSeed.businessMetrics.currentMRR,
      activeSubscribers: settingsSeed.businessMetrics.activeSubscribers,
      revenueReceived: settingsSeed.businessMetrics.revenueReceivedThisMonth,
      cancellations: settingsSeed.businessMetrics.cancellationsThisMonth,
      newSubscribers: settingsSeed.businessMetrics.newSubscribersThisMonth,
      investment: settingsSeed.businessMetrics.investmentThisMonth,
    })
  })
})
