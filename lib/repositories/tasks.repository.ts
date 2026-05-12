import { tasksSeed } from '@/lib/mocks/seeds/tasks.seed'
import type { Task } from '@/lib/types'
import { createMockRepository } from './mock-storage'
import { createTasksSupabaseRepository, type TasksRepository } from './tasks.supabase.repository'

const localTasksStorageRepo = createMockRepository<Task>('untd-tasks', tasksSeed)

export type TasksDataSource = 'local' | 'supabase'

export function resolveTasksDataSource(value: string | undefined): TasksDataSource {
  return value === 'supabase' ? 'supabase' : 'local'
}

export function createTasksRepository(
  dataSource: TasksDataSource = resolveTasksDataSource(process.env.NEXT_PUBLIC_DATA_SOURCE)
): TasksRepository {
  if (dataSource === 'supabase') return createTasksSupabaseRepository()
  return createLocalTasksRepository()
}

function hasArchivedAtFilter(filters?: Partial<Task>): boolean {
  return Boolean(filters && Object.prototype.hasOwnProperty.call(filters, 'archivedAt'))
}

function matchesFilters(task: Task, filters?: Partial<Task>): boolean {
  if (!filters) return true
  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined) return true
    return (task as unknown as Record<string, unknown>)[key] === value
  })
}

function createLocalTasksRepository(): TasksRepository {
  return {
    async list(filters?: Partial<Task>): Promise<Task[]> {
      const tasks = await localTasksStorageRepo.list()
      const visibleTasks = hasArchivedAtFilter(filters)
        ? tasks
        : tasks.filter((task) => !task.archivedAt)
      return visibleTasks.filter((task) => matchesFilters(task, filters))
    },
    getById(id: string): Promise<Task | null> {
      return localTasksStorageRepo.getById(id)
    },
    create(data): Promise<Task> {
      return localTasksStorageRepo.create(data)
    },
    update(id: string, data: Partial<Task>): Promise<Task> {
      return localTasksStorageRepo.update(id, data)
    },
    delete(id: string): Promise<void> {
      return localTasksStorageRepo.delete(id)
    },
    reset(): Promise<void> {
      return localTasksStorageRepo.reset()
    },
    clear(): Promise<void> {
      return localTasksStorageRepo.clear()
    },
    seedDemoData(): Promise<void> {
      return localTasksStorageRepo.seedDemoData()
    },
    subscribe(listener: () => void): () => void {
      return localTasksStorageRepo.subscribe(listener)
    },
  }
}

const localTasksRepo = createLocalTasksRepository()
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
