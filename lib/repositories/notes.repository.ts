import { notesSeed } from '@/lib/mocks/seeds/notes.seed'
import type { Note } from '@/lib/types'
import { createMockRepository } from './mock-storage'

export const notesRepo = createMockRepository<Note>('untd-notes', notesSeed)
