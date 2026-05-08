import { describe, expect, it } from 'vitest'
import {
  fromSupabaseInteractionRow,
  toSupabaseInteractionInsert,
  toSupabaseInteractionUpdate,
  type SupabaseInteractionRow,
} from '../interactions.mapper'

const row: SupabaseInteractionRow = {
  id: '2c83b471-15b2-4e77-bc8a-bdcb9c13f4f9',
  lead_id: '4e2f4d7e-5b1a-4d90-8f6b-2a184fba5ed1',
  workspace_id: 'default',
  owner_id: 'arthur',
  type: 'note',
  title: 'Nota interna',
  description: 'Arthur registrou contexto da conversa.',
  occurred_at: '2026-05-08T12:30:00.000Z',
  created_at: '2026-05-08T12:31:00.000Z',
  updated_at: '2026-05-08T12:32:00.000Z',
}

describe('Supabase interactions mapper', () => {
  it('maps a Supabase row into the internal LeadInteraction model', () => {
    expect(fromSupabaseInteractionRow(row)).toEqual({
      id: row.id,
      leadId: row.lead_id,
      type: 'note',
      description: 'Arthur registrou contexto da conversa.',
      occurredAt: '2026-05-08T12:30:00.000Z',
      createdAt: '2026-05-08T12:31:00.000Z',
    })
  })

  it('maps internal input into Supabase insert payload', () => {
    expect(
      toSupabaseInteractionInsert({
        leadId: row.lead_id,
        type: 'meeting-held',
        description: 'Reuniao realizada com decisor.',
        occurredAt: '2026-05-08T15:00:00.000Z',
      })
    ).toEqual({
      lead_id: row.lead_id,
      workspace_id: 'default',
      owner_id: 'arthur',
      type: 'meeting-held',
      title: null,
      description: 'Reuniao realizada com decisor.',
      occurred_at: '2026-05-08T15:00:00.000Z',
    })
  })

  it('maps partial updates without sending undefined fields', () => {
    expect(
      toSupabaseInteractionUpdate({
        type: 'follow-up-sent',
        description: undefined,
        occurredAt: '2026-05-09T10:00:00.000Z',
      })
    ).toEqual({
      type: 'follow-up-sent',
      occurred_at: '2026-05-09T10:00:00.000Z',
    })
  })
})
