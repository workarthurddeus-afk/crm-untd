'use client'

import { useEffect, useMemo, useState } from 'react'
import { settingsRepo } from '@/lib/repositories/settings.repository'
import {
  getBusinessMetricsSettings,
  getSettings,
  resetSettings,
  updateBusinessMetrics,
  updateSettings,
} from '@/lib/services/settings.service'
import type { BusinessMetricsSettings, SettingsUpdateInput, UntdSettings } from '@/lib/types/settings'

type AsyncError = Error | null

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unexpected settings error')
}

function useSettingsActions() {
  return useMemo(
    () => ({
      updateSettings,
      resetSettings,
      updateBusinessMetrics,
    }),
    []
  )
}

export function useSettings() {
  const [settings, setSettings] = useState<UntdSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useSettingsActions()

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getSettings().then(
        (data) => {
          if (!active) return
          setSettings(data)
          setError(null)
          setIsLoading(false)
        },
        (err: unknown) => {
          if (!active) return
          setError(toError(err))
          setIsLoading(false)
        }
      )
    }

    load()
    const unsubscribe = settingsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { settings, data: settings, isLoading, loading: isLoading, error, actions }
}

export function useBusinessMetricsSettings() {
  const [metrics, setMetrics] = useState<BusinessMetricsSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useSettingsActions()

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getBusinessMetricsSettings().then(
        (data) => {
          if (!active) return
          setMetrics(data)
          setError(null)
          setIsLoading(false)
        },
        (err: unknown) => {
          if (!active) return
          setError(toError(err))
          setIsLoading(false)
        }
      )
    }

    load()
    const unsubscribe = settingsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { metrics, data: metrics, isLoading, loading: isLoading, error, actions }
}

export type { SettingsUpdateInput }
