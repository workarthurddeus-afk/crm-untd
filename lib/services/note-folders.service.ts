import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { notesRepo } from '@/lib/repositories/notes.repository'
import type { NoteFolder, NoteFolderInput } from '@/lib/types'

export interface NoteFolderWithCount extends NoteFolder {
  noteCount: number
  activeNoteCount: number
}

export async function getNoteFolders(): Promise<NoteFolderWithCount[]> {
  const [folders, notes] = await Promise.all([
    noteFoldersRepo.listFolders(),
    notesRepo.listNotes(),
  ])

  return folders.map((folder) => {
    const folderNotes = notes.filter((note) => note.folderId === folder.id)
    return {
      ...folder,
      noteCount: folderNotes.length,
      activeNoteCount: folderNotes.filter((note) => !note.isArchived && !note.isDeleted).length,
    }
  })
}

export async function getNoteFolder(id: string): Promise<NoteFolder | null> {
  return noteFoldersRepo.getFolderById(id)
}

export async function createNoteFolder(input: NoteFolderInput): Promise<NoteFolder> {
  const normalizedName = normalizeFolderName(input.name)
  if (!normalizedName) throw new Error('Folder name is required')

  const folders = await noteFoldersRepo.listAllFolders()
  const duplicate = folders.find((folder) => normalizeFolderName(folder.name) === normalizedName)
  if (duplicate) throw new Error(`Folder "${input.name.trim()}" already exists`)

  const description = input.description?.trim()
  return noteFoldersRepo.createFolder({
    ...input,
    name: input.name.trim(),
    description: description || undefined,
  })
}

export async function updateNoteFolder(id: string, input: Partial<NoteFolder>): Promise<NoteFolder> {
  return noteFoldersRepo.updateFolder(id, input)
}

export async function archiveNoteFolder(id: string): Promise<NoteFolder> {
  return noteFoldersRepo.archiveFolder(id)
}

export async function restoreNoteFolder(id: string): Promise<NoteFolder> {
  return noteFoldersRepo.restoreFolder(id)
}

function normalizeFolderName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}
