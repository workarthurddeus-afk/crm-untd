# Design

## Theme

Interface escura, premium e rica em motion. Base em roxo-preto profundo com acento elétrico em roxo UNTD. Cada interação sente intencional e polida — profissional sem ser corporativo, bonito sem ser decorativo. Construído para um power user que abre isso todo dia: precisa ser inspirador de verdade.

---

## Color

### Base
| Token | Hex | Uso |
|---|---|---|
| `background` | `#0f0e17` | Fundo principal da aplicação |
| `surface` | `#1a1825` | Cards, painéis, sidebar |
| `surface-elevated` | `#211f2e` | Modais, dropdowns, tooltips |
| `border` | `#2e2b40` | Bordas padrão |
| `border-subtle` | `#1f1d2c` | Divisores e separadores |

### Brand
| Token | Hex | Uso |
|---|---|---|
| `primary` | `#5332ea` | Botões primários, links ativos, destaques |
| `primary-hover` | `#6445f0` | Hover de elementos primários |
| `primary-muted` | `#5332ea1a` | Backgrounds sutis com toque de marca |
| `primary-subtle` | `#2a1f7a` | Estados selecionados, badges de ativo |

### Text
| Token | Hex | Uso |
|---|---|---|
| `text-default` | `#ffffff` | Texto principal |
| `text-secondary` | `#b3b0c8` | Labels, subtítulos, metadados |
| `text-muted` | `#6e6b87` | Placeholders, datas, info de apoio |
| `text-inverse` | `#0f0e17` | Texto em fundo claro (ex: badges) |

### Semantic
| Token | Hex | Uso |
|---|---|---|
| `success` | `#34d399` | Lead fechado, métricas positivas |
| `warning` | `#fbbf24` | Follow-up pendente, atenção |
| `danger` | `#f87171` | Lead perdido, erro |
| `info` | `#60a5fa` | Informação neutra |

### Pipeline States
| Estágio | Hex |
|---|---|
| Prospecção | `#a78bfa` |
| Primeiro contato | `#60a5fa` |
| Respondeu | `#34d399` |
| Follow-up | `#fbbf24` |
| Proposta enviada | `#fb923c` |
| Fechado (ganho) | `#10b981` |
| Fechado (perdido) | `#4b5563` |

---

## Typography

### Fontes
- **Display / Headlines**: `Satoshi` — geométrica, moderna, ligeiramente editorial. Personalidade sem arrogância.
- **UI / Body**: `Inter` — legível em tamanhos pequenos, neutra, excelente em dark mode.
- **Mono**: `JetBrains Mono` — IDs de lead, scores, valores de métricas.

### Escala tipográfica
| Nome | Tamanho | Line-height | Uso típico |
|---|---|---|---|
| `xs` | 11px | 1.4 | Badges, labels de formulário |
| `sm` | 13px | 1.5 | Metadados, timestamps, captions |
| `base` | 14px | 1.6 | Corpo de texto, itens de lista |
| `md` | 16px | 1.5 | Subtítulos de seção |
| `lg` | 20px | 1.4 | Títulos de card, nomes de lead |
| `xl` | 24px | 1.3 | Títulos de página |
| `2xl` | 32px | 1.2 | Números de dashboard, métricas principais |
| `3xl` | 48px | 1.1 | Hero numbers, contadores animados |

### Pesos
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing

Unidade base: **4px**.

