import type { Feedback, Lead, PipelineStage, Task } from '@/lib/types'
import { leadsNeedingFollowUpToday, leadsNeedingProposal, leadsStale } from './follow-up.service'

export type Alert =
  | { type: 'leads-stale'; count: number; days: number; leadIds: string[] }
  | { type: 'follow-ups-due-today'; count: number; leadIds: string[] }
  | { type: 'high-icp-no-proposal'; count: number; leadIds: string[] }
  | { type: 'tasks-overdue'; count: number; taskIds: string[] }
  | { type: 'high-impact-feedback'; count: number; feedbackIds: string[] }

interface GenerateAlertsInput {
  leads: Lead[]
  tasks: Task[]
  feedbacks: Feedback[]
  pipeline: PipelineStage[]
  today: Date
  staleThresholdDays?: number
  highIcpThreshold?: number
}

function overdueTasks(tasks: Task[], today: Date): Task[] {
  return tasks.filter((task) => {
    if (task.status === 'done' || task.status === 'cancelled') return false
    if (!task.dueDate) return false
    return new Date(task.dueDate).getTime() < today.getTime()
  })
}

function highImpactFeedbacks(feedbacks: Feedback[]): Feedback[] {
  return feedbacks.filter(
    (feedback) =>
      feedback.impact === 'high' && (feedback.status === 'new' || feedback.status === 'reviewing')
  )
}

export function generateAlerts(input: GenerateAlertsInput): Alert[] {
  const staleThresholdDays = input.staleThresholdDays ?? 10
  const highIcpThreshold = input.highIcpThreshold ?? 80
  const alerts: Alert[] = []

  const dueFollowUps = leadsNeedingFollowUpToday(input.leads, input.today)
  if (dueFollowUps.length > 0) {
    alerts.push({
      type: 'follow-ups-due-today',
      count: dueFollowUps.length,
      leadIds: dueFollowUps.map((lead) => lead.id),
    })
  }

  const stale = leadsStale(input.leads, staleThresholdDays, input.today)
  if (stale.length > 0) {
    alerts.push({
      type: 'leads-stale',
      count: stale.length,
      days: staleThresholdDays,
      leadIds: stale.map((lead) => lead.id),
    })
  }

  const proposalNeeded = leadsNeedingProposal(input.leads, input.pipeline, highIcpThreshold)
  if (proposalNeeded.length > 0) {
    alerts.push({
      type: 'high-icp-no-proposal',
      count: proposalNeeded.length,
      leadIds: proposalNeeded.map((lead) => lead.id),
    })
  }

  const tasksOverdue = overdueTasks(input.tasks, input.today)
  if (tasksOverdue.length > 0) {
    alerts.push({
      type: 'tasks-overdue',
      count: tasksOverdue.length,
      taskIds: tasksOverdue.map((task) => task.id),
    })
  }

  const feedbacks = highImpactFeedbacks(input.feedbacks)
  if (feedbacks.length > 0) {
    alerts.push({
      type: 'high-impact-feedback',
      count: feedbacks.length,
      feedbackIds: feedbacks.map((feedback) => feedback.id),
    })
  }

  return alerts
}
