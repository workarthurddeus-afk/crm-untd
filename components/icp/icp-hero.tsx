'use client'

import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Crosshair, ShieldAlert, Sparkles, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getPipelineICPAnalytics } from '@/lib/utils/icp-analytics'
import { cn } from '@/lib/utils/cn'
import type { ICPProfile, Lead } from '@/lib/types'

interface Props {
  profile: ICPProfile
  leads: Lead[]
}

function fitStatus(score: number) {
  if (score >= 80) {
    return {
      label: 'saudavel',
      tone: 'text-success',
      color: '#a78bfa',
      ring: 'border-primary/35 shadow-glow-primary-sm',
      motion: [1, 1.012, 1],
    }
  }
  if (score >= 55) {
    return {
      label: 'moderado',
      tone: 'text-primary',
      color: '#5332ea',
      ring: 'border-primary/25 shadow-md-token',
      motion: [1, 1.02, 1],
    }
  }
  return {
    label: 'critico',
    tone: 'text-danger',
    color: '#f87171',
    ring: 'border-danger/30 shadow-md-token',
    motion: [1, 1.028, 0.992, 1],
  }
}

function currency(value?: number): string {
  if (!value) return 'potencial indefinido'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ICPHero({ profile, leads }: Props) {
  const reduced = useReducedMotion()
  const analytics = useMemo(() => getPipelineICPAnalytics(leads, profile), [leads, profile])
  const status = fitStatus(analytics.averageScore)
  const top = analytics.topOpportunity
  const fitDegrees = Math.max(0, Math.min(100, analytics.averageScore)) * 3.6

  return (
    <Card className="overflow-hidden border-primary/20 bg-surface">
      <div className="grid gap-0 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="relative flex min-h-[360px] items-center justify-center border-b border-border-subtle bg-background/35 p-6 xl:border-b-0 xl:border-r">
          <div className="absolute left-6 top-6 z-[1] flex items-center gap-2">
            <Badge variant="default" className="border-primary/20 bg-primary-muted text-primary">
              Orb de aderencia
            </Badge>
          </div>

          <motion.div
            aria-label={`Aderencia media ao ICP: ${analytics.averageScore}%`}
            role="img"
            className={cn(
              'relative flex h-64 w-64 items-center justify-center rounded-full border',
              status.ring,
            )}
            style={{
              background: `conic-gradient(from 180deg, ${status.color} ${fitDegrees}deg, rgba(46,43,64,0.55) 0deg)`,
            }}
            animate={reduced ? undefined : { scale: status.motion }}
            transition={reduced ? undefined : { duration: analytics.averageScore >= 80 ? 6 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-3 rounded-full border border-border-subtle bg-background shadow-lg-token" />
            <div className="absolute inset-10 rounded-full border border-primary/10 bg-surface" />
            <div className="relative z-[1] text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Aderencia media
              </p>
              <p className="mt-2 font-display text-5xl font-bold leading-none tracking-tight text-text">
                {analytics.averageScore}%
              </p>
              <p className={cn('mt-2 text-sm font-semibold uppercase tracking-[0.16em]', status.tone)}>
                {status.label}
              </p>
              <p className="mt-3 text-xs text-text-secondary">
                {analytics.alignedCount} leads alinhados
              </p>
            </div>
          </motion.div>
        </div>

        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Modelo ativo</Badge>
            <span className="text-xs text-text-secondary">{profile.name}</span>
          </div>

          <div className="mt-5 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Leitura do pipeline
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-text lg:text-4xl">
              {analytics.scoredLeads.length === 0
                ? 'Cadastre leads para calcular aderencia ao ICP.'
                : analytics.distribution.high > 0
                ? `${analytics.distribution.high} oportunidades com fit alto para priorizar.`
                : analytics.alignedCount > 0
                  ? `${analytics.alignedCount} leads perto do ICP alvo.`
                  : 'O pipeline ainda precisa de leads mais alinhados ao ICP.'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
              {analytics.scoredLeads.length === 0
                ? 'Assim que os primeiros leads reais entrarem no CRM, este painel mostra aderencia media, oportunidades alinhadas e gargalos de fit.'
                : profile.description}
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border-subtle bg-background/30 p-4">
              <Target className="h-4 w-4 text-success" strokeWidth={1.75} aria-hidden />
              <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Alto fit
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-text">{analytics.distribution.high}</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-background/30 p-4">
              <Crosshair className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
              <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Possivel fit
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-text">{analytics.distribution.possible}</p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-background/30 p-4">
              <ShieldAlert className="h-4 w-4 text-warning" strokeWidth={1.75} aria-hidden />
              <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Fit fraco
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-text">{analytics.distribution.weak}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-primary/20 bg-primary-muted/35 p-4">
            <div className="flex items-center gap-2 text-primary">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                Melhor oportunidade
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text">
              {top
                ? `${top.lead.company} esta com ICP ${top.score.total}/100 e ${currency(top.lead.revenuePotential)} de potencial.`
                : 'Sem leads abertos para ranquear agora.'}
            </p>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-border-subtle bg-background/25 p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
            <p className="text-sm leading-relaxed text-text-secondary">
              Score alto significa aderencia estrutural ao ICP, nao intuicao solta: nicho, urgencia, recorrencia, canais ativos e red flags entram no calculo.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
