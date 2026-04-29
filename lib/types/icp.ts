export type ICPEvaluatorType =
  | 'enum-match'
  | 'numeric-range'
  | 'boolean-true'
  | 'array-includes'
  | 'string-not-empty'

export interface ICPCriterion {
  id: string
  name: string
  description?: string
  weight: number
  field: string
  evaluator: ICPEvaluatorType
  config: Record<string, unknown>
}

export interface ICPPersona {
  name: string
  description: string
  pains: string[]
  desires: string[]
  objections: string[]
  purchaseTriggers: string[]
  bestMessage?: string
  likelyOffer?: string
  foundOnChannels: string[]
}

export interface ICPProfile {
  id: string
  name: string
  description?: string
  criteria: ICPCriterion[]
  persona: ICPPersona
  createdAt: string
  updatedAt: string
}

export interface ICPCriterionResult {
  criterionId: string
  name: string
  weight: number
  matchScore: number
  contribution: number
  positive: boolean
  explanation: string
}

export interface ScoreBreakdown {
  total: number
  criteria: ICPCriterionResult[]
}
