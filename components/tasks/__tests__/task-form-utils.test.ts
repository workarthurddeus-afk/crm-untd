import { describe, expect, it } from 'vitest'
import {
  NO_TASK_RELATION_VALUE,
  buildTaskPayloadFromForm,
  getDefaultTaskFormState,
  taskToFormState,
} from '../task-form-utils'
import type { Task } from '@/lib/types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-001',
    title: 'Preparar follow-up',
    description: 'Revisar contexto antes de falar com o lead.',
    dueDate: '2026-05-06T14:30:00.000Z',
    importance: 'high',
    status: 'pending',
    category: 'follow-up',
    relatedLeadId: 'lead-001',
    relatedNoteId: 'note-001',
    source: 'lead',
    color: 'purple',
    tagIds: ['follow-up', 'sales'],
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('task form utils', () => {
  it('creates a clean default state for new tasks', () => {
    const form = getDefaultTaskFormState()

    expect(form).toMatchObject({
      title: '',
      importance: 'medium',
      status: 'pending',
      category: 'ops',
      source: 'manual',
      color: 'purple',
      relatedLeadId: NO_TASK_RELATION_VALUE,
      relatedNoteId: NO_TASK_RELATION_VALUE,
    })
  })

  it('maps an existing task into editable form values', () => {
    const form = taskToFormState(makeTask())

    expect(form).toMatchObject({
      title: 'Preparar follow-up',
      dueDate: '2026-05-06',
      dueTime: '14:30',
      tags: 'follow-up, sales',
      relatedLeadId: 'lead-001',
      relatedNoteId: 'note-001',
    })
  })

  it('builds a task payload with normalized optional fields', () => {
    const payload = buildTaskPayloadFromForm({
      ...getDefaultTaskFormState(),
      title: '  Revisar proposta  ',
      description: '  Ajustar escopo antes de enviar. ',
      dueDate: '2026-05-08',
      dueTime: '09:15',
      importance: 'high',
      category: 'strategy',
      tags: ' sales, proposta,, follow-up ',
      relatedLeadId: NO_TASK_RELATION_VALUE,
      relatedNoteId: 'note-002',
    })

    expect(payload).toMatchObject({
      title: 'Revisar proposta',
      description: 'Ajustar escopo antes de enviar.',
      dueDate: '2026-05-08T09:15:00.000Z',
      importance: 'high',
      category: 'strategy',
      relatedLeadId: undefined,
      relatedNoteId: 'note-002',
      tagIds: ['sales', 'proposta', 'follow-up'],
    })
  })
})
