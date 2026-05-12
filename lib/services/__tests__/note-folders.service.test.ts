import { beforeEach, describe, expect, it } from 'vitest'
import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { notesRepo } from '@/lib/repositories/notes.repository'
import { createNoteFolder, deleteNoteFolder, getNoteFolders } from '../note-folders.service'

describe('note-folders.service', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await noteFoldersRepo.seedDemoData()
    await notesRepo.seedDemoData()
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

  it('deletes a folder by moving its notes to sem pasta', async () => {
    const note = await notesRepo.createNote({
      title: 'Nota em pasta temporaria',
      content: 'Conteudo que deve sobreviver a exclusao da pasta.',
      type: 'idea',
      status: 'active',
      priority: 'medium',
      impact: 'medium',
      effort: 'low',
      color: 'purple',
      folderId: 'folder-ideas',
      tags: ['pasta'],
      isPinned: false,
      isFavorite: false,
      isArchived: false,
    })

    await deleteNoteFolder('folder-ideas')

    await expect(noteFoldersRepo.getFolderById('folder-ideas')).resolves.toBeNull()
    await expect(notesRepo.getNoteById(note.id)).resolves.toMatchObject({
      folderId: null,
    })
  })
})
