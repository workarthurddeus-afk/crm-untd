import { leadsSeed } from '@/lib/mocks/seeds/leads.seed'
import type { Lead } from '@/lib/types'
import { createMockRepository } from './mock-storage'
import { createLeadsSupabaseRepository, type LeadsRepository } from './leads.supabase.repository'

export type LeadsDataSource = 'local' | 'supabase'

const storageRepo = createMockRepository<Lead>('untd-leads', leadsSeed)

export function resolveLeadsDataSource(value: string | undefined): LeadsDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export function createLeadsRepository(
  dataSource: LeadsDataSource = resolveLeadsDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): LeadsRepository {
  if (dataSource === 'supabase') return createLeadsSupabaseRepository()
  return createLocalLeadsRepository()
}

export const leadsRepo = createLeadsRepository()

function hasArchivedAtFilter(filters?: Partial<Lead>): boolean {
  return Boolean(filters && Object.prototype.hasOwnProperty.call(filters, 'archivedAt'))
}

function matchesFilters(lead: Lead, filters?: Partial<Lead>): boolean {
  if (!filters) return true
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined) return true
    return (lead as unknown as Record<string, unknown>)[key] === value
  })
}

function createLocalLeadsRepository(): LeadsRepository {
  return {
    async list(filters?: Partial<Lead>): Promise<Lead[]> {
      const leads = await storageRepo.list()
      const visibleLeads = hasArchivedAtFilter(filters)
        ? leads
        : leads.filter((lead) => !lead.archivedAt)

      return visibleLeads.filter((lead) => matchesFilters(lead, filters))
    },
    getById(id: string): Promise<Lead | null> {
      return storageRepo.getById(id)
    },
    create(data): Promise<Lead> {
      return storageRepo.create(data)
    },
    update(id: string, data: Partial<Lead>): Promise<Lead> {
      return storageRepo.update(id, data)
    },
    delete(id: string): Promise<void> {
      return storageRepo.delete(id)
    },
    archiveLead(id: string, archivedAt = new Date().toISOString()): Promise<Lead> {
      return storageRepo.update(id, { archivedAt })
    },
    unarchiveLead(id: string): Promise<Lead> {
      return storageRepo.update(id, { archivedAt: null })
    },
    deleteLead(id: string): Promise<void> {
      return storageRepo.delete(id)
    },
    reset(): Promise<void> {
      return storageRepo.reset()
    },
    clear(): Promise<void> {
      return storageRepo.clear()
    },
    seedDemoData(): Promise<void> {
      return storageRepo.seedDemoData()
    },
    subscribe(listener: () => void): () => void {
      return storageRepo.subscribe(listener)
    },
  }
}
