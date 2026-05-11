import { describe, expect, it } from 'vitest'
import {
  fromSupabaseTaskRow,
  toSupabaseTaskInsert,
  toSupabaseTaskUpdate,
  type SupabaseTaskRow,
} from '../tasks.mapper'

const userId = '9a449f5f-4e70-40fd-bb20-4e7679e4b9af'
const leadId = '87a10f2b-3e35-49c4-b3d7-31e140da9172'
const noteId = 'b6ce016a-1259-4c8a-8213-9ff844515b72'

const row: SupabaseTaskRow = {
  id: '508c4548-d218-4b0b-8844-df3303c2c7cb',
  user_id: userId,
  workspace_id: 'default',
  title: 'Enviar proposta',
  description: 'Enviar proposta revisada para lead quente.',
  status: 'pending',
  importance: 'high',
  category: 'follow-up',
  source: 'note',
  color: 'purple',
  tags: ['follow-up', 'proposta'],
  due_at: '2026-05-12T12:00:00.000Z',
  completed_at: null,
  cancelled_at: null,
  archived_at: null,
  related_lead_id: leadId,
  related_note_id: noteId,
  related_calendar_event_id: 'calendar-local-001',
  related_feedback_id: null,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

describe('tasks Supabase mapper', () => {
  it('maps Supabase rows to internal tasks', () => {
    expect(fromSupabaseTaskRow(row)).toEqual({
      id: row.id,
      title: 'Enviar proposta',
      description: 'Enviar proposta revisada para lead quente.',
      dueDate: row.due_at,
      importance: 'high',
      status: 'pending',
      category: 'follow-up',
      relatedLeadId: leadId,
      relatedNoteId: noteId,
      relatedCalendarEventId: 'calendar-local-001',
      relatedFeedbackId: undefined,
      source: 'note',
      color: 'purple',
      completedAt: undefined,
      cancelledAt: undefined,
      archivedAt: undefined,
      tagIds: ['follow-up', 'proposta'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  })

  it('maps internal task input to canonical insert columns', () => {
    expect(
      toSupabaseTaskInsert(
        {
          title: 'Executar insight',
          description: 'Criar tarefa a partir da nota.',
          dueDate: '2026-05-13T09:00:00.000Z',
          importance: 'medium',
          status: 'pending',
          category: 'strategy',
          relatedLeadId: leadId,
          relatedNoteId: noteId,
          relatedCalendarEventId: 'calendar-local-001',
          source: 'note',
          color: 'violet',
          tagIds: ['insight', 'acao'],
        },
        userId
      )
    ).toEqual({
      user_id: userId,
      workspace_id: 'default',
      title: 'Executar insight',
      description: 'Criar tarefa a partir da nota.',
      status: 'pending',
      importance: 'medium',
      category: 'strategy',
      source: 'note',
      color: 'violet',
      tags: ['insight', 'acao'],
      due_at: '2026-05-13T09:00:00.000Z',
      completed_at: null,
      cancelled_at: null,
      archived_at: null,
      related_lead_id: leadId,
      related_note_id: noteId,
      related_calendar_event_id: 'calendar-local-001',
      related_feedback_id: null,
    })
  })

  it('omits undefined update fields and keeps explicit nulls for cleared relations', () => {
    expect(
      toSupabaseTaskUpdate(
        {
          title: 'Revisada',
          relatedLeadId: undefined,
          relatedNoteId: '',
          status: 'done',
          completedAt: '2026-05-13T10:00:00.000Z',
        },
        userId
      )
    ).toEqual({
      user_id: userId,
      title: 'Revisada',
      status: 'done',
      completed_at: '2026-05-13T10:00:00.000Z',
      related_note_id: null,
    })
  })
})
