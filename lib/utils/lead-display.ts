import type { Lead } from '@/lib/types'

/**
 * Pure helpers shared across the lead detail surface.
 * No React, no DOM — safe to import anywhere.
 */

export function leadInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '·'
}

export function leadIsClosed(lead: Lead): boolean {
  return lead.result === 'won' || lead.result === 'lost' || lead.result === 'no-fit'
}

/**
 * Maps a pipeline stage id to the design-system pipe-* color group.
 * Returns null for stages that don't have a dedicated pipe color
 * (so callers can fall back to a neutral tint).
 */
export function pipeColorForStage(stageId: string): string | null {
  switch (stageId) {
    case 'stage-research':
      return null
    case 'stage-identified':
      return 'prospect'
    case 'stage-first':
      return 'contacted'
    case 'stage-replied':
      return 'replied'
    case 'stage-followup':
      return 'followup'
    case 'stage-meeting-set':
    case 'stage-diagnosis':
      return 'contacted'
    case 'stage-proposal':
      return 'proposal'
    case 'stage-pilot':
      return 'followup'
    case 'stage-won':
      return 'won'
    case 'stage-lost':
      return 'lost'
    default:
      return null
  }
}
