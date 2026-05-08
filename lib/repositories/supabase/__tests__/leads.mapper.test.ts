import { describe, expect, it } from 'vitest'
import {
  fromSupabaseLeadRow,
  toSupabaseLeadInsert,
  toSupabaseLeadUpdate,
  type SupabaseLeadRow,
} from '../leads.mapper'

const baseRow: SupabaseLeadRow = {
  id: '2c83b471-15b2-4e77-bc8a-bdcb9c13f4f9',
  workspace_id: 'default',
  owner_id: 'arthur',
  name: 'Arthur Silva',
  company: 'UNTD Studio',
  role: 'Founder',
  niche: 'Agencia de social media',
  website: 'https://untd.studio',
  instagram: '@untd',
  linkedin: 'https://linkedin.com/in/arthur',
  email: 'arthur@untd.studio',
  phone: '(18) 99999-9999',
  city: 'Presidente Prudente',
  state: 'SP',
  country: 'BR',
  origin: 'cold-dm',
  pipeline_stage_id: 'replied',
  temperature: 'hot',
  icp_score: 84,
  pain: 'Precisa acelerar criativos.',
  revenue_potential: 4500,
  objections: ['preco'],
  first_contact_at: '2026-05-01T12:00:00.000Z',
  last_contact_at: '2026-05-02T12:00:00.000Z',
  next_follow_up_at: '2026-05-05T12:00:00.000Z',
  tag_ids: ['social-media'],
  internal_notes: 'Lead com bom timing.',
  result: 'open',
  status: 'qualified',
  visual_quality_score: 7,
  visual_problems: 'Feed inconsistente.',
  why_good_lead: 'Alta recorrencia.',
  suggested_approach: 'Mostrar prova visual.',
  created_at: '2026-05-01T12:00:00.000Z',
  updated_at: '2026-05-02T12:00:00.000Z',
}

describe('Supabase lead mapper', () => {
  it('maps a canonical Supabase row into the internal Lead model', () => {
    const lead = fromSupabaseLeadRow(baseRow)

    expect(lead).toMatchObject({
      id: baseRow.id,
      name: 'Arthur Silva',
      company: 'UNTD Studio',
      role: 'Founder',
      niche: 'Agencia de social media',
      email: 'arthur@untd.studio',
      phone: '(18) 99999-9999',
      location: { city: 'Presidente Prudente', country: 'BR' },
      origin: 'cold-dm',
      pipelineStageId: 'replied',
      temperature: 'hot',
      icpScore: 84,
      pain: 'Precisa acelerar criativos.',
      revenuePotential: 4500,
      objections: ['preco'],
      ownerId: 'arthur',
      tagIds: ['social-media'],
      result: 'open',
      createdAt: '2026-05-01T12:00:00.000Z',
      updatedAt: '2026-05-02T12:00:00.000Z',
    })
    expect(lead.internalNotes).toContain('Lead com bom timing.')
    expect(lead.internalNotes).toContain('Alta recorrencia.')
  })

  it('applies safe defaults and clamps icp score for partial legacy rows', () => {
    const lead = fromSupabaseLeadRow({
      ...baseRow,
      name: null,
      owner_id: null,
      origin: null,
      pipeline_stage_id: null,
      temperature: null,
      icp_score: 140,
      country: null,
      objections: null,
      tag_ids: null,
      result: null,
      updated_at: null,
    })

    expect(lead).toMatchObject({
      name: 'UNTD Studio',
      ownerId: 'arthur',
      origin: 'manual',
      pipelineStageId: 'prospecting',
      temperature: 'cold',
      icpScore: 100,
      location: { city: 'Presidente Prudente', country: 'BR' },
      objections: [],
      tagIds: [],
      result: 'open',
      updatedAt: '2026-05-01T12:00:00.000Z',
    })
  })

  it('maps Lead input into a Supabase insert payload with canonical columns', () => {
    expect(
      toSupabaseLeadInsert({
        name: 'Novo Lead',
        company: 'Lead Co',
        role: 'CEO',
        niche: 'Clinica estetica',
        website: '',
        instagram: '@leadco',
        email: '',
        phone: '(18) 98888-8888',
        location: { city: 'Presidente Prudente', country: 'BR' },
        origin: 'referral',
        pipelineStageId: 'contacted',
        temperature: 'warm',
        pain: 'Demora para produzir criativos.',
        revenuePotential: 3000,
        objections: ['tempo'],
        ownerId: 'arthur',
        tagIds: ['clinica'],
        internalNotes: 'Entrou por indicacao.',
        result: 'open',
      })
    ).toMatchObject({
      workspace_id: 'default',
      owner_id: 'arthur',
      name: 'Novo Lead',
      company: 'Lead Co',
      city: 'Presidente Prudente',
      country: 'BR',
      origin: 'referral',
      pipeline_stage_id: 'contacted',
      temperature: 'warm',
      icp_score: 0,
      revenue_potential: 3000,
      objections: ['tempo'],
      tag_ids: ['clinica'],
      result: 'open',
    })
  })

  it('maps partial Lead updates without sending undefined fields', () => {
    expect(
      toSupabaseLeadUpdate({
        pipelineStageId: 'proposal',
        result: 'won',
        icpScore: 101,
        location: { city: 'Sao Paulo' },
        email: undefined,
      })
    ).toEqual({
      pipeline_stage_id: 'proposal',
      result: 'won',
      icp_score: 100,
      city: 'Sao Paulo',
    })
  })
})
