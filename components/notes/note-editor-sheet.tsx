'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Bold,
  CheckCircle2,
  CheckSquare,
  Heading2,
  Highlighter,
  Italic,
  Lightbulb,
  List,
  ListOrdered,
  Loader2,
  MessageSquareQuote,
  Minus,
  Pin,
  Quote,
  Save,
  Sparkles,
  Star,
  WandSparkles,
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import type { Note, NoteFolder, NoteInput } from '@/lib/types'
import { NoteMarkdownPreview } from './note-markdown-preview'
import {
  NO_NOTE_FOLDER_VALUE,
  NOTE_COLOR_OPTIONS,
  NOTE_EFFORT_OPTIONS,
  NOTE_IMPACT_OPTIONS,
  NOTE_PRIORITY_OPTIONS,
  NOTE_STATUS_OPTIONS,
  NOTE_TYPE_OPTIONS,
  applyMarkdownFormat,
  buildNotePayloadFromForm,
  getDefaultNoteEditorState,
  noteToEditorState,
  type MarkdownAction,
  type NoteEditorFormState,
} from './note-editor-utils'

interface Props {
  open: boolean
  note: Note | null
  folders: NoteFolder[]
  onOpenChange: (open: boolean) => void
  onCreate: (input: NoteInput) => Promise<Note>
  onUpdate: (id: string, input: Partial<NoteInput>) => Promise<Note>
  onArchive: (id: string) => Promise<void>
  onRestore: (id: string) => Promise<void>
  onTransformToTask: (id: string) => Promise<void>
  onSaved?: (note: Note) => void
}

type BusyAction = 'save' | 'archive' | 'task' | null

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}

