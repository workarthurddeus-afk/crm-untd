'use client'
import Link from 'next/link'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { PipelineSummary } from '@/lib/utils/pipeline-summary'

interface Props { summary: PipelineSummary }

export function PipelineMovementCard({ summary }: Props) {
  const max = summary.buckets.reduce((m, b) => Math.max(m, b.count), 0) || 1

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Movimento do Pipeline</h2>
        <span className="text-xs font-mono tabular-nums text-text-muted">{summary.totalOpen}</span>
      </div>

      {summary.buckets.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">Sem leads ativos no momento.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {summary.buckets.map((b) => (
            <li key={b.stage.id} className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: b.stage.color }} aria-hidden />
              <span className="text-sm text-text-secondary truncate min-w-0 flex-1">{b.stage.name}</span>
              <div className="flex h-1 w-16 shrink-0 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary/40"
                  style={{ width: `${(b.count / max) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-sm font-mono tabular-nums text-text">{b.count}</span>
            </li>
          ))}
        </ul>
      )}

      {summary.bottleneck && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" strokeWidth={1.75} aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-warning">Gargalo atual</p>
            <p className="text-xs text-text-secondary leading-snug">{summary.bottleneck.reason}</p>
          </div>
        </div>
      )}

      <Link
        href="/crm"
        className={cn(
          'mt-4 inline-flex items-center gap-1 text-xs font-medium text-text-secondary',
          'transition-colors duration-fast hover:text-text'
        )}
      >
        Abrir Kanban <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden />
      </Link>
    </Card>
  )
}
