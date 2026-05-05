'use client'

import { useMemo, useState } from 'react'
import { Bell, CalendarPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import {
  calendarImportanceLabel,
  calendarTypeLabel,
  formatLongDate,
  getCalendarColorTokens,
} from '@/lib/utils/calendar-display'
import {
  CALENDAR_COLORS,
  CALENDAR_EVENT_TYPES,
  CALENDAR_IMPORTANCES,
  type CalendarColor,
  type CalendarEventInput,
  type CalendarEventType,
  type CalendarImportance,
} from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * Initial date (UTC midnight). The form pre-fills the date input from
   * this so creating from a day cell stays anchored.
   */
  initialDate: Date
  /** When opened from "Lembrete" CTA, kicks off as a reminder. */
  asReminder?: boolean
  onSubmit: (input: CalendarEventInput) => Promise<void>
}

interface FormState {
  title: string
  description: string
  date: string // YYYY-MM-DD (UTC)
  startTime: string // HH:mm
  endTime: string
  allDay: boolean
  type: CalendarEventType
  importance: CalendarImportance
  color: CalendarColor
  isReminder: boolean
  location: string
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function toDateInputValue(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function combineDateTimeUtc(date: string, time: string): string {
  // Build ISO from UTC components — input is YYYY-MM-DD + HH:mm
  return new Date(`${date}T${time}:00.000Z`).toISOString()
}

function defaultFormState(initialDate: Date, asReminder: boolean): FormState {
  return {
    title: '',
    description: '',
    date: toDateInputValue(initialDate),
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
    type: asReminder ? 'reminder' : 'meeting',
    importance: 'medium',
    color: asReminder ? 'yellow' : 'purple',
    isReminder: asReminder,
    location: '',
  }
}

export function EventCreateDialog({
  open,
  onOpenChange,
  initialDate,
  asReminder = false,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(() => defaultFormState(initialDate, asReminder))
  const [busy, setBusy] = useState(false)

  // Reset form when the dialog transitions to open or when the caller
  // changes the seed inputs. Using the React-sanctioned "reset during
  // render" pattern (storing previous props) — keeps the form in lockstep
  // without an effect-driven cascade.
  const seed = `${open ? '1' : '0'}|${initialDate.toISOString()}|${asReminder ? 'r' : 'e'}`
  const [prevSeed, setPrevSeed] = useState(seed)
  if (open && seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(defaultFormState(initialDate, asReminder))
  } else if (!open && prevSeed !== seed) {
    setPrevSeed(seed)
  }

  const tokens = useMemo(() => getCalendarColorTokens(form.color), [form.color])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Dê um título para o evento')
      return
    }

    const startAt = form.allDay
      ? new Date(`${form.date}T00:00:00.000Z`).toISOString()
      : combineDateTimeUtc(form.date, form.startTime)
    const endAt = form.allDay
      ? undefined
      : combineDateTimeUtc(form.date, form.endTime || form.startTime)

    const payload: CalendarEventInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      startAt,
      endAt,
      allDay: form.allDay,
      type: form.type,
      status: 'scheduled',
      priority: form.importance === 'critical' ? 'high' : form.importance === 'low' ? 'low' : 'medium',
      importance: form.importance,
      color: form.color,
      location: form.location.trim() || undefined,
      attendees: [],
      tags: [],
      source: 'manual',
      isReminder: form.isReminder,
      reminderAt: form.isReminder ? startAt : null,
      completedAt: null,
      relatedLeadId: null,
      relatedTaskId: null,
      relatedNoteId: null,
      relatedFeedbackId: null,
      relatedProjectId: null,
    }

    setBusy(true)
    try {
      await onSubmit(payload)
      toast.success(form.isReminder ? 'Lembrete criado' : 'Evento criado')
      onOpenChange(false)
    } catch (err) {
      toast.error('Falha ao criar', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusy(false)
    }
  }

  const dateLong = useMemo(() => formatLongDate(`${form.date}T12:00:00.000Z`), [form.date])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                tokens.chipBg,
                tokens.chipText
              )}
            >
              {form.isReminder ? (
                <Bell className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              ) : (
                <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              )}
            </div>
            <DialogTitle>
              {form.isReminder ? 'Novo lembrete' : 'Novo evento'}
            </DialogTitle>
          </div>
          <DialogDescription>{dateLong}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div>
            <Label htmlFor="event-title">Título</Label>
            <Input
              id="event-title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Reunião com Pixel & Code, follow-up Renove..."
              autoFocus
              className="mt-1"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="event-date">Data</Label>
              <Input
                id="event-date"
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 self-end pb-1">
              <Label htmlFor="event-allday" className="text-xs">
                Dia inteiro
              </Label>
              <Switch
                id="event-allday"
                checked={form.allDay}
                onCheckedChange={(checked) => update('allDay', checked)}
              />
            </div>
          </div>

          {!form.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="event-start">Início</Label>
                <Input
                  id="event-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="event-end">Fim</Label>
                <Input
                  id="event-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => update('endTime', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => update('type', v as CalendarEventType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {calendarTypeLabel[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Importância</Label>
              <Select
                value={form.importance}
                onValueChange={(v) => update('importance', v as CalendarImportance)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_IMPORTANCES.map((i) => (
                    <SelectItem key={i} value={i}>
                      {calendarImportanceLabel[i]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Cor</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {CALENDAR_COLORS.map((color) => {
                const t = getCalendarColorTokens(color)
                const active = color === form.color
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update('color', color)}
                    aria-pressed={active}
                    aria-label={color}
                    className={cn(
                      'h-6 w-6 rounded-full transition-transform duration-fast',
                      'border border-border-subtle',
                      active && 'scale-110 ring-2 ring-primary/40 ring-offset-2 ring-offset-background'
                    )}
                  >
                    <span className={cn('block h-full w-full rounded-full', t.dot)} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="event-location">Local / link</Label>
            <Input
              id="event-location"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Sala, link de meet, endereço..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="event-description">Descrição</Label>
            <Textarea
              id="event-description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Pauta, contexto, próximos passos..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface/40 px-3 py-2">
            <div>
              <p className="text-xs font-medium text-text-secondary">Marcar como lembrete</p>
              <p className="text-[11px] text-text-muted">
                Aparece em &quot;próximos&quot; e atrasados.
              </p>
            </div>
            <Switch
              checked={form.isReminder}
              onCheckedChange={(checked) => update('isReminder', checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Salvando
                </>
              ) : (
                <>
                  <CalendarPlus aria-hidden /> Criar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
