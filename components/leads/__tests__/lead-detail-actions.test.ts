import { describe, expect, it } from 'vitest'
import {
  attachLeadToFeedbackInput,
  attachLeadToNoteInput,
  buildLeadInteractionPayload,
} from '../lead-detail-actions'
import type { FeedbackInput, NoteInput } from '@/lib/types'

describe('lead detail actions', () => {
  it('builds an interaction payload linked to the current lead', () => {
    expect(
      buildLeadInteractionPayload('lead-001', {
        type: 'meeting-held',
        description: 'Diagnostico sobre consistencia visual.',
        date: '2026-05-06',
        time: '14:30',
      })
    ).toEqual({
      leadId: 'lead-001',
      type: 'meeting-held',
      description: 'Diagnostico sobre consistencia visual.',
      occurredAt: '2026-05-06T14:30:00.000Z',
    })
  })

  it('keeps notes created from lead detail linked to that lead', () => {
    const input = {
      title: 'Insight comercial',
      content: 'Lead reforcou que consistencia visual e o gargalo.',
      type: 'insight',
      status: 'active',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      color: 'purple',
      tags: ['vendas'],
      folderId: null,
      isPinned: false,
      isFavorite: true,
      isArchived: false,
      source: 'manual',
    } satisfies NoteInput

    expect(attachLeadToNoteInput(input, 'lead-001')).toMatchObject({
      relatedLeadId: 'lead-001',
      source: 'lead',
    })
  })

  it('keeps feedback created from lead detail linked to that lead', () => {
    const input = {
      title: 'Objecao sobre preco',
      content: 'Lead pediu clareza do primeiro resultado antes de mensalidade.',
      type: 'objection',
      source: 'manual',
      status: 'new',
      impact: 'high',
      frequency: 'recurring',
      sentiment: 'mixed',
      priority: 'high',
      tags: ['pricing'],
      isArchived: false,
      isPinned: false,
      capturedAt: '2026-05-06T14:30:00.000Z',
    } satisfies FeedbackInput

    expect(attachLeadToFeedbackInput(input, 'lead-001')).toMatchObject({
      relatedLeadId: 'lead-001',
      source: 'lead',
    })
  })
})
