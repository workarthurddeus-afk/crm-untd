import { describe, expect, it } from 'vitest'
import {
  NOTE_FOLDER_ICON_OPTIONS,
  buildNoteFolderPayloadFromForm,
  getDefaultNoteFolderFormState,
} from '../note-folder-form-utils'

describe('note folder form utils', () => {
  it('creates a clean default form state', () => {
    const form = getDefaultNoteFolderFormState()

    expect(form).toMatchObject({
      name: '',
      description: '',
      color: 'purple',
      icon: 'folder',
    })
    expect(NOTE_FOLDER_ICON_OPTIONS.some((option) => option.value === 'lightbulb')).toBe(true)
  })

  it('builds a folder payload with trimmed optional fields', () => {
    const payload = buildNoteFolderPayloadFromForm(
      {
        ...getDefaultNoteFolderFormState(),
        name: '  Conteudo de vendas  ',
        description: '  Ideias e aprendizados para ofertas. ',
        color: 'green',
        icon: 'star',
      },
      7
    )

    expect(payload).toEqual({
      name: 'Conteudo de vendas',
      description: 'Ideias e aprendizados para ofertas.',
      color: 'green',
      icon: 'star',
      parentId: null,
      order: 7,
      isArchived: false,
    })
  })
})
