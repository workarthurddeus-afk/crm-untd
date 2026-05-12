export type LeadOrigin =
  | 'cold-dm'
  | 'cold-email'
  | 'in-person'
  | 'referral'
  | 'paid-traffic'
  | 'social'
  | 'community'
  | 'event'
  | 'manual'
  | 'manual-search'
  | 'other'

export type LeadTemperature = 'cold' | 'warm' | 'hot'
export type LeadResult = 'open' | 'won' | 'lost' | 'no-response' | 'no-fit'

export interface LeadLocation {
  city?: string
  country?: string
}

export interface Lead {
  id: string
  name: string
  company: string
  role?: string
  niche: string
  website?: string
  instagram?: string
  linkedin?: string
  email?: string
  phone?: string
  location?: LeadLocation
  origin: LeadOrigin
  pipelineStageId: string
  temperature: LeadTemperature
  icpScore: number
  pain?: string
  revenuePotential?: number
  objections?: string[]
  firstContactAt?: string
  lastContactAt?: string
  nextFollowUpAt?: string
  ownerId: string
  tagIds: string[]
  internalNotes?: string
  result: LeadResult
  archivedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type LeadInput = Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'icpScore'>
