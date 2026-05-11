import { tasksSeed } from '@/lib/mocks/seeds/tasks.seed'
import type { Task } from '@/lib/types'
import { createMockRepository } from './mock-storage'
import { createTasksSupabaseRepository, type TasksRepository } from './tasks.supabase.repository'

const localTasksRepo = createMockRepository<Task>('untd-tasks', tasksSeed)

export type TasksDataSource = 'local' | 'supabase'

export function resolveTasksDataSource(value: string | undefined): TasksDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export function createTasksRepository(
  dataSource: TasksDataSource = resolveTasksDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): TasksRepository {
  if (dataSource === 'supabase') return createTasksSupabaseRepository()
  return localTasksRepo
}

let supabaseTasksRepo: TasksRepository | null = null

function getActiveTasksRepository(): TasksRepository {
  if (resolveTasksDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE) !== 'supabase') {
    return localTasksRepo
  }

  supabaseTasksRepo ??= createTasksSupabaseRepository()
  return supabaseTasksRepo
}

export const tasksRepo = new Proxy({} as TasksRepository, {
  get(_target, property: keyof TasksRepository) {
    if (property === 'subscribe') {
      return (listener: () => void) => getActiveTasksRepository().subscribe(listener)
    }

    return async (...args: unknown[]) => {
      const repository = getActiveTasksRepository()
      const value = repository[property]
      if (typeof value !== 'function') return value
      return (value as (...items: unknown[]) => unknown).apply(repository, args)
    }
  },
})
