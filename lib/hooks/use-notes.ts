'use client'
import { useEffect, useState } from 'react'
import { notesRepo } from '@/lib/repositories/notes.repository'
import type { Note } from '@/lib/types'

export function useNotes(filters?: Partial<Note>) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    let active = true
    const load = () => {
      void notesRepo.list(filters).then((data) => {
        if (!active) return
        setNotes(data)
        setIsLoading(false)
      })
    }
    load()
    const unsubscribe = notesRepo.subscribe(load)
    return () => {
      active = false
      unsubscribe()
    }
  }, [filters])
  return { notes, isLoading }
}
