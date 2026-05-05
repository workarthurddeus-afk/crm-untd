'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Calendar, Snowflake, Zap, Clock, MessageSquareWarning, ChevronRight, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { Alert } from '@/lib/services/alerts.service'

interface Props { alerts: Alert[] }

interface Row {
  id: string
  Icon: LucideIcon
  iconClass: string
  title: string
  description: string
  badge: string
  href: string
}

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

function alertToRow(alert: Alert): Row {
  switch (alert.type) {
    case 'follow-ups-due-today':
      return {
        id: alert.type,
        Icon: Calendar,
        iconClass: 'bg-warning/10 text-warning',
        title: 'Follow-ups vencendo hoje',
        description: `${pluralize(alert.count, 'lead', 'leads')} aguardando retorno`,
        badge: 'Follow-up',
        href: '/leads',
      }
    case 'leads-stale':
      return {
        id: alert.type,
        Icon: Snowflake,
        iconClass: 'bg-danger/10 text-danger',
        title: `Leads frios há ${alert.days}+ dias`,
        description: `${pluralize(alert.count, 'lead parado', 'leads parados')} há mais de ${alert.days} dias`,
        badge: 'Lead',
        href: '/leads',
      }
    case 'high-icp-no-proposal':
      return {
        id: alert.type,
        Icon: Zap,
        iconClass: 'bg-warning/10 text-warning',
        title: 'Leads quentes sem proposta',
        description: `${pluralize(alert.count, 'lead', 'leads')} de alto ICP esperando proposta`,
        badge: 'Proposta',
        href: '/leads',
      }
    case 'tasks-overdue':
      return {
        id: alert.type,
        Icon: Clock,
        iconClass: 'bg-danger/10 text-danger',
        title: 'Tarefas atrasadas',
        description: `${pluralize(alert.count, 'tarefa passou', 'tarefas passaram')} do prazo`,
        badge: 'Tarefa',
        href: '/tasks',
      }
    case 'high-impact-feedback':
      return {
        id: alert.type,
        Icon: MessageSquareWarning,
        iconClass: 'bg-warning/10 text-warning',
        title: 'Feedbacks de alto impacto',
        description: `${pluralize(alert.count, 'feedback', 'feedbacks')} para revisar`,
        badge: 'Feedback',
        href: '/feedbacks',
      }
  }
}

export function ActionCenter({ alerts }: Props) {
  const rows = useMemo(() => alerts.map(alertToRow), [alerts])

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Central de Ação</h2>
        <span className="text-xs text-text-muted">
          {rows.length === 0 ? 'tudo em dia' : `${rows.length} ${rows.length === 1 ? 'item' : 'itens'}`}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-success/10 text-success">
            <Calendar className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="mt-3 text-sm font-medium text-text">Tudo sob controle.</p>
          <p className="mt-1 text-xs text-text-muted">Sem ações urgentes para hoje.</p>
        </div>
      ) : (
        <ul className="mt-3 space-y-1">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={row.href}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2.5',
                  'transition-colors duration-fast hover:bg-surface-elevated/40'
                )}
              >
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', row.iconClass)}>
                  <row.Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text leading-tight truncate">{row.title}</p>
                  <p className="text-xs text-text-muted leading-snug truncate">{row.description}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{row.badge}</Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity duration-fast group-hover:opacity-100" strokeWidth={1.75} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
