'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Clock, Calendar, Link2 } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { TaskCheckbox } from './task-checkbox'
import {
  categoryLabel,
  categoryTone,
  categoryToneClass,
  importanceAccentClass,
  computeDuePill,
  dueToneTextClass,
} from '@/lib/utils/task-display'
import {
  TASK_CELEBRATION_COMPLETING_MS,
  TASK_CELEBRATION_REOPENING_MS,
  TASK_CELEBRATION_REDUCED_MS,
} from '@/lib/constants/task-celebration'
import type { Task, TaskStatus, Lead } from '@/lib/types'

type TransitionPhase = 'completing' | 'reopening' | null

interface Props {
  task: Task
  now: Date
  leadById: Map<string, Lead>
  isPending?: boolean
  onToggle: (task: Task) => void
  onOpen: (task: Task) => void
}

export function TaskRow({ task, now, leadById, isPending, onToggle, onOpen }: Props) {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<TransitionPhase>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const isDone = task.status === 'done' || task.status === 'cancelled'
  const isCompleting = phase === 'completing'
  const isReopening = phase === 'reopening'
  const isTransitioning = phase !== null

  const displayStatus: TaskStatus = isCompleting
    ? 'done'
    : isReopening
      ? 'pending'
      : task.status

  const duePill = task.dueDate ? computeDuePill(task.dueDate, now) : null
  const tone = categoryTone(task.category)
  const relatedLead = task.relatedLeadId
    ? leadById.get(task.relatedLeadId)
    : undefined

  function handleCheckboxToggle() {
    if (isTransitioning || isPending) return
    const next: TransitionPhase = isDone ? 'reopening' : 'completing'
    setPhase(next)

    const duration = reduced
      ? TASK_CELEBRATION_REDUCED_MS
      : next === 'completing'
        ? TASK_CELEBRATION_COMPLETING_MS
        : TASK_CELEBRATION_REOPENING_MS

    timerRef.current = window.setTimeout(() => {
      onToggle(task)
    }, duration)
  }

  function handleRowClick() {
    if (isTransitioning) return
    onOpen(task)
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-2 rounded-lg py-2.5 pl-1 pr-3 sm:gap-3 sm:px-3',
        'select-none',
        'hover:bg-surface-elevated/40',
        !isTransitioning && 'transition-colors duration-fast',
        isTransitioning && !reduced && [
          'transition-opacity ease-[cubic-bezier(0.4,0,0.6,1)]',
          isCompleting && 'duration-[1200ms]',
          isReopening && 'duration-[800ms]',
          'opacity-0 pointer-events-none',
        ],
        isTransitioning && reduced && 'opacity-0 pointer-events-none',
        isCompleting && 'ring-2 ring-success/30 shadow-md-token',
        isReopening && 'ring-1 ring-primary/30 shadow-sm-token',
      )}
    >
      <div
        className={cn(
          'absolute bottom-3 left-0 top-3 z-[1] w-0.5 rounded-full',
          importanceAccentClass[task.importance],
        )}
      />

      <div className="shrink-0">
        <TaskCheckbox
          status={displayStatus}
          title={task.title}
          isPending={isPending && !isTransitioning}
          onToggle={handleCheckboxToggle}
        />
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          aria-label={`Editar tarefa ${task.title}`}
          onClick={handleRowClick}
          disabled={isTransitioning}
          className={cn(
            'block min-h-11 w-full rounded-md px-2 py-1.5 text-left',
            'transition-colors duration-fast hover:bg-surface-elevated/45',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            isTransitioning && 'cursor-not-allowed',
          )}
        >
          <span className="flex min-w-0 items-start gap-2">
            <span
              className={cn(
                'min-w-0 flex-1 break-words text-sm font-medium leading-snug text-text',
                isDone && 'line-through opacity-60',
              )}
            >
              {task.title}
            </span>

            {duePill && !isDone && (
              <span
                className={cn(
                  'flex shrink-0 items-center gap-1 text-[0.7rem] font-medium tabular-nums',
                  dueToneTextClass[duePill.tone],
                )}
              >
                {duePill.tone === 'future' ? (
                  <Calendar className="h-3 w-3" aria-hidden />
                ) : (
                  <Clock className="h-3 w-3" aria-hidden />
                )}
                {duePill.label}
              </span>
            )}
          </span>

          {task.description && (
            <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-text-secondary">
              {task.description}
            </span>
          )}
        </button>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              'border font-display text-[10px] font-medium uppercase tracking-wide',
              categoryToneClass[tone],
            )}
          >
            {categoryLabel[task.category]}
          </Badge>

          {relatedLead && (
            <Link
              href={`/leads/${relatedLead.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded-sm border border-border bg-transparent px-2 py-0.5 text-xs font-medium leading-none text-text-secondary whitespace-nowrap transition-colors duration-fast hover:border-primary/30 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Link2 className="h-3 w-3 shrink-0" />
              {relatedLead.name}
            </Link>
          )}

          {task.tagIds.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
