import { beforeEach, describe, expect, it } from 'vitest'
import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { createNoteFolder, getNoteFolders } from '../note-folders.service'

describe('note-folders.service', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await noteFoldersRepo.reset()
  })

  it('creates a folder with normalized editable fields', async () => {
    const created = await createNoteFolder({
      name: '  Campanhas  ',
      description: '  Ideias de campanhas e angulos criativos. ',
      color: 'pink',
      icon: 'star',
      parentId: null,
      order: 9,
      isArchived: false,
    })

    expect(created).toMatchObject({
      name: 'Campanhas',
      description: 'Ideias de campanhas e angulos criativos.',
      color: 'pink',
      icon: 'star',
      order: 9,
      isArchived: false,
    })

    const folders = await getNoteFolders()
    expect(folders.map((folder) => folder.name)).toContain('Campanhas')
  })

  it('rejects duplicate folder names case-insensitively', async () => {
    await expect(
      createNoteFolder({
        name: ' estrategia ',
        description: '',
        color: 'purple',
        icon: 'target',
        parentId: null,
        order: 10,
        isArchived: false,
      })
    ).rejects.toThrow(/already exists/i)
  })
})
