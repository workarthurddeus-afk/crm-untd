'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PageHeader } from '@/components/shared/page-header'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { useLeads } from '@/lib/hooks/use-leads'
import { tokens } from '@/lib/theme/tokens'
import { ICPPageActions } from '@/components/icp/icp-page-actions'
import { ICPHero } from '@/components/icp/icp-hero'
import { ICPScoreDistribution } from '@/components/icp/icp-score-distribution'
import { CriteriaList } from '@/components/icp/criteria-list'
import { ICPPageSkeleton } from '@/components/icp/icp-page-skeleton'
import { ICPTargetCard } from '@/components/icp/icp-target-card'
import { ICPEditorSheet } from '@/components/icp/icp-editor-sheet'
import { PipelineICPAnalysis } from '@/components/icp/pipeline-icp-analysis'

export default function ICPPage() {
  const { profile, isLoading: profileLoading, updateProfile } = useICPProfile()
  const { leads, isLoading: leadsLoading } = useLeads()
  const [editorOpen, setEditorOpen] = useState(false)
  const reduced = useReducedMotion()

  const isLoading = profileLoading || leadsLoading

  return (
    <div>
      <PageHeader
        title="ICP & Scoring"
        description="Centro de leitura, edicao e analise do cliente ideal da UNTD."
        actions={<ICPPageActions />}
        className="flex-col px-4 sm:flex-row sm:px-6 lg:px-8"
      />
      {isLoading || !profile ? (
        <ICPPageSkeleton />
      ) : (
        <>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: tokens.duration.slow / 1000,
              ease: tokens.easing.enter,
            }}
            className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          >
            <ICPHero profile={profile} leads={leads} />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
              <div className="space-y-6">
                <ICPTargetCard profile={profile} onEdit={() => setEditorOpen(true)} />
                <PipelineICPAnalysis profile={profile} leads={leads} />
              </div>
              <div className="space-y-6 xl:sticky xl:top-6">
                <ICPScoreDistribution leads={leads} profile={profile} />
              </div>
            </div>

            <CriteriaList profile={profile} leads={leads} />
          </motion.div>

          <ICPEditorSheet
            open={editorOpen}
            profile={profile}
            onOpenChange={setEditorOpen}
            onSave={updateProfile}
          />
        </>
      )}
    </div>
  )
}
