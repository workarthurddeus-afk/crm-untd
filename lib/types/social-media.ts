export type SocialNetwork = 'instagram' | 'linkedin' | 'facebook' | 'youtube'

export interface SocialMediaOverview {
  network: SocialNetwork
  followers: number
  followersGrowthPct: number
  reach: number
  impressions: number
  engagement: number
  engagementRate: number
  clicks: number
  postsPublished: number
  comments: number
  saves: number
  shares: number
  asOf: string
}

export interface SocialPost {
  id: string
  network: SocialNetwork
  publishedAt: string
  caption: string
  reach: number
  impressions: number
  engagement: number
  likes: number
  comments: number
  saves: number
  shares: number
  thumbnailUrl?: string
}

export interface SocialInsight {
  id: string
  network: SocialNetwork
  message: string
  severity: 'info' | 'warning' | 'positive'
  createdAt: string
}
