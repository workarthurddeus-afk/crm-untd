import { z } from 'zod'

const positiveNumber = z.number().min(0)
const positiveInteger = z.number().int().min(0)

export const workspaceSettingsSchema = z.object({
  workspaceName: z.string().min(1),
  userName: z.string().min(1),
  companyName: z.string().min(1),
  companyDescription: z.string(),
  timezone: z.string().min(1),
  language: z.enum(['pt-BR', 'en-US']),
  currency: z.enum(['BRL', 'USD', 'EUR']),
})

export const businessMetricsSettingsSchema = z.object({
  currentMRR: positiveNumber,
  activeSubscribers: positiveInteger,
  newSubscribersThisMonth: positiveInteger,
  cancellationsThisMonth: positiveInteger,
  revenueReceivedThisMonth: positiveNumber,
  investmentThisMonth: positiveNumber,
  monthlyRevenueGoal: positiveNumber,
  monthlyProspectingGoal: positiveInteger,
  monthlyCustomerGoal: positiveInteger,
})

export const crmPipelineSettingsSchema = z.object({
  staleLeadDays: positiveInteger,
  defaultFollowUpDays: positiveInteger,
  hotLeadIcpThreshold: z.number().min(0).max(100),
  proposalReminderDays: positiveInteger,
  defaultRevenuePotential: positiveNumber,
  dailyProspectingTarget: positiveInteger,
})

export const tasksCalendarSettingsSchema = z.object({
  defaultTaskImportance: z.enum(['low', 'medium', 'high']),
  defaultTaskCategory: z.enum([
    'prospecting',
    'follow-up',
    'meeting',
    'product',
    'design',
    'content',
    'social',
    'meta-ads',
    'strategy',
    'study',
    'ops',
    'other',
  ]),
  defaultEventDurationMinutes: z.number().int().min(15).max(240),
  workdayStart: z.string().regex(/^\d{2}:\d{2}$/),
  workdayEnd: z.string().regex(/^\d{2}:\d{2}$/),
  defaultCalendarView: z.enum(['day', 'week', 'month', 'agenda']),
  showCompletedTasksByDefault: z.boolean(),
})

export const productSalesSettingsSchema = z.object({
  productName: z.string().min(1),
  productDescription: z.string(),
  targetAudience: z.string(),
  coreOffer: z.string(),
  mainObjections: z.array(z.string()),
  keyBenefits: z.array(z.string()),
  salesNotes: z.string(),
})

export const integrationSettingsSchema = z.object({
  key: z.enum(['meta_ads', 'instagram', 'google_calendar', 'stripe_asaas', 'email']),
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(['coming_soon', 'not_connected', 'connected']),
})

export const settingsSchema = z.object({
  id: z.string().min(1),
  workspace: workspaceSettingsSchema,
  businessMetrics: businessMetricsSettingsSchema,
  crm: crmPipelineSettingsSchema,
  tasksCalendar: tasksCalendarSettingsSchema,
  productSales: productSalesSettingsSchema,
  integrations: z.array(integrationSettingsSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const settingsUpdateSchema = z.object({
  workspace: workspaceSettingsSchema.partial().optional(),
  businessMetrics: businessMetricsSettingsSchema.partial().optional(),
  crm: crmPipelineSettingsSchema.partial().optional(),
  tasksCalendar: tasksCalendarSettingsSchema.partial().optional(),
  productSales: productSalesSettingsSchema.partial().optional(),
  integrations: z.array(integrationSettingsSchema).optional(),
})

export const businessMetricsUpdateSchema = businessMetricsSettingsSchema.partial()
