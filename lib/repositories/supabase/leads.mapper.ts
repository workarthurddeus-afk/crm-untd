import type { Lead, LeadInput, LeadOrigin, LeadResult, LeadTemperature } from '@/lib/types'

const DEFAULT_WORKSPACE_ID = 'default'
const DEFAULT_OWNER_ID = 'arthur'
const DEFAULT_ORIGIN: LeadOrigin = 'manual'
const DEFAULT_TEMPERATURE: LeadTemperature = 'cold'
const DEFAULT_RESULT: LeadResult = 'open'
const DEFAULT_PIPELINE_STAGE_ID = 'prospecting'
const DEFAULT_COUNTRY = 'BR'

const leadOrigins = new Set<LeadOrigin>([
  'cold-dm',
  'cold-email',
  'in-person',
  'referral',
  'paid-traffic',
  'social',
  'community',
  'event',
  'manual',
  'manual-search',
  'other',
])

const leadTemperatures = new Set<LeadTemperature>(['cold', 'warm', 'hot'])
const leadResults = new Set<LeadResult>(['open', 'won', 'lost', 'no-response', 'no-fit'])

export interface SupabaseLeadRow {
  id: string
  workspace_id?: string | null
  owner_id?: string | null
  name?: string | null
  owner_name?: string | null
  company?: string | null
  company_name?: string | null
  role?: string | null
  owner_role?: string | null
  niche?: string | null
  website?: string | null
  instagram?: string | null
  linkedin?: string | null
  owner_linkedin?: string | null
  email?: string | null
  commercial_email?: string | null
  phone?: string | null
  commercial_phone?: string | null
  whatsapp?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  origin?: string | null
  pipeline_stage_id?: string | null
  temperature?: string | null
  icp_score?: number | null
  fit_score?: number | null
  pain?: string | null
  revenue_potential?: number | string | null
  objections?: string[] | null
  first_contact_at?: string | null
  last_contact_at?: string | null
  next_follow_up_at?: string | null
  tag_ids?: string[] | null
  internal_notes?: string | null
  result?: string | null
  status?: string | null
  visual_quality_score?: number | null
  visual_problems?: string | null
  why_good_lead?: string | null
  suggested_approach?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type SupabaseLeadInsert = Omit<SupabaseLeadRow, 'id' | 'created_at' | 'updated_at'>
export type SupabaseLeadUpdate = Partial<SupabaseLeadInsert>

function cleanString(value: string | null | undefined): string | undefined {
  const clean = value?.trim()
  return clean ? clean : undefined
}

function nullableString(value: string | null | undefined): string | null {
  return cleanString(value) ?? null
}

function removeUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>
}

