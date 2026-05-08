import { leadsSeed } from '@/lib/mocks/seeds/leads.seed'
import type { Lead } from '@/lib/types'
import { createMockRepository } from './mock-storage'
import { createLeadsSupabaseRepository, type LeadsRepository } from './leads.supabase.repository'

export type LeadsDataSource = 'local' | 'supabase'

export function resolveLeadsDataSource(value: string | undefined): LeadsDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export function createLeadsRepository(
  dataSource: LeadsDataSource = resolveLeadsDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): LeadsRepository {
  if (dataSource === 'supabase') return createLeadsSupabaseRepository()
  return createMockRepository<Lead>('untd-leads', leadsSeed)
}

export const leadsRepo = createLeadsRepository()
