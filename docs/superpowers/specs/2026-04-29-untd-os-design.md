# UNTD OS — Design Spec

**Date:** 2026-04-29
**Status:** Approved
**Author:** Arthur (UNTD) + Claude (Architect)
**Related docs:** [PRODUCT.md](../../../PRODUCT.md), [DESIGN.md](../../../DESIGN.md)

---

## 1. Context & Goals

UNTD OS é o centro de comando pessoal do fundador da UNTD Studio (SaaS B2B de geração de imagens). Substitui ferramentas espalhadas por uma interface única para: gerenciar leads, pipeline comercial, anotações estratégicas, calendário de ações, tarefas, dashboards de redes sociais e tráfego pago, e centralizar feedbacks.

**Goals da V1:**
- Aplicação Next.js completa, navegável em todos os 11 módulos descritos no escopo
- UX premium fiel ao DESIGN.md (dark, motion-rich, tokens roxos UNTD)
- Dados realistas via mocks persistidos em localStorage
- Arquitetura preparada para troca direta para Supabase + Meta APIs sem refatoração estrutural
- Engine de ICP scoring funcional com breakdown explicável
- Sistema de alertas inteligentes baseado em regras

**Non-goals da V1:** autenticação real, integrações reais com Meta Graph/Ads APIs, IA real, multi-usuário, import/export de dados, testes E2E extensivos.

---

## 2. Phasing Strategy

V1 entregue em **4 fases sequenciais** dentro de um único projeto. Cada fase é um entregável funcional e revisável:

| Fase | Escopo | Entregável |
|---|---|---|
| **0 — Fundação** | Setup, tokens, fontes, AppShell, primitivos UI, repository pattern, persistência localStorage | App vazio mas navegável, com sidebar/topbar, identidade visual aplicada |
| **1 — Núcleo CRM** | Leads (lista + detalhe + timeline), Pipeline Kanban, ICP & Scoring | Operação comercial completa funcional |
| **2 — Operação Diária** | Dashboard, Calendário, Tarefas, Notas | Planejamento e organização do dia-a-dia |
| **3 — Inteligência & Crescimento** | Social Media, Meta Ads, Feedbacks, Settings | Dashboards mockados, central de feedback, configurações |

`writing-plans` planejará a **Fase 0 + Fase 1** com profundidade. Fases 2 e 3 ficam como sub-planos referenciados, expandidos quando suas dependências (Fase 1) estiverem prontas.

---

## 3. Stack & Tooling

| Camada | Escolha | Razão |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Server Components + route groups + boa DX |
| Linguagem | **TypeScript** strict | 11 domínios exigem tipos sólidos |
| Estilo | **Tailwind CSS v3** + CSS Variables | Estabilidade com shadcn; tokens DESIGN.md como vars no `:root` |
| UI Primitives | **shadcn/ui** (Radix) calibrado ao DESIGN.md | Não usar tema padrão — todo componente customizado para tokens UNTD |
| Fontes | `next/font` (Inter, JetBrains Mono) + Fontshare local (Satoshi) | Inter/Mono open-source via Google; Satoshi self-hosted para evitar layout shift |
| Estado client | **Zustand** + middleware `persist` | Sem boilerplate; cada domínio um store; persistência automática |
| Forms | **react-hook-form** + **zod** | Validação tipada compartilhada com tipos de domínio |
| Drag-and-drop | **@dnd-kit/core** + **@dnd-kit/sortable** | Acessível, performático |
| Charts | **Recharts** | Bom dark mode, tree-shakable |
| Datas | **date-fns** + **date-fns-tz** | Leve, tree-shakable |
| Motion | **Framer Motion** | Implementa o sistema de motion do DESIGN.md |
| Ícones | **Lucide React** | Pedido no DESIGN.md |
| Editor (Notas) | **Tiptap** (ProseMirror) | Markdown + rich text + extensível |
| Tabela (Leads) | **TanStack Table v8** | Headless, virtualização, sort/filter avançado |
| Backend abstrato | **Repository Pattern** com adapters | Mock agora, Supabase depois com troca de uma linha |
| Persistência mock | **localStorage** com seed JSON | Dados sobrevivem reload, recuperam do seed se vazios |
| Gerenciador de pacotes | **pnpm** | Mais rápido, melhor cache |
| Lint/Format | **ESLint** + **Prettier** + import sort | Padrão consistente |

