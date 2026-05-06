import type { FeedbackInput, LeadInteractionInput, InteractionType, NoteInput } from '@/lib/types'

export interface LeadInteractionFormState {
  type: InteractionType
  description: string
  date: string
  time: string
}

export function getDefaultLeadInteractionFormState(currentDate = new Date()): LeadInteractionFormState {
  return {
    type: 'note',
    description: '',
    date: currentDate.toISOString().slice(0, 10),
    time: currentDate.toISOString().slice(11, 16),
  }
}

export function buildLeadInteractionPayload(
  leadId: string,
  form: LeadInteractionFormState
): LeadInteractionInput {
  const date = form.date || new Date().toISOString().slice(0, 10)
  const time = form.time || '09:00'
  const description = form.description.trim()

  return {
    leadId,
    type: form.type,
    description: description || undefined,
    occurredAt: new Date(`${date}T${time}:00.000Z`).toISOString(),
  }
}

export function attachLeadToNoteInput(input: NoteInput, leadId: string): NoteInput {
  return {
    ...input,
    relatedLeadId: leadId,
    source: 'lead',
  }
}

export function attachLeadToFeedbackInput(input: FeedbackInput, leadId: string): FeedbackInput {
  return {
    ...input,
    relatedLeadId: leadId,
    source: 'lead',
  }
}
