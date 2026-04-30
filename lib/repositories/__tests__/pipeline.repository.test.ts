import { beforeEach, describe, expect, it } from 'vitest'
import { pipelineStagesSeed } from '@/lib/mocks/seeds/pipeline.seed'
import { pipelineRepo } from '../pipeline.repository'

describe('pipelineRepo', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('lists seeded stages sorted by order', async () => {
    const stages = await pipelineRepo.list()

    expect(stages).toHaveLength(11)
    expect(stages.map((stage) => stage.id)).toEqual(pipelineStagesSeed.map((stage) => stage.id))
    expect(stages[0]?.id).toBe('stage-research')
    expect(stages.at(-1)?.id).toBe('stage-lost')
  })

  it('returns a stage by id', async () => {
    const stage = await pipelineRepo.getById('stage-proposal')

    expect(stage?.name).toBe('Proposta Enviada')
  })

  it('updates a stage while preserving its id', async () => {
    const updated = await pipelineRepo.update('stage-followup', { name: 'Follow-up ativo', id: 'changed' })

    expect(updated.id).toBe('stage-followup')
    expect(updated.name).toBe('Follow-up ativo')
    expect(await pipelineRepo.getById('changed')).toBeNull()
  })

  it('persists updated stages in localStorage', async () => {
    await pipelineRepo.update('stage-pilot', { order: 2 })

    const raw = window.localStorage.getItem('untd-pipeline-stages')
    expect(raw).toContain('"id":"stage-pilot"')
    expect(raw).toContain('"order":2')
  })

  it('resets persisted stages back to seed', async () => {
    await pipelineRepo.update('stage-won', { name: 'Fechado' })
    await pipelineRepo.reset()

    expect((await pipelineRepo.getById('stage-won'))?.name).toBe('Cliente Pagante')
  })

  it('notifies subscribers when stages change', async () => {
    let calls = 0
    const unsubscribe = pipelineRepo.subscribe(() => calls++)

    await pipelineRepo.update('stage-first', { order: 12 })
    expect(calls).toBe(1)

    unsubscribe()
    await pipelineRepo.update('stage-first', { order: 2 })
    expect(calls).toBe(1)
  })
})
