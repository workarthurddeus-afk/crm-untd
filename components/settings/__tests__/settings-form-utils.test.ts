import { describe, expect, it } from 'vitest'
import { settingsSeed } from '@/lib/mocks/seeds/settings.seed'
import {
  buildSettingsUpdateFromForm,
  parseSettingsList,
  settingsToFormState,
} from '../settings-form-utils'

describe('settings-form-utils', () => {
  it('converts settings to editable form state', () => {
    const form = settingsToFormState(settingsSeed)

    expect(form.workspace.workspaceName).toBe('UNTD OS')
    expect(form.productSales.mainObjections).toContain('Ja tenho designer')
    expect(form.productSales.keyBenefits).toContain('Consistencia visual')
  })

  it('builds a settings update payload and normalizes list fields', () => {
    const form = settingsToFormState(settingsSeed)
    form.workspace.workspaceName = 'UNTD Command'
    form.businessMetrics.currentMRR = 4200
    form.productSales.mainObjections = 'Ja tenho designer\n\nPreco mensal cedo'
    form.productSales.keyBenefits = 'Velocidade\nConsistencia visual'

    expect(buildSettingsUpdateFromForm(form)).toMatchObject({
      workspace: { workspaceName: 'UNTD Command' },
      businessMetrics: { currentMRR: 4200 },
      productSales: {
        mainObjections: ['Ja tenho designer', 'Preco mensal cedo'],
        keyBenefits: ['Velocidade', 'Consistencia visual'],
      },
    })
  })

  it('parses comma and newline separated list fields', () => {
    expect(parseSettingsList('pricing, brandkit\nfollow-up\n')).toEqual([
      'pricing',
      'brandkit',
      'follow-up',
    ])
  })
})
