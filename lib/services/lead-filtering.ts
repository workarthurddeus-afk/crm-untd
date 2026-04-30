import type { Lead } from '@/lib/types'
import type { LeadFilters } from '@/lib/stores/filters.store'

const DAY_MS = 24 * 60 * 60 * 1000

export function filterLeads(leads: Lead[], filters: LeadFilters): Lead[] {
  const query = filters.search.trim().toLowerCase()

  return leads.filter((lead) => {
    if (query) {
      const haystack = [lead.name, lead.company, lead.niche, lead.role ?? '']
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (filters.origins.length && !filters.origins.includes(lead.origin)) {
      return false
    }
    if (
      filters.temperatures.length &&
      !filters.temperatures.includes(lead.temperature)
    ) {
      return false
    }
    if (filters.results.length && !filters.results.includes(lead.result)) {
      return false
    }
    if (lead.icpScore < filters.scoreMin || lead.icpScore > filters.scoreMax) {
      return false
    }
    if (
      filters.pipelineStageIds.length &&
      !filters.pipelineStageIds.includes(lead.pipelineStageId)
    ) {
      return false
    }
    if (
      filters.tagIds.length &&
      !filters.tagIds.some((t) => lead.tagIds.includes(t))
    ) {
      return false
    }

    if (filters.followUpDue !== 'any') {
      if (!lead.nextFollowUpAt) return false
      const due = new Date(lead.nextFollowUpAt)
      const now = new Date()
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
      const endOfToday = new Date(startOfToday.getTime() + DAY_MS)
      const endOfWeek = new Date(startOfToday.getTime() + 7 * DAY_MS)

      if (filters.followUpDue === 'overdue' && due >= startOfToday) return false
      if (
        filters.followUpDue === 'today' &&
        (due < startOfToday || due >= endOfToday)
      ) {
        return false
      }
      if (
        filters.followUpDue === 'this-week' &&
        (due < startOfToday || due >= endOfWeek)
      ) {
        return false
      }
    }

    return true
  })
}
