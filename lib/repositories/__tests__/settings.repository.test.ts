import { beforeEach, describe, expect, it } from 'vitest'
import { settingsRepo } from '@/lib/repositories/settings.repository'

describe('settings.repository', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await settingsRepo.resetSettings()
  })

  it('loads the default UNTD workspace settings', async () => {
    const settings = await settingsRepo.getSettings()

    expect(settings.workspace).toMatchObject({
      workspaceName: 'UNTD OS',
      userName: 'Arthur',
      companyName: 'UNTD Studio',
      language: 'pt-BR',
      currency: 'BRL',
    })
    expect(settings.businessMetrics.currentMRR).toBe(0)
    expect(settings.crm.defaultFollowUpDays).toBeGreaterThan(0)
  })

  it('updates settings with a deep partial merge', async () => {
    const updated = await settingsRepo.updateSettings({
      workspace: { workspaceName: 'UNTD Command Center' },
      crm: { staleLeadDays: 21 },
    })

    expect(updated.workspace.workspaceName).toBe('UNTD Command Center')
    expect(updated.workspace.userName).toBe('Arthur')
    expect(updated.crm.staleLeadDays).toBe(21)
    expect(updated.crm.defaultFollowUpDays).toBe(3)
  })

  it('updates business metrics without touching product context', async () => {
    const updated = await settingsRepo.updateBusinessMetrics({
      currentMRR: 4800,
      activeSubscribers: 8,
      monthlyRevenueGoal: 12000,
    })

    expect(updated.businessMetrics).toMatchObject({
      currentMRR: 4800,
      activeSubscribers: 8,
      monthlyRevenueGoal: 12000,
    })
    expect(updated.productSales.productName).toBe('UNTD Studio')
  })

  it('resets settings back to defaults', async () => {
    await settingsRepo.updateSettings({
      workspace: { workspaceName: 'Temporario' },
      businessMetrics: { currentMRR: 9999 },
    })

    const reset = await settingsRepo.resetSettings()

    expect(reset.workspace.workspaceName).toBe('UNTD OS')
    expect(reset.businessMetrics.currentMRR).toBe(0)
  })
})
