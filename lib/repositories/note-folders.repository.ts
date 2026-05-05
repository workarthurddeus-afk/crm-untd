import { noteFoldersSeed } from '@/lib/mocks/seeds/note-folders.seed'
import type { NoteFolder, NoteFolderInput } from '@/lib/types'
import { createMockRepository } from './mock-storage'

const storageRepo = createMockRepository<NoteFolder>('untd-note-folders', noteFoldersSeed)

export const noteFoldersRepo = {
  async listFolders(filters?: Partial<NoteFolder>): Promise<NoteFolder[]> {
    const folders = await storageRepo.list()
    return folders
      .filter((folder) => {
        if (filters?.isArchived !== undefined) return folder.isArchived === filters.isArchived
        return !folder.isArchived
      })
      .filter((folder) => {
        if (!filters) return true
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || key === 'isArchived') return true
          return (folder as unknown as Record<string, unknown>)[key] === value
        })
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  },
  async listAllFolders(): Promise<NoteFolder[]> {
    return (await storageRepo.list()).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  },
  async getFolderById(id: string): Promise<NoteFolder | null> {
    return storageRepo.getById(id)
  },
  async createFolder(data: NoteFolderInput): Promise<NoteFolder> {
    return storageRepo.create(data)
  },
  async updateFolder(id: string, data: Partial<NoteFolder>): Promise<NoteFolder> {
    return storageRepo.update(id, data)
  },
  async archiveFolder(id: string): Promise<NoteFolder> {
    return storageRepo.update(id, { isArchived: true })
  },
  async restoreFolder(id: string): Promise<NoteFolder> {
    return storageRepo.update(id, { isArchived: false })
  },
  async deleteFolder(id: string): Promise<void> {
    await storageRepo.delete(id)
  },
  async reset(): Promise<void> {
    await storageRepo.reset()
  },
  subscribe(listener: () => void): () => void {
    return storageRepo.subscribe(listener)
  },
}
