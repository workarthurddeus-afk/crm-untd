import type { Lead, PipelineStage } from '@/lib/types'

function isOpenLead(lead: Lead): boolean {
  return lead.result === 'open'
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

export function leadsNeedingFollowUpToday(leads: Lead[], today: Date): Lead[] {
  return leads.filter((lead) => {
    if (!isOpenLead(lead) || !lead.nextFollowUpAt) return false

    const due = new Date(lead.nextFollowUpAt)
    return isSameUtcDay(due, today) || due.getTime() < today.getTime()
  })
}

export function leadsStale(leads: Lead[], thresholdDays: number, today: Date): Lead[] {
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000

  return leads.filter((lead) => {
    if (!isOpenLead(lead) || !lead.lastContactAt) return false

    const lastContact = new Date(lead.lastContactAt)
    return today.getTime() - lastContact.getTime() >= thresholdMs
  })
}

export function leadsNeedingProposal(
  leads: Lead[],
  stages: PipelineStage[],
  minIcpScore: number
): Lead[] {
  const proposalStage = stages.find((stage) => stage.id === 'stage-proposal')
  if (!proposalStage) return []

  const orderByStageId = new Map(stages.map((stage) => [stage.id, stage.order]))

  return leads.filter((lead) => {
    if (!isOpenLead(lead)) return false
    if (lead.icpScore < minIcpScore) return false

    const currentOrder = orderByStageId.get(lead.pipelineStageId)
    if (currentOrder === undefined) return false

    return currentOrder < proposalStage.order
  })
}
