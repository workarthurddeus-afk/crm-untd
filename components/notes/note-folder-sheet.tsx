'use client'

import { useMemo, useState } from 'react'
import { FolderPlus, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
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
import type { NoteFolder, NoteFolderInput } from '@/lib/types'
import {
  NOTE_FOLDER_COLOR_OPTIONS,
  NOTE_FOLDER_ICON_OPTIONS,
  buildNoteFolderPayloadFromForm,
  getDefaultNoteFolderFormState,
  type NoteFolderFormState,
} from './note-folder-form-utils'

interface Props {
  open: boolean
  nextOrder: number
  onOpenChange: (open: boolean) => void
  onCreate: (input: NoteFolderInput) => Promise<NoteFolder>
  onCreated?: (folder: NoteFolder) => void
}

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}

function FolderField({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
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

export function NoteFolderSheet({ open, nextOrder, onOpenChange, onCreate, onCreated }: Props) {
  const [form, setForm] = useState<NoteFolderFormState>(() => getDefaultNoteFolderFormState())
  const [nameError, setNameError] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)

  const seed = open ? 'open' : 'closed'
  const [prevSeed, setPrevSeed] = useState(seed)
  if (open && seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(getDefaultNoteFolderFormState())
    setNameError(undefined)
    setIsSaving(false)
  } else if (!open && prevSeed !== seed) {
    setPrevSeed(seed)
  }

  const selectedColor = useMemo(
    () => NOTE_FOLDER_COLOR_OPTIONS.find((option) => option.value === form.color),
    [form.color]
  )
  const selectedIcon = useMemo(
    () => NOTE_FOLDER_ICON_OPTIONS.find((option) => option.value === form.icon),
    [form.icon]
  )
  function update<K extends keyof NoteFolderFormState>(key: K, value: NoteFolderFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'name' && String(value).trim()) setNameError(undefined)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim()) {
      setNameError('Digite um nome para a pasta.')
      return
    }

    setIsSaving(true)
    try {
      const created = await onCreate(buildNoteFolderPayloadFromForm(form, nextOrder))
      toast.success('Pasta criada', { description: created.name })
      onCreated?.(created)
      onOpenChange(false)
    } catch (err) {
      toast.error('Falha ao criar pasta', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] max-w-[96vw]">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <SheetHeader className="bg-gradient-to-b from-surface-elevated to-surface">
            <div className="flex items-start gap-3 pr-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary-muted text-primary">
                <FolderPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <SheetTitle>Nova pasta</SheetTitle>
                <SheetDescription>
                  Organize ideias, aprendizados e sinais sem tirar a nota do fluxo.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <SheetBody className="space-y-5">
            <div className="rounded-xl border border-border-subtle bg-surface/45 p-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-background/50',
                    selectedColor?.className ?? 'text-text-muted'
                  )}
                >
                  <FolderPlus className="h-5 w-5 text-white/90" strokeWidth={1.7} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-text">
                    {form.name.trim() || 'Pasta sem nome'}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {selectedIcon?.label ?? 'Pasta'} · {selectedColor?.label ?? 'Padrao'}
                  </p>
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <FolderField label="Nome" htmlFor="note-folder-name" error={nameError}>
                <Input
                  id="note-folder-name"
                  value={form.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="Ex: Conteudo, Clientes, Experimentos..."
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'note-folder-name-error' : undefined}
                  autoFocus
                />
              </FolderField>

              <FolderField
                label="Descricao"
                htmlFor="note-folder-description"
                hint="Opcional. Use para lembrar o papel operacional da pasta."
              >
                <Textarea
                  id="note-folder-description"
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="Que tipo de memoria deve morar aqui?"
                  rows={3}
                />
              </FolderField>

              <div className="grid gap-3 sm:grid-cols-2">
                <FolderField label="Icone" htmlFor="note-folder-icon">
                  <Select value={form.icon} onValueChange={(value) => update('icon', value)}>
                    <SelectTrigger id="note-folder-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_FOLDER_ICON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FolderField>

                <FolderField label="Cor" htmlFor="note-folder-color">
                  <Select
                    value={form.color}
                    onValueChange={(value) =>
                      update('color', value as NoteFolderFormState['color'])
                    }
                  >
                    <SelectTrigger id="note-folder-color">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTE_FOLDER_COLOR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FolderField>
              </div>

              <div className="flex flex-wrap gap-2">
                {NOTE_FOLDER_COLOR_OPTIONS.map((option) => {
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
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving} className="min-w-[132px]">
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Criando
                </>
              ) : (
                <>
                  <Save aria-hidden /> Criar pasta
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