**Decisões deliberadas:**
- Sem **Server Actions** ainda — toda mutação client-side via repository. Migração futura concentrada num PR.
- Sem **tRPC** — overhead desnecessário com mock.
- Sem **Prisma** — entra junto com Supabase.

---

## 4. Folder Structure

```
untd-os/
├── app/
│   ├── (app)/                      # Route group autenticado (futuro)
│   │   ├── layout.tsx              # AppShell: sidebar + topbar + page transitions
│   │   ├── dashboard/page.tsx
│   │   ├── crm/page.tsx
│   │   ├── leads/
│   │   │   ├── page.tsx            # Tabela
│   │   │   └── [id]/page.tsx       # Detalhe + timeline
│   │   ├── icp/page.tsx
│   │   ├── notes/
│   │   │   ├── page.tsx            # Biblioteca
│   │   │   └── [id]/page.tsx       # Editor
│   │   ├── calendar/page.tsx
│   │   ├── tasks/page.tsx
│   │   ├── social-media/page.tsx
│   │   ├── meta-ads/page.tsx
│   │   ├── feedbacks/page.tsx
│   │   └── settings/page.tsx
│   ├── layout.tsx                  # Root: fontes, theme provider, toaster
│   ├── globals.css                 # Tailwind + tokens CSS
│   └── not-found.tsx
│
├── components/
│   ├── ui/                         # shadcn calibrado: button, card, badge, input,
│   │                               # select, dialog, tooltip, tabs, sheet,
│   │                               # dropdown-menu, command, avatar, separator,
│   │                               # scroll-area, skeleton, toast, popover, switch
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── sidebar-item.tsx
│   │   ├── topbar.tsx
│   │   └── command-palette.tsx     # Cmd+K (extra de UX premium)
│   ├── shared/
│   │   ├── kpi-card.tsx
│   │   ├── empty-state.tsx
│   │   ├── page-header.tsx
│   │   ├── icp-score-ring.tsx      # SVG ring animado
│   │   ├── temperature-badge.tsx
│   │   ├── origin-tag.tsx
│   │   ├── priority-indicator.tsx
│   │   └── animated-number.tsx
│   ├── dashboard/                  # Composites do dashboard
│   ├── crm/                        # Pipeline kanban
│   ├── leads/                      # Tabela + detail panel + timeline
│   ├── notes/                      # Editor Tiptap + library
│   ├── calendar/                   # Day/week/month views
│   ├── tasks/                      # Lista + kanban
│   ├── feedbacks/
│   ├── settings/
│   ├── charts/                     # Wrappers Recharts com tema
│   └── motion/                     # Wrappers framer-motion (PageTransition, Stagger)
│
├── lib/
│   ├── types/                      # Tipos de domínio
│   │   ├── lead.ts
│   │   ├── pipeline.ts
│   │   ├── interaction.ts
│   │   ├── note.ts
│   │   ├── task.ts
│   │   ├── calendar-action.ts
│   │   ├── icp.ts
│   │   ├── social-media.ts
│   │   ├── meta-ads.ts
│   │   ├── feedback.ts
│   │   ├── tag.ts
│   │   └── index.ts                # barrel
│   ├── schemas/                    # Zod schemas espelhando types
│   ├── repositories/
│   │   ├── base.repository.ts      # Interface genérica
│   │   ├── leads.repository.ts     # Interface por domínio
│   │   ├── leads.mock.ts           # Mock + localStorage
│   │   ├── notes.repository.ts
│   │   ├── notes.mock.ts
│   │   ├── ...                     # idem cada domínio
│   │   └── index.ts                # Factory mock vs supabase via env
│   ├── services/                   # Lógica de domínio
│   │   ├── scoring.service.ts      # Engine ICP score
│   │   ├── alerts.service.ts       # Alertas inteligentes
│   │   ├── follow-up.service.ts    # Quem precisa follow-up hoje
│   │   ├── social-media.service.ts # Wrapper Meta API (mock)
│   │   └── meta-ads.service.ts     # Wrapper Meta Ads API (mock)
│   ├── mocks/
│   │   ├── seeds/
│   │   │   ├── leads.seed.ts       # 15 leads realistas
│   │   │   ├── notes.seed.ts       # 10 notas
│   │   │   ├── tasks.seed.ts       # 12 tarefas
│   │   │   ├── calendar.seed.ts    # 8 ações
│   │   │   ├── feedbacks.seed.ts   # 5 feedbacks
│   │   │   ├── social.seed.ts
│   │   │   ├── meta-ads.seed.ts
│   │   │   ├── icp.seed.ts         # ICP profile inicial
│   │   │   └── pipeline.seed.ts    # 11 etapas
│   │   └── factories.ts            # Helpers
│   ├── stores/                     # Zustand
│   │   ├── ui.store.ts             # Sidebar collapsed, modais
│   │   ├── filters.store.ts        # Filtros de tabela (persistido)
│   │   └── index.ts
│   ├── hooks/                      # useLeads, useNotes, etc — leem dos repos
│   ├── utils/
│   │   ├── cn.ts                   # tailwind-merge + clsx
│   │   ├── date.ts
│   │   ├── format.ts               # número, moeda, %
│   │   └── id.ts                   # nanoid wrapper
│   └── theme/
│       └── tokens.ts               # Tokens DESIGN.md como TS
│
├── public/
│   └── fonts/                      # Satoshi self-hosted
│
├── styles/
│   └── tokens.css                  # CSS vars do DESIGN.md
│
├── docs/
│   └── superpowers/
│       └── specs/                  # Specs (este arquivo aqui)
│
├── tailwind.config.ts
├── components.json                 # shadcn config
├── next.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## 5. Type System

Single source of truth em `lib/types/`. Cada domínio em arquivo próprio. Discriminated unions em todos os campos de estado. Tudo serializável (datas como ISO strings) para sobreviver ao localStorage.

**Tipos principais:**

```ts
// lib/types/lead.ts
export type LeadOrigin =
  | 'cold-dm' | 'cold-email' | 'in-person' | 'referral'
  | 'paid-traffic' | 'social' | 'community' | 'event'
  | 'manual-search' | 'other'

