'use client'

import { useEffect, useMemo, useState } from 'react'
import { calendarEventsRepo } from '@/lib/repositories/calendar-events.repository'
import {
  cancelCalendarEvent,
  createCalendarEvent,
  getCalendarRange,
  getDashboardCalendarSummary,
  getMonthAgenda,
  getRangeForView,
  getTodaySchedule,
  getUpcomingSchedule,
  getWeekAgenda,
  markEventCompleted,
  markEventUncompleted,
  postponeCalendarEvent,
  updateCalendarEvent,
  type DashboardCalendarSummary,
} from '@/lib/services/calendar.service'
import type { CalendarEvent, CalendarFilters, CalendarView } from '@/lib/types'

type AsyncError = Error | null

interface CalendarHookOptions {
  view?: CalendarView
  currentDate?: string | Date
  filters?: CalendarFilters
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unexpected calendar error')
}

function useCalendarActions() {
  return useMemo(
    () => ({
      createEvent: createCalendarEvent,
      updateEvent: updateCalendarEvent,
      completeEvent: markEventCompleted,
      uncompleteEvent: markEventUncompleted,
      cancelEvent: cancelCalendarEvent,
      postponeEvent: postponeCalendarEvent,
    }),
    []
  )
}

export function useCalendar(options: CalendarHookOptions = {}) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useCalendarActions()
  const currentDateKey = options.currentDate ? new Date(options.currentDate).toISOString() : undefined
  const view = options.view ?? 'week'

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      const currentDate = currentDateKey ? new Date(currentDateKey) : new Date()
      const range = getRangeForView(view === 'agenda' ? 'week' : view, currentDate)
      void getCalendarRange(range.start, range.end, options.filters).then(
        (data) => {
          if (!active) return
          setEvents(data)
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [currentDateKey, options.filters, view])

  return { events, data: events, isLoading, loading: isLoading, error, actions }
}

export function useCalendarEvents(filters?: CalendarFilters) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useCalendarActions()

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void calendarEventsRepo.listEvents(filters).then(
        (data) => {
          if (!active) return
          setEvents(data)
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [filters])

  return { events, data: events, isLoading, loading: isLoading, error, actions }
}

export function useTodaySchedule() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getTodaySchedule().then(
        (data) => {
          if (!active) return
          setEvents(data)
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { events, data: events, isLoading, loading: isLoading, error }
}

export function useWeekAgenda(date: string | Date = new Date()) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getWeekAgenda(date).then(
        (data) => {
          if (!active) return
          setEvents(data)
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [date])

  return { events, data: events, isLoading, loading: isLoading, error }
}

export function useMonthAgenda(date: string | Date = new Date()) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getMonthAgenda(date).then(
        (data) => {
          if (!active) return
          setEvents(data)
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [date])

  return { events, data: events, isLoading, loading: isLoading, error }
}

export function useCalendarSummary() {
  const [summary, setSummary] = useState<DashboardCalendarSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getDashboardCalendarSummary().then(
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { summary, data: summary, isLoading, loading: isLoading, error }
}

export function useUpcomingEvents(limit = 8) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getUpcomingSchedule(limit).then(
        (data) => {
          if (!active) return
          setEvents(data)
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [limit])

  return { events, data: events, isLoading, loading: isLoading, error }
}

export function useCalendarEvent(id: string | null) {
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const actions = useCalendarActions()

  useEffect(() => {
    if (!id) {
      let active = true
      queueMicrotask(() => {
        if (!active) return
        setEvent(null)
        setIsLoading(false)
      })
      return () => {
        active = false
      }
    }

    let active = true
    const load = () => {
      setIsLoading(true)
      void calendarEventsRepo.getEventById(id).then(
        (data) => {
          if (!active) return
          setEvent(data)
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
    const unsubscribe = calendarEventsRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [id])

  return { event, data: event, isLoading, loading: isLoading, error, actions }
}
