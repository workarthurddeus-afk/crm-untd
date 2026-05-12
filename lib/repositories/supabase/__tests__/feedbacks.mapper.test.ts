import { describe, expect, it } from 'vitest'
import {
  fromSupabaseFeedbackRow,
  toSupabaseFeedbackInsert,
  toSupabaseFeedbackUpdate,
  type SupabaseFeedbackRow,
} from '../feedbacks.mapper'

const userId = '9a449f5f-4e70-40fd-bb20-4e7679e4b9af'
const leadId = '87a10f2b-3e35-49c4-b3d7-31e140da9172'
const noteId = 'b6ce016a-1259-4c8a-8213-9ff844515b72'
const taskId = '508c4548-d218-4b0b-8844-df3303c2c7cb'
const calendarEventId = 'a3fc2a2c-0583-4094-8fe6-77f2a9ed2c32'

const row: SupabaseFeedbackRow = {
  id: 'f6f6bde1-5035-4397-9ec4-17fc5bf3b996',
  user_id: userId,
  workspace_id: 'default',
  title: 'Lead pediu templates por nicho',
  content: 'Social media quer modelos por restaurante e clinica.',
  type: 'feature_request',
  source: 'call',
  status: 'reviewing',
  impact: 'high',
  frequency: 'recurring',
  sentiment: 'mixed',
  priority: 'high',
  tags: ['Social Media', 'Templates'],
  related_lead_id: leadId,
  related_note_id: noteId,
  related_task_id: taskId,
  related_calendar_event_id: calendarEventId,
  related_project_id: 'roadmap-untd',
  is_archived: false,
  is_pinned: true,
  captured_at: '2026-05-12T12:00:00.000Z',
  resolved_at: null,
  created_at: '2026-05-12T10:00:00.000Z',
  updated_at: '2026-05-12T11:00:00.000Z',
}

describe('feedbacks Supabase mapper', () => {
  it('maps Supabase rows to internal feedbacks', () => {
    expect(fromSupabaseFeedbackRow(row)).toEqual({
      id: row.id,
      title: 'Lead pediu templates por nicho',
      content: 'Social media quer modelos por restaurante e clinica.',
      type: 'feature_request',
      source: 'call',
      status: 'reviewing',
      impact: 'high',
      frequency: 'recurring',
      sentiment: 'mixed',
      priority: 'high',
      tags: ['social-media', 'templates'],
      relatedLeadId: leadId,
      relatedNoteId: noteId,
      relatedTaskId: taskId,
      relatedCalendarEventId: calendarEventId,
      relatedProjectId: 'roadmap-untd',
      isArchived: false,
      isPinned: true,
      capturedAt: row.captured_at,
      resolvedAt: null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  })

  it('maps internal input to canonical insert columns', () => {
    expect(
      toSupabaseFeedbackInsert(
        {
          title: 'Objeção de preço',
          content: 'Lead achou o plano mensal caro.',
          type: 'objection',
          source: 'dm',
          status: 'new',
          impact: 'medium',
          frequency: 'recurring',
          sentiment: 'negative',
          priority: 'high',
          tags: ['Pricing', ' Objeção '],
          relatedLeadId: leadId,
          isArchived: false,
          isPinned: false,
          capturedAt: '2026-05-12T13:00:00.000Z',
        },
        userId
      )
    ).toEqual({
      user_id: userId,
      workspace_id: 'default',
      title: 'Objeção de preço',
      content: 'Lead achou o plano mensal caro.',
      type: 'objection',
      source: 'dm',
      status: 'new',
      impact: 'medium',
      frequency: 'recurring',
      sentiment: 'negative',
      priority: 'high',
      tags: ['pricing', 'objecao'],
      related_lead_id: leadId,
      related_note_id: null,
      related_task_id: null,
      related_calendar_event_id: null,
      related_project_id: null,
      is_archived: false,
      is_pinned: false,
      captured_at: '2026-05-12T13:00:00.000Z',
      resolved_at: null,
    })
  })

  it('omits undefined update fields and keeps explicit nulls', () => {
    expect(
      toSupabaseFeedbackUpdate(
        {
          status: 'resolved',
          resolvedAt: '2026-05-12T14:00:00.000Z',
          relatedTaskId: '',
          isPinned: true,
        },
        userId
      )
    ).toEqual({
      user_id: userId,
      status: 'resolved',
      related_task_id: null,
      is_pinned: true,
      resolved_at: '2026-05-12T14:00:00.000Z',
    })
  })
})