interface ToolbarAction {
  action: MarkdownAction
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const toolbarActions: ToolbarAction[] = [
  { action: 'bold', label: 'Negrito', icon: Bold },
  { action: 'italic', label: 'Italico', icon: Italic },
  { action: 'highlight', label: 'Destaque', icon: Highlighter },
  { action: 'heading', label: 'Heading', icon: Heading2 },
  { action: 'bullet', label: 'Lista', icon: List },
  { action: 'numbered', label: 'Lista numerada', icon: ListOrdered },
  { action: 'quote', label: 'Quote', icon: Quote },
  { action: 'insight', label: 'Bloco insight', icon: Sparkles },
  { action: 'attention', label: 'Bloco atencao', icon: MessageSquareQuote },
  { action: 'idea', label: 'Bloco ideia', icon: Lightbulb },
  { action: 'divider', label: 'Separador', icon: Minus },
]

function NoteField({ label, htmlFor, error, hint, className, children }: FieldProps) {
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
          <span className="text-text-muted">{hint}</span>
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

export function NoteEditorSheet({
  open,
  note,
  folders,
  onOpenChange,
  onCreate,
  onUpdate,
  onArchive,
  onRestore,
  onTransformToTask,
  onSaved,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [form, setForm] = useState<NoteEditorFormState>(() => getDefaultNoteEditorState())
  const [titleError, setTitleError] = useState<string | undefined>()
  const [busyAction, setBusyAction] = useState<BusyAction>(null)
  const isEdit = Boolean(note)
  const isBusy = busyAction !== null

  const seed = `${open ? '1' : '0'}|${note?.id ?? 'new'}|${note?.updatedAt ?? ''}`
  const [prevSeed, setPrevSeed] = useState(seed)
  if (open && seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(noteToEditorState(note))
    setTitleError(undefined)
    setBusyAction(null)
  } else if (!open && prevSeed !== seed) {
    setPrevSeed(seed)
  }

  const selectedType = useMemo(
    () => NOTE_TYPE_OPTIONS.find((option) => option.value === form.type),
    [form.type]
  )
  const selectedColor = useMemo(
    () => NOTE_COLOR_OPTIONS.find((option) => option.value === form.color),
    [form.color]
  )

  function update<K extends keyof NoteEditorFormState>(key: K, value: NoteEditorFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'title' && String(value).trim()) {
      setTitleError(undefined)
    }
  }

  function runFormat(action: MarkdownAction) {
    const element = textareaRef.current
    const selectionStart = element?.selectionStart ?? form.content.length
    const selectionEnd = element?.selectionEnd ?? selectionStart
    const result = applyMarkdownFormat(form.content, selectionStart, selectionEnd, action)
    update('content', result.content)

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) {
      setTitleError('Digite um titulo para a nota.')
      return
    }

    setBusyAction('save')
    try {
      const payload = buildNotePayloadFromForm(form)
      const saved = note ? await onUpdate(note.id, payload) : await onCreate(payload)
      setForm(noteToEditorState(saved))
      toast.success(note ? 'Nota atualizada' : 'Nota criada', { description: saved.title })
      onSaved?.(saved)
      onOpenChange(false)
    } catch (err) {
      toast.error('Falha ao salvar nota', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusyAction(null)
    }
  }

  async function handleArchiveToggle() {
    if (!note) return
    setBusyAction('archive')
    try {
      if (note.isArchived) {
        await onRestore(note.id)
      } else {
        await onArchive(note.id)
      }
    } finally {
      setBusyAction(null)
    }
  }

  async function handleTransformToTask() {
    if (!note) return
    setBusyAction('task')
    try {
      await onTransformToTask(note.id)
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[920px] max-w-[96vw]">
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
                  <WandSparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                )}
              </span>
              <div className="min-w-0">
                <SheetTitle>{isEdit ? 'Editar nota' : 'Nova nota'}</SheetTitle>
                <SheetDescription>
                  {isEdit
                    ? 'Ajuste a memoria estrategica sem perder contexto, tags ou relacoes.'
                    : 'Capture uma ideia com contexto suficiente para virar acao quando fizer sentido.'}
                </SheetDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant={form.impact === 'high' ? 'success' : 'outline'}>
                Impacto {NOTE_IMPACT_OPTIONS.find((i) => i.value === form.impact)?.label}
              </Badge>
              <Badge variant={form.priority === 'high' ? 'danger' : 'secondary'}>
                Prioridade {NOTE_PRIORITY_OPTIONS.find((i) => i.value === form.priority)?.label}
              </Badge>
              {selectedType && <Badge variant="default">{selectedType.label}</Badge>}
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button
                    type="button"
                    variant={note?.relatedTaskId ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => void handleTransformToTask()}
                    disabled={isBusy || Boolean(note?.relatedTaskId)}
                    className="justify-start"
                  >
                    {note?.relatedTaskId ? (
                      <>
                        <CheckCircle2 aria-hidden /> Tarefa criada
                      </>
                    ) : busyAction === 'task' ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden /> Criando
                      </>
                    ) : (
                      <>
                        <CheckSquare aria-hidden /> Virar tarefa
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => update('isPinned', !form.isPinned)}
                    disabled={isBusy}
                    className={cn('justify-start', form.isPinned && 'text-primary')}
                  >
                    <Pin className={cn(form.isPinned && 'fill-primary')} aria-hidden />
                    {form.isPinned ? 'Fixada' : 'Fixar'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => update('isFavorite', !form.isFavorite)}
                    disabled={isBusy}
                    className={cn('justify-start', form.isFavorite && 'text-warning')}
                  >
                    <Star className={cn(form.isFavorite && 'fill-warning')} aria-hidden />
                    {form.isFavorite ? 'Favorita' : 'Favoritar'}
                  </Button>
                  <Button
                    type="button"
                    variant={note?.isArchived ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => void handleArchiveToggle()}
                    disabled={isBusy}
                    className="justify-start"
                  >
                    {busyAction === 'archive' ? (
                      <Loader2 className="animate-spin" aria-hidden />
                    ) : note?.isArchived ? (
                      <ArchiveRestore aria-hidden />
                    ) : (
                      <Archive aria-hidden />
                    )}
                    {note?.isArchived ? 'Restaurar' : 'Arquivar'}
                  </Button>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <SectionTitle>Escrita</SectionTitle>
              <NoteField label="Titulo" htmlFor="note-title" error={titleError}>
                <Input
                  id="note-title"
                  value={form.title}
                  onChange={(event) => update('title', event.target.value)}
                  placeholder="Insight, decisao, ideia ou aprendizado..."
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? 'note-title-error' : undefined}
                  autoFocus
                  className="h-12 bg-background/50 font-display text-xl font-semibold tracking-tight"
                />
              </NoteField>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border-subtle bg-surface/50 p-1">
                    {toolbarActions.map((item) => {
                      const Icon = item.icon
                      return (
                        <Button
                          key={item.action}
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={item.label}
                          title={item.label}
                          onClick={() => runFormat(item.action)}
                          className="h-8 w-8"
                        >
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        </Button>
                      )
                    })}
                  </div>
                  <Textarea
                    ref={textareaRef}
                    value={form.content}
                    onChange={(event) => update('content', event.target.value)}
                    placeholder="Escreva em Markdown simples. Use a toolbar para destacar insight, atencao, ideia, listas e quotes."
                    rows={15}
                    className="min-h-[360px] resize-y rounded-xl bg-background/60 text-[15px] leading-relaxed"
                  />
                </div>

                <div className="min-w-0 rounded-xl border border-border-subtle bg-surface/35 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                      Preview
                    </p>
                    <span className="text-[10px] text-text-muted">Markdown controlado</span>
                  </div>
                  <NoteMarkdownPreview content={form.content} emptyLabel="O preview aparece aqui." />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Classificacao</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <NoteField label="Tipo" htmlFor="note-type">
                  <Select
                    value={form.type}
                    onValueChange={(value) => update('type', value as NoteEditorFormState['type'])}
                  >
                    <SelectTrigger id="note-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </NoteField>
                <NoteField label="Status" htmlFor="note-status">
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      update('status', value as NoteEditorFormState['status'])
                    }
                  >
                    <SelectTrigger id="note-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </NoteField>
                <NoteField label="Pasta" htmlFor="note-folder">
                  <Select
                    value={form.folderId}
                    onValueChange={(value) => update('folderId', value)}
                  >
                    <SelectTrigger id="note-folder">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_NOTE_FOLDER_VALUE}>Sem pasta</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </NoteField>
                <NoteField label="Prioridade" htmlFor="note-priority">
                  <Select
                    value={form.priority}
                    onValueChange={(value) =>
                      update('priority', value as NoteEditorFormState['priority'])
                    }
                  >
                    <SelectTrigger id="note-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </NoteField>
                <NoteField label="Impacto" htmlFor="note-impact">
                  <Select
                    value={form.impact}
                    onValueChange={(value) =>
                      update('impact', value as NoteEditorFormState['impact'])
                    }
                  >
                    <SelectTrigger id="note-impact">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_IMPACT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </NoteField>
                <NoteField label="Esforco" htmlFor="note-effort">
                  <Select
                    value={form.effort}
                    onValueChange={(value) =>
                      update('effort', value as NoteEditorFormState['effort'])
                    }
                  >
                    <SelectTrigger id="note-effort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_EFFORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </NoteField>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Sinais</SectionTitle>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <NoteField
                  label="Tags"
                  htmlFor="note-tags"
                  hint="Separe por virgulas. Ex: vendas, brandkit, follow-up"
                >
                  <Input
                    id="note-tags"
                    value={form.tags}
                    onChange={(event) => update('tags', event.target.value)}
                    placeholder="vendas, brandkit, follow-up"
                  />
                </NoteField>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border-subtle bg-surface/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="note-pinned" className="text-xs text-text-secondary">
                        Fixada
                      </Label>
                      <Switch
                        id="note-pinned"
                        checked={form.isPinned}
                        onCheckedChange={(value) => update('isPinned', value)}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="note-favorite" className="text-xs text-text-secondary">
                        Favorita
                      </Label>
                      <Switch
                        id="note-favorite"
                        checked={form.isFavorite}
                        onCheckedChange={(value) => update('isFavorite', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <SectionTitle>Tema</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {NOTE_COLOR_OPTIONS.map((option) => {
                  const active = form.color === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update('color', option.value)}
                      aria-label={`Cor ${option.label}`}
                      aria-pressed={active}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-md border transition-all duration-base',
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
                  <Save aria-hidden /> {isEdit ? 'Salvar nota' : 'Criar nota'}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
