import { describe, expect, it } from 'vitest'
import {
  defaultTaskAdvancedFilters,
  filterTasksAdvanced,
  getActiveTaskFilters,
  getActiveTaskFiltersCount,
  removeTaskFilterById,
} from '../task-filter-utils'
import type { Task } from '@/lib/types'

const today = new Date('2026-05-05T12:00:00.000Z')

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-test',
    title: 'Revisar proposta comercial',
    description: 'Ajustar promessa e follow-up antes de enviar.',
    dueDate: '2026-05-05T09:00:00.000Z',
    importance: 'medium',
    status: 'pending',
    category: 'follow-up',
    source: 'manual',
    color: 'purple',
    tagIds: ['sales', 'proposal'],
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('filterTasksAdvanced', () => {
  it('searches title, description and tags', () => {
    const tasks = [
      makeTask({ id: 'title', title: 'Preparar proposta premium', description: '' }),
      makeTask({ id: 'description', title: 'Outro', description: 'Contem follow-up sensivel' }),
      makeTask({ id: 'tag', title: 'Outro', description: '', tagIds: ['brandkit'] }),
      makeTask({ id: 'miss', title: 'Nada', description: 'Sem match', tagIds: [] }),
    ]

    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, query: 'proposta' }, today).map((t) => t.id)).toEqual(['title'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, query: 'follow' }, today).map((t) => t.id)).toEqual(['description'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, query: 'brandkit' }, today).map((t) => t.id)).toEqual(['tag'])
  })

  it('filters by status, importance, category, source, color and relations', () => {
    const tasks = [
      makeTask({
        id: 'match',
        status: 'in-progress',
        importance: 'high',
        category: 'strategy',
        source: 'note',
        color: 'blue',
        relatedLeadId: 'lead-001',
        relatedNoteId: 'note-001',
      }),
      makeTask({ id: 'miss', status: 'pending', importance: 'low', category: 'ops' }),
    ]

    const result = filterTasksAdvanced(
      tasks,
      {
        ...defaultTaskAdvancedFilters,
        statuses: ['in-progress'],
        importances: ['high'],
        categories: ['strategy'],
        sources: ['note'],
        colors: ['blue'],
        relatedLeadIds: ['lead-001'],
        relatedNoteIds: ['note-001'],
      },
      today
    )

    expect(result.map((task) => task.id)).toEqual(['match'])
  })

  it('filters due ranges including overdue, today, this week, upcoming and no date', () => {
    const tasks = [
      makeTask({ id: 'overdue', dueDate: '2026-05-04T09:00:00.000Z' }),
      makeTask({ id: 'today', dueDate: '2026-05-05T09:00:00.000Z' }),
      makeTask({ id: 'week', dueDate: '2026-05-08T09:00:00.000Z' }),
      makeTask({ id: 'upcoming', dueDate: '2026-05-20T09:00:00.000Z' }),
      makeTask({ id: 'none', dueDate: undefined }),
    ]

    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, due: 'overdue' }, today).map((t) => t.id)).toEqual(['overdue'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, due: 'today' }, today).map((t) => t.id)).toEqual(['today'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, due: 'this-week' }, today).map((t) => t.id)).toEqual(['today', 'week'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, due: 'upcoming' }, today).map((t) => t.id)).toEqual(['week', 'upcoming'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, due: 'no-date' }, today).map((t) => t.id)).toEqual(['none'])
  })

  it('filters active, completed and cancelled task states', () => {
    const tasks = [
      makeTask({ id: 'pending', status: 'pending' }),
      makeTask({ id: 'progress', status: 'in-progress' }),
      makeTask({ id: 'done', status: 'done' }),
      makeTask({ id: 'cancelled', status: 'cancelled' }),
    ]

    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, completion: 'active' }, today).map((t) => t.id)).toEqual(['pending', 'progress'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, completion: 'completed' }, today).map((t) => t.id)).toEqual(['done'])
    expect(filterTasksAdvanced(tasks, { ...defaultTaskAdvancedFilters, completion: 'cancelled' }, today).map((t) => t.id)).toEqual(['cancelled'])
  })

  it('filters by any selected tag and counts active filters', () => {
    const tasks = [
      makeTask({ id: 'sales', tagIds: ['sales'] }),
      makeTask({ id: 'brandkit', tagIds: ['brandkit'] }),
    ]
    const filters = {
      ...defaultTaskAdvancedFilters,
      query: 'revisar',
      tags: ['brandkit'],
      due: 'today' as const,
      completion: 'active' as const,
    }

    expect(filterTasksAdvanced(tasks, filters, today).map((task) => task.id)).toEqual(['brandkit'])
    expect(getActiveTaskFiltersCount(filters)).toBe(4)
    expect(getActiveTaskFilters(filters).map((filter) => filter.id)).toEqual([
      'query',
      'due',
      'completion',
      'tag:brandkit',
    ])
  })

  it('removes a single active filter by chip id', () => {
    const filters = {
      ...defaultTaskAdvancedFilters,
      query: 'proposta',
      statuses: ['pending' as const],
      tags: ['sales'],
    }

    expect(removeTaskFilterById(filters, 'query').query).toBe('')
    expect(removeTaskFilterById(filters, 'status:pending').statuses).toEqual([])
    expect(removeTaskFilterById(filters, 'tag:sales').tags).toEqual([])
  })
})
