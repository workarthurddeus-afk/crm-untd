import { noteFoldersSeed } from '@/lib/mocks/seeds/note-folders.seed'
import type { NoteFolder, NoteFolderInput } from '@/lib/types'
import { createMockRepository } from './mock-storage'
import {
  createNoteFoldersSupabaseRepository,
  type NoteFoldersRepository,
} from './note-folders.supabase.repository'

const storageRepo = createMockRepository<NoteFolder>('untd-note-folders', noteFoldersSeed)

function createLocalNoteFoldersRepository(): NoteFoldersRepository {
  return {
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
  async clear(): Promise<void> {
    await storageRepo.clear()
  },
  async seedDemoData(): Promise<void> {
    await storageRepo.seedDemoData()
  },
  subscribe(listener: () => void): () => void {
    return storageRepo.subscribe(listener)
  },
}
}

export type NoteFoldersDataSource = 'local' | 'supabase'

export function resolveNoteFoldersDataSource(value: string | undefined): NoteFoldersDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export function createNoteFoldersRepository(
  dataSource: NoteFoldersDataSource = resolveNoteFoldersDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): NoteFoldersRepository {
  if (dataSource === 'supabase') return createNoteFoldersSupabaseRepository()
  return createLocalNoteFoldersRepository()
}

const localNoteFoldersRepo = createLocalNoteFoldersRepository()
let supabaseNoteFoldersRepo: NoteFoldersRepository | null = null

function getActiveNoteFoldersRepository(): NoteFoldersRepository {
  if (resolveNoteFoldersDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE) !== 'supabase') {
    return localNoteFoldersRepo
  }

  supabaseNoteFoldersRepo ??= createNoteFoldersSupabaseRepository()
  return supabaseNoteFoldersRepo
}

export const noteFoldersRepo = new Proxy({} as NoteFoldersRepository, {
  get(_target, property: keyof NoteFoldersRepository) {
    if (property === 'subscribe') {
      return (listener: () => void) => getActiveNoteFoldersRepository().subscribe(listener)
    }

    return async (...args: unknown[]) => {
      const repository = getActiveNoteFoldersRepository()
      const value = repository[property]
      if (typeof value !== 'function') return value
      return (value as (...items: unknown[]) => unknown).apply(repository, args)
    }
  },
})
