import { Badge } from '@/components/ui/badge'

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-6xl p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Tarefas</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            O que precisa sair hoje.
          </p>
        </div>
        <Badge variant="outline">Em construção</Badge>
      </div>
    </div>
  )
}
