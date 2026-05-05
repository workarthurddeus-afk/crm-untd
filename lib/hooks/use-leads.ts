'use client'

import { useEffect, useState } from 'react'
import { leadsRepo } from '@/lib/repositories/leads.repository'
import type { Lead } from '@/lib/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = () => {
      void leadsRepo.list().then((data) => {
        if (!active) return
        setLeads(data)
        setIsLoading(false)
      })
    }

    load()
    const unsubscribe = leadsRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { leads, isLoading }
}

export function useLead(id: string | null) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      return
    }

    let active = true

    const load = () => {
      void leadsRepo.getById(id).then((data) => {
        if (!active) return
        setLead(data)
        setIsLoading(false)
      })
    }

    load()
    const unsubscribe = leadsRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [id])

  return {
    lead: id ? lead : null,
    isLoading: id ? isLoading : false,
  }
}
