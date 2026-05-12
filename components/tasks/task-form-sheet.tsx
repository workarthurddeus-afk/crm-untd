'use client'

import { useMemo, useState } from 'react'
import {
  CalendarClock,
  CalendarCheck2,
  CalendarPlus,
  CheckCircle2,
  Clipboard,
  Flag,
  Loader2,
  PauseCircle,
  RotateCcw,
  Save,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import type { Lead, Note, Task, TaskInput } from '@/lib/types'
import {
  NO_TASK_RELATION_VALUE,
  TASK_CATEGORY_OPTIONS,
  TASK_COLOR_OPTIONS,
  TASK_IMPORTANCE_OPTIONS,
  TASK_SOURCE_OPTIONS,
  TASK_STATUS_OPTIONS,
  buildTaskPayloadFromForm,
  getDefaultTaskFormState,
  taskToFormState,
  type TaskFormState,
} from './task-form-utils'

interface Props {
  open: boolean
  task: Task | null
  leads: Lead[]
  notes: Note[]
  onOpenChange: (open: boolean) => void
  onCreate: (input: TaskInput, options?: { addToCalendar?: boolean }) => Promise<Task>
  onUpdate: (id: string, input: Partial<TaskInput>, options?: { addToCalendar?: boolean }) => Promise<Task>
  onComplete: (id: string) => Promise<Task>
  onReopen: (id: string) => Promise<Task>
  onCancelTask: (id: string) => Promise<Task>
  onPostpone: (id: string, dueDate: string) => Promise<Task>
  onScheduleOnCalendar: (id: string) => Promise<{ task: Task; created: boolean }>
}

type BusyAction =
  | 'save'
  | 'complete'
  | 'reopen'
  | 'cancel'
  | 'postpone'
  | 'schedule'
  | 'copy'
  | null

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

function TaskField({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-text-secondary">
        {label}
      </Label>
      {children}
      <div className="min-h-[1rem] text-[11px] leading-tight">
        {error ? (
          <span id={`${htmlFor}-error`} role="alert" className="text-danger">
            {error}
          </span>
        ) : hint ? (
          <span className="text-text-secondary">{hint}</span>
        ) : null}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="font-display text-sm font-semibold text-text">{children}</h3>
      <Separator className="flex-1" />
    </div>
  )
}

function nextDayIso(value: string | undefined): string {
  const base = value ? new Date(value) : new Date()
  if (!value) {
    base.setUTCHours(9, 0, 0, 0)
  }
  base.setUTCDate(base.getUTCDate() + 1)
  return base.toISOString()
}

export function TaskFormSheet({
  open,
  task,
  leads,
  notes,
  onOpenChange,
  onCreate,
  onUpdate,
  onComplete,
  onReopen,
  onCancelTask,
  onPostpone,
  onScheduleOnCalendar,
}: Props) {
  const [form, setForm] = useState<TaskFormState>(() => getDefaultTaskFormState())
  const [titleError, setTitleError] = useState<string | undefined>()
  const [calendarError, setCalendarError] = useState<string | undefined>()
  const [busyAction, setBusyAction] = useState<BusyAction>(null)
  const isEdit = Boolean(task)
  const isBusy = busyAction !== null

  const seed = `${open ? '1' : '0'}|${task?.id ?? 'new'}|${task?.updatedAt ?? ''}`
  const [prevSeed, setPrevSeed] = useState(seed)
  if (open && seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(taskToFormState(task))
    setTitleError(undefined)
    setCalendarError(undefined)
    setBusyAction(null)
  } else if (!open && prevSeed !== seed) {
    setPrevSeed(seed)
  }

  const selectedColor = useMemo(
    () => TASK_COLOR_OPTIONS.find((option) => option.value === form.color),
    [form.color]
  )

  function update<K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'title' && String(value).trim()) {
      setTitleError(undefined)
    }
    if ((key === 'dueDate' || key === 'addToCalendar') && (key === 'addToCalendar' ? value === false : String(value))) {
      setCalendarError(undefined)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) {
      setTitleError('Digite um titulo para a tarefa.')
      return
    }
    if (form.addToCalendar && !form.dueDate) {
      setCalendarError('Defina uma data para criar o evento no calendario.')
      return
    }

    setBusyAction('save')
    try {
      const payload = buildTaskPayloadFromForm(form)
      if (task) {
        const updated = await onUpdate(task.id, payload, { addToCalendar: form.addToCalendar })
        setForm(taskToFormState(updated))
        toast.success(
          form.addToCalendar || updated.relatedCalendarEventId
            ? 'Tarefa atualizada e calendario sincronizado'
            : 'Tarefa atualizada',
          { description: updated.title }
        )
      } else {
        const created = await onCreate(payload, { addToCalendar: form.addToCalendar })
        setForm(taskToFormState(created))
        toast.success(
          form.addToCalendar ? 'Tarefa criada e adicionada ao calendario' : 'Tarefa criada',
          { description: created.title }
        )
      }
      onOpenChange(false)
    } catch (err) {
      toast.error('Falha ao salvar tarefa', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusyAction(null)
    }
  }

  async function runQuickAction(action: Exclude<BusyAction, 'save' | 'copy' | null>) {
    if (!task) return
    setBusyAction(action)
    try {
      const updated =
        action === 'complete'
          ? await onComplete(task.id)
          : action === 'reopen'
            ? await onReopen(task.id)
            : action === 'cancel'
              ? await onCancelTask(task.id)
              : await onPostpone(task.id, nextDayIso(task.dueDate))

      setForm(taskToFormState(updated))
      toast.success(
        action === 'complete'
          ? 'Tarefa concluida'
          : action === 'reopen'
            ? 'Tarefa reaberta'
            : action === 'cancel'
              ? 'Tarefa cancelada'
              : 'Tarefa adiada',
        { description: updated.title }
      )
    } catch (err) {
      toast.error('Acao nao concluida', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusyAction(null)
    }
  }

  async function handleCopy() {
    const value = [form.title.trim(), form.description.trim()].filter(Boolean).join('\n\n')
    if (!value) return
    setBusyAction('copy')
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Conteudo copiado')
    } catch (err) {
      toast.error('Nao foi possivel copiar', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusyAction(null)
    }
  }

  async function handleScheduleOnCalendar() {
    if (!task) return
    setBusyAction('schedule')
    try {
      const result = await onScheduleOnCalendar(task.id)
      setForm(taskToFormState(result.task))
      toast.success(result.created ? 'Tarefa agendada' : 'Tarefa ja estava agendada', {
        description: result.task.title,
      })
    } catch (err) {
      toast.error('Nao foi possivel agendar', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(560px,96vw)] max-w-[96vw]">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <SheetHeader className="bg-gradient-to-b from-surface-elevated to-surface">
            <div className="flex items-start gap-3 pr-8">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
                  'border-primary/25 bg-primary-muted text-primary'
                )}
              >
                {isEdit ? (
                  <Flag className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                ) : (
                  <CalendarClock className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                )}
              </span>
              <div className="min-w-0">
                <SheetTitle>{isEdit ? 'Editar tarefa' : 'Nova tarefa'}</SheetTitle>
                <SheetDescription>
                  {isEdit
                    ? 'Ajuste a acao, mude o prazo ou encerre o ciclo sem sair do fluxo.'
                    : 'Crie uma acao operacional com contexto suficiente para decidir rapido depois.'}
                </SheetDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant={form.importance === 'high' ? 'danger' : 'outline'}>
                {TASK_IMPORTANCE_OPTIONS.find((i) => i.value === form.importance)?.label}
              </Badge>
              <Badge variant={form.status === 'done' ? 'success' : form.status === 'cancelled' ? 'danger' : 'default'}>
                {TASK_STATUS_OPTIONS.find((s) => s.value === form.status)?.label}
              </Badge>
              {selectedColor && (
                <Badge variant="secondary">
                  <span className={cn('h-2 w-2 rounded-full', selectedColor.className)} />
                  {selectedColor.label}
                </Badge>
              )}
            </div>
          </SheetHeader>

          <SheetBody className="space-y-6">
            {isEdit && (
              <section className="rounded-xl border border-border-subtle bg-surface/45 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {form.status === 'done' || form.status === 'cancelled' ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void runQuickAction('reopen')}
                      disabled={isBusy}
                      className="min-h-11 justify-start"
                    >
                      <RotateCcw aria-hidden /> Reabrir
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void runQuickAction('complete')}
                      disabled={isBusy}
                      className="min-h-11 justify-start"
                    >
                      <CheckCircle2 aria-hidden /> Concluir
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void runQuickAction('postpone')}
                    disabled={isBusy}
                    className="min-h-11 justify-start"
                  >
                    <PauseCircle aria-hidden /> Adiar
                  </Button>
                  <Button
                    type="button"
                    variant={task?.relatedCalendarEventId ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => void handleScheduleOnCalendar()}
                    disabled={isBusy || Boolean(task?.relatedCalendarEventId)}
                    className="min-h-11 justify-start"
                  >
                    {task?.relatedCalendarEventId ? (
                      <>
                        <CalendarCheck2 aria-hidden /> Agendada
                      </>
                    ) : busyAction === 'schedule' ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden /> Agendando
                      </>
                    ) : (
                      <>
                        <CalendarPlus aria-hidden /> Agendar
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => void runQuickAction('cancel')}
                    disabled={isBusy || form.status === 'cancelled'}
                    className="min-h-11 justify-start"
                  >
                    <XCircle aria-hidden /> Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleCopy()}
                    disabled={isBusy || (!form.title.trim() && !form.description.trim())}
                    className="min-h-11 justify-start"
                  >
                    <Clipboard aria-hidden /> Copiar contexto
                  </Button>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <SectionTitle>Essencial</SectionTitle>
              <TaskField label="Titulo" htmlFor="task-title" error={titleError}>
                <Input
                  id="task-title"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="Enviar proposta, revisar oferta, preparar reunião..."
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? 'task-title-error' : undefined}
                  autoFocus
                />
              </TaskField>
              <TaskField label="Descricao" htmlFor="task-description">
                <Textarea
                  id="task-description"
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="Contexto, criterio de sucesso ou proximo passo claro."
                  rows={4}
                />
              </TaskField>
            </section>

            <section className="space-y-4">
              <SectionTitle>Prazo e prioridade</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <TaskField label="Data" htmlFor="task-due-date">
                  <Input
                    id="task-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => update('dueDate', event.target.value)}
                  />
                </TaskField>
                <TaskField label="Hora" htmlFor="task-due-time">
                  <Input
                    id="task-due-time"
                    type="time"
                    value={form.dueTime}
                    onChange={(event) => update('dueTime', event.target.value)}
                  />
                </TaskField>
                <div className="sm:col-span-2">
                  <div
                    className={cn(
                      'flex items-center justify-between gap-4 rounded-xl border p-3',
                      task?.relatedCalendarEventId
                        ? 'border-success/25 bg-success/10'
                        : 'border-border-subtle bg-surface/45'
                    )}
                  >
                    <div className="min-w-0">
                      <Label htmlFor="task-add-calendar" className="text-sm font-semibold text-text">
                        {task?.relatedCalendarEventId ? 'Agendada no calendario' : 'Adicionar ao calendario'}
                      </Label>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {task?.relatedCalendarEventId
                          ? 'Ao salvar, o evento vinculado acompanha titulo, status e data da tarefa.'
                          : form.dueDate
                            ? 'Cria um evento vinculado a esta tarefa.'
                            : 'Defina uma data para habilitar o agendamento.'}
                      </p>
                      {calendarError && (
                        <p id="task-add-calendar-error" role="alert" className="mt-2 text-[11px] text-danger">
                          {calendarError}
                        </p>
                      )}
                    </div>
                    <Switch
                      id="task-add-calendar"
                      checked={form.addToCalendar}
                      disabled={isBusy || Boolean(task?.relatedCalendarEventId) || !form.dueDate}
                      aria-describedby={calendarError ? 'task-add-calendar-error' : undefined}
                      onCheckedChange={(checked) => update('addToCalendar', checked)}
                    />
                  </div>
                </div>
                <TaskField label="Importancia" htmlFor="task-importance">
                  <Select
                    value={form.importance}
                    onValueChange={(value) => update('importance', value as TaskFormState['importance'])}
                  >
                    <SelectTrigger id="task-importance">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_IMPORTANCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TaskField>
                <TaskField label="Status" htmlFor="task-status">
                  <Select
                    value={form.status}
                    onValueChange={(value) => update('status', value as TaskFormState['status'])}
                  >
                    <SelectTrigger id="task-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TaskField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Contexto</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2">
                <TaskField label="Categoria" htmlFor="task-category">
                  <Select
                    value={form.category}
                    onValueChange={(value) => update('category', value as TaskFormState['category'])}
                  >
                    <SelectTrigger id="task-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TaskField>
                <TaskField label="Origem" htmlFor="task-source">
                  <Select
                    value={form.source}
                    onValueChange={(value) => update('source', value as TaskFormState['source'])}
                  >
                    <SelectTrigger id="task-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TaskField>
                <TaskField label="Lead relacionado" htmlFor="task-lead">
                  <Select
                    value={form.relatedLeadId}
                    onValueChange={(value) => update('relatedLeadId', value)}
                  >
                    <SelectTrigger id="task-lead">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_TASK_RELATION_VALUE}>Sem lead</SelectItem>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name} · {lead.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TaskField>
                <TaskField label="Nota relacionada" htmlFor="task-note">
                  <Select
                    value={form.relatedNoteId}
                    onValueChange={(value) => update('relatedNoteId', value)}
                  >
                    <SelectTrigger id="task-note">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_TASK_RELATION_VALUE}>Sem nota</SelectItem>
                      {notes.slice(0, 40).map((note) => (
                        <SelectItem key={note.id} value={note.id}>
                          {note.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TaskField>
              </div>
              <TaskField
                label="Tags"
                htmlFor="task-tags"
                hint="Separe por virgulas. Ex: follow-up, proposta, icp"
              >
                <Input
                  id="task-tags"
                  value={form.tags}
                  onChange={(event) => update('tags', event.target.value)}
                  placeholder="follow-up, proposta, icp"
                />
              </TaskField>
            </section>

            <section className="space-y-3">
              <SectionTitle>Cor</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {TASK_COLOR_OPTIONS.map((option) => {
                  const active = form.color === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update('color', option.value)}
                      aria-label={`Cor ${option.label}`}
                      aria-pressed={active}
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-md border transition-all duration-base',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        active
                          ? 'border-primary/50 bg-primary-muted'
                          : 'border-border-subtle bg-surface/40 hover:border-border'
                      )}
                    >
                      <span className={cn('h-4 w-4 rounded-full', option.className)} />
                    </button>
                  )
                })}
              </div>
            </section>
          </SheetBody>

          <SheetFooter className="bg-surface/80">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Manter sem salvar
            </Button>
            <Button type="submit" variant="primary" disabled={isBusy} className="min-w-[132px]">
              {busyAction === 'save' ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Salvando
                </>
              ) : (
                <>
                  <Save aria-hidden /> {isEdit ? 'Salvar tarefa' : 'Criar tarefa'}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
