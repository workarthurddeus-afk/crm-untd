import { tasksSeed } from '@/lib/mocks/seeds/tasks.seed'
import type { Task } from '@/lib/types'
import { createMockRepository } from './mock-storage'

export const tasksRepo = createMockRepository<Task>('untd-tasks', tasksSeed)
