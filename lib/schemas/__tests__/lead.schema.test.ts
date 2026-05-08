import { describe, expect, it } from 'vitest'
import { leadInputSchema } from '../lead'

const validLeadInput = {
  name: 'Arthur',
  company: 'UNTD Studio',
  niche: 'Agencia',
  origin: 'manual',
  pipelineStageId: 'prospecting',
  temperature: 'cold',
  ownerId: 'arthur',
  tagIds: [],
  result: 'open',
}

describe('leadInputSchema', () => {
  it('rejects blank company before the Supabase repository is called', () => {
    const result = leadInputSchema.safeParse({
      ...validLeadInput,
      company: '   ',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe('Empresa obrigatoria')
  })
})
