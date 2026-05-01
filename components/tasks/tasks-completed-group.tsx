'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { TaskRow } from './task-row'
import type { Task, Lead } from '@/lib/types'

type CelebrationTone = 'completing' | 'reopening'

interface Props {
  tasks: Task[]
  now: Date
  leadById: Map<string, Lead>
  celebrating: Map<string, CelebrationTone>
  onToggle: (task: Task) => void
}

export function TasksCompletedGroup({
  tasks,
  now,
  leadById,
  celebrating,
  onToggle,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  if (tasks.length === 0) return null

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 shrink-0 transition-transform duration-base',
            expanded && 'rotate-90',
          )}
        />
        <span className="flex-1 text-left">Concluídas</span>
        <span className="font-mono tabular-nums text-text-muted ml-auto">
          {tasks.length}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="completed-list"
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, height: 0 }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, height: 'auto' }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, height: 0 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
            }
            className="overflow-hidden"
          >
            <div className="mt-2 opacity-60">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  now={now}
                  leadById={leadById}
                  celebrationTone={celebrating.get(task.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
