'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Flame, Sun, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { buildDailyPlan } from '@/lib/services/tasks.service'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import { categoryLabel } from '@/lib/utils/task-display'
import type { Task } from '@/lib/types'

interface Props { tasks: Task[]; today: Date }

const importanceLabels: Record<Task['importance'], string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}
const importanceClasses: Record<Task['importance'], string> = {
  high: 'bg-danger/10 text-danger',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-text-muted/10 text-text-muted',
}

export function PriorityOfDayCard({ tasks, today }: Props) {
  const top = useMemo(() => buildDailyPlan(tasks, today)[0] ?? null, [tasks, today])
  const [busy, setBusy] = useState(false)

  if (!top) {
    return (
      <Card className="p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Prioridade do Dia</h2>
        <div className="mt-6 flex flex-col items-center justify-center text-center">
          <Sun className="h-7 w-7 text-warning" strokeWidth={1.5} aria-hidden />
          <p className="mt-2 text-sm font-medium text-text">Sem prioridade urgente</p>
          <p className="mt-1 text-xs text-text-muted">Você está em dia.</p>
        </div>
      </Card>
    )
  }

  async function markDone() {
    if (busy || !top) return
    setBusy(true)
    try {
      await tasksRepo.update(top.id, { status: 'done' })
      toast.success('Prioridade concluída', { description: top.title })
    } catch (err) {
      toast.error('Falha ao concluir tarefa', { description: err instanceof Error ? err.message : String(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Flame className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Prioridade do Dia</h2>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">{categoryLabel[top.category]}</Badge>
          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${importanceClasses[top.importance]}`}>
            {importanceLabels[top.importance]}
          </span>
        </div>
        <p className="text-sm font-semibold text-text leading-snug line-clamp-2">{top.title}</p>
        {top.description && (
          <p className="text-xs text-text-muted leading-snug line-clamp-2">{top.description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button asChild variant="primary" size="sm" className="flex-1">
          <Link href="/tasks">
            Abrir <ArrowRight aria-hidden />
          </Link>
        </Button>
        <Button variant="secondary" size="sm" onClick={markDone} disabled={busy}>
          <Check aria-hidden /> Concluir
        </Button>
      </div>
    </Card>
  )
}
