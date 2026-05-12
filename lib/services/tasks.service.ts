import { tasksRepo } from '@/lib/repositories/tasks.repository'
import { taskInputSchema, taskUpdateSchema } from '@/lib/schemas/task'
import { calendarEventsRepo } from '@/lib/repositories/calendar-events.repository'
import {
  createCalendarEvent,
  transformTaskToCalendarEventPayload,
} from '@/lib/services/calendar.service'
import { nowIso } from '@/lib/utils/date'
import type {
  CalendarEvent,
  Lead,
  Note,
  Task,
  TaskCategory,
  TaskImportance,
  TaskInput,
} from '@/lib/types'

const importanceRank: Record<TaskImportance, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export interface DashboardTasksSummary {
  total: number
  open: number
  today: number
  overdue: number
  upcoming: number
  highImportance: number
  completedToday: number
  cancelled: number
}

export interface TaskStats extends DashboardTasksSummary {
  pending: number
  inProgress: number
  done: number
  byCategory: Record<TaskCategory, number>
}

export interface ScheduledTaskCalendarEvent {
  task: Task
  event: CalendarEvent
  created: boolean
}

export interface TaskCalendarSaveOptions {
  addToCalendar?: boolean
}

export interface TaskCalendarSaveResult {
  task: Task
  calendarEvent?: CalendarEvent
  calendarEventCreated: boolean
}

export function isOpenTask(task: Task): boolean {
  return task.status === 'pending' || task.status === 'in-progress'
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() === startOfUtcDay(b).getTime()
}

function dueDate(task: Task): Date | null {
  return task.dueDate ? new Date(task.dueDate) : null
}

function isSameUtcDateString(value: string | undefined, date: Date): boolean {
  if (!value) return false
  return isSameUtcDay(new Date(value), date)
}

function sortByImportanceThenDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const importanceDelta = importanceRank[a.importance] - importanceRank[b.importance]
    if (importanceDelta !== 0) return importanceDelta

    const dueDelta = (dueDate(a)?.getTime() ?? Infinity) - (dueDate(b)?.getTime() ?? Infinity)
    if (dueDelta !== 0) return dueDelta

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

