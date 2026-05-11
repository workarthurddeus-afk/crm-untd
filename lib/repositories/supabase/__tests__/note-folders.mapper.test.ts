import { describe, expect, it } from 'vitest'
import {
  fromSupabaseNoteFolderRow,
  toSupabaseNoteFolderInsert,
  toSupabaseNoteFolderUpdate,
  type SupabaseNoteFolderRow,
} from '../note-folders.mapper'

const userId = '9a449f5f-4e70-40fd-bb20-4e7679e4b9af'
const row: SupabaseNoteFolderRow = {
  id: '5f688f6b-0ba0-4881-9b8b-7f6fc2d9fc78',
  user_id: userId,
  workspace_id: 'default',
  name: 'Estrategia',
  description: 'Decisoes importantes',
  color: 'purple',
  icon: 'target',
  parent_id: null,
  order_index: 2,
  is_archived: false,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

describe('note folders Supabase mapper', () => {
  it('maps Supabase rows to internal folders', () => {
    expect(fromSupabaseNoteFolderRow(row)).toEqual({
      id: row.id,
      name: 'Estrategia',
      description: 'Decisoes importantes',
      color: 'purple',
      icon: 'target',
      parentId: null,
      order: 2,
      isArchived: false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  })

  it('maps internal folder input to canonical insert columns', () => {
    expect(
      toSupabaseNoteFolderInsert(
        {
          name: 'Produto',
          description: 'Notas de produto',
          color: 'blue',
          icon: 'box',
          parentId: null,
          order: 1,
          isArchived: false,
        },
        userId
      )
    ).toEqual({
      user_id: userId,
      workspace_id: 'default',
      name: 'Produto',
      description: 'Notas de produto',
      color: 'blue',
      icon: 'box',
      parent_id: null,
      order_index: 1,
      is_archived: false,
    })
  })

  it('omits undefined update fields', () => {
    expect(toSupabaseNoteFolderUpdate({ name: 'Ideias' }, userId)).toEqual({
      user_id: userId,
      name: 'Ideias',
    })
  })
})
