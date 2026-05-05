import type {
  CalendarColor,
  CalendarEvent,
  CalendarEventStatus,
  CalendarEventType,
  CalendarImportance,
  CalendarPriority,
} from '@/lib/types'
import { parseDate } from '@/lib/utils/date-range'

/**
 * UI helpers for the Calendar module.
 *
 * Pure data + small formatters — no React, no JSX. Mirrors the contract
 * already in `lib/utils/calendar.ts` but adds proper PT-BR labels (with
 * accents), color tokens for the dark canvas, and time/date helpers that
 * stay in UTC to match the data layer's day-keying.
 */

export const calendarTypeLabel: Record<CalendarEventType, string> = {
  call: 'Call',
  meeting: 'Reunião',
  presentation: 'Apresentação',
  follow_up: 'Follow-up',
  prospecting: 'Prospecção',
  task: 'Tarefa',
  reminder: 'Lembrete',
  internal: 'Interno',
  strategy: 'Estratégia',
  product: 'Produto',
  design: 'Design',
  content: 'Conteúdo',
  social_media: 'Social Media',
  meta_ads: 'Meta Ads',
  review: 'Review',
  personal: 'Pessoal',
  other: 'Outro',
}

export const calendarStatusLabel: Record<CalendarEventStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  missed: 'Perdido',
  postponed: 'Adiado',
}

export const calendarImportanceLabel: Record<CalendarImportance, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export const calendarPriorityLabel: Record<CalendarPriority, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

/**
 * Per-color visual tokens. Subtle on dark — no saturated fills.
 *
 * - dot: fill class for the small color indicator
 * - rail: tinted left rail for cards/pills
 * - chipBg/chipText: badge background + text for chips
 * - pill: classes used for the inline event pill on the month grid
 */
export interface CalendarColorTokens {
  dot: string
  rail: string
  chipBg: string
  chipText: string
  pillBg: string
  pillText: string
  pillBorder: string
  glow: string
}

export const calendarColorTokens: Record<CalendarColor, CalendarColorTokens> = {
  default: {
    dot: 'bg-text-muted/70',
    rail: 'bg-text-muted/40',
    chipBg: 'bg-text-muted/12',
    chipText: 'text-text-secondary',
    pillBg: 'bg-text-muted/12',
    pillText: 'text-text-secondary',
    pillBorder: 'border-text-muted/20',
    glow: 'rgba(110, 107, 135, 0.18)',
  },
  purple: {
    dot: 'bg-primary',
    rail: 'bg-primary/70',
    chipBg: 'bg-primary/15',
    chipText: 'text-primary',
    pillBg: 'bg-primary/12',
    pillText: 'text-primary',
    pillBorder: 'border-primary/25',
    glow: 'rgba(83, 50, 234, 0.30)',
  },
  violet: {
    dot: 'bg-[#8b5cf6]',
    rail: 'bg-[#8b5cf6]/70',
    chipBg: 'bg-[#8b5cf6]/15',
    chipText: 'text-[#a78bfa]',
    pillBg: 'bg-[#8b5cf6]/12',
    pillText: 'text-[#a78bfa]',
    pillBorder: 'border-[#8b5cf6]/25',
    glow: 'rgba(139, 92, 246, 0.28)',
  },
  blue: {
    dot: 'bg-info',
    rail: 'bg-info/70',
    chipBg: 'bg-info/15',
    chipText: 'text-info',
    pillBg: 'bg-info/12',
    pillText: 'text-info',
    pillBorder: 'border-info/25',
    glow: 'rgba(96, 165, 250, 0.28)',
  },
  cyan: {
    dot: 'bg-[#22d3ee]',
    rail: 'bg-[#22d3ee]/70',
    chipBg: 'bg-[#22d3ee]/15',
    chipText: 'text-[#67e8f9]',
    pillBg: 'bg-[#22d3ee]/12',
    pillText: 'text-[#67e8f9]',
    pillBorder: 'border-[#22d3ee]/25',
    glow: 'rgba(34, 211, 238, 0.26)',
  },
  green: {
    dot: 'bg-success',
    rail: 'bg-success/70',
    chipBg: 'bg-success/15',
    chipText: 'text-success',
    pillBg: 'bg-success/12',
    pillText: 'text-success',
    pillBorder: 'border-success/25',
    glow: 'rgba(52, 211, 153, 0.26)',
  },
  yellow: {
    dot: 'bg-warning',
    rail: 'bg-warning/70',
    chipBg: 'bg-warning/15',
    chipText: 'text-warning',
    pillBg: 'bg-warning/12',
    pillText: 'text-warning',
    pillBorder: 'border-warning/25',
    glow: 'rgba(251, 191, 36, 0.22)',
  },
  orange: {
    dot: 'bg-[#fb923c]',
    rail: 'bg-[#fb923c]/70',
    chipBg: 'bg-[#fb923c]/15',
    chipText: 'text-[#fdba74]',
    pillBg: 'bg-[#fb923c]/12',
    pillText: 'text-[#fdba74]',
    pillBorder: 'border-[#fb923c]/25',
    glow: 'rgba(251, 146, 60, 0.22)',
  },
  red: {
    dot: 'bg-danger',
    rail: 'bg-danger/70',
    chipBg: 'bg-danger/15',
    chipText: 'text-danger',
    pillBg: 'bg-danger/12',
    pillText: 'text-danger',
    pillBorder: 'border-danger/25',
    glow: 'rgba(248, 113, 113, 0.24)',
  },
  pink: {
    dot: 'bg-[#f472b6]',
    rail: 'bg-[#f472b6]/70',
    chipBg: 'bg-[#f472b6]/15',
    chipText: 'text-[#f9a8d4]',
    pillBg: 'bg-[#f472b6]/12',
    pillText: 'text-[#f9a8d4]',
    pillBorder: 'border-[#f472b6]/25',
    glow: 'rgba(244, 114, 182, 0.22)',
  },
  slate: {
    dot: 'bg-[#94a3b8]',
    rail: 'bg-[#94a3b8]/55',
    chipBg: 'bg-[#94a3b8]/12',
    chipText: 'text-[#cbd5e1]',
    pillBg: 'bg-[#94a3b8]/10',
    pillText: 'text-[#cbd5e1]',
    pillBorder: 'border-[#94a3b8]/20',
    glow: 'rgba(148, 163, 184, 0.18)',
  },
}

