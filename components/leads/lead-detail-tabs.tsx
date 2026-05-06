'use client'

import { useMemo, useState } from 'react'
import { FeedbackDetailSheet } from '@/components/feedbacks/feedback-detail-sheet'
import { FeedbackFormSheet } from '@/components/feedbacks/feedback-form-sheet'
import { NoteEditorSheet } from '@/components/notes/note-editor-sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFeedbacksByLead } from '@/lib/hooks/use-feedbacks'
import { useNoteFolders } from '@/lib/hooks/use-note-folders'
import { useNotes } from '@/lib/hooks/use-notes'
import {
  convertFeedbackToNotePayload,
  convertFeedbackToTaskPayload,
} from '@/lib/services/feedbacks.service'
import { createStrategicNote } from '@/lib/services/notes.service'
import { createTask } from '@/lib/services/tasks.service'
import type { Feedback, FeedbackInput, Lead, Note, NoteInput, PipelineStage } from '@/lib/types'
import { attachLeadToFeedbackInput, attachLeadToNoteInput } from './lead-detail-actions'
import { LeadFeedbacksPanel } from './lead-feedbacks-panel'
import { LeadNotesPanel } from './lead-notes-panel'
import { LeadOverview } from './lead-overview'
import { LeadTimeline } from './lead-timeline'

interface Props {
  lead: Lead
  stage?: PipelineStage
}

export function LeadDetailTabs({ lead, stage }: Props) {
  const noteFilters = useMemo(() => ({ relatedLeadId: lead.id }), [lead.id])
  const { notes, isLoading: notesLoading, actions: noteActions } = useNotes(noteFilters)
  const { folders } = useNoteFolders()
  const {
    feedbacks,
    isLoading: feedbacksLoading,
    actions: feedbackActions,
  } = useFeedbacksByLead(lead.id)

  const [noteEditorOpen, setNoteEditorOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false)
  const [feedbackDetailOpen, setFeedbackDetailOpen] = useState(false)
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null)
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null)

  const editingNote = useMemo(
    () => notes.find((note) => note.id === editingNoteId) ?? null,
    [editingNoteId, notes]
  )
  const editingFeedback = useMemo(
    () => feedbacks.find((feedback) => feedback.id === editingFeedbackId) ?? null,
    [editingFeedbackId, feedbacks]
  )
  const selectedFeedback = useMemo(
    () => feedbacks.find((feedback) => feedback.id === selectedFeedbackId) ?? null,
    [feedbacks, selectedFeedbackId]
  )

  function openNewNote() {
    setEditingNoteId(null)
    setNoteEditorOpen(true)
  }

  function openEditNote(note: Note) {
    setEditingNoteId(note.id)
    setNoteEditorOpen(true)
  }

  async function createLeadNote(input: NoteInput) {
    return noteActions.create(attachLeadToNoteInput(input, lead.id))
  }

  async function updateLeadNote(id: string, input: Partial<NoteInput>) {
    return noteActions.update(id, {
      ...input,
      relatedLeadId: lead.id,
      source: 'lead',
    })
  }

  function openNewFeedback() {
    setEditingFeedbackId(null)
    setFeedbackFormOpen(true)
  }

  function openEditFeedback(feedback: Feedback) {
    setEditingFeedbackId(feedback.id)
    setFeedbackDetailOpen(false)
    setFeedbackFormOpen(true)
  }

  function selectFeedback(feedback: Feedback) {
    setSelectedFeedbackId(feedback.id)
    setFeedbackDetailOpen(true)
  }

  async function createLeadFeedback(input: FeedbackInput) {
    return feedbackActions.createFeedback(attachLeadToFeedbackInput(input, lead.id))
  }

  async function updateLeadFeedback(id: string, input: Partial<FeedbackInput>) {
    return feedbackActions.updateFeedback(id, {
      ...input,
      relatedLeadId: lead.id,
      source: 'lead',
    })
  }

  async function convertFeedbackToNote(feedback: Feedback): Promise<Feedback> {
    if (feedback.relatedNoteId) return feedback
    const note = await createStrategicNote(convertFeedbackToNotePayload(feedback))
    return feedbackActions.updateFeedback(feedback.id, {
      relatedNoteId: note.id,
      status: 'converted_to_note',
    })
  }

  async function convertFeedbackToTask(feedback: Feedback): Promise<Feedback> {
    if (feedback.relatedTaskId) return feedback
    const task = await createTask(convertFeedbackToTaskPayload(feedback))
    return feedbackActions.updateFeedback(feedback.id, {
      relatedTaskId: task.id,
      status: 'converted_to_task',
    })
  }

  return (
    <>
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList>
          <TabsTrigger value="visao-geral">Visao geral</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral">
          <LeadOverview lead={lead} stage={stage} />
        </TabsContent>
        <TabsContent value="timeline">
          <LeadTimeline leadId={lead.id} />
        </TabsContent>
        <TabsContent value="notas">
          <LeadNotesPanel
            notes={notes}
            folders={folders}
            isLoading={notesLoading}
            onCreate={openNewNote}
            onEdit={openEditNote}
          />
        </TabsContent>
        <TabsContent value="feedbacks">
          <LeadFeedbacksPanel
            feedbacks={feedbacks}
            lead={lead}
            isLoading={feedbacksLoading}
            onCreate={openNewFeedback}
            onSelect={selectFeedback}
          />
        </TabsContent>
      </Tabs>

      <NoteEditorSheet
        open={noteEditorOpen}
        note={editingNote}
        folders={folders}
        onOpenChange={(open) => {
          setNoteEditorOpen(open)
          if (!open) setEditingNoteId(null)
        }}
        onCreate={createLeadNote}
        onUpdate={updateLeadNote}
        onArchive={async (id) => {
          await noteActions.archive(id)
        }}
        onRestore={async (id) => {
          await noteActions.restore(id)
        }}
        onTransformToTask={async (id) => {
          await noteActions.createTaskFromNote(id)
        }}
      />

      <FeedbackFormSheet
        open={feedbackFormOpen}
        feedback={editingFeedback}
        leads={[lead]}
        defaultLeadId={lead.id}
        onOpenChange={(open) => {
          setFeedbackFormOpen(open)
          if (!open) setEditingFeedbackId(null)
        }}
        onCreate={createLeadFeedback}
        onUpdate={updateLeadFeedback}
        onSaved={(feedback) => setSelectedFeedbackId(feedback.id)}
      />

      <FeedbackDetailSheet
        open={feedbackDetailOpen}
        feedback={selectedFeedback}
        leads={[lead]}
        onOpenChange={setFeedbackDetailOpen}
        onEdit={openEditFeedback}
        onResolve={feedbackActions.resolveFeedback}
        onReopen={feedbackActions.reopenFeedback}
        onArchive={feedbackActions.archiveFeedback}
        onRestore={feedbackActions.unarchiveFeedback}
        onPin={feedbackActions.pinFeedback}
        onUnpin={feedbackActions.unpinFeedback}
        onConvertToNote={convertFeedbackToNote}
        onConvertToTask={convertFeedbackToTask}
      />
    </>
  )
}
