import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Dashboard</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Sua visão diária do estado da operação.
          </p>
        </div>
        <Badge variant="outline">Em construção</Badge>
      </div>
    </div>
  )
}
