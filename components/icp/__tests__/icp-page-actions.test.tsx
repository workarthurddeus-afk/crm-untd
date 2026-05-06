import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ICPPageActions } from '../icp-page-actions'

describe('ICPPageActions', () => {
  it('does not expose a disabled edit CTA or roadmap copy', () => {
    const html = renderToStaticMarkup(<ICPPageActions />)

    expect(html).not.toContain('disabled')
    expect(html).not.toContain('roadmap')
    expect(html).toContain('Perfil calibrado')
  })
})
