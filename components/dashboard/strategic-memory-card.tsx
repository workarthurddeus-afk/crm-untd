'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Sparkles, Pin, Plus, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { notesRepo } from '@/lib/repositories/notes.repository'
import { cn } from '@/lib/utils/cn'
import type { StrategicMemoryPick } from '@/lib/utils/strategic-memory'
import type { NoteType } from '@/lib/types'

const noteTypeLabel: Record<NoteType, string> = {
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

interface Props { pick: StrategicMemoryPick }

export function StrategicMemoryCard({ pick }: Props) {
  const [pinning, setPinning] = useState(false)
  const note = pick.note

  const relative = (() => {
    try { return formatDistanceToNow(parseISO(note.updatedAt), { locale: ptBR, addSuffix: true }) }
    catch { return '' }
  })()

  async function togglePin() {
    if (pinning) return
    setPinning(true)
    try {
      await notesRepo.update(note.id, { pinned: !note.pinned })
      toast.success(note.pinned ? 'Nota desafixada' : 'Nota fixada')
    } catch (err) {
      toast.error('Falha ao atualizar', { description: err instanceof Error ? err.message : String(err) })
    } finally {
      setPinning(false)
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
        className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full opacity-60"
        style={{ background: 'radial-gradient(closest-side, rgba(83,50,234,0.18), transparent 70%)' }}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Memória Estratégica</span>
            <span className="text-[10px] text-primary">Lembrete do dia</span>
          </div>
        </div>

        <h3 className="mt-3 font-display text-base font-semibold leading-snug text-text">{note.title}</h3>
        <p className="mt-1.5 text-sm text-text-secondary leading-relaxed line-clamp-3">{note.content}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted">
          <Badge variant="outline" className="text-[10px]">{noteTypeLabel[note.type]}</Badge>
          {note.tagIds.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
          ))}
          {relative && <span className="font-mono tabular-nums">{relative}</span>}
        </div>

        <p className="mt-2 text-xs italic text-primary/80">{pick.reason}</p>

        <div className="mt-4 flex items-center gap-2">
          <Button asChild variant="primary" size="sm" className="flex-1">
            <Link href="/notes">Abrir <ArrowRight aria-hidden /></Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => toast.info('Conversão para tarefa em breve.')}>
            <Plus aria-hidden /> Tarefa
          </Button>
          <Button variant="ghost" size="icon" onClick={togglePin} disabled={pinning} aria-label={note.pinned ? 'Desafixar' : 'Fixar'}>
            <Pin className={cn('h-4 w-4', note.pinned && 'fill-current')} strokeWidth={1.75} aria-hidden />
          </Button>
        </div>
      </div>
    </Card>
  )
}
