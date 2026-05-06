import type { CalendarView } from './calendar'
import type { TaskCategory, TaskImportance } from './task'

export type SettingsLanguage = 'pt-BR' | 'en-US'
export type SettingsCurrency = 'BRL' | 'USD' | 'EUR'
export type IntegrationStatus = 'coming_soon' | 'not_connected' | 'connected'
export type IntegrationKey = 'meta_ads' | 'instagram' | 'google_calendar' | 'stripe_asaas' | 'email'

export interface WorkspaceSettings {
  workspaceName: string
  userName: string
  companyName: string
  companyDescription: string
  timezone: string
  language: SettingsLanguage
  currency: SettingsCurrency
}

export interface BusinessMetricsSettings {
  currentMRR: number
  activeSubscribers: number
  newSubscribersThisMonth: number
  cancellationsThisMonth: number
  revenueReceivedThisMonth: number
  investmentThisMonth: number
  monthlyRevenueGoal: number
  monthlyProspectingGoal: number
  monthlyCustomerGoal: number
}

export interface CrmPipelineSettings {
  staleLeadDays: number
  defaultFollowUpDays: number
  hotLeadIcpThreshold: number
  proposalReminderDays: number
  defaultRevenuePotential: number
  dailyProspectingTarget: number
}

export interface TasksCalendarSettings {
  defaultTaskImportance: TaskImportance
  defaultTaskCategory: TaskCategory
  defaultEventDurationMinutes: number
  workdayStart: string
  workdayEnd: string
  defaultCalendarView: CalendarView
  showCompletedTasksByDefault: boolean
}

export interface ProductSalesSettings {
  productName: string
  productDescription: string
  targetAudience: string
  coreOffer: string
  mainObjections: string[]
  keyBenefits: string[]
  salesNotes: string
}

export interface IntegrationSettings {
  key: IntegrationKey
  name: string
  description: string
  status: IntegrationStatus
}

export interface UntdSettings {
  id: string
  workspace: WorkspaceSettings
  businessMetrics: BusinessMetricsSettings
  crm: CrmPipelineSettings
  tasksCalendar: TasksCalendarSettings
  productSales: ProductSalesSettings
  integrations: IntegrationSettings[]
  createdAt: string
  updatedAt: string
}

export type SettingsInput = Omit<UntdSettings, 'id' | 'createdAt' | 'updatedAt'>

export interface SettingsUpdateInput {
  workspace?: Partial<WorkspaceSettings>
  businessMetrics?: Partial<BusinessMetricsSettings>
  crm?: Partial<CrmPipelineSettings>
  tasksCalendar?: Partial<TasksCalendarSettings>
  productSales?: Partial<ProductSalesSettings>
  integrations?: IntegrationSettings[]
}
