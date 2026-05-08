'use client'

import { useEffect, useState } from 'react'
import { interactionsRepo } from '@/lib/repositories/interaction.repository'
import type { LeadInteraction } from '@/lib/types'

function sortNewestFirst(interactions: LeadInteraction[]): LeadInteraction[] {
  return [...interactions].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  )
}

export function useInteractions(leadId: string | null) {
  const [interactions, setInteractions] = useState<LeadInteraction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!leadId) {
      return
    }

    let active = true

    const load = () => {
      void interactionsRepo.getByLeadId(leadId).then((data) => {
        if (!active) return
        setInteractions(sortNewestFirst(data))
        setIsLoading(false)
      })
    }

    load()
    const unsubscribe = interactionsRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [leadId])

  return {
    interactions: leadId ? interactions : [],
    isLoading: leadId ? isLoading : false,
  }
}
