'use client'

import { CheckCircle2 } from 'lucide-react'
import { AlertCard } from './alert-card'
import type { Alert } from '@/lib/services/alerts.service'

interface Props {
  alerts: Alert[]
}

export function AlertsFeed({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-surface p-4 border-l-4 border-l-success ring-1 ring-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text">Tudo sob controle.</p>
          <p className="text-xs text-text-muted mt-0.5">Sem alertas críticos para hoje.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <AlertCard key={`${alert.type}-${i}`} alert={alert} />
      ))}
    </div>
  )
}
