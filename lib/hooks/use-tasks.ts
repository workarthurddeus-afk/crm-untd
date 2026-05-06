'use client'

import { useCallback, useEffect, useState } from 'react'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import {
  cancelTask as cancelTaskAction,
  completeTask as completeTaskAction,
  createTask as createTaskAction,
  postponeTask as postponeTaskAction,
  reopenTask as reopenTaskAction,
  scheduleTaskOnCalendar as scheduleTaskOnCalendarAction,
  uncompleteTask as uncompleteTaskAction,
  updateTask as updateTaskAction,
} from '@/lib/services/tasks.service'
import type { Task, TaskInput } from '@/lib/types'

export function useTasks(filters?: Partial<Task>) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const actions = useTaskActions()

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

  return { tasks, isLoading, ...actions }
}

export function useTask(id: string | null) {
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
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

  return {
    task: id ? task : null,
    isLoading: id ? isLoading : false,
  }
}

export function useTaskActions() {
  const createTask = useCallback((input: TaskInput) => createTaskAction(input), [])
  const updateTask = useCallback(
    (id: string, input: Partial<TaskInput>) => updateTaskAction(id, input),
    []
  )
  const completeTask = useCallback((id: string, completedAt?: string) => {
    return completeTaskAction(id, completedAt)
  }, [])
  const reopenTask = useCallback((id: string) => reopenTaskAction(id), [])
  const uncompleteTask = useCallback((id: string) => uncompleteTaskAction(id), [])
  const cancelTask = useCallback((id: string, cancelledAt?: string) => {
    return cancelTaskAction(id, cancelledAt)
  }, [])
  const postponeTask = useCallback((id: string, newDueDate: string) => {
    return postponeTaskAction(id, newDueDate)
  }, [])
  const scheduleTaskOnCalendar = useCallback((id: string) => {
    return scheduleTaskOnCalendarAction(id)
  }, [])

  return {
    createTask,
    updateTask,
    completeTask,
    reopenTask,
    uncompleteTask,
    cancelTask,
    postponeTask,
    scheduleTaskOnCalendar,
  }
}
