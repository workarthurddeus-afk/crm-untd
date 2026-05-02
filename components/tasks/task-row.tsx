'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Calendar, Link2 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'sonner'
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
import { TASK_CELEBRATION_COMPLETING_MS } from '@/lib/constants/task-celebration'
import type { Task, Lead } from '@/lib/types'

type CelebrationTone = 'completing' | 'reopening'

const COMPLETING_DURATION_S = TASK_CELEBRATION_COMPLETING_MS / 1000

interface Props {
  task: Task
  now: Date
  leadById: Map<string, Lead>
  isPending?: boolean
  celebrationTone?: CelebrationTone
  onToggle: (task: Task) => void
}

export function TaskRow({
  task,
  now,
  leadById,
  isPending,
  celebrationTone,
  onToggle,
}: Props) {
  const reduced = useReducedMotion()
  const router = useRouter()
  const isDone = task.status === 'done' || task.status === 'cancelled'
  const duePill = task.dueDate ? computeDuePill(task.dueDate, now) : null
  const tone = categoryTone(task.category)
  const relatedLead = task.relatedLeadId ? leadById.get(task.relatedLeadId) : undefined

  function handleRowClick() {
    if (relatedLead) {
      router.push(`/leads/${relatedLead.id}`)
      return
    }
    toast.info('Detalhe da tarefa chega depois.')
  }

  const isFadingOut = celebrationTone === 'completing' && !reduced

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleRowClick()
        }
      }}
      animate={
        isFadingOut
          ? { opacity: [1, 1, 0], scale: [1, 1, 0.985] }
          : { opacity: 1, scale: 1 }
      }
      transition={
        isFadingOut
          ? {
              opacity: {
                duration: COMPLETING_DURATION_S,
                times: [0, 0.3, 1],
                ease: [0.4, 0, 0.6, 1],
              },
              scale: {
                duration: COMPLETING_DURATION_S,
                times: [0, 0.3, 1],
                ease: [0.4, 0, 0.6, 1],
              },
            }
          : { duration: 0 }
      }
      className={cn(
        'group relative flex items-start gap-3 rounded-md py-3 px-4 -mx-4',
        'cursor-pointer select-none',
        'hover:bg-surface-elevated/40',
        'transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'will-change-[opacity,transform]',
      )}
    >
      {celebrationTone && (
        <motion.div
          aria-hidden
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
          className={cn(
            'pointer-events-none absolute inset-0 rounded-md',
            celebrationTone === 'completing'
              ? 'ring-2 ring-success/50 shadow-[0_0_28px_rgba(52,211,153,0.4)]'
              : 'ring-1 ring-primary/60 shadow-[0_0_20px_rgba(83,50,234,0.35)]',
          )}
        />
      )}

      <div
        className={cn(
          'absolute left-0 top-3 bottom-3 w-0.5 rounded-full z-[1]',
          importanceAccentClass[task.importance],
        )}
      />

      <div className="mt-0.5 shrink-0">
        <TaskCheckbox
          status={task.status}
          title={task.title}
          isPending={isPending}
          onToggle={() => onToggle(task)}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 text-sm font-medium leading-snug text-text',
              isDone && 'line-through opacity-60',
            )}
          >
            {task.title}
          </span>

          {duePill && !isDone && (
            <span
              className={cn(
                'flex shrink-0 items-center gap-1 text-[11px] font-mono tabular-nums',
                dueToneTextClass[duePill.tone],
              )}
            >
              {duePill.tone === 'future' ? (
                <Calendar className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {duePill.label}
            </span>
          )}
        </div>

        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
            {task.description}
          </p>
        )}

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
    </motion.div>
  )
}
