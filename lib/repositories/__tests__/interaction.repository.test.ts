import { beforeEach, describe, expect, it } from 'vitest'
import { interactionsSeed } from '@/lib/mocks/seeds/interactions.seed'
import { interactionsRepo } from '../interaction.repository'

describe('interactionsRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('seeds realistic interactions for leads 001 through 005', async () => {
    const interactions = await interactionsRepo.list()

    expect(interactions).toHaveLength(20)
    expect(interactions.map((interaction) => interaction.id)).toEqual(
      interactionsSeed.map((interaction) => interaction.id)
    )

    for (const leadId of ['lead-001', 'lead-002', 'lead-003', 'lead-004', 'lead-005']) {
      const leadInteractions = interactions.filter((interaction) => interaction.leadId === leadId)
      expect(leadInteractions.length).toBeGreaterThanOrEqual(3)
      expect(leadInteractions.length).toBeLessThanOrEqual(5)
    }
  })

  it('filters interactions by leadId', async () => {
    const interactions = await interactionsRepo.list({ leadId: 'lead-001' })

    expect(interactions).toHaveLength(5)
    expect(interactions.every((interaction) => interaction.leadId === 'lead-001')).toBe(true)
  })

  it('creates interactions with generated id and createdAt timestamp', async () => {
    const created = await interactionsRepo.create({
      leadId: 'lead-001',
      type: 'note',
      description: 'Arthur registrou contexto extra da conversa.',
      occurredAt: '2026-04-30T12:00:00.000Z',
    })

    expect(created.id).toBeTruthy()
    expect(created.createdAt).toBeTruthy()
    expect(created.leadId).toBe('lead-001')
    expect(await interactionsRepo.getById(created.id)).toMatchObject({ type: 'note' })
  })

  it('updates an interaction without changing its id or leadId', async () => {
    const updated = await interactionsRepo.update('interaction-001-01', {
      id: 'changed',
      leadId: 'changed-lead',
      description: 'Descricao revisada.',
    })

    expect(updated.id).toBe('interaction-001-01')
    expect(updated.leadId).toBe('lead-001')
    expect(updated.description).toBe('Descricao revisada.')
  })

  it('notifies subscribers on mutations', async () => {
    let calls = 0
    const unsubscribe = interactionsRepo.subscribe(() => calls++)

    await interactionsRepo.create({
      leadId: 'lead-002',
      type: 'follow-up-sent',
      description: 'Follow-up enviado pelo WhatsApp.',
      occurredAt: '2026-04-30T13:00:00.000Z',
    })
    expect(calls).toBe(1)

    unsubscribe()
    await interactionsRepo.create({
      leadId: 'lead-002',
      type: 'note',
      description: 'Nota apos unsubscribe.',
      occurredAt: '2026-04-30T14:00:00.000Z',
    })
    expect(calls).toBe(1)
  })
})
