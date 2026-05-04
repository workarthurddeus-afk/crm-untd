'use client'

import Link from 'next/link'
import {
  Calendar,
  Snowflake,
  Zap,
  Clock,
  MessageSquareWarning,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { Alert } from '@/lib/services/alerts.service'

type Tone = 'danger' | 'warning' | 'info'

interface AlertConfig {
  tone: Tone
  Icon: LucideIcon
  title: string
  description: string
  href: string
  borderClass: string
  bubbleClass: string
}

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

const toneClasses: Record<Tone, { borderClass: string; bubbleClass: string }> = {
  danger: {
    borderClass: 'border-l-danger',
    bubbleClass: 'bg-danger/10 text-danger',
  },
  warning: {
    borderClass: 'border-l-warning',
    bubbleClass: 'bg-warning/10 text-warning',
  },
  info: {
    borderClass: 'border-l-info',
    bubbleClass: 'bg-info/10 text-info',
  },
}

function alertConfig(alert: Alert): AlertConfig {
  const tone = (t: Tone) => toneClasses[t]

  switch (alert.type) {
    case 'follow-ups-due-today':
      return {
        tone: 'warning',
        Icon: Calendar,
        title: 'Follow-ups vencendo hoje',
        description: `${pluralize(alert.count, 'lead', 'leads')} aguardando retorno`,
        href: '/leads',
        ...tone('warning'),
      }
    case 'leads-stale':
      return {
        tone: 'danger',
        Icon: Snowflake,
        title: `Leads frios há ${alert.days}+ dias`,
        description: `${pluralize(alert.count, 'lead', 'leads')} parados há mais de ${alert.days} dias`,
        href: '/leads',
        ...tone('danger'),
      }
    case 'high-icp-no-proposal':
      return {
        tone: 'warning',
        Icon: Zap,
        title: 'Leads quentes sem proposta',
        description: `${pluralize(alert.count, 'lead', 'leads')} de alto ICP esperando proposta`,
        href: '/leads',
        ...tone('warning'),
      }
    case 'tasks-overdue':
      return {
        tone: 'danger',
        Icon: Clock,
        title: 'Tarefas atrasadas',
        description: `${pluralize(alert.count, 'tarefa', 'tarefas')} passou do prazo`,
        href: '/tasks',
        ...tone('danger'),
      }
    case 'high-impact-feedback':
      return {
        tone: 'warning',
        Icon: MessageSquareWarning,
        title: 'Feedbacks de alto impacto',
        description: `${pluralize(alert.count, 'feedback', 'feedbacks')} para revisar`,
        href: '/feedbacks',
        ...tone('warning'),
      }
  }
}

interface Props {
  alert: Alert
}

export function AlertCard({ alert }: Props) {
  const config = alertConfig(alert)
  const { Icon } = config

  return (
    <Link
      href={config.href}
      className={cn(
        'flex items-center gap-3 rounded-md border bg-surface p-4',
        'border-l-4 ring-1 ring-border',
        'transition-colors duration-fast',
        'hover:bg-surface-elevated/40',
        config.borderClass,
      )}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-md', config.bubbleClass)}>
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text">{config.title}</p>
        <p className="text-xs text-text-muted mt-0.5">{config.description}</p>
      </div>
      <Badge variant="secondary" className="ml-auto shrink-0 font-mono tabular-nums">
        {alert.count}
      </Badge>
    </Link>
  )
}
