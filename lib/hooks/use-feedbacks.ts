'use client'

import { useEffect, useMemo, useState } from 'react'
import { feedbacksRepo } from '@/lib/repositories/feedbacks.repository'
import {
  archiveFeedback,
  createFeedback,
  deleteFeedbackPermanently,
  getFeedbackDashboardSummary,
  getFeedbackInbox,
  getFeedbackStats,
  getFeedbacksByLead,
  pinFeedback,
  reopenFeedback,
  resolveFeedback,
  unarchiveFeedback,
  unpinFeedback,
  updateFeedback,
  type FeedbackDashboardSummary,
  type FeedbackStats,
} from '@/lib/services/feedbacks.service'
import type { Feedback, FeedbackFilters } from '@/lib/types'

type AsyncError = Error | null

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unexpected feedbacks error')
}

function useFeedbackActions() {
  return useMemo(
    () => ({
      createFeedback,
      updateFeedback,
      archiveFeedback,
      unarchiveFeedback,
      deleteFeedback: deleteFeedbackPermanently,
      resolveFeedback,
      reopenFeedback,
      pinFeedback,
      unpinFeedback,
    }),
    []
  )
}

export function useFeedbacks(filters?: FeedbackFilters) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useFeedbackActions()

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getFeedbackInbox(filters).then(
        (data) => {
          if (!active) return
          setFeedbacks(data)
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
    const unsubscribe = feedbacksRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [filters])

  return { feedbacks, data: feedbacks, isLoading, loading: isLoading, error, actions }
}

export function useFeedback(id: string | null) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useFeedbackActions()

  useEffect(() => {
    if (!id) {
      let active = true
      queueMicrotask(() => {
        if (!active) return
        setFeedback(null)
        setIsLoading(false)
      })
      return () => {
        active = false
      }
    }

    let active = true
    const load = () => {
      setIsLoading(true)
      void feedbacksRepo.getFeedbackById(id).then(
        (data) => {
          if (!active) return
          setFeedback(data)
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
    const unsubscribe = feedbacksRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [id])

  return { feedback, data: feedback, isLoading, loading: isLoading, error, actions }
}

export function useFeedbackStats() {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getFeedbackStats().then(
        (data) => {
          if (!active) return
          setStats(data)
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
    const unsubscribe = feedbacksRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { stats, data: stats, isLoading, loading: isLoading, error }
}

export function useFeedbackDashboardSummary() {
  const [summary, setSummary] = useState<FeedbackDashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getFeedbackDashboardSummary().then(
        (data) => {
          if (!active) return
          setSummary(data)
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
    const unsubscribe = feedbacksRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { summary, data: summary, isLoading, loading: isLoading, error }
}

export function useFeedbacksByLead(leadId: string | null) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useFeedbackActions()

  useEffect(() => {
    if (!leadId) {
      let active = true
      queueMicrotask(() => {
        if (!active) return
        setFeedbacks([])
        setIsLoading(false)
      })
      return () => {
        active = false
      }
    }

    let active = true
    const load = () => {
      setIsLoading(true)
      void getFeedbacksByLead(leadId).then(
        (data) => {
          if (!active) return
          setFeedbacks(data)
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
    const unsubscribe = feedbacksRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [leadId])

  return { feedbacks, data: feedbacks, isLoading, loading: isLoading, error, actions }
}
