'use client'

import * as React from 'react'
import { toast } from 'sonner'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Mail,
  MoreHorizontal,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold tracking-tight text-text">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      <div className="rounded-lg border border-border-subtle bg-surface/40 p-6">
        {children}
      </div>
    </section>
  )
}

export default function PrimitivesPage() {
  const [checked, setChecked] = React.useState(true)
  const [radio, setRadio] = React.useState('comfortable')
  const [showBookmarks, setShowBookmarks] = React.useState(true)
  const [stage, setStage] = React.useState('replied')

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-10 space-y-12">
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
            UNTD OS / dev
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-text">
            Primitives
          </h1>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
            Showcase of every base UI primitive at every meaningful state.
            This page is a tool — used to verify tokens, motion, alignment,
            and craft before primitives ship to product surfaces.
          </p>
        </header>

        {/* Buttons */}
        <Section
          title="Button"
          description="Five variants, four sizes. Primary owns the brand glow on hover; ghost is the workhorse for toolbars and dropdowns."
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Variants — md
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">
                  <Sparkles /> New lead
                </Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">
                  <Trash2 /> Delete
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Sizes — primary
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Settings">
                  <Settings />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                States
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="secondary" disabled>
                  Disabled secondary
                </Button>
                <Button asChild variant="ghost">
                  <a href="#buttons">
                    Link via asChild <ArrowRight />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section
          title="Card"
          description="Static cards shift border + shadow on hover. Interactive cards add the spring scale (1.0 → 1.015) — used when the entire card is the affordance."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Static card</CardTitle>
                <CardDescription>
                  Used for informational surfaces — KPIs, summaries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Hover only shifts color and shadow. No scale.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  Learn more <ArrowRight />
                </Button>
              </CardFooter>
            </Card>

            <Card interactive>
              <CardHeader>
                <CardTitle>Interactive card</CardTitle>
                <CardDescription>
                  Whole surface is clickable — leads, kanban cards, calendar items.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>MA</AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-text">Marina Aguiar</p>
                    <p className="text-xs text-text-muted">Última atividade há 2h</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="pipeline-replied">Respondeu</Badge>
                <Badge variant="success" className="ml-auto">
                  ICP 87
                </Badge>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Badges */}
        <Section
          title="Badge"
          description="Semantic and pipeline-stage variants. Pipeline tones are tinted backgrounds derived from the stage hue."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Badge variant="pipeline-prospect">Prospecção</Badge>
              <Badge variant="pipeline-contacted">Primeiro contato</Badge>
              <Badge variant="pipeline-replied">Respondeu</Badge>
              <Badge variant="pipeline-followup">Follow-up</Badge>
              <Badge variant="pipeline-proposal">Proposta enviada</Badge>
              <Badge variant="pipeline-won">Fechado (ganho)</Badge>
              <Badge variant="pipeline-lost">Fechado (perdido)</Badge>
            </div>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Input + Label" description="Focus ring is brand-tinted; aria-invalid swaps to danger.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do lead</Label>
              <Input id="name" placeholder="ex: Marina Aguiar" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" defaultValue="invalido@" aria-invalid />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" defaultValue="UNTD" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="locked">Locked</Label>
              <Input id="locked" defaultValue="—" disabled />
            </div>
          </div>
        </Section>

        {/* Avatar */}
        <Section title="Avatar">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/72?img=12" alt="Maria" />
              <AvatarFallback>MA</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                <User className="h-5 w-5" strokeWidth={1.5} />
              </AvatarFallback>
            </Avatar>
          </div>
        </Section>

        {/* Skeleton */}
        <Section title="Skeleton" description="Pulsing opacity, no traveling gradient.">
          <div className="space-y-3 max-w-md">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Abrir dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar ação</DialogTitle>
                <DialogDescription>
                  Você está prestes a marcar este lead como ganho. Essa ação
                  pode ser revertida no histórico do pipeline.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="reason">Observação</Label>
                <Input id="reason" placeholder="ex: contrato assinado em 12/04" />
              </div>
              <DialogFooter>
                <Button variant="ghost">Cancelar</Button>
                <Button>
                  <Check /> Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        {/* Sheet */}
        <Section title="Sheet" description="380px right panel — matches the lead detail width in DESIGN.md.">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Abrir detalhe</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Marina Aguiar</SheetTitle>
                <SheetDescription>
                  Lead recebido via DM, respondeu a primeira mensagem.
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>MA</AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-text">Marina Aguiar</p>
                      <p className="text-xs text-text-muted font-mono">UNTD-014</p>
                    </div>
                    <Badge variant="pipeline-replied" className="ml-auto">
                      Respondeu
                    </Badge>
                  </div>
                  <Separator />
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Lead com fit forte. ICP 87. Próxima ação: enviar deck
                    institucional + agendar reunião quinta.
                  </p>
                </div>
              </SheetBody>
              <SheetFooter>
                <Button variant="ghost">Fechar</Button>
                <Button>
                  <Mail /> Enviar e-mail
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Section>

        {/* Popover */}
        <Section title="Popover">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Filtros <ChevronDown />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72">
              <div className="space-y-3">
                <p className="font-display text-sm font-semibold text-text">
                  Filtrar leads
                </p>
                <div className="space-y-2">
                  <Label htmlFor="filter-stage" className="text-xs">
                    Estágio
                  </Label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger id="filter-stage">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospecção</SelectItem>
                      <SelectItem value="contacted">Primeiro contato</SelectItem>
                      <SelectItem value="replied">Respondeu</SelectItem>
                      <SelectItem value="won">Fechado (ganho)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Section>

        {/* Tooltip */}
        <Section title="Tooltip">
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Adicionar">
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Adicionar lead</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Mais">
                  <MoreHorizontal />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Mais opções</TooltipContent>
            </Tooltip>
          </div>
        </Section>

        {/* DropdownMenu */}
        <Section title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                Ações <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Conta</DropdownMenuLabel>
              <DropdownMenuItem>
                Perfil
                <DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurações
                <DropdownMenuShortcut>,</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Visão</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showBookmarks}
                onCheckedChange={setShowBookmarks}
              >
                Mostrar bookmarks
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Densidade</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={radio} onValueChange={setRadio}>
                <DropdownMenuRadioItem value="compact">Compacta</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="comfortable">Confortável</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="spacious">Espaçada</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        {/* Select */}
        <Section title="Select">
          <div className="max-w-xs space-y-1.5">
            <Label>Origem do lead</Label>
            <Select defaultValue="dm">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dm">DM fria</SelectItem>
                <SelectItem value="email">Cold email</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Visão geral</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-sm text-text-secondary leading-relaxed">
                Resumo do lead: ICP 87, último contato há 2h, três tarefas
                pendentes nesta semana.
              </p>
            </TabsContent>
            <TabsContent value="activity">
              <p className="text-sm text-text-secondary leading-relaxed">
                Histórico cronológico — DMs, e-mails, ligações.
              </p>
            </TabsContent>
            <TabsContent value="notes">
              <p className="text-sm text-text-secondary leading-relaxed">
                Anotações privadas, com tags e busca.
              </p>
            </TabsContent>
          </Tabs>
        </Section>

        {/* ScrollArea */}
        <Section title="ScrollArea">
          <ScrollArea className="h-56 w-full max-w-md rounded-md border border-border bg-surface p-4">
            <div className="space-y-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-sm px-2 py-2 text-sm hover:bg-surface-elevated"
                >
                  <span className="text-text-secondary">Lead #{(i + 1).toString().padStart(3, '0')}</span>
                  <Badge variant="outline">ICP {50 + ((i * 7) % 40)}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Section>

        {/* Switch */}
        <Section title="Switch">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="s1" />
              <Label htmlFor="s1">Notificações por e-mail</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="s2" checked={checked} onCheckedChange={setChecked} />
              <Label htmlFor="s2">Modo foco</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="s3" disabled />
              <Label htmlFor="s3">Indisponível</Label>
            </div>
          </div>
        </Section>

        {/* Toaster triggers */}
        <Section title="Sonner / Toasts">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                toast.success('Lead movido para Respondeu', {
                  description: 'Marina Aguiar — UNTD-014',
                })
              }
            >
              Success
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.warning('Follow-up vence amanhã', {
                  description: '3 leads aguardando resposta há mais de 5 dias',
                })
              }
            >
              Warning
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.error('Falha ao sincronizar Meta Ads', {
                  description: 'Tentando reconectar em 30s',
                })
              }
            >
              Danger
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.info('Nova versão disponível', {
                  description: 'UNTD OS 0.2.0',
                })
              }
            >
              Info
            </Button>
          </div>
        </Section>

        <footer className="pt-8 border-t border-border-subtle">
          <p className="text-xs text-text-muted font-mono">
            UNTD OS — primitives v0.1
          </p>
        </footer>
      </div>
    </div>
  )
}
