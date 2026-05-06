import { beforeEach, describe, expect, it } from 'vitest'
import { settingsRepo } from '@/lib/repositories/settings.repository'
import {
  getBusinessMetricsSettings,
  getSettings,
  resetSettings,
  updateBusinessMetrics,
  updateSettings,
} from '../settings.service'

describe('settings.service', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await settingsRepo.resetSettings()
  })

  it('returns defaults prepared for manual dashboard metrics', async () => {
    const settings = await getSettings()

    expect(settings.businessMetrics).toMatchObject({
      monthlyRevenueGoal: 10000,
      monthlyProspectingGoal: 120,
      monthlyCustomerGoal: 10,
    })
    expect(settings.tasksCalendar.defaultCalendarView).toBe('month')
  })

  it('validates and updates workspace preferences', async () => {
    const updated = await updateSettings({
      workspace: {
        companyDescription: 'Estudio de criativos e sistemas para crescimento.',
        timezone: 'America/Sao_Paulo',
      },
      productSales: {
        mainObjections: ['Ja tenho designer', 'Nao confio em IA para marca'],
      },
    })

    expect(updated.workspace.companyDescription).toContain('criativos')
    expect(updated.productSales.mainObjections).toHaveLength(2)
  })

  it('updates and reads business metrics through focused helpers', async () => {
    await updateBusinessMetrics({
      currentMRR: 3200,
      revenueReceivedThisMonth: 5400,
      investmentThisMonth: 900,
    })

    const metrics = await getBusinessMetricsSettings()

    expect(metrics.currentMRR).toBe(3200)
    expect(metrics.revenueReceivedThisMonth).toBe(5400)
    expect(metrics.investmentThisMonth).toBe(900)
  })

  it('resets settings through service', async () => {
    await updateSettings({ workspace: { workspaceName: 'Outro OS' } })

    const reset = await resetSettings()

    expect(reset.workspace.workspaceName).toBe('UNTD OS')
  })
})
