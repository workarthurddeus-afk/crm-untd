import { z } from 'zod'
import {
  CALENDAR_ATTENDEE_STATUSES,
  CALENDAR_COLORS,
  CALENDAR_EVENT_STATUSES,
  CALENDAR_EVENT_TYPES,
  CALENDAR_IMPORTANCES,
  CALENDAR_PRIORITIES,
  CALENDAR_SOURCES,
} from '@/lib/types'

export const calendarAttendeeStatusSchema = z.enum(CALENDAR_ATTENDEE_STATUSES)

export const calendarAttendeeSchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email().optional(),
  leadId: z.string().nullable().optional(),
  status: calendarAttendeeStatusSchema.default('unknown').optional(),
})

export const calendarEventTypeSchema = z.enum(CALENDAR_EVENT_TYPES)
export const calendarEventStatusSchema = z.enum(CALENDAR_EVENT_STATUSES)
export const calendarPrioritySchema = z.enum(CALENDAR_PRIORITIES)
export const calendarImportanceSchema = z.enum(CALENDAR_IMPORTANCES)
export const calendarColorSchema = z.enum(CALENDAR_COLORS)
export const calendarSourceSchema = z.enum(CALENDAR_SOURCES)

export const calendarEventInputSchema = z.object({
  title: z.string().min(1).max(220),
  description: z.string().max(2000).optional(),
  startAt: z.string(),
  endAt: z.string().optional(),
  allDay: z.boolean().default(false),
  type: calendarEventTypeSchema.default('other'),
  status: calendarEventStatusSchema.default('scheduled'),
  priority: calendarPrioritySchema.default('medium'),
  importance: calendarImportanceSchema.default('medium'),
  color: calendarColorSchema.default('default'),
  location: z.string().max(240).optional(),
  meetingUrl: z.string().url().optional(),
  attendees: z.array(calendarAttendeeSchema).default([]),
  tags: z.array(z.string().min(1).max(80)).default([]),
  relatedLeadId: z.string().nullable().optional(),
  relatedTaskId: z.string().nullable().optional(),
  relatedNoteId: z.string().nullable().optional(),
  relatedFeedbackId: z.string().nullable().optional(),
  relatedProjectId: z.string().nullable().optional(),
  source: calendarSourceSchema.default('manual'),
  isReminder: z.boolean().default(false),
  reminderAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
})

export type CalendarEventInputSchema = z.infer<typeof calendarEventInputSchema>