function sortByDueThenImportance(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dueDelta = (dueDate(a)?.getTime() ?? Infinity) - (dueDate(b)?.getTime() ?? Infinity)
    if (dueDelta !== 0) return dueDelta

    const importanceDelta = importanceRank[a.importance] - importanceRank[b.importance]
    if (importanceDelta !== 0) return importanceDelta

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

export function tasksDueToday(tasks: Task[], today: Date): Task[] {
  return sortByImportanceThenDue(tasks.filter((task) => {
    const due = dueDate(task)
    return isOpenTask(task) && due !== null && isSameUtcDay(due, today)
  }))
}

export function tasksOverdue(tasks: Task[], today: Date): Task[] {
  const todayStart = startOfUtcDay(today).getTime()

  return sortByImportanceThenDue(tasks.filter((task) => {
    const due = dueDate(task)
    return isOpenTask(task) && due !== null && startOfUtcDay(due).getTime() < todayStart
  }))
}

export function tasksThisWeek(tasks: Task[], today: Date): Task[] {
  const todayStart = startOfUtcDay(today).getTime()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  const weekEnd = todayStart + sevenDaysMs

  return sortByDueThenImportance(tasks.filter((task) => {
    const due = dueDate(task)
    if (!isOpenTask(task) || due === null) return false

    const dueTime = startOfUtcDay(due).getTime()
    return dueTime >= todayStart && dueTime < weekEnd
  }))
}

export function buildDailyPlan(tasks: Task[], today: Date): Task[] {
  const taskById = new Map<string, Task>()

  for (const task of [...tasksOverdue(tasks, today), ...tasksDueToday(tasks, today)]) {
    taskById.set(task.id, task)
  }

  return [...taskById.values()].sort((a, b) => {
    const overdueDelta =
      Number(tasksOverdue([b], today).length > 0) - Number(tasksOverdue([a], today).length > 0)
    if (overdueDelta !== 0) return overdueDelta

    const importanceDelta = importanceRank[a.importance] - importanceRank[b.importance]
    if (importanceDelta !== 0) return importanceDelta

    return (dueDate(a)?.getTime() ?? 0) - (dueDate(b)?.getTime() ?? 0)
  })
}

export async function createTask(input: TaskInput): Promise<Task> {
  const parsed = taskInputSchema.parse(input)
  const stamped = applyStatusMetadata(parsed)
  return tasksRepo.create(stamped)
}

export async function createTaskWithCalendar(
  input: TaskInput,
  options: TaskCalendarSaveOptions = {}
): Promise<TaskCalendarSaveResult> {
  if (options.addToCalendar && !input.dueDate) {
    throw new Error('Defina uma data para adicionar a tarefa ao calendario.')
  }

  const task = await createTask(input)
  if (!options.addToCalendar) {
    return { task, calendarEventCreated: false }
  }

  const scheduled = await syncTaskCalendarEvent(task)
  return {
    task: scheduled.task,
    calendarEvent: scheduled.event,
    calendarEventCreated: scheduled.created,
  }
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const existing = await tasksRepo.getById(id)
  if (!existing) throw new Error(`Task ${id} not found`)

  const parsed = taskUpdateSchema.parse(input)
  return tasksRepo.update(id, applyStatusMetadata({ ...existing, ...parsed }))
}

export async function updateTaskWithCalendar(
  id: string,
  input: Partial<TaskInput>,
  options: TaskCalendarSaveOptions = {}
): Promise<TaskCalendarSaveResult> {
  const existing = await tasksRepo.getById(id)
  if (!existing) throw new Error(`Task ${id} not found`)

  const shouldSyncCalendar = options.addToCalendar || Boolean(existing.relatedCalendarEventId)
  if (shouldSyncCalendar && !('dueDate' in input ? input.dueDate : existing.dueDate)) {
    throw new Error('Defina uma data para adicionar a tarefa ao calendario.')
  }

  const updated = await updateTask(id, input)

  if (!shouldSyncCalendar) {
    return { task: updated, calendarEventCreated: false }
  }

  const scheduled = await syncTaskCalendarEvent(updated)
  return {
    task: scheduled.task,
    calendarEvent: scheduled.event,
    calendarEventCreated: scheduled.created,
  }
}

export async function completeTask(id: string, completedAt = nowIso()): Promise<Task> {
  return tasksRepo.update(id, {
    status: 'done',
    completedAt,
    cancelledAt: undefined,
  })
}

export async function reopenTask(
  id: string,
  status: Extract<Task['status'], 'pending' | 'in-progress'> = 'pending'
): Promise<Task> {
  return tasksRepo.update(id, {
    status,
    completedAt: undefined,
    cancelledAt: undefined,
  })
}

export const uncompleteTask = reopenTask

export async function cancelTask(id: string, cancelledAt = nowIso()): Promise<Task> {
  return tasksRepo.update(id, {
    status: 'cancelled',
    cancelledAt,
    completedAt: undefined,
  })
}

export async function postponeTask(id: string, newDueDate: string): Promise<Task> {
  return tasksRepo.update(id, { dueDate: newDueDate })
}

export async function scheduleTaskOnCalendar(taskId: string): Promise<ScheduledTaskCalendarEvent> {
  const task = await tasksRepo.getById(taskId)
  if (!task) throw new Error(`Task ${taskId} not found`)

  if (!task.dueDate) throw new Error('Defina uma data para adicionar a tarefa ao calendario.')

  return syncTaskCalendarEvent(task)
}

async function syncTaskCalendarEvent(task: Task): Promise<ScheduledTaskCalendarEvent> {
  if (task.relatedCalendarEventId) {
    const existing = await calendarEventsRepo.getEventById(task.relatedCalendarEventId)
    if (existing) {
      const event = await calendarEventsRepo.updateEvent(existing.id, transformTaskToCalendarEventPayload(task))
      return { task, event, created: false }
    }
  }

  const [existingByTask] = await calendarEventsRepo.getEventsByTaskId(task.id)
  if (existingByTask) {
    const event = await calendarEventsRepo.updateEvent(existingByTask.id, transformTaskToCalendarEventPayload(task))
    const syncedTask = task.relatedCalendarEventId === event.id
      ? task
      : await tasksRepo.update(task.id, { relatedCalendarEventId: event.id })
    return { task: syncedTask, event, created: false }
  }

  const event = await createCalendarEvent(transformTaskToCalendarEventPayload(task))
  const updatedTask = await tasksRepo.update(task.id, {
    relatedCalendarEventId: event.id,
  })

  return { task: updatedTask, event, created: true }
}

export async function getTodayTasks(date = new Date()): Promise<Task[]> {
  return tasksDueToday(await tasksRepo.list(), date)
}

export async function getOverdueTasks(date = new Date()): Promise<Task[]> {
  return tasksOverdue(await tasksRepo.list(), date)
}

export async function getThisWeekTasks(date = new Date()): Promise<Task[]> {
  return tasksThisWeek(await tasksRepo.list(), date)
}

export async function getUpcomingTasks(daysAhead = 14, date = new Date()): Promise<Task[]> {
  const tasks = await tasksRepo.list()
  const todayStart = startOfUtcDay(date).getTime()
  const windowEnd = todayStart + daysAhead * 24 * 60 * 60 * 1000

  return sortByDueThenImportance(tasks.filter((task) => {
    const due = dueDate(task)
    if (!isOpenTask(task) || due === null) return false

    const dueTime = startOfUtcDay(due).getTime()
    return dueTime > todayStart && dueTime <= windowEnd
  }))
}

export async function getHighImportanceTasks(): Promise<Task[]> {
  return sortByDueThenImportance(
    (await tasksRepo.list()).filter((task) => isOpenTask(task) && task.importance === 'high')
  )
}

export async function getTasksForLead(leadId: string): Promise<Task[]> {
  return sortByDueThenImportance(await tasksRepo.list({ relatedLeadId: leadId }))
}

export async function getTasksForNote(noteId: string): Promise<Task[]> {
  return sortByDueThenImportance(await tasksRepo.list({ relatedNoteId: noteId }))
}

export async function getActionPlanForDay(date = new Date()): Promise<Task[]> {
  return buildDailyPlan(await tasksRepo.list(), date)
}

export async function getDashboardTasksSummary(date = new Date()): Promise<DashboardTasksSummary> {
  const tasks = await tasksRepo.list()
  const openTasks = tasks.filter(isOpenTask)

  return {
    total: tasks.length,
    open: openTasks.length,
    today: tasksDueToday(tasks, date).length,
    overdue: tasksOverdue(tasks, date).length,
    upcoming: (await getUpcomingTasks(7, date)).length,
    highImportance: openTasks.filter((task) => task.importance === 'high').length,
    completedToday: tasks.filter((task) => task.status === 'done' && isSameUtcDateString(task.completedAt, date)).length,
    cancelled: tasks.filter((task) => task.status === 'cancelled').length,
  }
}

export async function getTaskStats(date = new Date()): Promise<TaskStats> {
  const tasks = await tasksRepo.list()
  const summary = await getDashboardTasksSummary(date)

  return {
    ...summary,
    pending: tasks.filter((task) => task.status === 'pending').length,
    inProgress: tasks.filter((task) => task.status === 'in-progress').length,
    done: tasks.filter((task) => task.status === 'done').length,
    byCategory: tasks.reduce<Record<TaskCategory, number>>((acc, task) => {
      acc[task.category] = (acc[task.category] ?? 0) + 1
      return acc
    }, {} as Record<TaskCategory, number>),
  }
}

export function transformLeadToFollowUpTaskPayload(lead: Lead): TaskInput {
  return {
    title: `Follow-up com ${lead.name}`,
    description: `Retomar conversa com ${lead.name} (${lead.company}) e definir proximo passo comercial.`,
    dueDate: lead.nextFollowUpAt ?? nowIso(),
    importance: lead.temperature === 'hot' || lead.icpScore >= 80 ? 'high' : 'medium',
    status: 'pending',
    category: 'follow-up',
    relatedLeadId: lead.id,
    source: 'lead',
    tagIds: ['follow-up', ...lead.tagIds],
  }
}

export function transformNoteToTaskPayload(note: Note): TaskInput {
  return {
    title: `Executar: ${note.title}`,
    description: note.excerpt ?? note.content.slice(0, 240),
    importance: note.priority === 'high' || note.impact === 'high' ? 'high' : note.priority,
    status: 'pending',
    category: getCategoryFromNote(note),
    relatedNoteId: note.id,
    relatedLeadId: note.relatedLeadId ?? undefined,
    source: 'note',
    tagIds: note.tags.length > 0 ? note.tags : note.tagIds,
  }
}

export function transformCalendarEventToTaskPayload(event: CalendarEvent): TaskInput {
  return {
    title: `Preparar: ${event.title}`,
    description: event.description,
    dueDate: event.startAt,
    importance: event.importance === 'critical' ? 'high' : event.priority,
    status: 'pending',
    category: getCategoryFromCalendarEvent(event),
    relatedCalendarEventId: event.id,
    relatedLeadId: event.relatedLeadId ?? undefined,
    relatedNoteId: event.relatedNoteId ?? undefined,
    relatedFeedbackId: event.relatedFeedbackId ?? undefined,
    source: 'calendar',
    tagIds: event.tags,
  }
}

function applyStatusMetadata(input: TaskInput): TaskInput {
  if (input.status === 'done') {
    return {
      ...input,
      completedAt: input.completedAt ?? nowIso(),
      cancelledAt: undefined,
    }
  }

  if (input.status === 'cancelled') {
    return {
      ...input,
      cancelledAt: input.cancelledAt ?? nowIso(),
      completedAt: undefined,
    }
  }

  return {
    ...input,
    completedAt: undefined,
    cancelledAt: undefined,
  }
}

function getCategoryFromNote(note: Note): TaskCategory {
  if (note.type === 'meeting') return 'meeting'
  if (note.type === 'campaign') return 'meta-ads'
  if (note.type === 'copy') return 'content'
  if (note.type === 'ui') return 'design'
  if (note.type === 'product' || note.type === 'feature' || note.type === 'bug') return 'product'
  return 'strategy'
}

function getCategoryFromCalendarEvent(event: CalendarEvent): TaskCategory {
  if (event.type === 'meeting' || event.type === 'call' || event.type === 'presentation') return 'meeting'
  if (event.type === 'prospecting') return 'prospecting'
  if (event.type === 'follow_up') return 'follow-up'
  if (event.type === 'design') return 'design'
  if (event.type === 'content' || event.type === 'social_media') return 'content'
  if (event.type === 'meta_ads') return 'meta-ads'
  if (event.type === 'product') return 'product'
  if (event.type === 'strategy' || event.type === 'review') return 'strategy'
  return 'ops'
}
