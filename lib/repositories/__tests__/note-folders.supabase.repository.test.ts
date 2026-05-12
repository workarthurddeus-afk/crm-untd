import { describe, expect, it } from 'vitest'
import { createNoteFoldersSupabaseRepository } from '../note-folders.supabase.repository'
import type { SupabaseNoteFolderRow } from '../supabase/note-folders.mapper'

const user = { id: '9a449f5f-4e70-40fd-bb20-4e7679e4b9af' }
const row: SupabaseNoteFolderRow = {
  id: '5f688f6b-0ba0-4881-9b8b-7f6fc2d9fc78',
  user_id: user.id,
  workspace_id: 'default',
  name: 'Inbox',
  description: 'Captura rapida',
  color: 'default',
  icon: 'inbox',
  parent_id: null,
  order_index: 0,
  is_archived: false,
  created_at: '2026-05-11T10:00:00.000Z',
  updated_at: '2026-05-11T11:00:00.000Z',
}

function createFakeClient(data: SupabaseNoteFolderRow[] = [row], authUser: typeof user | null = user) {
  const calls: Array<{ method: string; payload?: unknown }> = []

  return {
    calls,
    auth: {
      getUser() {
        calls.push({ method: 'getUser' })
        return Promise.resolve({ data: { user: authUser }, error: null })
      },
    },
    from(table: string) {
      calls.push({ method: 'from', payload: table })
      return {
        select() {
          calls.push({ method: 'select' })
          return {
            order() {
              calls.push({ method: 'order' })
              return Promise.resolve({ data, error: null })
            },
            eq(_column: string, id: string) {
              calls.push({ method: 'eq', payload: id })
              return {
                maybeSingle() {
                  calls.push({ method: 'maybeSingle' })
                  return Promise.resolve({
                    data: data.find((item) => item.id === id) ?? null,
                    error: null,
                  })
                },
              }
            },
          }
        },
        insert(payload: unknown) {
          calls.push({ method: 'insert', payload })
          return {
            select() {
              return {
                single() {
                  calls.push({ method: 'single' })
                  return Promise.resolve({
                    data: { ...row, ...(payload as object) },
                    error: null,
                  })
                },
              }
            },
          }
        },
        update(payload: unknown) {
          calls.push({ method: 'update', payload })
          return {
            eq(_column: string, id: string) {
              calls.push({ method: 'eq', payload: id })
              return {
                select() {
                  return {
                    single() {
                      calls.push({ method: 'single' })
                      return Promise.resolve({ data: { ...row, ...(payload as object) }, error: null })
                    },
                  }
                },
              }
            },
          }
        },
        delete() {
          calls.push({ method: 'delete' })
          return {
            eq(_column: string, id: string) {
              calls.push({ method: 'eq', payload: id })
              return Promise.resolve({ error: null })
            },
          }
        },
      }
    },
  }
}

describe('note folders Supabase repository', () => {
  it('lists folders through the internal folder model', async () => {
    const repo = createNoteFoldersSupabaseRepository(createFakeClient())

    await expect(repo.listFolders()).resolves.toEqual([
      expect.objectContaining({ id: row.id, name: 'Inbox', order: 0 }),
    ])
  })

  it('creates folders with user ownership', async () => {
    const fake = createFakeClient()
    const repo = createNoteFoldersSupabaseRepository(fake)

    await repo.createFolder({
      name: 'Produto',
      description: 'Notas de produto',
      color: 'blue',
      icon: 'box',
      parentId: null,
      order: 1,
      isArchived: false,
    })

    expect(fake.calls).toContainEqual({
      method: 'insert',
      payload: expect.objectContaining({ user_id: user.id, name: 'Produto' }),
    })
  })

  it('deletes folders through Supabase', async () => {
    const fake = createFakeClient()
    const repo = createNoteFoldersSupabaseRepository(fake)

    await repo.deleteFolder(row.id)

    expect(fake.calls).toContainEqual({ method: 'delete' })
    expect(fake.calls).toContainEqual({ method: 'eq', payload: row.id })
  })

  it('requires an authenticated user before mutating folders', async () => {
    const repo = createNoteFoldersSupabaseRepository(createFakeClient([], null))

    await expect(
      repo.createFolder({
        name: 'Produto',
        color: 'blue',
        parentId: null,
        order: 1,
        isArchived: false,
      })
    ).rejects.toThrow('Sessao expirada. Faca login novamente.')
  })
})
