export type CampaignStatus = 'active' | 'paused' | 'archived' | 'draft'
export type CampaignObjective =
  | 'leads' | 'traffic' | 'conversions' | 'reach' | 'engagement' | 'sales' | 'awareness'

export interface MetaCampaign {
  id: string
  name: string
  status: CampaignStatus
  objective: CampaignObjective
  audience: string
  creativePreviewUrl?: string
  startedAt: string
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  leads: number
  cpl: number
  conversions: number
  cpa: number
  roas?: number
}

export interface MetaAdsDailyMetric {
  date: string
  spend: number
  leads: number
  clicks: number
  impressions: number
}

export interface MetaAdsOverview {
  totalSpend: number
  totalLeads: number
  totalClicks: number
  totalImpressions: number
  avgCtr: number
  avgCpc: number
  avgCpl: number
  avgRoas?: number
  activeCampaigns: number
  pausedCampaigns: number
  asOf: string
}
