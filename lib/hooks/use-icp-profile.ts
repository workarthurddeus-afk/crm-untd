'use client'

import { useEffect, useState } from 'react'
import { icpRepo } from '@/lib/repositories/icp.repository'
import type { ICPProfile } from '@/lib/types'

export function useICPProfile() {
  const [profile, setProfile] = useState<ICPProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = () => {
      void icpRepo.get().then((data) => {
        if (!active) return
        setProfile(data)
        setIsLoading(false)
      })
    }

    load()
    const unsubscribe = icpRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { profile, isLoading }
}
