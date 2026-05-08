'use client'

import { useEffect, useState } from 'react'
import { pipelineRepo } from '@/lib/repositories/pipeline.repository'
import type { PipelineStage } from '@/lib/types'

export function usePipelineStages() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true

    const load = () => {
      setIsLoading(true)
      void pipelineRepo
        .list()
        .then((data) => {
          if (!active) return
          setStages(data)
          setError(null)
        })
        .catch((err: unknown) => {
          if (!active) return
          setStages([])
          setError(err instanceof Error ? err : new Error(String(err)))
        })
        .finally(() => {
          if (!active) return
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

  return { stages, isLoading, error }
}
