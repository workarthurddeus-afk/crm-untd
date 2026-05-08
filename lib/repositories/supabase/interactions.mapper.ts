import type { InteractionType, LeadInteraction, LeadInteractionInput } from '@/lib/types'

const DEFAULT_WORKSPACE_ID = 'default'
const DEFAULT_OWNER_ID = 'arthur'
const DEFAULT_INTERACTION_TYPE: InteractionType = 'note'

const interactionTypes = new Set<InteractionType>([
  'first-contact-sent',
  'replied',
  'follow-up-sent',
  'meeting-scheduled',
  'meeting-held',
  'proposal-sent',
  'feedback-received',
  'won',
  'lost',
  'note',
])

export interface SupabaseInteractionRow {
  id: string
  lead_id: string
  workspace_id?: string | null
  owner_id?: string | null
  type?: string | null
  title?: string | null
  description?: string | null
  occurred_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type SupabaseInteractionInsert = Omit<
  SupabaseInteractionRow,
  'id' | 'created_at' | 'updated_at'
>
export type SupabaseInteractionUpdate = Partial<SupabaseInteractionInsert>

function cleanString(value: string | null | undefined): string | undefined {
  const clean = value?.trim()
  return clean ? clean : undefined
}

function nullableString(value: string | null | undefined): string | null {
  return cleanString(value) ?? null
}

function requiredString(value: string | null | undefined, message: string): string {
  const clean = cleanString(value)
  if (!clean) throw new Error(message)
  return clean
}

function removeUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>
}

function normalizeType(value: string | null | undefined): InteractionType {
  return interactionTypes.has(value as InteractionType)
    ? (value as InteractionType)
    : DEFAULT_INTERACTION_TYPE
}

export function fromSupabaseInteractionRow(row: SupabaseInteractionRow): LeadInteraction {
  const createdAt = row.created_at ?? new Date().toISOString()

  return {
    id: row.id,
    leadId: row.lead_id,
    type: normalizeType(row.type),
    description: cleanString(row.description),
    occurredAt: row.occurred_at ?? createdAt,
    createdAt,
  }
}

export function toSupabaseInteractionInsert(input: LeadInteractionInput): SupabaseInteractionInsert {
  return {
    lead_id: requiredString(input.leadId, 'Lead obrigatorio para registrar interacao.'),
    workspace_id: DEFAULT_WORKSPACE_ID,
    owner_id: DEFAULT_OWNER_ID,
    type: input.type ?? DEFAULT_INTERACTION_TYPE,
    title: null,
    description: requiredString(input.description, 'Descricao obrigatoria para registrar interacao.'),
    occurred_at: input.occurredAt ?? new Date().toISOString(),
  }
}

export function toSupabaseInteractionUpdate(
  input: Partial<LeadInteraction>
): SupabaseInteractionUpdate {
  return removeUndefined({
    lead_id: input.leadId === undefined ? undefined : requiredString(input.leadId, 'Lead obrigatorio para registrar interacao.'),
    type: input.type,
    description: input.description === undefined ? undefined : nullableString(input.description),
    occurred_at: input.occurredAt,
  }) as SupabaseInteractionUpdate
}