function clampScore(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function normalizeOrigin(value: string | null | undefined): LeadOrigin {
  return leadOrigins.has(value as LeadOrigin) ? (value as LeadOrigin) : DEFAULT_ORIGIN
}

function normalizeTemperature(value: string | null | undefined): LeadTemperature {
  return leadTemperatures.has(value as LeadTemperature) ? (value as LeadTemperature) : DEFAULT_TEMPERATURE
}

function normalizeResult(value: string | null | undefined): LeadResult {
  return leadResults.has(value as LeadResult) ? (value as LeadResult) : DEFAULT_RESULT
}

function normalizeRevenue(value: number | string | null | undefined): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value !== 'string' || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function normalizeStringArray(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function composeLegacyNotes(row: SupabaseLeadRow): string | undefined {
  const notes = [
    cleanString(row.internal_notes),
    row.why_good_lead ? `Por que e bom lead: ${row.why_good_lead}` : undefined,
    row.suggested_approach ? `Abordagem sugerida: ${row.suggested_approach}` : undefined,
  ].filter(Boolean)

  return notes.length > 0 ? notes.join('\n\n') : undefined
}

export function fromSupabaseLeadRow(row: SupabaseLeadRow): Lead {
  const createdAt = row.created_at ?? new Date().toISOString()
  const company = cleanString(row.company) ?? cleanString(row.company_name) ?? 'Lead sem empresa'
  const name = cleanString(row.name) ?? cleanString(row.owner_name) ?? company
  const email = cleanString(row.email) ?? cleanString(row.commercial_email)
  const phone = cleanString(row.phone) ?? cleanString(row.commercial_phone) ?? cleanString(row.whatsapp)
  const pain = cleanString(row.pain) ?? cleanString(row.visual_problems)

  return {
    id: row.id,
    name,
    company,
    role: cleanString(row.role) ?? cleanString(row.owner_role),
    niche: cleanString(row.niche) ?? 'Sem nicho',
    website: cleanString(row.website),
    instagram: cleanString(row.instagram),
    linkedin: cleanString(row.linkedin) ?? cleanString(row.owner_linkedin),
    email,
    phone,
    location: {
      city: cleanString(row.city),
      country: cleanString(row.country) ?? DEFAULT_COUNTRY,
    },
    origin: normalizeOrigin(row.origin),
    pipelineStageId: cleanString(row.pipeline_stage_id) ?? DEFAULT_PIPELINE_STAGE_ID,
    temperature: normalizeTemperature(row.temperature),
    icpScore: clampScore(row.icp_score ?? row.fit_score),
    pain,
    revenuePotential: normalizeRevenue(row.revenue_potential),
    objections: normalizeStringArray(row.objections),
    firstContactAt: cleanString(row.first_contact_at),
    lastContactAt: cleanString(row.last_contact_at),
    nextFollowUpAt: cleanString(row.next_follow_up_at),
    ownerId: cleanString(row.owner_id) ?? DEFAULT_OWNER_ID,
    tagIds: normalizeStringArray(row.tag_ids),
    internalNotes: composeLegacyNotes(row),
    result: normalizeResult(row.result),
    createdAt,
    updatedAt: row.updated_at ?? createdAt,
  }
}

export function toSupabaseLeadInsert(input: LeadInput & { icpScore?: number }): SupabaseLeadInsert {
  return removeUndefined({
    workspace_id: DEFAULT_WORKSPACE_ID,
    owner_id: cleanString(input.ownerId) ?? DEFAULT_OWNER_ID,
    name: nullableString(input.name),
    company: nullableString(input.company),
    role: nullableString(input.role),
    niche: nullableString(input.niche),
    website: nullableString(input.website),
    instagram: nullableString(input.instagram),
    linkedin: nullableString(input.linkedin),
    email: nullableString(input.email),
    phone: nullableString(input.phone),
    city: nullableString(input.location?.city),
    country: cleanString(input.location?.country) ?? DEFAULT_COUNTRY,
    origin: input.origin ?? DEFAULT_ORIGIN,
    pipeline_stage_id: cleanString(input.pipelineStageId) ?? DEFAULT_PIPELINE_STAGE_ID,
    temperature: input.temperature ?? DEFAULT_TEMPERATURE,
    icp_score: clampScore(input.icpScore),
    pain: nullableString(input.pain),
    revenue_potential: input.revenuePotential ?? null,
    objections: input.objections ?? [],
    first_contact_at: nullableString(input.firstContactAt),
    last_contact_at: nullableString(input.lastContactAt),
    next_follow_up_at: nullableString(input.nextFollowUpAt),
    tag_ids: input.tagIds ?? [],
    internal_notes: nullableString(input.internalNotes),
    result: input.result ?? DEFAULT_RESULT,
  }) as SupabaseLeadInsert
}

export function toSupabaseLeadUpdate(input: Partial<Lead>): SupabaseLeadUpdate {
  return removeUndefined({
    owner_id: input.ownerId === undefined ? undefined : cleanString(input.ownerId) ?? DEFAULT_OWNER_ID,
    name: input.name === undefined ? undefined : nullableString(input.name),
    company: input.company === undefined ? undefined : nullableString(input.company),
    role: input.role === undefined ? undefined : nullableString(input.role),
    niche: input.niche === undefined ? undefined : nullableString(input.niche),
    website: input.website === undefined ? undefined : nullableString(input.website),
    instagram: input.instagram === undefined ? undefined : nullableString(input.instagram),
    linkedin: input.linkedin === undefined ? undefined : nullableString(input.linkedin),
    email: input.email === undefined ? undefined : nullableString(input.email),
    phone: input.phone === undefined ? undefined : nullableString(input.phone),
    city: input.location?.city === undefined ? undefined : nullableString(input.location.city),
    country: input.location?.country === undefined ? undefined : cleanString(input.location.country) ?? DEFAULT_COUNTRY,
    origin: input.origin,
    pipeline_stage_id: input.pipelineStageId === undefined ? undefined : cleanString(input.pipelineStageId) ?? DEFAULT_PIPELINE_STAGE_ID,
    temperature: input.temperature,
    icp_score: input.icpScore === undefined ? undefined : clampScore(input.icpScore),
    pain: input.pain === undefined ? undefined : nullableString(input.pain),
    revenue_potential: input.revenuePotential,
    objections: input.objections,
    first_contact_at: input.firstContactAt === undefined ? undefined : nullableString(input.firstContactAt),
    last_contact_at: input.lastContactAt === undefined ? undefined : nullableString(input.lastContactAt),
    next_follow_up_at: input.nextFollowUpAt === undefined ? undefined : nullableString(input.nextFollowUpAt),
    tag_ids: input.tagIds,
    internal_notes: input.internalNotes === undefined ? undefined : nullableString(input.internalNotes),
    result: input.result,
  })
}
