import type {
  Task,
  TaskCategory,
  TaskColor,
  TaskImportance,
  TaskInput,
  TaskSource,
  TaskStatus,
} from '@/lib/types'

export const NO_TASK_RELATION_VALUE = '__none__'

export const TASK_IMPORTANCE_OPTIONS: Array<{ value: TaskImportance; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
]

export const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in-progress', label: 'Em progresso' },
  { value: 'done', label: 'Concluida' },
  { value: 'cancelled', label: 'Cancelada' },
]

export const TASK_CATEGORY_OPTIONS: Array<{ value: TaskCategory; label: string }> = [
  { value: 'prospecting', label: 'Prospeccao' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'meeting', label: 'Reuniao' },
  { value: 'product', label: 'Produto' },
  { value: 'design', label: 'Design' },
  { value: 'content', label: 'Conteudo' },
  { value: 'social', label: 'Social' },
  { value: 'meta-ads', label: 'Meta Ads' },
  { value: 'strategy', label: 'Estrategia' },
  { value: 'study', label: 'Estudo' },
  { value: 'ops', label: 'Operacoes' },
  { value: 'other', label: 'Outro' },
]

export const TASK_SOURCE_OPTIONS: Array<{ value: TaskSource; label: string }> = [
  { value: 'manual', label: 'Manual' },
  { value: 'lead', label: 'Lead' },
  { value: 'note', label: 'Nota' },
  { value: 'calendar', label: 'Calendario' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'crm', label: 'CRM' },
]

export const TASK_COLOR_OPTIONS: Array<{ value: TaskColor; label: string; className: string }> = [
  { value: 'default', label: 'Padrao', className: 'bg-text-muted' },
  { value: 'purple', label: 'Roxo', className: 'bg-primary' },
  { value: 'violet', label: 'Violeta', className: 'bg-violet-400' },
  { value: 'blue', label: 'Azul', className: 'bg-blue-400' },
  { value: 'cyan', label: 'Ciano', className: 'bg-cyan-400' },
  { value: 'green', label: 'Verde', className: 'bg-success' },
  { value: 'yellow', label: 'Amarelo', className: 'bg-warning' },
  { value: 'orange', label: 'Laranja', className: 'bg-orange-400' },
  { value: 'red', label: 'Vermelho', className: 'bg-danger' },
  { value: 'pink', label: 'Rosa', className: 'bg-pink-400' },
  { value: 'slate', label: 'Slate', className: 'bg-slate-400' },
]

export interface TaskFormState {
  title: string
  description: string
  dueDate: string
  dueTime: string
  importance: TaskImportance
  status: TaskStatus
  category: TaskCategory
  tags: string
  relatedLeadId: string
  relatedNoteId: string
  source: TaskSource
  color: TaskColor
  addToCalendar: boolean
}

export function getDefaultTaskFormState(): TaskFormState {
  return {
    title: '',
    description: '',
    dueDate: '',
    dueTime: '09:00',
    importance: 'medium',
    status: 'pending',
    category: 'ops',
    tags: '',
    relatedLeadId: NO_TASK_RELATION_VALUE,
    relatedNoteId: NO_TASK_RELATION_VALUE,
    source: 'manual',
    color: 'purple',
    addToCalendar: false,
  }
}

export function taskToFormState(task: Task | null | undefined): TaskFormState {
  if (!task) return getDefaultTaskFormState()

  return {
    title: task.title,
    description: task.description ?? '',
    dueDate: isoToDateInput(task.dueDate),
    dueTime: isoToTimeInput(task.dueDate),
    importance: task.importance,
    status: task.status,
    category: task.category,
    tags: task.tagIds.join(', '),
    relatedLeadId: task.relatedLeadId ?? NO_TASK_RELATION_VALUE,
    relatedNoteId: task.relatedNoteId ?? NO_TASK_RELATION_VALUE,
    source: task.source ?? 'manual',
    color: task.color ?? 'purple',
    addToCalendar: Boolean(task.relatedCalendarEventId),
  }
}

export function buildTaskPayloadFromForm(form: TaskFormState): TaskInput {
  return {
    title: form.title.trim(),
    description: optionalText(form.description),
    dueDate: combineDateTimeUtc(form.dueDate, form.dueTime),
    importance: form.importance,
    status: form.status,
    category: form.category,
    relatedLeadId: relationValue(form.relatedLeadId),
    relatedNoteId: relationValue(form.relatedNoteId),
    source: form.source,
    color: form.color,
    tagIds: parseTaskTags(form.tags),
  }
}

export function parseTaskTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean)
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function relationValue(value: string): string | undefined {
  return value === NO_TASK_RELATION_VALUE ? undefined : value
}

function isoToDateInput(value: string | undefined): string {
  if (!value) return ''
  return value.slice(0, 10)
}

function isoToTimeInput(value: string | undefined): string {
  if (!value) return '09:00'
  const match = /T(\d{2}:\d{2})/.exec(value)
  return match?.[1] ?? '09:00'
}

function combineDateTimeUtc(date: string, time: string): string | undefined {
  if (!date) return undefined
  return new Date(`${date}T${time || '09:00'}:00.000Z`).toISOString()
}
