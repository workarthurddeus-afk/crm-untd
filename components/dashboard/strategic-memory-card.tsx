'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { ArrowRight, CheckSquare, Loader2, Pin, Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { notesRepo } from '@/lib/repositories/notes.repository'
import type { NoteTaskConversion } from '@/lib/services/notes.service'
import { cn } from '@/lib/utils/cn'
import type { StrategicMemoryPick } from '@/lib/utils/strategic-memory'
import type { NoteType } from '@/lib/types'

const noteTypeLabel: Record<string, string> = {
  insight: 'Insight',
  idea: 'Ideia',
  meeting: 'Reunião',
  feedback: 'Feedback',
  strategy: 'Estratégia',
  product: 'Produto',
  ui: 'UI',
  feature: 'Feature',
  campaign: 'Campanha',
  copy: 'Copy',
  offer: 'Oferta',
  sales: 'Vendas',
  pricing: 'Pricing',
  brandkit: 'BrandKit',
  prompt: 'Prompt',
  reference: 'Referência',
  bug: 'Bug',
  improvement: 'Melhoria',
  onboarding: 'Onboarding',
  market: 'Mercado',
  decision: 'Decisão',
  general: 'Geral',
  'product-idea': 'Produto',
  'ui-idea': 'UI',
  'feature-idea': 'Feature',
  'campaign-idea': 'Campanha',
  'copy-idea': 'Copy',
  'offer-idea': 'Oferta',
  'client-feedback': 'Feedback',
  'market-insight': 'Mercado',
  'sales-learning': 'Vendas',
  'strategic-decision': 'Estratégia',
  'useful-prompt': 'Prompt',
  'visual-reference': 'Referência',
  'bug-improvement': 'Bug',
  'onboarding-idea': 'Onboarding',
  'pricing-idea': 'Pricing',
  'brandkit-idea': 'BrandKit',
  other: 'Outro',
}

interface Props {
  pick: StrategicMemoryPick
  onTransformToTask: (noteId: string) => Promise<NoteTaskConversion>
}

export function StrategicMemoryCard({ pick, onTransformToTask }: Props) {
  const [pinning, setPinning] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const note = pick.note
  const hasLinkedTask = Boolean(note.relatedTaskId)
  const typeLabel = noteTypeLabel[note.type as NoteType] ?? 'Nota'

  const relative = (() => {
    try {
      return formatDistanceToNow(parseISO(note.updatedAt), { locale: ptBR, addSuffix: true })
    } catch {
      return ''
    }
  })()

  async function togglePin() {
    if (pinning) return
    setPinning(true)
    try {
      await notesRepo.update(note.id, { pinned: !note.pinned })
      toast.success(note.pinned ? 'Nota desafixada' : 'Nota fixada')
    } catch (err) {
      toast.error('Falha ao atualizar', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setPinning(false)
    }
  }

  async function transformToTask() {
    if (creatingTask || hasLinkedTask) return
    setCreatingTask(true)
    try {
      const result = await onTransformToTask(note.id)
      toast.success(result.created ? 'Tarefa criada' : 'Tarefa já vinculada', {
        description: result.task.title,
      })
    } catch (err) {
      toast.error('Falha ao criar tarefa', {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setCreatingTask(false)
    }
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-5',
        'bg-gradient-to-br from-surface-elevated to-surface',
        'ring-1 ring-primary/20',
        'shadow-[0_0_24px_rgba(83,50,234,0.08)]'
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full opacity-60"
        style={{
          background: 'radial-gradient(closest-side, rgba(83,50,234,0.18), transparent 70%)',
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Memória Estratégica
            </span>
            <span className="text-[10px] text-primary">Lembrete do dia</span>
          </div>
        </div>

        <h3 className="mt-3 font-display text-base font-semibold leading-snug text-text">
          {note.title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-text-secondary">
          {note.content}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted">
          <Badge variant="outline" className="text-[10px]">
            {typeLabel}
          </Badge>
          {note.tagIds.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
          {relative && <span className="font-mono tabular-nums">{relative}</span>}
        </div>

        <p className="mt-2 text-xs italic text-primary/80">{pick.reason}</p>

        <div className="mt-4 flex items-center gap-2">
          <Button asChild variant="primary" size="sm" className="flex-1">
            <Link href="/notes">
              Abrir <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button
            variant={hasLinkedTask ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => void transformToTask()}
            disabled={creatingTask || hasLinkedTask}
          >
            {creatingTask ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : hasLinkedTask ? (
              <CheckSquare aria-hidden />
            ) : (
              <Plus aria-hidden />
            )}
            {hasLinkedTask ? 'Tarefa criada' : 'Virar tarefa'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePin}
            disabled={pinning}
            aria-label={note.pinned ? 'Desafixar' : 'Fixar'}
          >
            <Pin
              className={cn('h-4 w-4', note.pinned && 'fill-current')}
              strokeWidth={1.75}
              aria-hidden
            />
          </Button>
        </div>
      </div>
    </Card>
  )
}
