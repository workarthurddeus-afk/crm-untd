'use client'

import { Plus, Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  query: string
  onQueryChange: (value: string) => void
  totals: {
    total: number
    pinned: number
    favorites: number
    highImpact: number
    archived: number
  }
  onNewNote: () => void
  onNewFolder: () => void
}

interface StatProps {
  label: string
  value: number
  accent?: 'default' | 'primary' | 'success' | 'warning'
}

function Stat({ label, value, accent = 'default' }: StatProps) {
  const color =
    accent === 'primary'
      ? 'text-primary'
      : accent === 'success'
        ? 'text-success'
        : accent === 'warning'
          ? 'text-warning'
          : 'text-text'

  return (
    <div className="flex items-baseline gap-1.5">
      <span className={`font-display text-base font-semibold tabular-nums ${color}`}>
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-text-muted">{label}</span>
    </div>
  )
}

export function NotesPageHeader({
  query,
  onQueryChange,
  totals,
  onNewNote,
  onNewFolder,
}: Props) {
  return (
    <header className="border-b border-border bg-gradient-to-b from-surface/40 to-transparent">
      <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight text-text">
              Notas & Ideias
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Memória estratégica, aprendizados e ideias do UNTD
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Stat label="notas" value={totals.total} />
            <span className="h-3 w-px bg-border" aria-hidden />
            <Stat label="fixadas" value={totals.pinned} accent="primary" />
            <Stat label="favoritas" value={totals.favorites} accent="warning" />
            <Stat label="alto impacto" value={totals.highImpact} accent="success" />
            <span className="h-3 w-px bg-border" aria-hidden />
            <Stat label="arquivadas" value={totals.archived} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
              strokeWidth={1.75}
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar título, conteúdo, tag..."
              className="pl-9"
            />
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              onNewFolder()
              toast.info('Criação de pasta em breve.')
            }}
          >
            <Plus aria-hidden /> Pasta
          </Button>
          <Button variant="primary" size="md" onClick={onNewNote}>
            <Plus aria-hidden /> Nova nota
          </Button>
        </div>
      </div>
    </header>
  )
}
