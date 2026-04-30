import { interactionsSeed } from '@/lib/mocks/seeds/interactions.seed'
import type { LeadInteraction, LeadInteractionInput } from '@/lib/types'
import { createMockRepository } from './mock-storage'

type StoredLeadInteraction = LeadInteraction & { updatedAt: string }

const storedSeed = interactionsSeed.map((interaction) => ({
  ...interaction,
  updatedAt: interaction.createdAt,
})) satisfies StoredLeadInteraction[]

const storageRepo = createMockRepository<StoredLeadInteraction>('untd-lead-interactions', storedSeed)

function toInteraction(interaction: StoredLeadInteraction): LeadInteraction {
  const { updatedAt: _updatedAt, ...publicInteraction } = interaction
  return publicInteraction
}

export const interactionsRepo = {
  async list(filters?: Partial<LeadInteraction>): Promise<LeadInteraction[]> {
    const interactions = await storageRepo.list(filters as Partial<StoredLeadInteraction> | undefined)
    return interactions.map(toInteraction)
  },
  async getById(id: string): Promise<LeadInteraction | null> {
    const interaction = await storageRepo.getById(id)
    return interaction ? toInteraction(interaction) : null
  },
  async create(data: LeadInteractionInput): Promise<LeadInteraction> {
    const created = await storageRepo.create(data)
    return toInteraction(created)
  },
  async update(id: string, data: Partial<LeadInteraction>): Promise<LeadInteraction> {
    const current = await storageRepo.getById(id)
    const updated = await storageRepo.update(id, {
      ...data,
      id: current?.id,
      leadId: current?.leadId,
    })
    return toInteraction(updated)
  },
  async delete(id: string): Promise<void> {
    await storageRepo.delete(id)
  },
  async reset(): Promise<void> {
    await storageRepo.reset()
  },
  subscribe(listener: () => void): () => void {
    return storageRepo.subscribe(listener)
  },
}
