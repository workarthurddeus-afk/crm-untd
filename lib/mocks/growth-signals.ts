export interface SocialMediaSignal {
  reach7d: number
  engagementRate: number
  growth: number
  bestPostTitle: string
}
export interface MetaAdsSignal {
  investment: number
  leadsGenerated: number
  cpl: number
  bestCampaign: string
}
export const socialMediaMock: SocialMediaSignal = {
  reach7d: 14_320,
  engagementRate: 4.7,
  growth: 2.1,
  bestPostTitle: 'Antes/depois: 5 criativos para clínica',
}
export const metaAdsMock: MetaAdsSignal = {
  investment: 180,
  leadsGenerated: 12,
  cpl: 15,
  bestCampaign: 'Lookalike Agências',
}
