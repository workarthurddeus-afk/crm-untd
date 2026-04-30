import { leadsSeed } from '@/lib/mocks/seeds/leads.seed'
import type { Lead } from '@/lib/types'
import { createMockRepository } from './mock-storage'

export const leadsRepo = createMockRepository<Lead>('untd-leads', leadsSeed)
