import type {
  SettingsUpdateInput,
  UntdSettings,
  WorkspaceSettings,
  BusinessMetricsSettings,
  CrmPipelineSettings,
  TasksCalendarSettings,
  ProductSalesSettings,
} from '@/lib/types/settings'

export interface ProductSalesFormState extends Omit<ProductSalesSettings, 'mainObjections' | 'keyBenefits'> {
  mainObjections: string
  keyBenefits: string
}

export interface SettingsFormState {
  workspace: WorkspaceSettings
  businessMetrics: BusinessMetricsSettings
  crm: CrmPipelineSettings
  tasksCalendar: TasksCalendarSettings
  productSales: ProductSalesFormState
}

export function settingsToFormState(settings: UntdSettings): SettingsFormState {
  return {
    workspace: { ...settings.workspace },
    businessMetrics: { ...settings.businessMetrics },
    crm: { ...settings.crm },
    tasksCalendar: { ...settings.tasksCalendar },
    productSales: {
      ...settings.productSales,
      mainObjections: settings.productSales.mainObjections.join('\n'),
      keyBenefits: settings.productSales.keyBenefits.join('\n'),
    },
  }
}

export function buildSettingsUpdateFromForm(form: SettingsFormState): SettingsUpdateInput {
  return {
    workspace: { ...form.workspace },
    businessMetrics: { ...form.businessMetrics },
    crm: { ...form.crm },
    tasksCalendar: { ...form.tasksCalendar },
    productSales: {
      ...form.productSales,
      mainObjections: parseSettingsList(form.productSales.mainObjections),
      keyBenefits: parseSettingsList(form.productSales.keyBenefits),
    },
  }
}

export function parseSettingsList(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}
