import { describe, expect, it } from 'vitest'
import {
  fromSupabaseCalendarEventRow,
  toSupabaseCalendarEventInsert,
  toSupabaseCalendarEventUpdate,
  type SupabaseCalendarEventRow,
} from '../calendar-events.mapper'

const userId = '9a449f5f-4e70-40fd-bb20-4e7679e4b9af'
const leadId = '87a10f2b-3e35-49c4-b3d7-31e140da9172'
const taskId = '508c4548-d218-4b0b-8844-df3303c2c7cb'
const noteId = 'b6ce016a-1259-4c8a-8213-9ff844515b72'

const row: SupabaseCalendarEventRow = {
  id: 'a3fc2a2c-0583-4094-8fe6-77f2a9ed2c32',
  user_id: userId,
  workspace_id: 'default',
  title: 'Diagnostico com lead',
  description: 'Call comercial com contexto de BrandKit.',
  type: 'meeting',
  status: 'confirmed',
  priority: 'high',
  importance: 'critical',
  color: 'purple',
  location: 'Google Meet',
  meeting_url: 'https://meet.google.com/abc-defg-hij',
  start_at: '2026-05-12T13:00:00.000Z',
  end_at: '2026-05-12T14:00:00.000Z',
  all_day: false,
  attendees: [{ name: 'Arthur', status: 'accepted' }],
  tags: ['vendas', 'diagnostico'],
  related_lead_id: leadId,
  related_task_id: taskId,
  related_note_id: noteId,
  related_feedback_id: null,
  related_project_id: 'projeto-untd',
  source: 'task',
  is_reminder: true,
  reminder_at: '2026-05-12T12:30:00.000Z',
  completed_at: null,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

describe('calendar events Supabase mapper', () => {
  it('maps Supabase rows to internal calendar events', () => {
    expect(fromSupabaseCalendarEventRow(row)).toEqual({
      id: row.id,
      title: 'Diagnostico com lead',
      description: 'Call comercial com contexto de BrandKit.',
      startAt: row.start_at,
      endAt: row.end_at,
      allDay: false,
      type: 'meeting',
      status: 'confirmed',
      priority: 'high',
      importance: 'critical',
      color: 'purple',
      location: 'Google Meet',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      attendees: [{ name: 'Arthur', status: 'accepted' }],
      tags: ['vendas', 'diagnostico'],
      relatedLeadId: leadId,
      relatedTaskId: taskId,
      relatedNoteId: noteId,
      relatedFeedbackId: null,
      relatedProjectId: 'projeto-untd',
      source: 'task',
      isReminder: true,
      reminderAt: row.reminder_at,
      completedAt: null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  })

  it('maps internal input to canonical insert columns', () => {
    expect(
      toSupabaseCalendarEventInsert(
        {
          title: 'Agendar tarefa',
          description: 'Criada a partir de task.',
          startAt: '2026-05-13T09:00:00.000Z',
          endAt: '2026-05-13T10:00:00.000Z',
          allDay: false,
          type: 'task',
          status: 'scheduled',
          priority: 'medium',
          importance: 'high',
          color: 'blue',
          attendees: [],
          tags: ['task'],
          relatedTaskId: taskId,
          source: 'task',
          isReminder: false,
        },
        userId
      )
    ).toEqual({
      user_id: userId,
      workspace_id: 'default',
      title: 'Agendar tarefa',
      description: 'Criada a partir de task.',
      type: 'task',
      status: 'scheduled',
      priority: 'medium',
      importance: 'high',
      color: 'blue',
      location: null,
      meeting_url: null,
      start_at: '2026-05-13T09:00:00.000Z',
      end_at: '2026-05-13T10:00:00.000Z',
      all_day: false,
      attendees: [],
      tags: ['task'],
      related_lead_id: null,
      related_task_id: taskId,
      related_note_id: null,
      related_feedback_id: null,
      related_project_id: null,
      source: 'task',
      is_reminder: false,
      reminder_at: null,
      completed_at: null,
    })
  })

  it('clears completedAt when reopening an event', () => {
    expect(toSupabaseCalendarEventUpdate({ status: 'scheduled', completedAt: null }, userId)).toEqual({
      user_id: userId,
      status: 'scheduled',
      completed_at: null,
    })
  })
})
