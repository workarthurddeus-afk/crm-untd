'use client'

import { Archive, CheckCircle2, Flame, Pin, Repeat2, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { Feedback, Lead } from '@/lib/types'
import {
  formatFeedbackDate,
  getFeedbackFrequencyLabel,
  getFeedbackImpactLabel,
  getFeedbackPriorityLabel,
  getFeedbackSentimentLabel,
  getFeedbackStatusLabel,
  getFeedbackTone,
  getFeedbackTypeLabel,
  getLeadLabel,
} from './feedback-view-utils'

interface Props {
  feedback: Feedback
  leads: Lead[]
  onSelect: (feedback: Feedback) => void
}

function toneClass(tone: ReturnType<typeof getFeedbackTone>) {
  return {
    danger: 'border-danger/30 bg-danger/10',
    warning: 'border-warning/30 bg-warning/10',
    success: 'border-success/30 bg-success/10',
    info: 'border-info/30 bg-info/10',
    default: 'border-primary/20 bg-surface/55',
  }[tone]
}

function impactVariant(impact: Feedback['impact']) {
  if (impact === 'critical') return 'danger'
  if (impact === 'high') return 'warning'
  return 'outline'
}

function priorityVariant(priority: Feedback['priority']) {
  if (priority === 'urgent') return 'danger'
  if (priority === 'high') return 'warning'
  return 'secondary'
}

export function FeedbackCard({ feedback, leads, onSelect }: Props) {
  const tone = getFeedbackTone(feedback)
  const leadLabel = getLeadLabel(feedback.relatedLeadId, leads)
  const isRecurring =
    feedback.frequency === 'recurring' || feedback.frequency === 'very_recurring'

  return (
    <button
      type="button"
      onClick={() => onSelect(feedback)}
      className={cn(
        'group w-full rounded-xl border p-4 text-left shadow-sm-token transition-all duration-base',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'hover:-translate-y-0.5 hover:border-primary/35 hover:bg-surface-elevated/80',
        toneClass(tone),
        feedback.isPinned && 'ring-1 ring-primary/25'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{getFeedbackTypeLabel(feedback.type)}</Badge>
            <Badge variant={impactVariant(feedback.impact)}>
              Impacto {getFeedbackImpactLabel(feedback.impact)}
            </Badge>
            <Badge variant={priorityVariant(feedback.priority)}>
              {getFeedbackPriorityLabel(feedback.priority)}
            </Badge>
          </div>
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight text-text">
            {feedback.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
            {feedback.content}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 text-text-muted">
          {feedback.isPinned && <Pin className="h-4 w-4 fill-primary text-primary" aria-hidden />}
          {feedback.isArchived && <Archive className="h-4 w-4 text-text-muted" aria-hidden />}
          {feedback.status === 'resolved' && (
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
          )}
          {isRecurring && <Repeat2 className="h-4 w-4 text-info" aria-hidden />}
          {feedback.impact === 'critical' && <Flame className="h-4 w-4 text-danger" aria-hidden />}
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border-subtle pt-3 text-xs text-text-muted sm:grid-cols-4">
        <span>{getFeedbackStatusLabel(feedback.status)}</span>
        <span>{getFeedbackFrequencyLabel(feedback.frequency)}</span>
        <span>{getFeedbackSentimentLabel(feedback.sentiment)}</span>
        <span>{formatFeedbackDate(feedback.capturedAt)}</span>
      </div>

      {(leadLabel || feedback.tags.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {leadLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-background/35 px-2.5 py-1 text-xs text-text-secondary">
              <UserRound className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              {leadLabel}
            </span>
          )}
          {feedback.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-subtle bg-surface/55 px-2 py-1 text-[11px] font-medium text-text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
