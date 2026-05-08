import { interactionsSeed } from '@/lib/mocks/seeds/interactions.seed'
import type { LeadInteraction, LeadInteractionInput } from '@/lib/types'
import { createMockRepository } from './mock-storage'
import {
  createInteractionsSupabaseRepository,
  type InteractionsRepository,
} from './interactions.supabase.repository'

type StoredLeadInteraction = LeadInteraction & { updatedAt: string }
type InteractionsDataSource = 'local' | 'supabase'

const storedSeed = interactionsSeed.map((interaction) => ({
  ...interaction,
  updatedAt: interaction.createdAt,
})) satisfies StoredLeadInteraction[]

const storageRepo = createMockRepository<StoredLeadInteraction>('untd-lead-interactions', storedSeed)

export function resolveInteractionsDataSource(value: string | undefined): InteractionsDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

function toInteraction(interaction: StoredLeadInteraction): LeadInteraction {
  const { updatedAt: _updatedAt, ...publicInteraction } = interaction
  return publicInteraction
}

function createLocalInteractionsRepository(): InteractionsRepository {
  return {
    async list(filters?: Partial<LeadInteraction>): Promise<LeadInteraction[]> {
      const interactions = await storageRepo.list(filters as Partial<StoredLeadInteraction> | undefined)
      return interactions.map(toInteraction)
    },
    async getById(id: string): Promise<LeadInteraction | null> {
      const interaction = await storageRepo.getById(id)
      return interaction ? toInteraction(interaction) : null
    },
    async getByLeadId(leadId: string): Promise<LeadInteraction[]> {
      const interactions = await storageRepo.list({ leadId })
      return interactions.map(toInteraction)
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
    async clear(): Promise<void> {
      await storageRepo.clear()
    },
    async seedDemoData(): Promise<void> {
      await storageRepo.seedDemoData()
    },
    subscribe(listener: () => void): () => void {
      return storageRepo.subscribe(listener)
    },
  }
}

export function createInteractionsRepository(
  dataSource: InteractionsDataSource = resolveInteractionsDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): InteractionsRepository {
  if (dataSource === 'supabase') return createInteractionsSupabaseRepository()
  return createLocalInteractionsRepository()
}

export const interactionsRepo = createInteractionsRepository()
