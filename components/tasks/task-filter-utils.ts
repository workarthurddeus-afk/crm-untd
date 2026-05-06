import type {
  Task,
  TaskCategory,
  TaskColor,
  TaskImportance,
  TaskSource,
  TaskStatus,
} from '@/lib/types'
import {
  TASK_CATEGORY_OPTIONS,
  TASK_COLOR_OPTIONS,
  TASK_IMPORTANCE_OPTIONS,
  TASK_SOURCE_OPTIONS,
  TASK_STATUS_OPTIONS,
} from './task-form-utils'

export type TaskDueFilter = 'all' | 'overdue' | 'today' | 'this-week' | 'upcoming' | 'no-date'
export type TaskCompletionFilter = 'all' | 'active' | 'completed' | 'cancelled'

export interface TaskAdvancedFilters {
  query: string
  statuses: TaskStatus[]
  importances: TaskImportance[]
  categories: TaskCategory[]
  due: TaskDueFilter
  sources: TaskSource[]
  relatedLeadIds: string[]
  relatedNoteIds: string[]
  tags: string[]
  colors: TaskColor[]
  completion: TaskCompletionFilter
}

export interface ActiveTaskFilter {
  id: string
  label: string
}

export const defaultTaskAdvancedFilters: TaskAdvancedFilters = {
  query: '',
  statuses: [],
  importances: [],
  categories: [],
  due: 'all',
  sources: [],
  relatedLeadIds: [],
  relatedNoteIds: [],
  tags: [],
  colors: [],
  completion: 'all',
}

const dueLabels: Record<TaskDueFilter, string> = {
  all: 'Todas as datas',
  overdue: 'Atrasadas',
  today: 'Hoje',
  'this-week': 'Esta semana',
  upcoming: 'Proximas',
  'no-date': 'Sem data',
}

const completionLabels: Record<TaskCompletionFilter, string> = {
  all: 'Todos os estados',
  active: 'Ativas',
  completed: 'Concluidas',
  cancelled: 'Canceladas',
}

function labelFromOptions<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T
): string {
  return options.find((option) => option.value === value)?.label ?? value
}

export function toggleTaskFilterValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function filterTasksAdvanced(
  tasks: Task[],
  filters: TaskAdvancedFilters,
  today = new Date()
): Task[] {
  return tasks.filter((task) => {
    if (!matchesQuery(task, filters.query)) return false
    if (!matchesAny(task.status, filters.statuses)) return false
    if (!matchesAny(task.importance, filters.importances)) return false
    if (!matchesAny(task.category, filters.categories)) return false
    if (!matchesAny(task.source, filters.sources)) return false
    if (!matchesAny(task.color, filters.colors)) return false
    if (!matchesAny(task.relatedLeadId, filters.relatedLeadIds)) return false
    if (!matchesAny(task.relatedNoteId, filters.relatedNoteIds)) return false
    if (!matchesTags(task, filters.tags)) return false
    if (!matchesCompletion(task, filters.completion)) return false
    if (!matchesDue(task, filters.due, today)) return false
    return true
  })
}

export function getActiveTaskFiltersCount(filters: TaskAdvancedFilters): number {
  return getActiveTaskFilters(filters).length
}

