'use client'

import { useMemo } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Card } from '@/components/ui/card'
import { calculateICPScore } from '@/lib/services/scoring.service'
import { cn } from '@/lib/utils/cn'
import type { ICPProfile, Lead } from '@/lib/types'

interface Props {
  profile: ICPProfile
  leads: Lead[]
}

interface KpiTileProps {
  label: string
  value: string
  secondary?: string
  accent?: boolean
}

function KpiTile({ label, value, secondary, accent }: KpiTileProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 relative overflow-hidden">
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(closest-side, rgba(83,50,234,0.35), transparent 70%)',
          }}
        />
      )}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 font-display text-3xl font-bold leading-none',
          accent ? 'text-primary' : 'text-text'
        )}
      >
        {value}
      </p>
      {secondary && (
        <p className="mt-1.5 text-xs text-text-muted">{secondary}</p>
      )}
    </div>
  )
}

function relativeDate(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true })
  } catch {
    return '—'
  }
}

export function ICPHero({ profile, leads }: Props) {
  const kpis = useMemo(() => {
    const totalWeight = profile.criteria.reduce((s, c) => s + c.weight, 0)
    const heaviest = [...profile.criteria].sort((a, b) => b.weight - a.weight)[0]

    if (leads.length === 0) {
      return {
        avgScore: { value: '—', secondary: '/100', accent: false },
        aligned: { value: '—', secondary: 'sem leads' },
        criteria: {
          value: String(profile.criteria.length),
          secondary: `${totalWeight}pts no total`,
        },
        heaviest: {
          value: heaviest?.name ?? '—',
          secondary: heaviest ? `${heaviest.weight}pt` : '—',
        },
      }
    }

    const scores = leads.map((l) => calculateICPScore(l, profile).total)
    const avg = Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
    const alignedCount = scores.filter((s) => s >= 70).length

    return {
      avgScore: {
        value: String(avg),
        secondary: '/100',
        accent: avg >= 60,
      },
      aligned: {
        value: String(alignedCount),
        secondary: `de ${leads.length}`,
      },
      criteria: {
        value: String(profile.criteria.length),
        secondary: `${totalWeight}pts no total`,
      },
      heaviest: {
        value: heaviest?.name ?? '—',
        secondary: heaviest ? `${heaviest.weight}pt` : '—',
      },
    }
  }, [leads, profile])

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-xl font-semibold text-text">
          {profile.name}
        </span>
        <span className="shrink-0 text-xs text-text-muted">
          {relativeDate(profile.updatedAt)}
        </span>
      </div>

      {profile.description && (
        <p className="mt-1.5 text-sm text-text-secondary leading-relaxed max-w-prose">
          {profile.description}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <KpiTile
          label="Score médio"
          value={kpis.avgScore.value}
          secondary={kpis.avgScore.secondary}
          accent={kpis.avgScore.accent}
        />
        <KpiTile
          label="Leads alinhados"
          value={kpis.aligned.value}
          secondary={kpis.aligned.secondary}
        />
        <KpiTile
          label="Critérios"
          value={kpis.criteria.value}
          secondary={kpis.criteria.secondary}
        />
        <KpiTile
          label="Maior peso"
          value={kpis.heaviest.value}
          secondary={kpis.heaviest.secondary}
        />
      </div>
    </Card>
  )
}
