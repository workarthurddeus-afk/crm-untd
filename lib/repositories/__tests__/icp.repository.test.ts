import { beforeEach, describe, expect, it } from 'vitest'
import { icpProfileSeed } from '@/lib/mocks/seeds/icp.seed'
import { icpRepo } from '../icp.repository'

describe('icpRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the default ICP profile when storage is empty', async () => {
    const profile = await icpRepo.get()

    expect(profile.id).toBe('icp-default')
    expect(profile.criteria).toHaveLength(7)
    expect(profile.persona.name).toBe('Agencia local em crescimento')
  })

  it('updates the profile while preserving its id', async () => {
    const updated = await icpRepo.update({ name: 'ICP Teste', id: 'changed' })

    expect(updated.id).toBe(icpProfileSeed.id)
    expect(updated.name).toBe('ICP Teste')
  })

  it('persists profile changes in localStorage', async () => {
    await icpRepo.update({ description: 'Nova descricao' })

    const raw = window.localStorage.getItem('untd-icp-profile')
    expect(raw).toContain('Nova descricao')
  })

  it('resets the profile back to seed', async () => {
    await icpRepo.update({ name: 'Alterado' })
    await icpRepo.reset()

    expect((await icpRepo.get()).name).toBe(icpProfileSeed.name)
  })

  it('notifies subscribers on updates', async () => {
    let calls = 0
    const unsubscribe = icpRepo.subscribe(() => calls++)

    await icpRepo.update({ name: 'ICP Atualizado' })
    expect(calls).toBe(1)

    unsubscribe()
    await icpRepo.update({ name: 'ICP Atualizado 2' })
    expect(calls).toBe(1)
  })
})
