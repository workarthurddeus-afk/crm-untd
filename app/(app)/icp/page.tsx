'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { useLeads } from '@/lib/hooks/use-leads'
import { tokens } from '@/lib/theme/tokens'
import { ICPHero } from '@/components/icp/icp-hero'
import { ICPScoreDistribution } from '@/components/icp/icp-score-distribution'
import { CriteriaList } from '@/components/icp/criteria-list'
import { PersonaCard } from '@/components/icp/persona-card'
import { ICPPageSkeleton } from '@/components/icp/icp-page-skeleton'

export default function ICPPage() {
  const { profile, isLoading: profileLoading } = useICPProfile()
  const { leads, isLoading: leadsLoading } = useLeads()
  const reduced = useReducedMotion()

  const isLoading = profileLoading || leadsLoading

  const editAction = (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={-1}>
          <Button variant="secondary" size="md" disabled>
            <Pencil aria-hidden />
            Editar perfil
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Edição chega na Phase 2.</TooltipContent>
    </Tooltip>
  )

  return (
    <div>
      <PageHeader
        title="ICP & Scoring"
        description="Quem é o seu cliente perfeito — em números."
        actions={editAction}
      />
      {isLoading || !profile ? (
        <ICPPageSkeleton />
      ) : (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: tokens.duration.slow / 1000,
            ease: tokens.easing.enter,
          }}
          className="mx-auto max-w-6xl px-8 py-8 space-y-6"
        >
          <ICPHero profile={profile} leads={leads} />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="space-y-6 min-w-0">
              <ICPScoreDistribution leads={leads} profile={profile} />
              <CriteriaList profile={profile} leads={leads} />
            </div>
            <div className="lg:sticky lg:top-6">
              <PersonaCard persona={profile.persona} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
