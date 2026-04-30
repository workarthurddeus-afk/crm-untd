'use client'

import { useEffect, useState } from 'react'
import { pipelineRepo } from '@/lib/repositories/pipeline.repository'
import type { PipelineStage } from '@/lib/types'

export function usePipelineStages() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = () => {
      void pipelineRepo.list().then((data) => {
        if (!active) return
        setStages(data)
        setIsLoading(false)
      })
    }

    load()
    const unsubscribe = pipelineRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { stages, isLoading }
}
