import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CriteriaList } from '../criteria-list'
import { ICPHero } from '../icp-hero'
import { ICPScoreDistribution } from '../icp-score-distribution'
import { PersonaCard } from '../persona-card'
import { icpProfileSeed } from '@/lib/mocks/seeds/icp.seed'
import { leadsSeed } from '@/lib/mocks/seeds/leads.seed'

describe('ICP experience', () => {
  it('frames the hero as an operational decision surface', () => {
    const html = renderToStaticMarkup(<ICPHero profile={icpProfileSeed} leads={leadsSeed} />)

    expect(html).toContain('Radar de fit')
    expect(html).toContain('Prioridade comercial')
    expect(html).toContain('Próximo movimento')
    expect(html).not.toContain('radial-gradient')
  })

  it('explains score distribution with accessible summary metadata', () => {
    const html = renderToStaticMarkup(<ICPScoreDistribution profile={icpProfileSeed} leads={leadsSeed} />)

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Distribuição de score ICP dos leads"')
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
    expect(html).not.toContain('Configuração')
  })

  it('presents persona as a compact sales brief', () => {
    const html = renderToStaticMarkup(<PersonaCard persona={icpProfileSeed.persona} />)

    expect(html).toContain('Brief comercial')
    expect(html).toContain('Mensagem de entrada')
    expect(html).toContain('Sinal de compra')
  })
})
