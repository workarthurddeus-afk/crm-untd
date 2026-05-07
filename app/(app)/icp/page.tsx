'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { useLeads } from '@/lib/hooks/use-leads'
import { tokens } from '@/lib/theme/tokens'
import { ICPPageActions } from '@/components/icp/icp-page-actions'
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

  return (
    <div>
      <PageHeader
        title="ICP & Scoring"
        description="O radar que separa oportunidade real de ruído comercial."
        actions={<ICPPageActions />}
        className="flex-col px-4 sm:flex-row sm:px-6 lg:px-8"
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
          className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.55fr)] xl:items-start">
            <ICPHero profile={profile} leads={leads} />
            <div className="xl:sticky xl:top-6">
              <PersonaCard persona={profile.persona} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.42fr)] xl:items-start">
            <CriteriaList profile={profile} leads={leads} />
            <div className="xl:sticky xl:top-6">
              <ICPScoreDistribution leads={leads} profile={profile} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