export type LeadTemperature = 'cold' | 'warm' | 'hot'
export type LeadResult = 'open' | 'won' | 'lost' | 'no-response' | 'no-fit'

export interface Lead {
  id: string
  name: string
  company: string
  role?: string
  niche: string
  website?: string
  instagram?: string
  linkedin?: string
  email?: string
  phone?: string
  location?: { city?: string; country?: string }
  origin: LeadOrigin
  pipelineStageId: string
  temperature: LeadTemperature
  icpScore: number               // 0-100, calculado
  pain?: string
  revenuePotential?: number
  objections?: string[]
  firstContactAt?: string        // ISO
  lastContactAt?: string
  nextFollowUpAt?: string
  ownerId: string                // 'arthur' hardcoded na V1
  tagIds: string[]
  internalNotes?: string
  result: LeadResult
  createdAt: string
  updatedAt: string
}

// lib/types/interaction.ts
export type InteractionType =
  | 'first-contact-sent' | 'replied' | 'follow-up-sent'
  | 'meeting-scheduled' | 'meeting-held' | 'proposal-sent'
  | 'feedback-received' | 'won' | 'lost' | 'note'

export interface LeadInteraction {
  id: string
  leadId: string
  type: InteractionType
  description?: string
  occurredAt: string
  createdAt: string
}

// lib/types/pipeline.ts
export interface PipelineStage {
  id: string
  name: string
  order: number
  color: string                  // hex token do DESIGN.md
  isFinalWon?: boolean
  isFinalLost?: boolean
}

// lib/types/note.ts
export type NoteType =
  | 'product-idea' | 'ui-idea' | 'feature-idea' | 'campaign-idea'
  | 'copy-idea' | 'offer-idea' | 'client-feedback' | 'market-insight'
  | 'sales-learning' | 'strategic-decision' | 'useful-prompt'
  | 'visual-reference' | 'bug-improvement' | 'onboarding-idea'
  | 'pricing-idea' | 'brandkit-idea' | 'other'

