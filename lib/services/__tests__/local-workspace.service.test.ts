import { beforeEach, describe, expect, it } from 'vitest'
import { calendarEventsRepo } from '@/lib/repositories/calendar-events.repository'
import { feedbacksRepo } from '@/lib/repositories/feedbacks.repository'
import { interactionsRepo } from '@/lib/repositories/interaction.repository'
import { leadsRepo } from '@/lib/repositories/leads.repository'
import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { notesRepo } from '@/lib/repositories/notes.repository'
import { settingsRepo } from '@/lib/repositories/settings.repository'
import { tasksRepo } from '@/lib/repositories/tasks.repository'
import {
  clearOperationalWorkspaceData,
  loadDemoWorkspaceData,
  resetLocalWorkspace,
} from '../local-workspace.service'

describe('local workspace service', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps operational modules empty by default', async () => {
    await expect(leadsRepo.list()).resolves.toEqual([])
    await expect(tasksRepo.list()).resolves.toEqual([])
    await expect(notesRepo.listNotes()).resolves.toEqual([])
    await expect(calendarEventsRepo.listEvents()).resolves.toEqual([])
    await expect(feedbacksRepo.listFeedbacks()).resolves.toEqual([])
    await expect(interactionsRepo.list()).resolves.toEqual([])
  })

  it('loads demo data only through an explicit action', async () => {
    await loadDemoWorkspaceData()

    expect((await leadsRepo.list()).length).toBeGreaterThan(0)
    expect((await tasksRepo.list()).length).toBeGreaterThan(0)
    expect((await notesRepo.listNotes()).length).toBeGreaterThan(0)
    expect((await noteFoldersRepo.listFolders()).length).toBeGreaterThan(0)
    expect((await calendarEventsRepo.listEvents()).length).toBeGreaterThan(0)
    expect((await feedbacksRepo.listFeedbacks()).length).toBeGreaterThan(0)
    expect((await interactionsRepo.list()).length).toBeGreaterThan(0)
  })

  it('clears operational modules without removing workspace settings defaults', async () => {
    await loadDemoWorkspaceData()
    await clearOperationalWorkspaceData()

    await expect(leadsRepo.list()).resolves.toEqual([])
    await expect(tasksRepo.list()).resolves.toEqual([])
    await expect(notesRepo.listNotes()).resolves.toEqual([])
    await expect(calendarEventsRepo.listEvents()).resolves.toEqual([])
    await expect(feedbacksRepo.listFeedbacks()).resolves.toEqual([])
    await expect(interactionsRepo.list()).resolves.toEqual([])
    await expect(settingsRepo.getSettings()).resolves.toMatchObject({
      workspace: { workspaceName: 'UNTD OS' },
    })
  })

  it('resets operational data and settings to clean defaults', async () => {
    await settingsRepo.updateBusinessMetrics({ currentMRR: 12000 })
    await loadDemoWorkspaceData()

    await resetLocalWorkspace()

    await expect(leadsRepo.list()).resolves.toEqual([])
    await expect(settingsRepo.getBusinessMetricsSettings()).resolves.toMatchObject({
      currentMRR: 0,
    })
  })
})