export function getCalendarColorTokens(color: CalendarColor): CalendarColorTokens {
  return calendarColorTokens[color] ?? calendarColorTokens.default
}

export function importanceBadgeVariant(
  importance: CalendarImportance
): 'danger' | 'warning' | 'info' | 'secondary' {
  if (importance === 'critical') return 'danger'
  if (importance === 'high') return 'warning'
  if (importance === 'medium') return 'info'
  return 'secondary'
}

export function priorityBadgeVariant(
  priority: CalendarPriority
): 'danger' | 'warning' | 'secondary' {
  if (priority === 'high') return 'danger'
  if (priority === 'medium') return 'warning'
  return 'secondary'
}

export function statusBadgeVariant(
  status: CalendarEventStatus
): 'success' | 'info' | 'warning' | 'secondary' | 'default' | 'danger' {
  if (status === 'completed') return 'success'
  if (status === 'in_progress' || status === 'confirmed') return 'info'
  if (status === 'postponed' || status === 'missed') return 'warning'
  if (status === 'cancelled') return 'secondary'
  return 'default'
}

/**
 * Pad helper used by the UTC-aware time formatter.
 */
function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

/**
 * Format an ISO timestamp as `HH:mm` in UTC. We render in UTC because the
 * data layer keys days in UTC (`getDateKey` slices the UTC midnight). Using
 * local TZ here would let an event at `13:00 UTC` jump cells when the user
 * is in a different timezone.
 */
export function formatEventClock(iso: string): string {
  const d = parseDate(iso)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export function formatEventTimeRange(event: CalendarEvent): string {
  if (event.allDay) return 'Dia inteiro'
  const start = formatEventClock(event.startAt)
  if (!event.endAt) return start
  const end = formatEventClock(event.endAt)
  return `${start} – ${end}`
}

const longWeekdays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

const shortWeekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const longMonths = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function getWeekdayShort(weekday: number): string {
  return shortWeekdays[weekday] ?? ''
}

export function formatLongDate(iso: string | Date): string {
  const d = parseDate(iso)
  return `${longWeekdays[d.getUTCDay()]}, ${d.getUTCDate()} de ${longMonths[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

export function formatShortDate(iso: string | Date): string {
  const d = parseDate(iso)
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`
}

export function formatMonthYear(iso: string | Date): string {
  const d = parseDate(iso)
  const month = longMonths[d.getUTCMonth()] ?? ''
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${d.getUTCFullYear()}`
}

/**
 * Time-of-day buckets for the day agenda. We bucket by UTC hour so events
 * stay in the same group as the day grid below.
 */
export type DayBucket = 'all-day' | 'morning' | 'afternoon' | 'evening'

export const dayBucketLabel: Record<DayBucket, string> = {
  'all-day': 'Dia inteiro',
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
}

export function bucketForEvent(event: CalendarEvent): DayBucket {
  if (event.allDay) return 'all-day'
  const hour = parseDate(event.startAt).getUTCHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export function isOverdueEvent(event: CalendarEvent, currentDate = new Date()): boolean {
  if (event.status === 'completed' || event.status === 'cancelled') return false
  const dueAt = event.reminderAt ?? event.endAt ?? event.startAt
  return parseDate(dueAt).getTime() < currentDate.getTime()
}
