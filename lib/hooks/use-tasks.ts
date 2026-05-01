'use client'

import { useEffect, useState } from 'react'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import type { Task } from '@/lib/types'

export function useTasks(filters?: Partial<Task>) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = () => {
      void tasksRepo.list(filters).then((data) => {
        if (!active) return
        setTasks(data)
        setIsLoading(false)
      })
    }

    load()
    const unsubscribe = tasksRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [filters])

  return { tasks, isLoading }
}

export function useTask(id: string | null) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setTask(null)
      setIsLoading(false)
      return
    }

    let active = true

    const load = () => {
      void tasksRepo.getById(id).then((data) => {
        if (!active) return
        setTask(data)
        setIsLoading(false)
      })
    }

    load()
    const unsubscribe = tasksRepo.subscribe(load)

    return () => {
      active = false
      unsubscribe()
    }
  }, [id])

  return { task, isLoading }
}
