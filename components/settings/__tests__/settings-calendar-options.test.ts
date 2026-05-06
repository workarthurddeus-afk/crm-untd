import { describe, expect, it } from 'vitest'
import { calendarViewOptions, settingsPersistenceCopy } from '../settings-page-config'

describe('settings page config', () => {
  it('only exposes the calendar view that exists in the app', () => {
    expect(calendarViewOptions).toEqual([{ value: 'month', label: 'Mês' }])
  })

  it('does not expose implementation language to the user', () => {
    expect(settingsPersistenceCopy.toLowerCase()).not.toContain('mock')
    expect(settingsPersistenceCopy).toContain('Dados salvos localmente')
  })
})
