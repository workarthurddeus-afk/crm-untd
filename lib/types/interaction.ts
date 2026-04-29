export type InteractionType =
  | 'first-contact-sent'
  | 'replied'
  | 'follow-up-sent'
  | 'meeting-scheduled'
  | 'meeting-held'
  | 'proposal-sent'
  | 'feedback-received'
  | 'won'
  | 'lost'
  | 'note'

export interface LeadInteraction {
  id: string
  leadId: string
  type: InteractionType
  description?: string
  occurredAt: string
  createdAt: string
}

export type LeadInteractionInput = Omit<LeadInteraction, 'id' | 'createdAt'>
