import { beforeEach, describe, expect, it } from 'vitest'
import { leadsSeed } from '@/lib/mocks/seeds/leads.seed'
import { leadsRepo } from '../leads.repository'

describe('leadsRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts empty until demo leads are loaded explicitly', async () => {
    await expect(leadsRepo.list()).resolves.toEqual([])
  })

  it('clears legacy fake leads already saved in localStorage', async () => {
    window.localStorage.setItem(
      'untd-leads',
      JSON.stringify([
        ...leadsSeed,
        {
          ...leadsSeed[0],
          id: 'legacy-extra-lead',
          name: 'Lead legado',
          company: 'Registro antigo',
        },
      ])
    )

    await expect(leadsRepo.list()).resolves.toEqual([])
    expect(window.localStorage.getItem('untd-leads')).toBe('[]')
  })

  it('loads 15 realistic UNTD leads only when requested', async () => {
    await leadsRepo.seedDemoData()
    const leads = await leadsRepo.list()

    expect(leads).toHaveLength(15)
    expect(leads.map((lead) => lead.id)).toEqual(leadsSeed.map((lead) => lead.id))
    expect(leads.map((lead) => lead.company)).toContain('Pixel & Code Agencia')
    expect(leads.map((lead) => lead.niche)).toContain('Agencia de trafego')
    expect(leads.every((lead) => lead.ownerId === 'arthur')).toBe(true)
  })

  it('filters leads by partial fields', async () => {
    await leadsRepo.seedDemoData()
    const hotLeads = await leadsRepo.list({ temperature: 'hot' })

    expect(hotLeads.length).toBeGreaterThan(0)
    expect(hotLeads.every((lead) => lead.temperature === 'hot')).toBe(true)
  })

  it('creates leads with id and timestamps', async () => {
    const created = await leadsRepo.create({
      name: 'Novo Lead',
      company: 'UNTD Test',
      niche: 'Agencia de social media',
      origin: 'cold-dm',
      pipelineStageId: 'stage-first',
      temperature: 'warm',
      icpScore: 0,
      ownerId: 'arthur',
      tagIds: [],
      result: 'open',
    })

    expect(created.id).toBeTruthy()
    expect(created.createdAt).toBeTruthy()
    expect(await leadsRepo.getById(created.id)).toMatchObject({ company: 'UNTD Test' })
  })

  it('notifies subscribers on mutations', async () => {
    await leadsRepo.seedDemoData()
    let calls = 0
    const unsubscribe = leadsRepo.subscribe(() => calls++)

    await leadsRepo.update('lead-001', { temperature: 'hot' })
    expect(calls).toBe(1)

    unsubscribe()
    await leadsRepo.update('lead-001', { temperature: 'warm' })
    expect(calls).toBe(1)
  })
})
