import { describe, expect, it } from 'vitest'
import {
  fromSupabaseNoteRow,
  toSupabaseNoteInsert,
  toSupabaseNoteUpdate,
  type SupabaseNoteRow,
} from '../notes.mapper'

const userId = '9a449f5f-4e70-40fd-bb20-4e7679e4b9af'
const folderId = '5f688f6b-0ba0-4881-9b8b-7f6fc2d9fc78'
const leadId = '87a10f2b-3e35-49c4-b3d7-31e140da9172'

const row: SupabaseNoteRow = {
  id: 'b6ce016a-1259-4c8a-8213-9ff844515b72',
  user_id: userId,
  workspace_id: 'default',
  folder_id: folderId,
  related_lead_id: leadId,
  related_task_id: null,
  related_feedback_id: null,
  related_project_id: null,
  title: 'Insight de vendas',
  content: 'Agencias compram velocidade e consistencia.',
  excerpt: 'Agencias compram velocidade.',
  type: 'sales',
  status: 'active',
  priority: 'high',
  impact: 'high',
  effort: 'low',
  tags: ['vendas', 'agencia'],
  color: 'green',
  source: 'crm',
  is_pinned: true,
  is_favorite: true,
  is_archived: false,
  is_deleted: false,
  last_viewed_at: null,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

describe('notes Supabase mapper', () => {
  it('maps Supabase rows to normalized internal notes', () => {
    const note = fromSupabaseNoteRow(row)

    expect(note).toMatchObject({
      id: row.id,
      title: 'Insight de vendas',
      folderId,
      relatedLeadId: leadId,
      type: 'sales',
      status: 'active',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      color: 'green',
      source: 'crm',
      isPinned: true,
      pinned: true,
      isFavorite: true,
      favorited: true,
      isArchived: false,
      tags: ['vendas', 'agencia'],
      relatedTo: 'lead',
    })
  })

  it('maps note create input to canonical insert columns', () => {
    expect(
      toSupabaseNoteInsert(
        {
          title: 'Nova nota',
          content: '# Nota\n\nConteudo',
          type: 'idea',
          status: 'draft',
          priority: 'medium',
          impact: 'high',
          effort: 'low',
          color: 'purple',
          tags: ['Produto'],
          folderId,
          isPinned: false,
          isFavorite: true,
          isArchived: false,
          relatedLeadId: leadId,
          relatedTaskId: 'task-local-nao-uuid',
          source: 'manual',
        },
        userId
      )
    ).toEqual(
      expect.objectContaining({
        user_id: userId,
        workspace_id: 'default',
        title: 'Nova nota',
        content: '# Nota\n\nConteudo',
        type: 'idea',
        status: 'draft',
        priority: 'medium',
        impact: 'high',
        effort: 'low',
        color: 'purple',
        tags: ['produto'],
        folder_id: folderId,
        related_lead_id: leadId,
        related_task_id: null,
        is_favorite: true,
      })
    )
  })

  it('maps update patches without sending undefined fields', () => {
    expect(toSupabaseNoteUpdate({ title: 'Revisada', isPinned: true }, userId)).toEqual({
      user_id: userId,
      title: 'Revisada',
      is_pinned: true,
    })
  })
})
