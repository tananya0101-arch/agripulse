export interface MarketPrice {
  id: string
  commodity: 'rubber' | 'palm' | 'durian' | 'fertilizer'
  commodityTh: string
  productType: string
  productTypeTh: string
  price: number | null
  currency: 'THB' | 'USD' | 'MYR'
  unit: string
  priceType: string
  marketLocation?: string
  sourceName: string
  sourceType: 'official' | 'industry' | 'news' | 'local_signal'
  sourceUrl?: string
  reportedAt: string
  previousPrice?: number
  changeValue?: number
  changePercent?: number
  trend: 'up' | 'down' | 'stable' | 'no_data'
  confidence: 'high' | 'medium' | 'low' | 'unknown'
  notes?: string
}

export interface MarketInsight {
  id: string
  commodity: string
  title: string
  confirmedFacts: string[]
  possibleDrivers: string[]
  farmerImpact: string
  fertilizerShopImpact: string
  contentIdea: string
  uncertainty: string
  sources: string[]
  generatedAt: string
}

export interface BusinessRecommendation {
  signal: string
  cropContext: string
  suggestedAction: string
  productCategory: string
  contentIdea: string
  riskWarning: string
  farmerCashFlowSignal: 'improving' | 'tight' | 'stable' | 'unknown'
  fertilizerDemandSignal: 'increasing' | 'decreasing' | 'stable' | 'unknown'
}

export interface ApprovedSource {
  id: string
  sourceName: string
  cropOrProduct: string
  sourceUrl: string
  dataType: string
  updateFrequency: string
  trustLevel: 'high' | 'medium' | 'low'
  sourceType: 'official' | 'industry' | 'news' | 'local_signal'
  licenseNote: string
  isActive: boolean
}

export interface LocalSignal {
  id: string
  submittedBy: string
  location: string
  productType: string
  price: number
  unit: string
  evidence?: string
  timeReported: string
  verificationStatus: 'unverified' | 'verified' | 'rejected'
  confidence: 'low' | 'medium' | 'high'
  notes?: string
}

export interface PriceHistory {
  date: string
  price: number
}
