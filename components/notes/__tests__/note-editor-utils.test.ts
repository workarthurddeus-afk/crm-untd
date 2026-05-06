import { describe, expect, it } from 'vitest'
import {
  NO_NOTE_FOLDER_VALUE,
  applyMarkdownFormat,
  buildNotePayloadFromForm,
  getDefaultNoteEditorState,
  noteToEditorState,
  parseNoteMarkdown,
  parseNoteTags,
} from '../note-editor-utils'
import type { Note } from '@/lib/types'

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-001',
    title: 'Insight de vendas',
    content: 'Agencias pequenas precisam ver consistencia visual antes de comprar.',
    excerpt: 'Agencias pequenas precisam ver consistencia visual antes de comprar.',
    type: 'insight',
    status: 'active',
    priority: 'high',
    impact: 'high',
    effort: 'low',
    color: 'purple',
    tags: ['vendas', 'brandkit'],
    folderId: 'folder-strategy',
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    source: 'manual',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-02T00:00:00.000Z',
    lastViewedAt: null,
    tagIds: ['vendas', 'brandkit'],
    relatedTo: 'general',
    pinned: true,
    favorited: true,
    ...overrides,
  }
}

describe('note editor utils', () => {
  it('creates a productive default state for a new note', () => {
    const form = getDefaultNoteEditorState()

    expect(form).toMatchObject({
      title: '',
      type: 'idea',
      status: 'draft',
      priority: 'medium',
      impact: 'medium',
      effort: 'medium',
      color: 'purple',
      folderId: NO_NOTE_FOLDER_VALUE,
      isPinned: false,
      isFavorite: false,
    })
  })

  it('maps an existing note into editable form values', () => {
    const form = noteToEditorState(makeNote())

    expect(form).toMatchObject({
      title: 'Insight de vendas',
      type: 'insight',
      status: 'active',
      priority: 'high',
      impact: 'high',
      effort: 'low',
      folderId: 'folder-strategy',
      tags: 'vendas, brandkit',
      isPinned: true,
      isFavorite: true,
    })
  })

  it('builds a clean note payload with normalized tags and nullable folder', () => {
    const payload = buildNotePayloadFromForm({
      ...getDefaultNoteEditorState(),
      title: '  Proposta para social medias  ',
      content: '  ## Oferta\n\nResolver consistencia visual em 7 dias. ',
      folderId: NO_NOTE_FOLDER_VALUE,
      tags: ' vendas, Social Media, #BrandKit,, ',
      isPinned: true,
      isFavorite: true,
    })

    expect(payload).toMatchObject({
      title: 'Proposta para social medias',
      content: '## Oferta\n\nResolver consistencia visual em 7 dias.',
      folderId: null,
      tags: ['vendas', 'social-media', 'brandkit'],
      isPinned: true,
      isFavorite: true,
      source: 'manual',
    })
  })

  it('normalizes comma-separated tags', () => {
    expect(parseNoteTags(' BrandKit, #DM fria,  vendas,, Meta Ads ')).toEqual([
      'brandkit',
      'dm-fria',
      'vendas',
      'meta-ads',
    ])
  })

  it('applies markdown formatting to the current selection', () => {
    const result = applyMarkdownFormat('Criar oferta', 6, 12, 'bold')

    expect(result.content).toBe('Criar **oferta**')
    expect(result.selectionStart).toBe(8)
    expect(result.selectionEnd).toBe(14)
  })

  it('parses markdown blocks for the note preview', () => {
    const blocks = parseNoteMarkdown(
      [
        '## Estrategia',
        '- Reduzir friccao',
        '1. Enviar proposta',
        '> [!IDEIA] Usar antes/depois no BrandKit',
        '---',
        'Texto solto',
      ].join('\n')
    )

    expect(blocks).toMatchObject([
      { type: 'heading', text: 'Estrategia', level: 2 },
      { type: 'bullet', text: 'Reduzir friccao' },
      { type: 'numbered', text: 'Enviar proposta', index: 1 },
      { type: 'callout', text: 'Usar antes/depois no BrandKit', tone: 'idea' },
      { type: 'divider' },
      { type: 'paragraph', text: 'Texto solto' },
    ])
  })
})
