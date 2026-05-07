import { calendarEventsRepo } from '@/lib/repositories/calendar-events.repository'
import { feedbacksRepo } from '@/lib/repositories/feedbacks.repository'
import { interactionsRepo } from '@/lib/repositories/interaction.repository'
import { leadsRepo } from '@/lib/repositories/leads.repository'
import { noteFoldersRepo } from '@/lib/repositories/note-folders.repository'
import { notesRepo } from '@/lib/repositories/notes.repository'
import { settingsRepo } from '@/lib/repositories/settings.repository'
import { tasksRepo } from '@/lib/repositories/tasks.repository'

const operationalRepositories = [
  leadsRepo,
  tasksRepo,
  notesRepo,
  noteFoldersRepo,
  calendarEventsRepo,
  feedbacksRepo,
  interactionsRepo,
] as const

export async function clearOperationalWorkspaceData(): Promise<void> {
  await Promise.all(operationalRepositories.map((repo) => repo.clear()))
}

export async function resetLocalWorkspace(): Promise<void> {
  await clearOperationalWorkspaceData()
  await settingsRepo.resetSettings()
}

export async function loadDemoWorkspaceData(): Promise<void> {
  await Promise.all(operationalRepositories.map((repo) => repo.seedDemoData()))
}
