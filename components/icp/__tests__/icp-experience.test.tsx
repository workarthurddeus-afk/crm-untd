import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CriteriaList } from '../criteria-list'
import { ICPHero } from '../icp-hero'
import { ICPScoreDistribution } from '../icp-score-distribution'
import { ICPTargetCard } from '../icp-target-card'
import { PersonaCard } from '../persona-card'
import { PipelineICPAnalysis } from '../pipeline-icp-analysis'
import { icpProfileSeed } from '@/lib/mocks/seeds/icp.seed'
import { leadsSeed } from '@/lib/mocks/seeds/leads.seed'

describe('ICP experience', () => {
  it('frames the hero as an operational decision surface with an adherence orb', () => {
    const html = renderToStaticMarkup(<ICPHero profile={icpProfileSeed} leads={leadsSeed} />)

    expect(html).toContain('Orb de aderencia')
    expect(html).toContain('Aderencia media')
    expect(html).toContain('leads alinhados')
    expect(html).toContain('Melhor oportunidade')
  })

  it('presents the target ICP as an editable strategic brief', () => {
    const html = renderToStaticMarkup(
      <ICPTargetCard profile={icpProfileSeed} onEdit={() => undefined} />
    )

    expect(html).toContain('ICP alvo')
    expect(html).toContain('Editar ICP')
    expect(html).toContain('Nichos prioritarios')
    expect(html).toContain('Red flags')
  })

  it('summarizes pipeline analytics against the current target ICP', () => {
    const html = renderToStaticMarkup(<PipelineICPAnalysis profile={icpProfileSeed} leads={leadsSeed} />)

    expect(html).toContain('Analise do pipeline')
    expect(html).toContain('Gargalos de aderencia')
    expect(html).toContain('Atributos de alto fit')
    expect(html).toContain('Nichos no pipeline')
  })

  it('explains score distribution with accessible summary metadata', () => {
    const html = renderToStaticMarkup(<ICPScoreDistribution profile={icpProfileSeed} leads={leadsSeed} />)

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Distribui')
    expect(html).toContain('Alto fit')
    expect(html).toContain('Fit fraco')
  })

  it('keeps criteria copy commercial instead of exposing implementation fields', () => {
    const html = renderToStaticMarkup(<CriteriaList profile={icpProfileSeed} leads={leadsSeed} />)

    expect(html).toContain('Alavancas de match')
    expect(html).toContain('Como pontua')
    expect(html).toContain('Leads que batem')
    expect(html).not.toContain('Avaliador')
    expect(html).not.toContain('Campo')
    expect(html).not.toContain('Configuracao')
  })

  it('presents persona as a compact sales brief', () => {
    const html = renderToStaticMarkup(<PersonaCard persona={icpProfileSeed.persona} />)

    expect(html).toContain('Brief comercial')
    expect(html).toContain('Mensagem de entrada')
    expect(html).toContain('Sinal de compra')
  })
})
