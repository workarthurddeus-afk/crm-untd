import type { ICPCriterion, ICPEvaluatorType } from '@/lib/types'

export const evaluatorLabel: Record<ICPEvaluatorType, string> = {
  'enum-match': 'Valor exato',
  'array-includes': 'Esta na lista',
  'array-overlap': 'Cruza com a lista',
  'text-includes': 'Texto contem sinal',
  'numeric-range': 'Faixa numerica',
  'boolean-true': 'Verdadeiro',
  'string-not-empty': 'Nao vazio',
}

type ConfigResult =
  | { kind: 'chips'; chips: string[] }
  | { kind: 'text'; text: string }

function valuesFromConfig(config: Record<string, unknown>, key = 'values'): string[] {
  const source = config[key]
  return Array.isArray(source)
    ? source.map(String).filter(Boolean)
    : []
}

export function formatCriterionConfig(criterion: ICPCriterion): ConfigResult {
  const { evaluator, config } = criterion

  switch (evaluator) {
    case 'array-includes':
    case 'array-overlap':
      return { kind: 'chips', chips: valuesFromConfig(config) }

    case 'text-includes': {
      const chips = valuesFromConfig(config, 'keywords')
      return { kind: 'chips', chips: chips.length > 0 ? chips : valuesFromConfig(config) }
    }

    case 'enum-match':
      return { kind: 'chips', chips: [String(config.value ?? '')] }

    case 'numeric-range': {
      const min = typeof config.min === 'number' ? config.min : null
      const max = typeof config.max === 'number' ? config.max : null

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
          text: `Entre ${min.toLocaleString('pt-BR')} e ${max.toLocaleString('pt-BR')}`,
        }
      }
      if (hasMin) {
        return {
          kind: 'text',
          text: `>= ${min.toLocaleString('pt-BR')}`,
        }
      }
      if (hasMax) {
        return {
          kind: 'text',
          text: `<= ${max.toLocaleString('pt-BR')}`,
        }
      }
      return { kind: 'text', text: 'Qualquer valor numerico' }
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
