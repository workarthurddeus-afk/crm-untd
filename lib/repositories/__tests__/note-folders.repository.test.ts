import { beforeEach, describe, expect, it } from 'vitest'
import { noteFoldersSeed } from '@/lib/mocks/seeds/note-folders.seed'
import { noteFoldersRepo } from '../note-folders.repository'

describe('noteFoldersRepo', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    await noteFoldersRepo.reset()
  })

  it('seeds default strategic folders', async () => {
    const folders = await noteFoldersRepo.listFolders()

    expect(folders.map((folder) => folder.id)).toEqual(noteFoldersSeed.map((folder) => folder.id))
    expect(folders.map((folder) => folder.name)).toEqual([
      'Inbox',
      'Estrategia',
      'Produto',
      'Vendas',
      'Feedbacks',
      'Ideias',
    ])
  })

  it('archives folders out of default list', async () => {
    await noteFoldersRepo.archiveFolder('folder-feedbacks')

    const active = await noteFoldersRepo.listFolders()
    expect(active.map((folder) => folder.id)).not.toContain('folder-feedbacks')

    const archived = await noteFoldersRepo.listFolders({ isArchived: true })
    expect(archived.map((folder) => folder.id)).toContain('folder-feedbacks')
  })
})