export function getActiveTaskFilters(filters: TaskAdvancedFilters): ActiveTaskFilter[] {
  const active: ActiveTaskFilter[] = []

  if (filters.query.trim()) {
    active.push({ id: 'query', label: `Busca: ${filters.query.trim()}` })
  }
  if (filters.due !== defaultTaskAdvancedFilters.due) {
    active.push({ id: 'due', label: dueLabels[filters.due] })
  }
  if (filters.completion !== defaultTaskAdvancedFilters.completion) {
    active.push({ id: 'completion', label: completionLabels[filters.completion] })
  }

  for (const status of filters.statuses) {
    active.push({
      id: `status:${status}`,
      label: labelFromOptions(TASK_STATUS_OPTIONS, status),
    })
  }
  for (const importance of filters.importances) {
    active.push({
      id: `importance:${importance}`,
      label: labelFromOptions(TASK_IMPORTANCE_OPTIONS, importance),
    })
  }
  for (const category of filters.categories) {
    active.push({
      id: `category:${category}`,
      label: labelFromOptions(TASK_CATEGORY_OPTIONS, category),
    })
  }
  for (const source of filters.sources) {
    active.push({
      id: `source:${source}`,
      label: labelFromOptions(TASK_SOURCE_OPTIONS, source),
    })
  }
  for (const color of filters.colors) {
    active.push({
      id: `color:${color}`,
      label: labelFromOptions(TASK_COLOR_OPTIONS, color),
    })
  }
  for (const leadId of filters.relatedLeadIds) {
    active.push({ id: `lead:${leadId}`, label: 'Lead relacionado' })
  }
  for (const noteId of filters.relatedNoteIds) {
    active.push({ id: `note:${noteId}`, label: 'Nota relacionada' })
  }
  for (const tag of filters.tags) {
    active.push({ id: `tag:${tag}`, label: `#${tag}` })
  }

  return active
}

export function removeTaskFilterById(
  filters: TaskAdvancedFilters,
  id: string
): TaskAdvancedFilters {
  if (id === 'query') return { ...filters, query: defaultTaskAdvancedFilters.query }
  if (id === 'due') return { ...filters, due: defaultTaskAdvancedFilters.due }
  if (id === 'completion') {
    return { ...filters, completion: defaultTaskAdvancedFilters.completion }
  }

  const [kind, value] = id.split(':')
  if (!kind || !value) return filters

  if (kind === 'status') {
    return { ...filters, statuses: filters.statuses.filter((item) => item !== value) }
  }
  if (kind === 'importance') {
    return { ...filters, importances: filters.importances.filter((item) => item !== value) }
  }
  if (kind === 'category') {
    return { ...filters, categories: filters.categories.filter((item) => item !== value) }
  }
  if (kind === 'source') {
    return { ...filters, sources: filters.sources.filter((item) => item !== value) }
  }
  if (kind === 'color') {
    return { ...filters, colors: filters.colors.filter((item) => item !== value) }
  }
  if (kind === 'lead') {
    return { ...filters, relatedLeadIds: filters.relatedLeadIds.filter((item) => item !== value) }
  }
  if (kind === 'note') {
    return { ...filters, relatedNoteIds: filters.relatedNoteIds.filter((item) => item !== value) }
  }
  if (kind === 'tag') {
    return { ...filters, tags: filters.tags.filter((item) => item !== value) }
  }

  return filters
}

export function normalizeTaskTag(tag: string): string {
  return tag.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-')
}

function matchesQuery(task: Task, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    task.title,
    task.description ?? '',
    ...task.tagIds,
  ].join(' ').toLowerCase()

  return haystack.includes(normalized)
}

function matchesTags(task: Task, tags: string[]): boolean {
  if (tags.length === 0) return true
  const taskTags = new Set(task.tagIds.map(normalizeTaskTag))
  return tags.some((tag) => taskTags.has(normalizeTaskTag(tag)))
}

function matchesAny<T extends string>(value: T | undefined, accepted: T[]): boolean {
  if (accepted.length === 0) return true
  return value !== undefined && accepted.includes(value)
}

function matchesCompletion(task: Task, completion: TaskCompletionFilter): boolean {
  if (completion === 'all') return true
  if (completion === 'active') return task.status === 'pending' || task.status === 'in-progress'
  if (completion === 'completed') return task.status === 'done'
  return task.status === 'cancelled'
}

function matchesDue(task: Task, due: TaskDueFilter, today: Date): boolean {
  if (due === 'all') return true
  if (!task.dueDate) return due === 'no-date'

  const taskDay = startOfUtcDay(new Date(task.dueDate)).getTime()
  const todayStart = startOfUtcDay(today).getTime()
  const weekEnd = todayStart + 7 * 24 * 60 * 60 * 1000

  if (due === 'overdue') return taskDay < todayStart
  if (due === 'today') return taskDay === todayStart
  if (due === 'this-week') return taskDay >= todayStart && taskDay < weekEnd
  if (due === 'upcoming') return taskDay > todayStart
  return false
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}
