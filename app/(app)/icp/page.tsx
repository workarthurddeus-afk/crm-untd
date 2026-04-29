import { Badge } from '@/components/ui/badge'

export default function ICPPage() {
  return (
    <div className="mx-auto max-w-6xl p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">ICP & Scoring</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Quem é o seu cliente perfeito — em números.
          </p>
        </div>
        <Badge variant="outline">Em construção</Badge>
      </div>
    </div>
  )
}
