'use client'

import { useEffect, useMemo, useState } from 'react'
import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import {
  archiveNoteFolder,
  createNoteFolder,
  deleteNoteFolder,
  getNoteFolders,
  restoreNoteFolder,
  updateNoteFolder,
  type NoteFolderWithCount,
} from '@/lib/services/note-folders.service'

type AsyncError = Error | null

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unexpected note folders error')
}

export function useNoteFolders() {
  const [folders, setFolders] = useState<NoteFolderWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AsyncError>(null)

  useEffect(() => {
    let active = true

    const load = () => {
      setIsLoading(true)
      void getNoteFolders().then(
        (data) => {
          if (!active) return
          setFolders(data)
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
    const unsubscribe = noteFoldersRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const actions = useMemo(
    () => ({
      create: createNoteFolder,
      update: updateNoteFolder,
      archive: archiveNoteFolder,
      restore: restoreNoteFolder,
      delete: deleteNoteFolder,
    }),
    []
  )

  return { folders, data: folders, isLoading, loading: isLoading, error, actions }
}
