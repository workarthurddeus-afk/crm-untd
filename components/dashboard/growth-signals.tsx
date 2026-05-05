'use client'
import Link from 'next/link'
import { Share2, Megaphone, ArrowRight, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatBRL } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { SocialMediaSignal, MetaAdsSignal } from '@/lib/mocks/growth-signals'

interface Props { social: SocialMediaSignal; ads: MetaAdsSignal }

interface RowProps { label: string; value: string }
function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono tabular-nums text-text">{value}</span>
    </div>
  )
}

export function GrowthSignals({ social, ads }: Props) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="p-5 transition-colors duration-fast hover:border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Share2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Social Media</h3>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" strokeWidth={1.75} aria-hidden />
            {social.growth.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <Row label="Alcance 7d" value={social.reach7d.toLocaleString('pt-BR')} />
          <Row label="Engajamento" value={`${social.engagementRate.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`} />
          <div className="pt-2 border-t border-border-subtle">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Melhor conteúdo</p>
            <p className="mt-1 text-sm text-text leading-snug truncate">{social.bestPostTitle}</p>
          </div>
        </div>

        <Link href="/social-media" className={cn('mt-4 inline-flex items-center gap-1 text-xs font-medium text-text-secondary', 'transition-colors duration-fast hover:text-text')}>
          Ver Social Media <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        </Link>
      </Card>

      <Card className="p-5 transition-colors duration-fast hover:border-primary/20">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Megaphone className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Meta Ads</h3>
        </div>

        <div className="mt-4 space-y-2">
          <Row label="Investimento" value={formatBRL(ads.investment)} />
          <Row label="Leads gerados" value={ads.leadsGenerated.toLocaleString('pt-BR')} />
          <Row label="CPL" value={formatBRL(ads.cpl)} />
          <div className="pt-2 border-t border-border-subtle">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Melhor campanha</p>
            <p className="mt-1 text-sm text-text leading-snug truncate">{ads.bestCampaign}</p>
          </div>
        </div>

        <Link href="/meta-ads" className={cn('mt-4 inline-flex items-center gap-1 text-xs font-medium text-text-secondary', 'transition-colors duration-fast hover:text-text')}>
          Ver Meta Ads <ArrowRight className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        </Link>
      </Card>
    </section>
  )
}
