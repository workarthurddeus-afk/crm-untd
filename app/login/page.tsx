'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

function getNextPath(): string {
  if (typeof window === 'undefined') return '/dashboard'
  const value = new URLSearchParams(window.location.search).get('next')
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus(null)

    if (!email.trim() || !password) {
      setError('Informe email e senha para entrar.')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError('Credenciais invalidas ou usuario nao liberado.')
        return
      }

      setStatus('Sessao iniciada. Abrindo o comando...')
      router.replace(getNextPath())
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel entrar agora.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-text sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-lg-token lg:grid-cols-[1fr_420px]">
          <div className="hidden min-h-[520px] flex-col justify-between border-r border-border-subtle bg-[radial-gradient(circle_at_30%_20%,rgba(83,50,234,0.24),transparent_34%),linear-gradient(135deg,#151320,#0f0e17)] p-8 lg:flex">
            <div>
              <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
                Acesso protegido
              </div>
              <h1 className="max-w-md font-display text-4xl font-semibold leading-tight text-text">
                UNTD OS
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-text-secondary">
                Centro de comando privado para leads, pipeline, agenda e memoria operacional da UNTD.
              </p>
            </div>
            <p className="max-w-sm text-xs leading-5 text-text-muted">
              Dados comerciais reais exigem sessao autenticada. Use o usuario criado no Supabase Auth.
            </p>
          </div>

          <div className="flex min-h-[520px] flex-col justify-center px-6 py-8 sm:px-8">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Login
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-text">
                Entrar no CRM
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Entre com email e senha para acessar o workspace protegido.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(error && !email.trim())}
                  placeholder="arthur@untd.studio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(error && !password)}
                  placeholder="Sua senha"
                />
              </div>

              <div className="min-h-[1.25rem] text-xs leading-5">
                {error ? (
                  <p role="alert" className="text-danger">
                    {error}
                  </p>
                ) : status ? (
                  <p className="text-success">{status}</p>
                ) : (
                  <p className="text-text-muted">A sessao sera mantida com cookies seguros do Supabase.</p>
                )}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