Escala: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96`

Padding padrão de card: `20px`. Gap padrão de grid: `24px`.

---

## Border Radius

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 4px | Tags, badges, inputs menores |
| `radius-md` | 8px | Botões, inputs, chips |
| `radius-lg` | 12px | Cards, painéis |
| `radius-xl` | 16px | Modais, sheets laterais |
| `radius-2xl` | 24px | Grandes superfícies, hero containers |
| `radius-full` | 9999px | Avatares, indicadores circulares |

---

## Shadows & Glow

```
shadow-sm:       0 1px 3px rgba(0,0,0,0.4)
shadow-md:       0 4px 16px rgba(0,0,0,0.45)
shadow-lg:       0 8px 32px rgba(0,0,0,0.55)
glow-primary:    0 0 24px rgba(83,50,234,0.35)
glow-primary-sm: 0 0 8px rgba(83,50,234,0.2)
glow-success:    0 0 16px rgba(52,211,153,0.25)
```

Glow é reservado: botão primário no hover, ICP score alto, KPI principal do dashboard. Não usar em tudo.

---

## Motion

**Filosofia**: motion sente fluido, proposital e ligeiramente teatral. Reforça mudanças de estado, nunca decora. Cada transição ensina como a interface funciona.

### Durações
| Token | Valor | Uso |
|---|---|---|
| `duration-instant` | 80ms | Mudanças de cor, foco |
| `duration-fast` | 150ms | Tooltips, hovers |
| `duration-base` | 220ms | Botões, toggles, micro-interações |
| `duration-slow` | 350ms | Transições de página, modais |
| `duration-enter` | 400ms | Animações de entrada na montagem |

### Easings
```
ease-default:  cubic-bezier(0.25, 0.1, 0.25, 1)
ease-enter:    cubic-bezier(0, 0, 0.2, 1)      /* decelera ao entrar */
ease-exit:     cubic-bezier(0.4, 0, 1, 1)      /* acelera ao sair */
ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1) /* overshoot suave */
```

### Padrões de animação
- **Transição de página**: fade + translate Y de 12px → 0, 350ms ease-enter
- **Cards no hover**: scale de 1.0 → 1.015, border-color shift, 220ms ease-spring
- **Modais / sheets**: slide-up de 16px + fade, 300ms ease-enter
- **Sidebar items na montagem**: fade-in escalonado, 40ms de delay por item
- **Contadores / números**: animam do valor 0 ao real na montagem (300ms, ease-enter)
- **Pipeline drag**: scale 1.02 + glow-primary-sm no grab, drop com spring
- **ICP score ring**: desenha o arco SVG na montagem, 600ms ease-enter
- **Notificações / toasts**: slide da direita + fade, auto-dismiss com barra de progresso

---

## Layout

### Shell da aplicação
```
Sidebar esquerda:  240px (colapsada: 56px)
Top bar:           56px altura
Área de conteúdo:  fluida
Painel de detalhe: 380px (lead/nota selecionada)
```

### Grid do dashboard
- 12 colunas, gap de 24px
- Cards de KPI: span 3 colunas (4 por linha)
- Área de pipeline: span 12
- Widgets menores: span 4 ou 6

### Breakpoints
- Desktop first. Mínimo funcional: 1280px de largura.

---

## Components

### Cards
Fundo `surface`, borda 1px `border`, radius-lg. Hover: borda muda para `primary` a 30% de opacidade + `shadow-md`. Transição 220ms.

### Botões
- **Primary**: bg `primary`, texto branco, radius-md. Hover: bg `primary-hover` + `glow-primary-sm`.
- **Secondary**: bg `surface`, borda `border`, texto `text-secondary`. Hover: bg `surface-elevated`.
- **Ghost**: transparente, sem borda. Hover: bg `primary-muted`.
- **Destructive**: bg `danger` a 15%, texto `danger`, borda `danger` a 30%.

### Pipeline Kanban
Colunas com scroll horizontal. Drag-and-drop com animação spring. Header de coluna mostra contagem de leads e badge de cor de estágio. Cards de lead mostram: nome, ICP score badge, última atividade, tag de origem.

### ICP Score Badge
Anel de progresso circular (SVG), cor interpola de `text-muted` → `primary` conforme o score. Animado na montagem. Score numérico no centro em `JetBrains Mono`.

### Notes Editor
Largura total, sem aparência de textarea. Suporte a Markdown rico. Tags como pills no rodapé. Destaque de busca em amarelo suave. Data de criação em `text-muted` no cabeçalho. Empty state com prompt inspirador.

### Calendário
Vista de dia densa. Prioridades: crítico (`primary`), importante (`warning`), normal (`border`). Coluna de hoje tem borda esquerda com `glow-primary-sm`. Tarefas concluídas: strikethrough + opacidade reduzida.

### Navegação Sidebar
Ícone + label. Estado ativo: bg `primary-muted`, borda esquerda 2px `primary`, texto branco. Hover: bg `surface-elevated`. Colapsada: apenas ícone com tooltip.

### Métricas / KPI Cards
Número grande em `3xl` com fonte `Satoshi Bold`. Variação percentual abaixo com cor semântica. Ícone de trend à direita. Sparkline opcional no rodapé do card.

### Lead Origin Tags
Pills compactos com cor sutil por canal: DM (`primary-muted`), Email (`info` muted), Presencial (`success` muted), Indicação (`warning` muted), Tráfego (`danger` muted).

### Empty States
Nunca uma tabela vazia. Ilustração mínima + headline em `lg` + CTA primário. Tom: confiante e direto, não fofo.

---

## Icons

Biblioteca: **Lucide** (consistência, peso leve, estilo de linha limpo).
Tamanho padrão: 16px no body, 20px em headers de seção, 24px em empty states.
Stroke width: 1.5px.
