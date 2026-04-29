import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LeadOrigin, LeadResult, LeadTemperature } from '@/lib/types'

export interface LeadFilters {
  search: string
  origins: LeadOrigin[]
  temperatures: LeadTemperature[]
  results: LeadResult[]
  scoreMin: number
  scoreMax: number
  pipelineStageIds: string[]
  tagIds: string[]
  followUpDue: 'any' | 'today' | 'overdue' | 'this-week'
}

export const defaultLeadFilters: LeadFilters = {
  search: '',
  origins: [],
  temperatures: [],
  results: [],
  scoreMin: 0,
  scoreMax: 100,
  pipelineStageIds: [],
  tagIds: [],
  followUpDue: 'any',
}

interface FiltersState {
  leads: LeadFilters
  setLeadFilters: (next: Partial<LeadFilters>) => void
  resetLeadFilters: () => void
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      leads: defaultLeadFilters,
      setLeadFilters: (next) => set((s) => ({ leads: { ...s.leads, ...next } })),
      resetLeadFilters: () => set({ leads: defaultLeadFilters }),
    }),
    {
      name: 'untd-filters',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
