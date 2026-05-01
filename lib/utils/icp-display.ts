import type { ICPCriterion, ICPEvaluatorType } from '@/lib/types'

export const evaluatorLabel: Record<ICPEvaluatorType, string> = {
  'enum-match': 'Valor exato',
  'array-includes': 'Está na lista',
  'numeric-range': 'Faixa numérica',
  'boolean-true': 'Verdadeiro',
  'string-not-empty': 'Não vazio',
}

type ConfigResult =
  | { kind: 'chips'; chips: string[] }
  | { kind: 'text'; text: string }

export function formatCriterionConfig(criterion: ICPCriterion): ConfigResult {
  const { evaluator, config } = criterion

  switch (evaluator) {
    case 'array-includes': {
      const values = Array.isArray(config.values)
        ? (config.values as unknown[]).map(String)
        : []
      return { kind: 'chips', chips: values }
    }

    case 'enum-match': {
      return { kind: 'chips', chips: [String(config.value ?? '')] }
    }

    case 'numeric-range': {
      const min =
        typeof config.min === 'number' ? config.min : null
      const max =
        typeof config.max === 'number' ? config.max : null

      const hasMin =
        min !== null &&
        min !== Number.NEGATIVE_INFINITY &&
        min > Number.MIN_SAFE_INTEGER
      const hasMax =
        max !== null &&
        max !== Number.POSITIVE_INFINITY &&
        max < Number.MAX_SAFE_INTEGER

      if (hasMin && hasMax) {
        return {
          kind: 'text',
          text: `Entre ${(min as number).toLocaleString('pt-BR')} e ${(max as number).toLocaleString('pt-BR')}`,
        }
      }
      if (hasMin) {
        return {
          kind: 'text',
          text: `≥ ${(min as number).toLocaleString('pt-BR')}`,
        }
      }
      if (hasMax) {
        return {
          kind: 'text',
          text: `≤ ${(max as number).toLocaleString('pt-BR')}`,
        }
      }
      return { kind: 'text', text: 'Qualquer valor numérico' }
    }

    case 'boolean-true':
      return { kind: 'text', text: 'Deve ser verdadeiro' }

    case 'string-not-empty':
      return { kind: 'text', text: 'Campo deve estar preenchido' }
  }
}

export function matchRateColor(percent: number): string {
  if (percent >= 80) return 'bg-success'
  if (percent >= 50) return 'bg-info'
  if (percent >= 25) return 'bg-warning'
  return 'bg-danger'
}

export function distributionBucketColor(bucketIndex: number): string {
  if (bucketIndex >= 8) return 'bg-primary'
  if (bucketIndex >= 6) return 'bg-info/80'
  if (bucketIndex >= 4) return 'bg-warning/80'
  return 'bg-text-muted/40'
}
