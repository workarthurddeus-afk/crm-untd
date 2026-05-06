'use client'

import { useEffect, useMemo, useState } from 'react'
import { notesRepo } from '@/lib/repositories/notes.repository'
import {
  archiveNote,
  createStrategicNote,
  createTaskFromNote,
  getNoteDetails,
  getNotesLibrary,
  getNotesStats,
  getStrategicMemory,
  restoreNote,
  toggleFavorite,
  togglePinned,
  updateStrategicNote,
  type StrategicMemoryOptions,
} from '@/lib/services/notes.service'
import type { Note } from '@/lib/types'
import type { NoteFilters } from '@/lib/utils/notes'
import type { StrategicMemoryPick } from '@/lib/utils/strategic-memory'

type AsyncError = Error | null

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unexpected notes error')
}

export function useNotes(filters?: NoteFilters) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true

    const load = () => {
      setIsLoading(true)
      void getNotesLibrary({ filters }).then(
        (data) => {
          if (!active) return
          setNotes(data)
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
    const unsubscribe = notesRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [filters])

  const actions = useMemo(
    () => ({
      create: createStrategicNote,
      update: updateStrategicNote,
      archive: archiveNote,
      restore: restoreNote,
      togglePinned,
      toggleFavorite,
      createTaskFromNote,
    }),
    []
  )

  return { notes, data: notes, isLoading, loading: isLoading, error, actions }
}

export function useNote(id: string | null) {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    if (!id) {
      let active = true
      queueMicrotask(() => {
        if (!active) return
        setNote(null)
        setIsLoading(false)
      })
      return () => {
        active = false
      }
    }

    let active = true
    const load = () => {
      setIsLoading(true)
      void getNoteDetails(id).then(
        (data) => {
          if (!active) return
          setNote(data)
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
    const unsubscribe = notesRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [id])

  return { note, data: note, isLoading, loading: isLoading, error }
}

export function useStrategicMemory(options?: StrategicMemoryOptions) {
  const [memory, setMemory] = useState<StrategicMemoryPick | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)
  const currentDateKey = options?.currentDate?.toISOString()

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      const currentDate = currentDateKey ? new Date(currentDateKey) : undefined
      void getStrategicMemory({ currentDate }).then(
        (data) => {
          if (!active) return
          setMemory(data)
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
    const unsubscribe = notesRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [currentDateKey])

  return { memory, data: memory, isLoading, loading: isLoading, error }
}

export function useNotesStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getNotesStats>> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true
    const load = () => {
      setIsLoading(true)
      void getNotesStats().then(
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
    const unsubscribe = notesRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return { stats, data: stats, isLoading, loading: isLoading, error }
}