export type NotePriority = 'low' | 'medium' | 'high'
export type NoteStatus = 'draft' | 'review' | 'approved' | 'in-progress' | 'archived'
export type NoteRelation = 'lead' | 'client' | 'product' | 'campaign' | 'ui' | 'sales' | 'social' | 'meta-ads' | 'general'

export interface Note {
  id: string
  title: string
  content: string                // HTML do Tiptap
  type: NoteType
  tagIds: string[]
  relatedTo: NoteRelation
  priority: NotePriority
  status: NoteStatus
  pinned: boolean
  favorited: boolean
  expectedImpact?: 'low' | 'medium' | 'high'
  estimatedEffort?: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

// lib/types/task.ts e lib/types/calendar-action.ts
// (campos conforme escopo: title, description, dueDate, importance, status, category, relatedTo, tags)

// lib/types/icp.ts
export interface ICPCriterion {
  id: string
  name: string
  weight: number                 // 0-100, soma normalizada na engine
  field: keyof Lead | string     // qual campo do lead avaliar
  evaluator: ICPEvaluatorType    // tipo de avaliação
  config: Record<string, unknown>// configuração específica do evaluator
}

export type ICPEvaluatorType =
  | 'enum-match'                 // origin === valor desejado
  | 'numeric-range'              // potencial entre min e max
  | 'boolean-true'               // tem-marca-visual === true
  | 'array-includes'             // niche em lista priorizada

export interface ICPProfile {
  id: string
  name: string
  description?: string
  criteria: ICPCriterion[]
  persona: {
    name: string
    description: string
    pains: string[]
    desires: string[]
    objections: string[]
    purchaseTriggers: string[]
    bestMessage?: string
    likelyOffer?: string
    foundOnChannels: string[]
  }
  updatedAt: string
}
```

Os outros tipos (Task, CalendarAction, SocialMediaMetric, SocialPost, MetaCampaign, MetaAdsMetric, Feedback, Tag) seguem o mesmo padrão definido no escopo.

---

## 6. Data Layer — Repository Pattern

**Interface base:**

```ts
// lib/repositories/base.repository.ts
export interface Repository<T extends { id: string }, TInput = Omit<T, 'id' | 'createdAt' | 'updatedAt'>> {
  list(filters?: Partial<T>): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(data: TInput): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}
```

**Implementação mock genérica:**

```ts
// lib/repositories/mock-storage.ts
export function createMockRepository<T extends { id: string; createdAt: string; updatedAt: string }>(
  storageKey: string,
  seed: T[]
): Repository<T> {
  // Lê do localStorage, fallback para seed
  // Simula latência (50-150ms) com setTimeout
  // Persiste após cada mutação
  // Notifica listeners (para invalidação de hooks)
}
```

**Factory para troca de adapter:**

```ts
// lib/repositories/index.ts
import { createLeadsMock } from './leads.mock'
// import { createLeadsSupabase } from './leads.supabase'

const useSupabase = process.env.NEXT_PUBLIC_DATA_SOURCE === 'supabase'

export const leadsRepo = useSupabase
  ? createLeadsSupabase()    // futuro
  : createLeadsMock()
// ... idem para cada domínio
```

**Hooks no topo:**

```ts
// lib/hooks/use-leads.ts
export function useLeads(filters?: Partial<Lead>) {
  // Subscribe ao repo, retorna { data, isLoading, error }
  // Re-busca quando filters muda
  // Invalida quando repo notifica mudança
}
```

Nada nos componentes toca localStorage diretamente. Toda leitura/escrita passa pelos hooks → repositories. Migração para Supabase é trocar implementação dos repos sem mexer nos hooks ou componentes.

---

## 7. Domain Services

Lógica pura, sem dependência de UI ou storage. Testável isoladamente.

### 7.1 ICP Scoring Engine

```ts
// lib/services/scoring.service.ts
export interface ScoreBreakdown {
  total: number                  // 0-100
  criteria: Array<{
    criterionId: string
    name: string
    weight: number
    matchScore: number           // 0-1
    contribution: number         // weight * matchScore (já normalizado)
    positive: boolean            // ajudou ou não
    explanation: string          // "Nicho prioritário (Agências de marketing): match"
  }>
}

export function calculateICPScore(lead: Lead, profile: ICPProfile): ScoreBreakdown
export function recalculateAllLeads(leads: Lead[], profile: ICPProfile): Lead[]
```

A página de detalhe do lead exibe o breakdown ("Por que esse lead tem 84/100?"). Quando o ICP profile muda em Settings, dispara `recalculateAllLeads` e persiste os scores atualizados.

### 7.2 Smart Alerts Engine

```ts
// lib/services/alerts.service.ts
export type Alert =
  | { type: 'leads-stale'; count: number; days: number; leadIds: string[] }
  | { type: 'follow-ups-due-today'; count: number; leadIds: string[] }
  | { type: 'high-icp-no-proposal'; count: number; leadIds: string[] }
  | { type: 'tasks-overdue'; count: number; taskIds: string[] }
  | { type: 'high-impact-feedback'; count: number; feedbackIds: string[] }

export function generateAlerts(input: {
  leads: Lead[]
  tasks: Task[]
  feedbacks: Feedback[]
  pipeline: PipelineStage[]
  today: Date
}): Alert[]
```

Regras simples e extensíveis. Cada alerta gera um card com CTA contextual no Dashboard.

### 7.3 Follow-up Service

```ts
// lib/services/follow-up.service.ts
export function leadsNeedingFollowUpToday(leads: Lead[], today: Date): Lead[]
export function leadsStale(leads: Lead[], thresholdDays: number, today: Date): Lead[]
export function leadsNeedingProposal(leads: Lead[], pipeline: PipelineStage[]): Lead[]
```

### 7.4 Social Media & Meta Ads Services

Wrappers preparados para Meta Graph API e Meta Ads API. V1 retorna mocks. Shape do retorno espelha a API real (campos, nesting) para evitar refatoração no consumidor.

```ts
// lib/services/social-media.service.ts
export interface SocialMediaService {
  getOverview(network: SocialNetwork, range: DateRange): Promise<SocialMediaOverview>
  getRecentPosts(network: SocialNetwork, limit: number): Promise<SocialPost[]>
  getInsights(network: SocialNetwork): Promise<SocialInsight[]>
}

export const socialMediaService: SocialMediaService = createMockSocialMediaService()
// futuro: createMetaGraphService(token)
```

---

## 8. State Management

| Tipo de estado | Onde mora | Persistência |
|---|---|---|
| Dados de domínio (leads, notas, etc) | Repositories + hooks | localStorage via repo |
| Filtros de tabela | Zustand `filters.store.ts` | localStorage via persist middleware |
| UI ephemeral (modais, sheet aberto, sidebar collapsed) | Zustand `ui.store.ts` | sessionStorage (sidebar collapsed em localStorage) |
| Formulários | react-hook-form local | nenhuma |
| Server-fetched (futuro) | Server Components → props | n/a |

**Server Components** rodam onde possível para listas iniciais. **Client Components** para tudo interativo (kanban, filtros, editores, modais).

---

## 9. Routing & Layout

- Route group `(app)` envolve todas as páginas com `AppShell` (sidebar + topbar). Quando autenticação real entrar, vira `(auth)/login` + middleware sem refatoração.
- Page transitions via `<motion.div>` no `(app)/layout.tsx` com `AnimatePresence` (fade + translate Y 12px → 0, 350ms).
- Sidebar com 11 itens conforme escopo. Estado collapsed/expanded persistido.
- Topbar com: breadcrumb da página atual, busca global (Cmd+K → command palette), avatar.
- Command palette (Cmd+K) com ações rápidas: criar lead, criar nota, criar tarefa, navegar entre módulos.

---

## 10. Per-Module Decisions

### 10.1 Dashboard
- Server Component orquestrador. Cada bloco é Client Component independente.
- Blocos: Greeting, Plano de Hoje, CRM Summary, Pipeline Funnel (mini), Smart Alerts, Social Summary, Meta Ads Summary, Recent Notes, Recommended Actions.
- Cada bloco tem skeleton state e empty state.
- "Plano de Hoje" agrega tarefas + ações de calendário do dia atual ordenadas por importância.

### 10.2 CRM / Pipeline
- Layout horizontal scroll com 11 colunas.
- `@dnd-kit/sortable` para drag entre colunas. Animação spring no drop.
- Mutação otimista no Zustand, persistência via repo após confirmação.
- Card de lead mostra: nome, empresa, ICP score badge, temperature, origin tag, próximo follow-up, indicador de atrasado.
- Filtros no topo: origem, temperatura, score range, status, próximo follow-up, tags.
- Busca por nome/empresa/nicho.
- Mobile/fallback: `<Select>` para mudar etapa.

### 10.3 Leads
- TanStack Table v8 com virtualização.
- Colunas: Nome, Empresa, Nicho, Origem, Stage, Temperatura, ICP Score, Próx. Follow-up, Última interação, Tags.
- Ordenação por qualquer coluna; filtros agrupados em sheet lateral.
- Busca textual no topo.
- CTA "Novo Lead" abre dialog com form (react-hook-form + zod).

**Página de detalhe (`leads/[id]`):**
- Layout 2 colunas: dados principais à esquerda (60%), timeline + ações à direita (40%).
- Header com nome, ICP score ring grande, badges de stage e temperature.
- Tabs: Visão geral / Timeline / Notas / Feedbacks.
- Timeline cronológica com ícones por tipo de interação.
- Botões de ação: criar follow-up, adicionar nota, marcar ganho/perdido, mudar etapa.
- ICP Breakdown expansível ("Por que 84/100?").

### 10.4 ICP & Scoring
- Layout 2 colunas: Critérios à esquerda (form com peso, evaluator, config), Persona à direita (form rich).
- Live preview: card mostra exemplo de lead e o score recalculado em tempo real ao mexer nos critérios.
- "Salvar" persiste o profile e dispara recálculo de todos os leads.

### 10.5 Notas & Ideias
- Página principal: biblioteca em modo card grid + filtros laterais (tipo, prioridade, status, tags) + busca.
- Seção topo: notas fixadas (cards maiores).
- Seção "Recentes" e "Alto impacto" abaixo.
- Toggle visualização cards/lista.
- Página de detalhe (`notes/[id]`): editor Tiptap full-width com extensões `StarterKit`, `TaskList`, `Link`, `Highlight`, `Placeholder`. Sidebar direita com metadata (tipo, tags, prioridade, status, fixar, favoritar, impacto, esforço).
- "Nova nota" abre direto no editor.

### 10.6 Calendário
- Tabs: Dia / Semana / Mês.
- **Dia:** lista densa com cards coloridos por importância. "Prioridade máxima do dia" destacada no topo.
- **Semana:** grid 7 colunas, cards compactos.
- **Mês:** grid 7×6 com badges de densidade por dia.
- Criar ação: dialog com form. Pode relacionar a lead/nota/campanha.
- Coluna de hoje tem `glow-primary-sm` na borda esquerda.

### 10.7 Tarefas
- Tabs: Lista / Kanban (por status) / Por data / Por prioridade.
- Reaproveita componente `<KanbanBoard>` do CRM com colunas = status.
- Filtros rápidos como chips: Hoje, Atrasadas, Esta semana, Alta importância, Relacionadas a leads, Relacionadas ao produto.

### 10.8 Social Media
- Tabs por rede: Instagram / LinkedIn / Facebook / YouTube.
- Top: KPI cards (seguidores, engajamento, alcance, posts) com sparkline.
- Meio: gráfico de evolução (LineChart Recharts) — escolha de métrica via select.
- Lateral: posts recentes + ranking (melhores/piores).
- Bottom: cards de "Insights automáticos" (mockados, mas estruturados).

### 10.9 Meta Ads
- Top: KPI cards (investimento, leads, CPL, CTR, ROAS).
- Meio: gráfico de investimento e leads por dia.
- Tabela de campanhas (TanStack Table) com sort/filter.
- Card de campanha: status, objetivo, criativo principal, público, resultado, custo por resultado.
- Insights automáticos mockados.

### 10.10 Feedbacks
- Lista com filtros (tipo, impacto, frequência, status).
- Card de feedback mostra: quem, lead/cliente relacionado, conteúdo, tipo, impacto.
- Botões "Virar tarefa" / "Virar nota" criam entidade no repo correspondente e atualizam status do feedback.
- Seção "Mais recorrentes" e "Alto impacto sem ação" no topo.

### 10.11 Settings
- Tabs: Perfil / Aparência / Pipeline / Tags & Origens / Integrações / Dados.
- **Perfil:** nome, foto, fuso.
- **Aparência:** tema (sempre dark V1), densidade.
- **Pipeline:** edit etapas (nome, cor, ordem).
- **Tags & Origens:** CRUD de tags e canais customizáveis.
- **Integrações:** placeholders para OpenAI / Meta / Meta Ads (apenas inputs, sem fluxo real).
- **Dados:** export/import (botão "em breve").

---

## 11. Motion System Implementation

Implementa o sistema definido no DESIGN.md.

| Padrão | Implementação |
|---|---|
| Page transitions | `<motion.div>` no `(app)/layout.tsx`, `key={pathname}`, fade + Y 12→0, 350ms `easeOut` |
| Cards hover | Tailwind `transition-all duration-base` + `hover:` (sem framer pois é massivamente reutilizado) |
| Modais/sheets | Radix anima por padrão; calibrar durations no Tailwind config |
| Counters | Hook `useAnimatedNumber` baseado em framer's `animate()` |
| ICP ring | SVG `<circle>` com `pathLength` animado por framer (600ms ease-out) |
| Sidebar mount stagger | `<motion.div variants={...} initial="hidden" animate="show">` com `staggerChildren: 0.04` |
| Pipeline drag | `@dnd-kit` + `transform` CSS; scale 1.02 + glow no grab |
| Toasts | `sonner` (ou shadcn toast) já anima |

**Reduced motion:** media query global `@media (prefers-reduced-motion: reduce)` desativa transitions custosas. Hook `useReducedMotion()` do framer usado para skipar animações JS.

---

## 12. Theming & Design Tokens

Tokens do DESIGN.md exposed em três camadas:

1. **CSS Variables** em `styles/tokens.css` (`:root`):
   ```css
   :root {
     --background: #0f0e17;
     --surface: #1a1825;
     --surface-elevated: #211f2e;
     --primary: #5332ea;
     /* ... etc */
   }
   ```

2. **Tailwind theme extension** em `tailwind.config.ts` referencia as CSS vars:
   ```ts
   theme: {
     extend: {
       colors: {
         background: 'var(--background)',
         primary: 'var(--primary)',
         // ...
       }
     }
   }
   ```

3. **TypeScript tokens** em `lib/theme/tokens.ts` para uso programático (charts, motion):
   ```ts
   export const tokens = {
     colors: { background: '#0f0e17', primary: '#5332ea', ... },
     duration: { instant: 80, fast: 150, base: 220, slow: 350, enter: 400 },
     easing: { spring: [0.34, 1.56, 0.64, 1], ... },
   } as const
   ```

Fontes via `next/font`:
- Inter (Google) → `--font-inter`
- JetBrains Mono (Google) → `--font-mono`
- Satoshi (Fontshare CDN, baixado para `public/fonts/` e via `next/font/local`) → `--font-display`

---

## 13. Mock Seeds

Conteúdo realista do contexto UNTD Studio. Geração determinística (seed fixo) para reproducibilidade.

| Seed | Quantidade | Características |
|---|---|---|
| Pipeline stages | 11 | Conforme escopo, com cores do DESIGN.md |
| Leads | 15 | Mix realista: agência social media, restaurante local, clínica estética, e-commerce, infoprodutor, imobiliária, marca de moda, escola de idiomas, agência de tráfego, consultoria B2B + 5 outros. Distribuídos pelas etapas, com origens variadas. |
| Notas | 10 | 2 ideias de produto, 2 ideias UI, 2 feedbacks de cliente, 1 insight, 1 prompt útil, 1 referência visual, 1 estratégica |
| Tarefas | 12 | Mix de hoje, atrasadas, futuras, prioridades variadas |
| Ações de calendário | 8 | Distribuídas na semana atual, tipos variados |
| Feedbacks | 5 | Tipos diversos, alguns recorrentes |
| Social media | overview + 10 posts | Métricas plausíveis, posts recentes |
| Meta Ads | 4 campanhas + métricas diárias 30d | Mix de status, objetivos, performance |
| ICP Profile | 1 | Profile inicial com 8 critérios padrão e persona "Agência local em crescimento" |
| Tags | 8 | Variadas |

Seeds expostos em `lib/mocks/seeds/` e carregados pelos repos quando localStorage está vazio. Botão "Reset to seed" disponível em Settings → Dados.

---

## 14. Testing Strategy

Mínimo viável para V1:
- **Unit tests** para `scoring.service`, `alerts.service`, `follow-up.service` — lógica pura onde erros são caros (Vitest).
- **Type tests** implícitos via `tsc --noEmit` no CI.
- **Sem** testes de componente, sem E2E. Não vale o overhead na V1.

---

## 15. Risk & Future Migration

| Risco | Mitigação |
|---|---|
| localStorage tem limite (~5-10MB) | Tamanho dos mocks fica abaixo; alerta amigável se exceder |
| Migração para Supabase causar ripple | Repository pattern isola; troca em `lib/repositories/index.ts` |
| Meta APIs mudarem shape | Services retornam tipos próprios, não a API raw; adapter futuro normaliza |
| Tiptap content (HTML) vs Markdown puro | Persistir HTML do Tiptap; export Markdown disponível como utilitário |
| Drag-and-drop quebrar em mobile | Fallback `<Select>` em viewports < 768px |
| Performance da tabela com muitos leads | TanStack Table virtualizado já escala para milhares |
| Cores do DESIGN.md sem WCAG AA em alguns pares | Auditoria de contraste no Dashboard de cada PR; ajuste de tokens secundários se necessário |

**Migração futura para Supabase (referência):**
1. Criar schema SQL espelhando types
2. Implementar `*.supabase.ts` para cada repo
3. Adicionar Server Actions/Route Handlers para mutações sensíveis
4. Trocar env `NEXT_PUBLIC_DATA_SOURCE=supabase`
5. Migrar dados localStorage → Supabase via script único

---

## 16. Out of Scope (V1)

- Autenticação real (`(app)` route group preparado, sem login)
- Integração Meta Graph / Meta Ads APIs (services preparados, dados mockados)
- IA real (botões "Gerar com IA" presentes mas desabilitados/placeholder)
- Multi-usuário (`ownerId: 'arthur'` hardcoded)
- Importação/exportação de dados (botão "em breve" em Settings)
- Testes E2E
- Internationalization (PT-BR fixo)
- PWA / mobile-native experience (desktop-first conforme DESIGN.md)

---

## 17. Acceptance Criteria

V1 está completa quando:

- [ ] `pnpm dev` inicia o app sem erros
- [ ] Todas as 11 rotas navegáveis via sidebar
- [ ] Tokens do DESIGN.md aplicados (cores, fontes, motion)
- [ ] Sidebar collapsed/expanded persiste entre reloads
- [ ] Pipeline kanban com drag-and-drop funcional
- [ ] Tabela de leads com filtros, ordenação e busca
- [ ] Página de detalhe de lead com timeline e breakdown ICP
- [ ] Editor Tiptap funcional com persistência
- [ ] Dashboard agregando dados das outras áreas com alertas funcionais
- [ ] Calendário com 3 visualizações
- [ ] Dashboards Social/Ads com gráficos e dados mockados
- [ ] Feedbacks com conversão para tarefa/nota
- [ ] Settings com edição de pipeline, tags, ICP
- [ ] Mocks persistidos em localStorage; reset disponível
- [ ] `tsc --noEmit` sem erros
- [ ] Build de produção (`pnpm build`) bem-sucedido
- [ ] Testes unitários passando para scoring/alerts/follow-up

---

## 18. Next Step

Após aprovação deste spec, invocar `writing-plans` para criar o plano de execução detalhado começando pela **Fase 0 + Fase 1** (Fundação + Núcleo CRM). Fases 2 e 3 ficam como sub-planos referenciados.
