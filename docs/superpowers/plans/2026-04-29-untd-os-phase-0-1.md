# UNTD OS Phase 0 + Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation (Phase 0) and CRM core (Phase 1) of UNTD OS — a Next.js 15 + TypeScript private CRM with mock-persistent localStorage data, ICP scoring engine, leads management, pipeline kanban, and visual identity from DESIGN.md.

**Architecture:** Next.js App Router with route group `(app)`, repository pattern with mock adapters (Supabase-ready), Zustand stores for client UI state, design tokens from DESIGN.md exposed as CSS vars + Tailwind theme + TS constants, framer-motion for the motion system, TanStack Table for leads, @dnd-kit for pipeline drag-and-drop.

**Tech Stack:** Next.js 15, TypeScript strict, Tailwind v3, shadcn/ui (Radix calibrated to DESIGN.md), Zustand + persist, Framer Motion, react-hook-form + zod, @dnd-kit, TanStack Table v8, Recharts, date-fns, Lucide, Tiptap, Vitest.

**Spec:** [docs/superpowers/specs/2026-04-29-untd-os-design.md](../specs/2026-04-29-untd-os-design.md)
**Visual identity:** [PRODUCT.md](../../../PRODUCT.md), [DESIGN.md](../../../DESIGN.md)

---

## Plan Map

**Phase 0 — Foundation (Tasks 1-11)**
1. Initialize Next.js project + git
2. Install dependencies
3. Configure design tokens (CSS vars + Tailwind theme + TS)
4. Configure fonts (Inter, JetBrains Mono, Satoshi)
5. shadcn/ui base setup + initial primitives
6. Domain types
7. Zod schemas
8. Repository pattern: base + mock storage helper
9. Zustand stores (UI + filters)
10. AppShell + Sidebar + Topbar + routing skeleton (11 placeholder pages)
11. Page transitions + smoke test

**Phase 1 — CRM Core (Tasks 12-26)**
12. Pipeline stages: types + seed + repository
13. Leads: seed + repository + hooks
14. ICP types + initial profile seed + repository
15. ICP scoring engine (TDD)
16. Alerts engine + follow-up service (TDD)
17. Shared components (KPI card, empty state, page header, badges, ICP ring)
18. Leads page — TanStack Table with filters/search
19. Lead form dialog (create/edit)
20. Lead detail page layout
21. Lead interactions: types + seed + repository + timeline component
22. ICP score breakdown component
23. ICP & Scoring page (criteria editor + persona)
24. Pipeline Kanban page with @dnd-kit
25. Origin tags, temperature badges, priority indicator
26. Final integration smoke test for Phase 1

---

# PHASE 0 — FOUNDATION

## Task 1: Initialize Next.js project + git

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `.gitignore`, `README.md`

- [ ] **Step 1: Initialize Next.js project**

Run from `C:\Users\Arthur Gostoso\Desktop\CRM UNTD`:
```bash
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm --no-turbopack
```

When prompted whether to continue with non-empty directory, answer **yes** (the .agents/ folder and PRODUCT.md/DESIGN.md must remain — Next.js installer is non-destructive to those).

Verify the following exist after install: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `tailwind.config.ts`, `app/globals.css`.

- [ ] **Step 2: Initialize git and create `.gitignore` additions**

```bash
git init
git add .gitignore
```

Append to existing `.gitignore`:
```
# Editor / OS
.vscode/
.idea/
.DS_Store
Thumbs.db

# Local data
*.local
.env*.local
```

- [ ] **Step 3: Update `tsconfig.json` to strict**

Replace `compilerOptions` with:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Verify build passes**

Run:
```bash
pnpm tsc --noEmit
pnpm build
```
Expected: both succeed. Default Next page builds.

- [ ] **Step 5: First commit**

```bash
git add -A
git commit -m "chore: bootstrap next.js 15 project with strict typescript"
```

---

## Task 2: Install runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install core libraries**

```bash
pnpm add zustand framer-motion react-hook-form @hookform/resolvers zod date-fns date-fns-tz lucide-react clsx tailwind-merge nanoid sonner cmdk
```

- [ ] **Step 2: Install UI/data libraries**

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @tanstack/react-table recharts class-variance-authority
```

- [ ] **Step 3: Install Radix primitives used by shadcn**

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-popover @radix-ui/react-scroll-area @radix-ui/react-slot @radix-ui/react-avatar @radix-ui/react-switch @radix-ui/react-label
```

- [ ] **Step 4: Install Tiptap for notes (Phase 2 prep, but list now)**

Skip — Tiptap is added in Phase 2. Do not install yet.

- [ ] **Step 5: Install dev dependencies**

```bash
pnpm add -D vitest @vitest/ui @types/node prettier prettier-plugin-tailwindcss eslint-config-prettier
```

- [ ] **Step 6: Verify install**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install runtime + dev dependencies"
```

---

## Task 3: Configure design tokens

**Files:**
- Create: `styles/tokens.css`
- Create: `lib/theme/tokens.ts`
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Create CSS variables file**

Create `styles/tokens.css`:
```css
:root {
  /* Base */
  --background: #0f0e17;
  --surface: #1a1825;
  --surface-elevated: #211f2e;
  --border: #2e2b40;
  --border-subtle: #1f1d2c;

  /* Brand */
  --primary: #5332ea;
  --primary-hover: #6445f0;
  --primary-muted: rgba(83, 50, 234, 0.1);
  --primary-subtle: #2a1f7a;

  /* Text */
  --text-default: #ffffff;
  --text-secondary: #b3b0c8;
  --text-muted: #6e6b87;
  --text-inverse: #0f0e17;

  /* Semantic */
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #f87171;
  --info: #60a5fa;

  /* Pipeline */
  --pipe-prospect: #a78bfa;
  --pipe-contacted: #60a5fa;
  --pipe-replied: #34d399;
  --pipe-followup: #fbbf24;
  --pipe-proposal: #fb923c;
  --pipe-won: #10b981;
  --pipe-lost: #4b5563;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.55);
  --glow-primary: 0 0 24px rgba(83, 50, 234, 0.35);
  --glow-primary-sm: 0 0 8px rgba(83, 50, 234, 0.2);
  --glow-success: 0 0 16px rgba(52, 211, 153, 0.25);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Create TypeScript tokens**

Create `lib/theme/tokens.ts`:
```ts
export const tokens = {
  colors: {
    background: '#0f0e17',
    surface: '#1a1825',
    surfaceElevated: '#211f2e',
    border: '#2e2b40',
    borderSubtle: '#1f1d2c',
    primary: '#5332ea',
    primaryHover: '#6445f0',
    primaryMuted: 'rgba(83, 50, 234, 0.1)',
    primarySubtle: '#2a1f7a',
    textDefault: '#ffffff',
    textSecondary: '#b3b0c8',
    textMuted: '#6e6b87',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    pipeline: {
      prospect: '#a78bfa',
      contacted: '#60a5fa',
      replied: '#34d399',
      followup: '#fbbf24',
      proposal: '#fb923c',
      won: '#10b981',
      lost: '#4b5563',
    },
  },
  duration: {
    instant: 80,
    fast: 150,
    base: 220,
    slow: 350,
    enter: 400,
  },
  easing: {
    default: [0.25, 0.1, 0.25, 1] as const,
    enter: [0, 0, 0.2, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
  },
} as const

export type Tokens = typeof tokens
```

- [ ] **Step 3: Update `tailwind.config.ts`**

Replace contents:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          muted: 'var(--primary-muted)',
          subtle: 'var(--primary-subtle)',
        },
        text: {
          DEFAULT: 'var(--text-default)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        pipe: {
          prospect: 'var(--pipe-prospect)',
          contacted: 'var(--pipe-contacted)',
          replied: 'var(--pipe-replied)',
          followup: 'var(--pipe-followup)',
          proposal: 'var(--pipe-proposal)',
          won: 'var(--pipe-won)',
          lost: 'var(--pipe-lost)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'sm-token': 'var(--shadow-sm)',
        'md-token': 'var(--shadow-md)',
        'lg-token': 'var(--shadow-lg)',
        'glow-primary': 'var(--glow-primary)',
        'glow-primary-sm': 'var(--glow-primary-sm)',
        'glow-success': 'var(--glow-success)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      transitionDuration: {
        instant: '80ms',
        fast: '150ms',
        base: '220ms',
        slow: '350ms',
        enter: '400ms',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 4: Update `app/globals.css`**

Replace contents:
```css
@import '../styles/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    color-scheme: dark;
  }
  body {
    @apply bg-background text-text font-sans antialiased;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  }
  ::selection {
    background: var(--primary-muted);
    color: var(--text-default);
  }
  *:focus-visible {
    @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md;
  }
}
```

- [ ] **Step 5: Verify**

Run:
```bash
pnpm tsc --noEmit
pnpm build
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(theme): wire DESIGN.md tokens via CSS vars + tailwind + ts"
```

---

## Task 4: Configure fonts

**Files:**
- Modify: `app/layout.tsx`
- Create: `public/fonts/satoshi/` (download Satoshi WOFF2 files manually before Step 4)
- Create: `app/fonts.ts`

- [ ] **Step 1: Create `app/fonts.ts`**

```ts
import { Inter, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const fontDisplay = localFont({
  variable: '--font-display',
  display: 'swap',
  src: [
    { path: '../public/fonts/satoshi/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/satoshi/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/satoshi/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../public/fonts/satoshi/Satoshi-Black.woff2', weight: '900', style: 'normal' },
  ],
})
```

- [ ] **Step 2: Download Satoshi**

Download Satoshi from https://www.fontshare.com/fonts/satoshi (free for commercial use). Place these files in `public/fonts/satoshi/`:
- `Satoshi-Regular.woff2`
- `Satoshi-Medium.woff2`
- `Satoshi-Bold.woff2`
- `Satoshi-Black.woff2`

- [ ] **Step 3: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { fontSans, fontMono, fontDisplay } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'UNTD OS',
  description: 'Centro de comando da UNTD',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify**

```bash
pnpm dev
```
Open `http://localhost:3000`. Expected: page renders with Inter as default font (visible in DevTools → Computed → font-family).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(theme): wire next/font for inter, jetbrains mono, satoshi"
```

---

## Task 5: shadcn/ui base + initial primitives

**Files:**
- Create: `lib/utils/cn.ts`
- Create: `components.json`
- Create: `components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `dialog.tsx`, `tooltip.tsx`, `tabs.tsx`, `separator.tsx`, `dropdown-menu.tsx`, `select.tsx`, `popover.tsx`, `scroll-area.tsx`, `avatar.tsx`, `switch.tsx`, `label.tsx`, `skeleton.tsx`, `sheet.tsx`

- [ ] **Step 1: Create `cn` utility**

Create `lib/utils/cn.ts`:
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/lib/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 3: Create `components/ui/button.tsx`**

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-base disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover hover:shadow-glow-primary-sm',
        secondary: 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated hover:text-text',
        ghost: 'bg-transparent text-text-secondary hover:bg-primary-muted hover:text-text',
        destructive: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
        outline: 'border border-border bg-transparent text-text hover:bg-surface',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { buttonVariants }
```

- [ ] **Step 4: Create `components/ui/card.tsx`**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-border bg-surface text-text transition-all duration-base hover:border-primary/30 hover:shadow-md-token',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-display text-lg font-semibold leading-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-text-muted', className)} {...props} />
)
CardDescription.displayName = 'CardDescription'

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
)
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />
)
CardFooter.displayName = 'CardFooter'
```

- [ ] **Step 5: Create `components/ui/badge.tsx`**

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-muted text-primary',
        secondary: 'border-border bg-surface text-text-secondary',
        success: 'border-transparent bg-success/15 text-success',
        warning: 'border-transparent bg-warning/15 text-warning',
        danger: 'border-transparent bg-danger/15 text-danger',
        info: 'border-transparent bg-info/15 text-info',
        outline: 'border-border text-text-secondary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
```

- [ ] **Step 6: Create `components/ui/input.tsx`**

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted',
        'transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
```

- [ ] **Step 7: Add remaining shadcn primitives via CLI**

For each component below, use the shadcn CLI then update the colors/spacing to match DESIGN.md tokens (replace any usage of `bg-background`, `bg-card`, `border-input` etc. with our semantic tokens: `bg-surface`, `border-border`, etc.).

```bash
pnpm dlx shadcn@latest add dialog tooltip tabs separator dropdown-menu select popover scroll-area avatar switch label skeleton sheet sonner
```

After install, edit each generated file in `components/ui/` to:
- Replace `bg-background` → `bg-surface-elevated`
- Replace `bg-card` → `bg-surface`
- Replace `border-input` → `border-border`
- Replace `text-muted-foreground` → `text-text-muted`
- Replace `text-foreground` → `text-text`
- Set radius classes to `rounded-md` or `rounded-lg` consistently

- [ ] **Step 8: Verify**

```bash
pnpm tsc --noEmit
pnpm build
```
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(ui): add shadcn primitives calibrated to DESIGN.md tokens"
```

---

## Task 6: Domain types

**Files:**
- Create: `lib/types/lead.ts`, `pipeline.ts`, `interaction.ts`, `note.ts`, `task.ts`, `calendar-action.ts`, `icp.ts`, `social-media.ts`, `meta-ads.ts`, `feedback.ts`, `tag.ts`, `index.ts`

- [ ] **Step 1: Create `lib/types/tag.ts`**

```ts
export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
}
```

- [ ] **Step 2: Create `lib/types/pipeline.ts`**

```ts
export interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  isFinalWon?: boolean
  isFinalLost?: boolean
}
```

- [ ] **Step 3: Create `lib/types/lead.ts`**

```ts
export type LeadOrigin =
  | 'cold-dm'
  | 'cold-email'
  | 'in-person'
  | 'referral'
  | 'paid-traffic'
  | 'social'
  | 'community'
  | 'event'
  | 'manual-search'
  | 'other'

export type LeadTemperature = 'cold' | 'warm' | 'hot'
export type LeadResult = 'open' | 'won' | 'lost' | 'no-response' | 'no-fit'

export interface LeadLocation {
  city?: string
  country?: string
}

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
  location?: LeadLocation
  origin: LeadOrigin
  pipelineStageId: string
  temperature: LeadTemperature
  icpScore: number
  pain?: string
  revenuePotential?: number
  objections?: string[]
  firstContactAt?: string
  lastContactAt?: string
  nextFollowUpAt?: string
  ownerId: string
  tagIds: string[]
  internalNotes?: string
  result: LeadResult
  createdAt: string
  updatedAt: string
}

export type LeadInput = Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'icpScore'>
```

- [ ] **Step 4: Create `lib/types/interaction.ts`**

```ts
export type InteractionType =
  | 'first-contact-sent'
  | 'replied'
  | 'follow-up-sent'
  | 'meeting-scheduled'
  | 'meeting-held'
  | 'proposal-sent'
  | 'feedback-received'
  | 'won'
  | 'lost'
  | 'note'

export interface LeadInteraction {
  id: string
  leadId: string
  type: InteractionType
  description?: string
  occurredAt: string
  createdAt: string
}

export type LeadInteractionInput = Omit<LeadInteraction, 'id' | 'createdAt'>
```

- [ ] **Step 5: Create `lib/types/icp.ts`**

```ts
export type ICPEvaluatorType =
  | 'enum-match'
  | 'numeric-range'
  | 'boolean-true'
  | 'array-includes'
  | 'string-not-empty'

export interface ICPCriterion {
  id: string
  name: string
  description?: string
  weight: number
  field: string
  evaluator: ICPEvaluatorType
  config: Record<string, unknown>
}

export interface ICPPersona {
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

export interface ICPProfile {
  id: string
  name: string
  description?: string
  criteria: ICPCriterion[]
  persona: ICPPersona
  createdAt: string
  updatedAt: string
}

export interface ICPCriterionResult {
  criterionId: string
  name: string
  weight: number
  matchScore: number
  contribution: number
  positive: boolean
  explanation: string
}

export interface ScoreBreakdown {
  total: number
  criteria: ICPCriterionResult[]
}
```

- [ ] **Step 6: Create stub types for Phase 2/3 domains**

Create `lib/types/note.ts`:
```ts
export type NoteType =
  | 'product-idea' | 'ui-idea' | 'feature-idea' | 'campaign-idea'
  | 'copy-idea' | 'offer-idea' | 'client-feedback' | 'market-insight'
  | 'sales-learning' | 'strategic-decision' | 'useful-prompt'
  | 'visual-reference' | 'bug-improvement' | 'onboarding-idea'
  | 'pricing-idea' | 'brandkit-idea' | 'other'

export type NotePriority = 'low' | 'medium' | 'high'
export type NoteStatus = 'draft' | 'review' | 'approved' | 'in-progress' | 'archived'
export type NoteRelation =
  | 'lead' | 'client' | 'product' | 'campaign' | 'ui'
  | 'sales' | 'social' | 'meta-ads' | 'general'
export type ImpactEffort = 'low' | 'medium' | 'high'

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  tagIds: string[]
  relatedTo: NoteRelation
  priority: NotePriority
  status: NoteStatus
  pinned: boolean
  favorited: boolean
  expectedImpact?: ImpactEffort
  estimatedEffort?: ImpactEffort
  createdAt: string
  updatedAt: string
}
```

Create `lib/types/task.ts`:
```ts
export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'cancelled'
export type TaskImportance = 'low' | 'medium' | 'high'
export type TaskCategory =
  | 'prospecting' | 'follow-up' | 'meeting' | 'product' | 'design'
  | 'content' | 'social' | 'meta-ads' | 'strategy' | 'study' | 'ops' | 'other'

export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  importance: TaskImportance
  status: TaskStatus
  category: TaskCategory
  relatedLeadId?: string
  relatedNoteId?: string
  tagIds: string[]
  createdAt: string
  updatedAt: string
}
```

Create `lib/types/calendar-action.ts`:
```ts
import type { TaskCategory, TaskImportance, TaskStatus } from './task'

export type CalendarUrgency = 'normal' | 'today' | 'overdue'

export interface CalendarAction {
  id: string
  title: string
  description?: string
  date: string
  startTime?: string
  endTime?: string
  type: TaskCategory
  importance: TaskImportance
  urgency: CalendarUrgency
  status: TaskStatus
  relatedLeadId?: string
  relatedNoteId?: string
  tagIds: string[]
  createdAt: string
  updatedAt: string
}
```

Create `lib/types/social-media.ts`:
```ts
export type SocialNetwork = 'instagram' | 'linkedin' | 'facebook' | 'youtube'

export interface SocialMediaOverview {
  network: SocialNetwork
  followers: number
  followersGrowthPct: number
  reach: number
  impressions: number
  engagement: number
  engagementRate: number
  clicks: number
  postsPublished: number
  comments: number
  saves: number
  shares: number
  asOf: string
}

export interface SocialPost {
  id: string
  network: SocialNetwork
  publishedAt: string
  caption: string
  reach: number
  impressions: number
  engagement: number
  likes: number
  comments: number
  saves: number
  shares: number
  thumbnailUrl?: string
}

export interface SocialInsight {
  id: string
  network: SocialNetwork
  message: string
  severity: 'info' | 'warning' | 'positive'
  createdAt: string
}
```

Create `lib/types/meta-ads.ts`:
```ts
export type CampaignStatus = 'active' | 'paused' | 'archived' | 'draft'
export type CampaignObjective =
  | 'leads' | 'traffic' | 'conversions' | 'reach' | 'engagement' | 'sales' | 'awareness'

export interface MetaCampaign {
  id: string
  name: string
  status: CampaignStatus
  objective: CampaignObjective
  audience: string
  creativePreviewUrl?: string
  startedAt: string
  spend: number
  impressions: number
  reach: number
  clicks: number
  ctr: number
  cpc: number
  cpm: number
  leads: number
  cpl: number
  conversions: number
  cpa: number
  roas?: number
}

export interface MetaAdsDailyMetric {
  date: string
  spend: number
  leads: number
  clicks: number
  impressions: number
}

export interface MetaAdsOverview {
  totalSpend: number
  totalLeads: number
  totalClicks: number
  totalImpressions: number
  avgCtr: number
  avgCpc: number
  avgCpl: number
  avgRoas?: number
  activeCampaigns: number
  pausedCampaigns: number
  asOf: string
}
```

Create `lib/types/feedback.ts`:
```ts
export type FeedbackType =
  | 'pain' | 'objection' | 'feature-request' | 'complaint'
  | 'compliment' | 'sales-insight' | 'product-insight' | 'bug' | 'improvement'

export type FeedbackImpact = 'low' | 'medium' | 'high'
export type FeedbackFrequency = 'one-off' | 'recurring' | 'very-recurring'
export type FeedbackStatus =
  | 'new' | 'reviewing' | 'converted-task' | 'converted-feature' | 'archived'

export interface Feedback {
  id: string
  source: string
  relatedLeadId?: string
  type: FeedbackType
  content: string
  date: string
  impact: FeedbackImpact
  frequency: FeedbackFrequency
  status: FeedbackStatus
  tagIds: string[]
  createdAt: string
  updatedAt: string
}
```

- [ ] **Step 7: Create barrel `lib/types/index.ts`**

```ts
export * from './lead'
export * from './pipeline'
export * from './interaction'
export * from './note'
export * from './task'
export * from './calendar-action'
export * from './icp'
export * from './social-media'
export * from './meta-ads'
export * from './feedback'
export * from './tag'
```

- [ ] **Step 8: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS, no errors.

- [ ] **Step 9: Commit**

```bash
git add lib/types/
git commit -m "feat(types): define all domain types"
```

---

## Task 7: Zod schemas

**Files:**
- Create: `lib/schemas/lead.ts`, `note.ts`, `task.ts`, `icp.ts`, `index.ts`

- [ ] **Step 1: Create `lib/schemas/lead.ts`**

```ts
import { z } from 'zod'

export const leadOriginSchema = z.enum([
  'cold-dm', 'cold-email', 'in-person', 'referral',
  'paid-traffic', 'social', 'community', 'event', 'manual-search', 'other',
])

export const leadTemperatureSchema = z.enum(['cold', 'warm', 'hot'])
export const leadResultSchema = z.enum(['open', 'won', 'lost', 'no-response', 'no-fit'])

export const leadInputSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(120),
  company: z.string().min(1, 'Empresa obrigatória').max(120),
  role: z.string().max(120).optional(),
  niche: z.string().min(1, 'Nicho obrigatório').max(120),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().max(120).optional(),
  linkedin: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(40).optional(),
  location: z
    .object({
      city: z.string().max(80).optional(),
      country: z.string().max(80).optional(),
    })
    .optional(),
  origin: leadOriginSchema,
  pipelineStageId: z.string().min(1),
  temperature: leadTemperatureSchema,
  pain: z.string().max(500).optional(),
  revenuePotential: z.number().nonnegative().optional(),
  objections: z.array(z.string().max(200)).optional(),
  firstContactAt: z.string().optional(),
  lastContactAt: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  ownerId: z.string().min(1).default('arthur'),
  tagIds: z.array(z.string()).default([]),
  internalNotes: z.string().max(2000).optional(),
  result: leadResultSchema.default('open'),
})

export type LeadInputSchema = z.infer<typeof leadInputSchema>
```

- [ ] **Step 2: Create `lib/schemas/icp.ts`**

```ts
import { z } from 'zod'

export const icpEvaluatorSchema = z.enum([
  'enum-match', 'numeric-range', 'boolean-true', 'array-includes', 'string-not-empty',
])

export const icpCriterionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  weight: z.number().min(0).max(100),
  field: z.string().min(1),
  evaluator: icpEvaluatorSchema,
  config: z.record(z.string(), z.unknown()).default({}),
})

export const icpPersonaSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  pains: z.array(z.string().max(300)).default([]),
  desires: z.array(z.string().max(300)).default([]),
  objections: z.array(z.string().max(300)).default([]),
  purchaseTriggers: z.array(z.string().max(300)).default([]),
  bestMessage: z.string().max(1000).optional(),
  likelyOffer: z.string().max(500).optional(),
  foundOnChannels: z.array(z.string().max(120)).default([]),
})

export const icpProfileInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  criteria: z.array(icpCriterionSchema).min(1, 'Pelo menos 1 critério'),
  persona: icpPersonaSchema,
})
```

- [ ] **Step 3: Create stub schemas for note/task**

Create `lib/schemas/note.ts`:
```ts
import { z } from 'zod'

export const noteInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().default(''),
  type: z.enum([
    'product-idea', 'ui-idea', 'feature-idea', 'campaign-idea',
    'copy-idea', 'offer-idea', 'client-feedback', 'market-insight',
    'sales-learning', 'strategic-decision', 'useful-prompt',
    'visual-reference', 'bug-improvement', 'onboarding-idea',
    'pricing-idea', 'brandkit-idea', 'other',
  ]),
  tagIds: z.array(z.string()).default([]),
  relatedTo: z.enum(['lead', 'client', 'product', 'campaign', 'ui', 'sales', 'social', 'meta-ads', 'general']),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['draft', 'review', 'approved', 'in-progress', 'archived']),
  pinned: z.boolean().default(false),
  favorited: z.boolean().default(false),
  expectedImpact: z.enum(['low', 'medium', 'high']).optional(),
  estimatedEffort: z.enum(['low', 'medium', 'high']).optional(),
})
```

Create `lib/schemas/task.ts`:
```ts
import { z } from 'zod'

export const taskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  importance: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'done', 'cancelled']),
  category: z.enum([
    'prospecting', 'follow-up', 'meeting', 'product', 'design',
    'content', 'social', 'meta-ads', 'strategy', 'study', 'ops', 'other',
  ]),
  relatedLeadId: z.string().optional(),
  relatedNoteId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
})
```

- [ ] **Step 4: Create barrel**

`lib/schemas/index.ts`:
```ts
export * from './lead'
export * from './icp'
export * from './note'
export * from './task'
```

- [ ] **Step 5: Verify**

Run: `pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/schemas/
git commit -m "feat(schemas): add zod schemas for lead/note/task/icp"
```

---

## Task 8: Repository pattern — base + mock storage helper

**Files:**
- Create: `lib/repositories/base.repository.ts`
- Create: `lib/repositories/mock-storage.ts`
- Create: `lib/utils/id.ts`
- Create: `lib/utils/date.ts`
- Create: `vitest.config.ts`
- Create: `lib/repositories/__tests__/mock-storage.test.ts`

- [ ] **Step 1: Create `lib/utils/id.ts`**

```ts
import { nanoid } from 'nanoid'

export function newId(prefix?: string): string {
  return prefix ? `${prefix}_${nanoid(12)}` : nanoid(16)
}
```

- [ ] **Step 2: Create `lib/utils/date.ts`**

```ts
export function nowIso(): string {
  return new Date().toISOString()
}

export function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export function isoDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}
```

- [ ] **Step 3: Create base repository interface**

Create `lib/repositories/base.repository.ts`:
```ts
export interface Entity {
  id: string
  createdAt: string
  updatedAt: string
}

export type EntityInput<T extends Entity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

export interface Repository<T extends Entity, TInput = EntityInput<T>> {
  list(filters?: Partial<T>): Promise<T[]>
  getById(id: string): Promise<T | null>
  create(data: TInput): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  subscribe(listener: () => void): () => void
}
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Create `vitest.setup.ts`:
```ts
import { beforeEach } from 'vitest'

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
  }
})
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

Install jsdom:
```bash
pnpm add -D jsdom
```

- [ ] **Step 5: Write failing test for mock-storage**

Create `lib/repositories/__tests__/mock-storage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createMockRepository } from '../mock-storage'
import type { Entity } from '../base.repository'

interface Item extends Entity {
  name: string
  value: number
}

describe('createMockRepository', () => {
  let repo: ReturnType<typeof createMockRepository<Item>>

  beforeEach(() => {
    window.localStorage.clear()
    repo = createMockRepository<Item>('test-items', [])
  })

  it('returns empty list when storage empty and no seed', async () => {
    const items = await repo.list()
    expect(items).toEqual([])
  })

  it('seeds storage on first read when seed provided', async () => {
    const seeded = createMockRepository<Item>('test-seeded', [
      { id: '1', name: 'A', value: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ])
    const items = await seeded.list()
    expect(items).toHaveLength(1)
    expect(items[0]?.name).toBe('A')
  })

  it('creates an item with generated id and timestamps', async () => {
    const created = await repo.create({ name: 'B', value: 2 })
    expect(created.id).toBeTruthy()
    expect(created.name).toBe('B')
    expect(created.createdAt).toBeTruthy()
    const all = await repo.list()
    expect(all).toHaveLength(1)
  })

  it('persists across instances via localStorage', async () => {
    await repo.create({ name: 'C', value: 3 })
    const repo2 = createMockRepository<Item>('test-items', [])
    const items = await repo2.list()
    expect(items).toHaveLength(1)
    expect(items[0]?.name).toBe('C')
  })

  it('updates an item and bumps updatedAt', async () => {
    const a = await repo.create({ name: 'A', value: 1 })
    const before = a.updatedAt
    await new Promise((r) => setTimeout(r, 5))
    const updated = await repo.update(a.id, { value: 99 })
    expect(updated.value).toBe(99)
    expect(updated.updatedAt).not.toBe(before)
  })

  it('deletes an item', async () => {
    const a = await repo.create({ name: 'A', value: 1 })
    await repo.delete(a.id)
    expect(await repo.getById(a.id)).toBeNull()
  })

  it('notifies subscribers on mutations', async () => {
    let calls = 0
    const unsub = repo.subscribe(() => calls++)
    await repo.create({ name: 'A', value: 1 })
    expect(calls).toBe(1)
    unsub()
    await repo.create({ name: 'B', value: 2 })
    expect(calls).toBe(1)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
pnpm test:run lib/repositories/__tests__/mock-storage.test.ts
```
Expected: FAIL — `mock-storage` module does not exist.

- [ ] **Step 7: Implement `lib/repositories/mock-storage.ts`**

```ts
import { newId } from '@/lib/utils/id'
import { nowIso } from '@/lib/utils/date'
import type { Entity, EntityInput, Repository } from './base.repository'

const SIM_LATENCY_MIN = 30
const SIM_LATENCY_MAX = 80

function delay(): Promise<void> {
  const ms = Math.floor(Math.random() * (SIM_LATENCY_MAX - SIM_LATENCY_MIN)) + SIM_LATENCY_MIN
  return new Promise((r) => setTimeout(r, ms))
}

function readStorage<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T[]
  } catch {
    return null
  }
}

function writeStorage<T>(key: string, value: T[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function createMockRepository<T extends Entity>(
  storageKey: string,
  seed: T[]
): Repository<T> & { reset: () => Promise<void> } {
  const listeners = new Set<() => void>()

  function getAll(): T[] {
    const stored = readStorage<T>(storageKey)
    if (stored !== null) return stored
    if (seed.length > 0) {
      writeStorage(storageKey, seed)
      return [...seed]
    }
    return []
  }

  function setAll(items: T[]): void {
    writeStorage(storageKey, items)
    listeners.forEach((l) => l())
  }

  function matches(item: T, filters: Partial<T>): boolean {
    return Object.entries(filters).every(([k, v]) => {
      if (v === undefined) return true
      return (item as Record<string, unknown>)[k] === v
    })
  }

  return {
    async list(filters) {
      await delay()
      const all = getAll()
      if (!filters) return all
      return all.filter((i) => matches(i, filters))
    },
    async getById(id) {
      await delay()
      const all = getAll()
      return all.find((i) => i.id === id) ?? null
    },
    async create(data: EntityInput<T>) {
      await delay()
      const now = nowIso()
      const created = {
        ...(data as object),
        id: newId(),
        createdAt: now,
        updatedAt: now,
      } as T
      setAll([...getAll(), created])
      return created
    },
    async update(id, data) {
      await delay()
      const all = getAll()
      const idx = all.findIndex((i) => i.id === id)
      if (idx < 0) throw new Error(`Item ${id} not found in ${storageKey}`)
      const existing = all[idx]
      if (!existing) throw new Error(`Item ${id} not found in ${storageKey}`)
      const updated = { ...existing, ...data, id: existing.id, updatedAt: nowIso() } as T
      const next = [...all]
      next[idx] = updated
      setAll(next)
      return updated
    },
    async delete(id) {
      await delay()
      setAll(getAll().filter((i) => i.id !== id))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    async reset() {
      writeStorage(storageKey, seed)
      listeners.forEach((l) => l())
    },
  }
}
```

- [ ] **Step 8: Run test — should pass**

```bash
pnpm test:run lib/repositories/__tests__/mock-storage.test.ts
```
Expected: All 7 tests PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(repos): repository pattern base + mock storage helper with tests"
```

---

## Task 9: Zustand stores

**Files:**
- Create: `lib/stores/ui.store.ts`
- Create: `lib/stores/filters.store.ts`
- Create: `lib/stores/index.ts`

- [ ] **Step 1: Create UI store**

Create `lib/stores/ui.store.ts`:
```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  setCommandPaletteOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
    }),
    {
      name: 'untd-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
```

- [ ] **Step 2: Create filters store**

Create `lib/stores/filters.store.ts`:
```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { LeadOrigin, LeadResult, LeadTemperature } from '@/lib/types'

export interface LeadFilters {
  search: string
  origins: LeadOrigin[]
  temperatures: LeadTemperature[]
  results: LeadResult[]
  scoreMin: number
  scoreMax: number
  pipelineStageIds: string[]
  tagIds: string[]
  followUpDue: 'any' | 'today' | 'overdue' | 'this-week'
}

export const defaultLeadFilters: LeadFilters = {
  search: '',
  origins: [],
  temperatures: [],
  results: [],
  scoreMin: 0,
  scoreMax: 100,
  pipelineStageIds: [],
  tagIds: [],
  followUpDue: 'any',
}

interface FiltersState {
  leads: LeadFilters
  setLeadFilters: (next: Partial<LeadFilters>) => void
  resetLeadFilters: () => void
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      leads: defaultLeadFilters,
      setLeadFilters: (next) => set((s) => ({ leads: { ...s.leads, ...next } })),
      resetLeadFilters: () => set({ leads: defaultLeadFilters }),
    }),
    {
      name: 'untd-filters',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

- [ ] **Step 3: Create barrel**

Create `lib/stores/index.ts`:
```ts
export * from './ui.store'
export * from './filters.store'
```

- [ ] **Step 4: Verify**

```bash
pnpm tsc --noEmit
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/stores/
git commit -m "feat(stores): add zustand stores for ui + filters with persist"
```

---

## Task 10: AppShell + Sidebar + Topbar + routing skeleton

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `components/layout/app-shell.tsx`
- Create: `components/layout/sidebar.tsx`
- Create: `components/layout/sidebar-item.tsx`
- Create: `components/layout/topbar.tsx`
- Create: `app/(app)/dashboard/page.tsx`, `crm/page.tsx`, `leads/page.tsx`, `icp/page.tsx`, `notes/page.tsx`, `calendar/page.tsx`, `tasks/page.tsx`, `social-media/page.tsx`, `meta-ads/page.tsx`, `feedbacks/page.tsx`, `settings/page.tsx`
- Modify: `app/page.tsx` (redirect to /dashboard)

- [ ] **Step 1: Create sidebar nav config**

Create `components/layout/nav-items.ts`:
```ts
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Workflow, Users, Target, NotebookPen,
  CalendarDays, ListChecks, Sparkles, Megaphone, MessageSquareText, Settings,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/crm', label: 'CRM / Pipeline', icon: Workflow },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/icp', label: 'ICP & Scoring', icon: Target },
  { href: '/notes', label: 'Notas & Ideias', icon: NotebookPen },
  { href: '/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/tasks', label: 'Tarefas', icon: ListChecks },
  { href: '/social-media', label: 'Social Media', icon: Sparkles },
  { href: '/meta-ads', label: 'Meta Ads', icon: Megaphone },
  { href: '/feedbacks', label: 'Feedbacks', icon: MessageSquareText },
  { href: '/settings', label: 'Configurações', icon: Settings },
]
```

- [ ] **Step 2: Create SidebarItem**

Create `components/layout/sidebar-item.tsx`:
```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  href: string
  label: string
  icon: LucideIcon
  collapsed?: boolean
}

export function SidebarItem({ href, label, icon: Icon, collapsed }: Props) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-base',
        active
          ? 'bg-primary-muted text-text'
          : 'text-text-secondary hover:bg-surface-elevated hover:text-text',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? label : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-sm bg-primary" />
      )}
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )
}
```

- [ ] **Step 3: Create Sidebar**

Create `components/layout/sidebar.tsx`:
```tsx
'use client'
import { useUIStore } from '@/lib/stores'
import { Button } from '@/components/ui/button'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SidebarItem } from './sidebar-item'
import { navItems } from './nav-items'

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggle = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-surface transition-all duration-base',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      <div className={cn('flex h-14 items-center border-b border-border px-3', collapsed && 'justify-center')}>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-tight text-text">UNTD OS</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <SidebarItem key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="w-full"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Create Topbar**

Create `components/layout/topbar.tsx`:
```tsx
'use client'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { navItems } from './nav-items'

function findLabel(pathname: string): string {
  const match = navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))
  return match?.label ?? 'UNTD OS'
}

export function Topbar() {
  const pathname = usePathname()
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6">
      <div className="font-display text-base font-semibold text-text">{findLabel(pathname)}</div>
      <div className="flex items-center gap-3 text-sm text-text-muted">
        <button
          className="flex items-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-xs transition-colors hover:border-primary/50 hover:text-text"
          aria-label="Buscar"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="ml-3 rounded-sm border border-border-subtle bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Create AppShell**

Create `components/layout/app-shell.tsx`:
```tsx
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `(app)/layout.tsx`**

Create `app/(app)/layout.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

- [ ] **Step 7: Create 11 placeholder pages**

For each route below, create `app/(app)/<route>/page.tsx`:

```tsx
export default function Page() {
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-bold text-text">[NOME DA PAGINA]</h1>
      <p className="mt-2 text-sm text-text-muted">Em construção.</p>
    </div>
  )
}
```

Replace `[NOME DA PAGINA]` per route:
- `dashboard/page.tsx` → "Dashboard"
- `crm/page.tsx` → "CRM / Pipeline"
- `leads/page.tsx` → "Leads"
- `icp/page.tsx` → "ICP & Scoring"
- `notes/page.tsx` → "Notas & Ideias"
- `calendar/page.tsx` → "Calendário"
- `tasks/page.tsx` → "Tarefas"
- `social-media/page.tsx` → "Social Media"
- `meta-ads/page.tsx` → "Meta Ads"
- `feedbacks/page.tsx` → "Feedbacks"
- `settings/page.tsx` → "Configurações"

- [ ] **Step 8: Redirect root to /dashboard**

Replace `app/page.tsx`:
```tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 9: Verify build + smoke test**

```bash
pnpm build
pnpm dev
```

Open http://localhost:3000 — should redirect to `/dashboard`. Click each sidebar item and confirm:
- All 11 routes render their placeholder
- Active state highlights correctly
- Sidebar collapse toggle works and persists across reloads
- No console errors

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(layout): app shell with sidebar, topbar, 11 placeholder routes"
```

---

## Task 11: Page transitions + motion primitives

**Files:**
- Create: `components/motion/page-transition.tsx`
- Create: `components/motion/stagger.tsx`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Create PageTransition**

Create `components/motion/page-transition.tsx`:
```tsx
'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { tokens } from '@/lib/theme/tokens'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: tokens.duration.slow / 1000,
        ease: tokens.easing.enter,
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create Stagger**

Create `components/motion/stagger.tsx`:
```tsx
'use client'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

const parentVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
}

export function StaggerList({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div variants={parentVariants} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Wire PageTransition into AppShell**

Replace `app/(app)/layout.tsx`:
```tsx
import { AppShell } from '@/components/layout/app-shell'
import { PageTransition } from '@/components/motion/page-transition'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <PageTransition>{children}</PageTransition>
    </AppShell>
  )
}
```

- [ ] **Step 4: Smoke test**

```bash
pnpm dev
```
Navigate between sidebar items — content should fade + translate up. With OS reduced-motion enabled, animation skips.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(motion): page transitions + stagger primitives"
```

**End of Phase 0** — application is now navigable, themed, and fully scaffolded.

---

# PHASE 1 — CRM CORE

## Task 12: Pipeline stages — seed + repository

**Files:**
- Create: `lib/mocks/seeds/pipeline.seed.ts`
- Create: `lib/repositories/pipeline.repository.ts`
- Create: `lib/repositories/index.ts`
- Create: `lib/hooks/use-pipeline-stages.ts`

- [ ] **Step 1: Create pipeline seed**

Create `lib/mocks/seeds/pipeline.seed.ts`:
```ts
import type { PipelineStage } from '@/lib/types'

export const pipelineStagesSeed: PipelineStage[] = [
  { id: 'stage-research',     name: 'Pesquisa / Mapeamento',   order: 0, color: 'var(--text-muted)' },
  { id: 'stage-identified',   name: 'Lead Identificado',       order: 1, color: 'var(--pipe-prospect)' },
  { id: 'stage-first',        name: 'Primeiro Contato',        order: 2, color: 'var(--pipe-contacted)' },
  { id: 'stage-replied',      name: 'Respondeu',               order: 3, color: 'var(--pipe-replied)' },
  { id: 'stage-followup',     name: 'Follow-up',               order: 4, color: 'var(--pipe-followup)' },
  { id: 'stage-meeting-set',  name: 'Reunião Marcada',         order: 5, color: 'var(--info)' },
  { id: 'stage-diagnosis',    name: 'Diagnóstico / Conversa',  order: 6, color: 'var(--info)' },
  { id: 'stage-proposal',     name: 'Proposta Enviada',        order: 7, color: 'var(--pipe-proposal)' },
  { id: 'stage-pilot',        name: 'Teste / Piloto',          order: 8, color: 'var(--warning)' },
  { id: 'stage-won',          name: 'Cliente Pagante',         order: 9, color: 'var(--pipe-won)', isFinalWon: true },
  { id: 'stage-lost',         name: 'Perdido / Sem Fit',       order: 10, color: 'var(--pipe-lost)', isFinalLost: true },
]
```

Note: pipeline stages don't have `createdAt`/`updatedAt` in the type, but our repo expects Entity. We'll create a specialized repo:

- [ ] **Step 2: Create pipeline repository**

Create `lib/repositories/pipeline.repository.ts`:
```ts
import type { PipelineStage } from '@/lib/types'
import { pipelineStagesSeed } from '@/lib/mocks/seeds/pipeline.seed'

const KEY = 'untd-pipeline-stages'

function read(): PipelineStage[] {
  if (typeof window === 'undefined') return pipelineStagesSeed
  const raw = window.localStorage.getItem(KEY)
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(pipelineStagesSeed))
    return [...pipelineStagesSeed]
  }
  try {
    return JSON.parse(raw) as PipelineStage[]
  } catch {
    return [...pipelineStagesSeed]
  }
}

function write(stages: PipelineStage[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(stages))
  listeners.forEach((l) => l())
}

const listeners = new Set<() => void>()

export const pipelineRepo = {
  async list(): Promise<PipelineStage[]> {
    return read().sort((a, b) => a.order - b.order)
  },
  async getById(id: string): Promise<PipelineStage | null> {
    return read().find((s) => s.id === id) ?? null
  },
  async update(id: string, data: Partial<PipelineStage>): Promise<PipelineStage> {
    const all = read()
    const idx = all.findIndex((s) => s.id === id)
    if (idx < 0) throw new Error(`Stage ${id} not found`)
    const existing = all[idx]
    if (!existing) throw new Error(`Stage ${id} not found`)
    const updated = { ...existing, ...data, id: existing.id }
    const next = [...all]
    next[idx] = updated
    write(next)
    return updated
  },
  async reset(): Promise<void> {
    write([...pipelineStagesSeed])
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
```

- [ ] **Step 3: Create hook**

Create `lib/hooks/use-pipeline-stages.ts`:
```ts
'use client'
import { useEffect, useState } from 'react'
import { pipelineRepo } from '@/lib/repositories/pipeline.repository'
import type { PipelineStage } from '@/lib/types'

export function usePipelineStages() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = () => {
      pipelineRepo.list().then((data) => {
        if (active) {
          setStages(data)
          setIsLoading(false)
        }
      })
    }
    load()
    return pipelineRepo.subscribe(load)
  }, [])

  return { stages, isLoading }
}
```

- [ ] **Step 4: Create repositories index**

Create `lib/repositories/index.ts`:
```ts
export { pipelineRepo } from './pipeline.repository'
```

- [ ] **Step 5: Verify**

```bash
pnpm tsc --noEmit
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(pipeline): seed + repository + hook for pipeline stages"
```

---

## Task 13: Leads — seed + repository + hook

**Files:**
- Create: `lib/mocks/seeds/leads.seed.ts`
- Create: `lib/repositories/leads.repository.ts`
- Create: `lib/hooks/use-leads.ts`
- Modify: `lib/repositories/index.ts`

- [ ] **Step 1: Create leads seed**

Create `lib/mocks/seeds/leads.seed.ts`:
```ts
import type { Lead } from '@/lib/types'
import { isoDaysAgo, isoDaysFromNow } from '@/lib/utils/date'

const now = new Date().toISOString()

export const leadsSeed: Lead[] = [
  {
    id: 'lead-001', name: 'Juliana Mendes', company: 'Pixel & Code Agência', role: 'Sócia',
    niche: 'Agência de social media', website: 'https://pixelcode.ag', instagram: '@pixelcode.ag',
    email: 'juliana@pixelcode.ag', phone: '+55 11 98000-1001',
    location: { city: 'São Paulo', country: 'Brasil' },
    origin: 'cold-dm', pipelineStageId: 'stage-replied', temperature: 'warm', icpScore: 0,
    pain: 'Demora na criação de criativos para múltiplos clientes',
    revenuePotential: 4500, objections: ['Já tem designer interno'],
    firstContactAt: isoDaysAgo(12), lastContactAt: isoDaysAgo(2), nextFollowUpAt: isoDaysFromNow(1),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(12), updatedAt: now,
  },
  {
    id: 'lead-002', name: 'Marcos Tavares', company: 'Trattoria del Bairro', role: 'Proprietário',
    niche: 'Restaurante local', instagram: '@trattoria.delbairro',
    email: 'marcos@trattoriadb.com.br', phone: '+55 21 99000-2002',
    location: { city: 'Rio de Janeiro', country: 'Brasil' },
    origin: 'in-person', pipelineStageId: 'stage-first', temperature: 'warm', icpScore: 0,
    pain: 'Posta inconsistente, criativo amador',
    revenuePotential: 1800,
    firstContactAt: isoDaysAgo(5), lastContactAt: isoDaysAgo(5), nextFollowUpAt: isoDaysFromNow(2),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(5), updatedAt: now,
  },
  {
    id: 'lead-003', name: 'Dra. Camila Souza', company: 'Clínica Estética Renove', role: 'Dermatologista',
    niche: 'Clínica estética', instagram: '@drcamilasouza',
    email: 'contato@renove.clin', phone: '+55 31 99000-3003',
    location: { city: 'Belo Horizonte', country: 'Brasil' },
    origin: 'paid-traffic', pipelineStageId: 'stage-meeting-set', temperature: 'hot', icpScore: 0,
    pain: 'Anúncios com criativos genéricos performam mal',
    revenuePotential: 6000,
    firstContactAt: isoDaysAgo(20), lastContactAt: isoDaysAgo(1), nextFollowUpAt: isoDaysFromNow(0),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(20), updatedAt: now,
  },
  {
    id: 'lead-004', name: 'Rafael Lima', company: 'Lima Moda', role: 'Founder',
    niche: 'E-commerce de moda', website: 'https://limamoda.com.br', instagram: '@lima.moda',
    email: 'rafa@limamoda.com.br',
    location: { city: 'Curitiba', country: 'Brasil' },
    origin: 'cold-email', pipelineStageId: 'stage-followup', temperature: 'warm', icpScore: 0,
    pain: 'Volume gigante de criativos para produtos novos toda semana',
    revenuePotential: 7500,
    firstContactAt: isoDaysAgo(15), lastContactAt: isoDaysAgo(7), nextFollowUpAt: isoDaysAgo(1),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(15), updatedAt: now,
  },
  {
    id: 'lead-005', name: 'Lara Castelo', company: 'Lara Castelo Co.', role: 'Infoprodutora',
    niche: 'Infoprodutor de finanças', instagram: '@laracastelo',
    email: 'contato@laracastelo.com',
    location: { city: 'São Paulo', country: 'Brasil' },
    origin: 'referral', pipelineStageId: 'stage-proposal', temperature: 'hot', icpScore: 0,
    pain: 'Lançamentos com criativos atrasados e off-brand',
    revenuePotential: 12000,
    firstContactAt: isoDaysAgo(25), lastContactAt: isoDaysAgo(3), nextFollowUpAt: isoDaysFromNow(2),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(25), updatedAt: now,
  },
  {
    id: 'lead-006', name: 'Eduardo Pinheiro', company: 'Pinheiro Imóveis', role: 'Diretor comercial',
    niche: 'Imobiliária', website: 'https://pinheiroimoveis.com', instagram: '@pinheiroimoveis',
    email: 'edu@pinheiroimoveis.com',
    location: { city: 'Florianópolis', country: 'Brasil' },
    origin: 'social', pipelineStageId: 'stage-identified', temperature: 'cold', icpScore: 0,
    pain: 'Anúncios de imóvel com fotos sem padrão visual',
    revenuePotential: 3500,
    firstContactAt: isoDaysAgo(2), lastContactAt: isoDaysAgo(2), nextFollowUpAt: isoDaysFromNow(5),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(2), updatedAt: now,
  },
  {
    id: 'lead-007', name: 'Beatriz Nogueira', company: 'Atelier Bia', role: 'Founder',
    niche: 'Marca de moda autoral', instagram: '@atelierbia',
    email: 'bia@atelierbia.com',
    location: { city: 'São Paulo', country: 'Brasil' },
    origin: 'cold-dm', pipelineStageId: 'stage-first', temperature: 'warm', icpScore: 0,
    pain: 'Identidade visual forte mas posts off-brand',
    revenuePotential: 2200,
    firstContactAt: isoDaysAgo(7), lastContactAt: isoDaysAgo(7), nextFollowUpAt: isoDaysFromNow(3),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(7), updatedAt: now,
  },
  {
    id: 'lead-008', name: 'Felipe Aragão', company: 'Speak London', role: 'Sócio',
    niche: 'Escola de idiomas', website: 'https://speaklondon.com.br', instagram: '@speak.london',
    email: 'felipe@speaklondon.com.br',
    location: { city: 'São Paulo', country: 'Brasil' },
    origin: 'community', pipelineStageId: 'stage-diagnosis', temperature: 'warm', icpScore: 0,
    pain: 'Material de captação amador',
    revenuePotential: 4000,
    firstContactAt: isoDaysAgo(10), lastContactAt: isoDaysAgo(2), nextFollowUpAt: isoDaysFromNow(2),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(10), updatedAt: now,
  },
  {
    id: 'lead-009', name: 'Gabriela Ramos', company: 'Performix Ads', role: 'CEO',
    niche: 'Agência de tráfego', website: 'https://performix.ag', instagram: '@performix',
    email: 'gabi@performix.ag',
    location: { city: 'Porto Alegre', country: 'Brasil' },
    origin: 'referral', pipelineStageId: 'stage-pilot', temperature: 'hot', icpScore: 0,
    pain: 'Volume absurdo de criativos para A/B testing',
    revenuePotential: 9500,
    firstContactAt: isoDaysAgo(30), lastContactAt: isoDaysAgo(2), nextFollowUpAt: isoDaysFromNow(1),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(30), updatedAt: now,
  },
  {
    id: 'lead-010', name: 'Henrique Sá', company: 'Sá Consultoria B2B', role: 'Consultor sênior',
    niche: 'Consultoria B2B', website: 'https://saconsultoria.com', linkedin: 'in/henriquesa',
    email: 'henrique@saconsultoria.com',
    location: { city: 'São Paulo', country: 'Brasil' },
    origin: 'cold-email', pipelineStageId: 'stage-research', temperature: 'cold', icpScore: 0,
    pain: 'LinkedIn sem identidade visual, tudo template',
    revenuePotential: 2800,
    firstContactAt: isoDaysAgo(1), lastContactAt: isoDaysAgo(1), nextFollowUpAt: isoDaysFromNow(7),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(1), updatedAt: now,
  },
  {
    id: 'lead-011', name: 'Isabela Quintas', company: 'Iza Pet Shop', role: 'Proprietária',
    niche: 'Pet shop local', instagram: '@iza.petshop',
    email: 'iza@izapetshop.com.br',
    location: { city: 'Salvador', country: 'Brasil' },
    origin: 'manual-search', pipelineStageId: 'stage-identified', temperature: 'cold', icpScore: 0,
    pain: 'Concorrência postando bonito, ela não consegue',
    revenuePotential: 1200,
    firstContactAt: isoDaysAgo(3), lastContactAt: isoDaysAgo(3), nextFollowUpAt: isoDaysFromNow(4),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(3), updatedAt: now,
  },
  {
    id: 'lead-012', name: 'João Ferraz', company: 'Ferraz Auto Center', role: 'Dono',
    niche: 'Auto center', instagram: '@ferraz.autocenter',
    location: { city: 'Campinas', country: 'Brasil' },
    origin: 'cold-dm', pipelineStageId: 'stage-lost', temperature: 'cold', icpScore: 0,
    pain: 'Não vê valor em design',
    firstContactAt: isoDaysAgo(40), lastContactAt: isoDaysAgo(20),
    ownerId: 'arthur', tagIds: [], result: 'no-fit', createdAt: isoDaysAgo(40), updatedAt: now,
  },
  {
    id: 'lead-013', name: 'Karina Moretti', company: 'Estúdio Moretti', role: 'Founder',
    niche: 'Estúdio de fotografia', instagram: '@estudiomoretti',
    email: 'karina@estudiomoretti.com',
    location: { city: 'São Paulo', country: 'Brasil' },
    origin: 'event', pipelineStageId: 'stage-won', temperature: 'hot', icpScore: 0,
    pain: 'Fechado: cliente pagante há 2 meses',
    revenuePotential: 3500,
    firstContactAt: isoDaysAgo(90), lastContactAt: isoDaysAgo(15),
    ownerId: 'arthur', tagIds: [], result: 'won', createdAt: isoDaysAgo(90), updatedAt: now,
  },
  {
    id: 'lead-014', name: 'Lucas Bianchi', company: 'Bianchi Joias', role: 'Sócio',
    niche: 'Joalheria boutique', instagram: '@bianchi.joias',
    email: 'lucas@bianchijoias.com.br',
    location: { city: 'Curitiba', country: 'Brasil' },
    origin: 'social', pipelineStageId: 'stage-followup', temperature: 'warm', icpScore: 0,
    pain: 'Posts caros, mas sem alma de marca',
    revenuePotential: 5000,
    firstContactAt: isoDaysAgo(18), lastContactAt: isoDaysAgo(9), nextFollowUpAt: isoDaysAgo(2),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(18), updatedAt: now,
  },
  {
    id: 'lead-015', name: 'Mariana Tavora', company: 'Mari Coach', role: 'Mentora',
    niche: 'Coach de carreira', instagram: '@maritavora',
    email: 'mari@maritavora.com',
    location: { city: 'São Paulo', country: 'Brasil' },
    origin: 'paid-traffic', pipelineStageId: 'stage-replied', temperature: 'warm', icpScore: 0,
    pain: 'Conteúdo sem padrão para construir autoridade',
    revenuePotential: 1800,
    firstContactAt: isoDaysAgo(8), lastContactAt: isoDaysAgo(1), nextFollowUpAt: isoDaysFromNow(2),
    ownerId: 'arthur', tagIds: [], result: 'open', createdAt: isoDaysAgo(8), updatedAt: now,
  },
]
```

- [ ] **Step 2: Create leads repository**

Create `lib/repositories/leads.repository.ts`:
```ts
import { createMockRepository } from './mock-storage'
import type { Lead } from '@/lib/types'
import { leadsSeed } from '@/lib/mocks/seeds/leads.seed'

export const leadsRepo = createMockRepository<Lead>('untd-leads', leadsSeed)
```

- [ ] **Step 3: Create useLeads hook**

Create `lib/hooks/use-leads.ts`:
```ts
'use client'
import { useEffect, useState } from 'react'
import { leadsRepo } from '@/lib/repositories/leads.repository'
import type { Lead } from '@/lib/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = () => {
      leadsRepo.list().then((data) => {
        if (active) {
          setLeads(data)
          setIsLoading(false)
        }
      })
    }
    load()
    return leadsRepo.subscribe(load)
  }, [])

  return { leads, isLoading }
}

export function useLead(id: string | null) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLead(null)
      setIsLoading(false)
      return
    }
    let active = true
    const load = () => {
      leadsRepo.getById(id).then((data) => {
        if (active) {
          setLead(data)
          setIsLoading(false)
        }
      })
    }
    load()
    return leadsRepo.subscribe(load)
  }, [id])

  return { lead, isLoading }
}
```

- [ ] **Step 4: Update repos index**

Update `lib/repositories/index.ts`:
```ts
export { pipelineRepo } from './pipeline.repository'
export { leadsRepo } from './leads.repository'
```

- [ ] **Step 5: Verify**

```bash
pnpm tsc --noEmit
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(leads): seed with 15 realistic leads + repository + hooks"
```

---

## Task 14: ICP types + initial profile seed + repository

**Files:**
- Create: `lib/mocks/seeds/icp.seed.ts`
- Create: `lib/repositories/icp.repository.ts`
- Create: `lib/hooks/use-icp-profile.ts`
- Modify: `lib/repositories/index.ts`

- [ ] **Step 1: Create ICP seed**

Create `lib/mocks/seeds/icp.seed.ts`:
```ts
import type { ICPProfile } from '@/lib/types'
import { nowIso } from '@/lib/utils/date'

const now = nowIso()

export const icpProfileSeed: ICPProfile = {
  id: 'icp-default',
  name: 'ICP UNTD Studio',
  description: 'Perfil ideal: agências/empresas que postam bastante, com volume de criativo alto e dor clara de design.',
  criteria: [
    {
      id: 'crit-niche', name: 'Nicho prioritário', weight: 20,
      field: 'niche', evaluator: 'array-includes',
      config: { values: ['Agência de social media', 'Agência de tráfego', 'E-commerce de moda', 'Infoprodutor de finanças', 'Clínica estética', 'Marca de moda autoral'] },
    },
    {
      id: 'crit-paid', name: 'Investe em tráfego pago', weight: 15,
      field: 'origin', evaluator: 'enum-match', config: { value: 'paid-traffic' },
    },
    {
      id: 'crit-revenue', name: 'Potencial de receita ≥ R$ 3000', weight: 20,
      field: 'revenuePotential', evaluator: 'numeric-range', config: { min: 3000, max: Infinity },
    },
    {
      id: 'crit-pain', name: 'Dor explícita com criativos/design', weight: 20,
      field: 'pain', evaluator: 'string-not-empty', config: {},
    },
    {
      id: 'crit-temp', name: 'Temperatura warm/hot', weight: 10,
      field: 'temperature', evaluator: 'enum-match', config: { value: 'warm' },
    },
    {
      id: 'crit-instagram', name: 'Tem Instagram ativo', weight: 10,
      field: 'instagram', evaluator: 'string-not-empty', config: {},
    },
    {
      id: 'crit-website', name: 'Tem site próprio', weight: 5,
      field: 'website', evaluator: 'string-not-empty', config: {},
    },
  ],
  persona: {
    name: 'Agência local em crescimento',
    description: 'Agência ou marca digital que cresceu até um ponto onde a demanda por criativos visuais excede a capacidade do designer interno. Já investe em mídia, sente impacto direto no faturamento de criativos melhores.',
    pains: [
      'Volume alto de criativos para múltiplos clientes ou produtos',
      'Designer interno sobrecarregado',
      'Anúncios com baixa performance por criativo fraco',
      'Inconsistência visual entre canais',
    ],
    desires: [
      'Velocidade de produção sem perder qualidade',
      'Manter identidade da marca em escala',
      'Reduzir custo por criativo',
    ],
    objections: [
      'Já tem designer interno',
      'Não confia em IA para gerar imagens "fiéis à marca"',
      'Preço',
    ],
    purchaseTriggers: [
      'Lançamento próximo com prazo apertado',
      'Aumento de clientes/produtos',
      'Frustração recente com designer freelancer',
    ],
    bestMessage: 'Imagens fiéis à sua marca em minutos, com BrandKit fixo e edição em canvas — você libera o designer interno para o trabalho que pede mão humana.',
    likelyOffer: 'Plano mensal com volume e BrandKit ilimitado',
    foundOnChannels: ['Instagram', 'LinkedIn', 'Indicação de cliente atual', 'Eventos de marketing'],
  },
  createdAt: now,
  updatedAt: now,
}
```

- [ ] **Step 2: Create ICP repository**

Create `lib/repositories/icp.repository.ts`:
```ts
import type { ICPProfile } from '@/lib/types'
import { icpProfileSeed } from '@/lib/mocks/seeds/icp.seed'
import { nowIso } from '@/lib/utils/date'

const KEY = 'untd-icp-profile'
const listeners = new Set<() => void>()

function read(): ICPProfile {
  if (typeof window === 'undefined') return icpProfileSeed
  const raw = window.localStorage.getItem(KEY)
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(icpProfileSeed))
    return icpProfileSeed
  }
  try {
    return JSON.parse(raw) as ICPProfile
  } catch {
    return icpProfileSeed
  }
}

function write(profile: ICPProfile): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(profile))
  listeners.forEach((l) => l())
}

export const icpRepo = {
  async get(): Promise<ICPProfile> {
    return read()
  },
  async update(data: Partial<Omit<ICPProfile, 'id' | 'createdAt'>>): Promise<ICPProfile> {
    const current = read()
    const next: ICPProfile = { ...current, ...data, id: current.id, updatedAt: nowIso() }
    write(next)
    return next
  },
  async reset(): Promise<void> {
    write(icpProfileSeed)
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
```

- [ ] **Step 3: Create hook**

Create `lib/hooks/use-icp-profile.ts`:
```ts
'use client'
import { useEffect, useState } from 'react'
import { icpRepo } from '@/lib/repositories/icp.repository'
import type { ICPProfile } from '@/lib/types'

export function useICPProfile() {
  const [profile, setProfile] = useState<ICPProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = () => {
      icpRepo.get().then((data) => {
        if (active) {
          setProfile(data)
          setIsLoading(false)
        }
      })
    }
    load()
    return icpRepo.subscribe(load)
  }, [])

  return { profile, isLoading }
}
```

- [ ] **Step 4: Update repos index**

Update `lib/repositories/index.ts`:
```ts
export { pipelineRepo } from './pipeline.repository'
export { leadsRepo } from './leads.repository'
export { icpRepo } from './icp.repository'
```

- [ ] **Step 5: Verify + commit**

```bash
pnpm tsc --noEmit
git add -A
git commit -m "feat(icp): seed default profile + repository + hook"
```

---

## Task 15: ICP scoring engine (TDD)

**Files:**
- Create: `lib/services/scoring.service.ts`
- Create: `lib/services/__tests__/scoring.service.test.ts`

- [ ] **Step 1: Write failing test for scoring engine**

Create `lib/services/__tests__/scoring.service.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { calculateICPScore, recalculateAllLeads } from '../scoring.service'
import type { Lead, ICPProfile } from '@/lib/types'

const baseProfile: ICPProfile = {
  id: 'p', name: 'Test', criteria: [
    { id: 'c1', name: 'Nicho prioritário', weight: 40, field: 'niche', evaluator: 'array-includes', config: { values: ['Agência'] } },
    { id: 'c2', name: 'Receita ≥ 3000', weight: 30, field: 'revenuePotential', evaluator: 'numeric-range', config: { min: 3000, max: Infinity } },
    { id: 'c3', name: 'Tem dor', weight: 30, field: 'pain', evaluator: 'string-not-empty', config: {} },
  ],
  persona: {
    name: '', description: '', pains: [], desires: [], objections: [], purchaseTriggers: [], foundOnChannels: [],
  },
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
}

function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: 'l1', name: 'X', company: 'Y', niche: 'Outro',
    origin: 'cold-dm', pipelineStageId: 's', temperature: 'cold',
    icpScore: 0, ownerId: 'arthur', tagIds: [], result: 'open',
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    ...overrides,
  }
}

describe('calculateICPScore', () => {
  it('returns 0 for lead with no matches', () => {
    const lead = makeLead({ niche: 'Outro', revenuePotential: 100, pain: '' })
    const result = calculateICPScore(lead, baseProfile)
    expect(result.total).toBe(0)
    expect(result.criteria).toHaveLength(3)
    expect(result.criteria.every((c) => !c.positive)).toBe(true)
  })

  it('returns 100 for lead matching all weighted criteria', () => {
    const lead = makeLead({ niche: 'Agência', revenuePotential: 5000, pain: 'Dor X' })
    const result = calculateICPScore(lead, baseProfile)
    expect(result.total).toBe(100)
    expect(result.criteria.every((c) => c.positive)).toBe(true)
  })

  it('calculates weighted partial score correctly', () => {
    const lead = makeLead({ niche: 'Agência', revenuePotential: 100, pain: '' })
    const result = calculateICPScore(lead, baseProfile)
    expect(result.total).toBe(40)
  })

  it('normalizes when criteria weights sum != 100', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        { id: 'a', name: 'A', weight: 50, field: 'pain', evaluator: 'string-not-empty', config: {} },
        { id: 'b', name: 'B', weight: 50, field: 'website', evaluator: 'string-not-empty', config: {} },
      ],
    }
    const lead = makeLead({ pain: 'X', website: '' })
    const result = calculateICPScore(lead, profile)
    expect(result.total).toBe(50)
  })

  it('normalizes when weights sum to 200', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        { id: 'a', name: 'A', weight: 100, field: 'pain', evaluator: 'string-not-empty', config: {} },
        { id: 'b', name: 'B', weight: 100, field: 'website', evaluator: 'string-not-empty', config: {} },
      ],
    }
    const lead = makeLead({ pain: 'X', website: '' })
    const result = calculateICPScore(lead, profile)
    expect(result.total).toBe(50)
  })

  it('handles enum-match', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [{ id: 'a', name: 'paid traffic', weight: 100, field: 'origin', evaluator: 'enum-match', config: { value: 'paid-traffic' } }],
    }
    const a = makeLead({ origin: 'paid-traffic' })
    const b = makeLead({ origin: 'cold-dm' })
    expect(calculateICPScore(a, profile).total).toBe(100)
    expect(calculateICPScore(b, profile).total).toBe(0)
  })

  it('handles boolean-true via nested path', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [{ id: 'a', name: 'has city', weight: 100, field: 'location.city', evaluator: 'string-not-empty', config: {} }],
    }
    const a = makeLead({ location: { city: 'SP' } })
    const b = makeLead({ location: undefined })
    expect(calculateICPScore(a, profile).total).toBe(100)
    expect(calculateICPScore(b, profile).total).toBe(0)
  })

  it('returns explanations for each criterion', () => {
    const lead = makeLead({ niche: 'Agência', revenuePotential: 5000, pain: 'X' })
    const result = calculateICPScore(lead, baseProfile)
    result.criteria.forEach((c) => {
      expect(c.explanation).toBeTruthy()
      expect(c.contribution).toBeGreaterThanOrEqual(0)
    })
  })

  it('rounds total to nearest integer', () => {
    const profile: ICPProfile = {
      ...baseProfile,
      criteria: [
        { id: 'a', name: 'A', weight: 33, field: 'pain', evaluator: 'string-not-empty', config: {} },
        { id: 'b', name: 'B', weight: 67, field: 'website', evaluator: 'string-not-empty', config: {} },
      ],
    }
    const lead = makeLead({ pain: 'X', website: '' })
    const result = calculateICPScore(lead, profile)
    expect(Number.isInteger(result.total)).toBe(true)
  })
})

describe('recalculateAllLeads', () => {
  it('updates icpScore on every lead', () => {
    const leads = [
      makeLead({ id: '1', niche: 'Agência', revenuePotential: 5000, pain: 'X', icpScore: 0 }),
      makeLead({ id: '2', niche: 'Outro', revenuePotential: 100, pain: '', icpScore: 50 }),
    ]
    const next = recalculateAllLeads(leads, baseProfile)
    expect(next[0]?.icpScore).toBe(100)
    expect(next[1]?.icpScore).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run lib/services/__tests__/scoring.service.test.ts
```
Expected: FAIL (module does not exist).

- [ ] **Step 3: Implement scoring service**

Create `lib/services/scoring.service.ts`:
```ts
import type { Lead, ICPProfile, ICPCriterion, ScoreBreakdown, ICPCriterionResult } from '@/lib/types'

function readPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function evaluateCriterion(lead: Lead, criterion: ICPCriterion): { match: number; explanation: string } {
  const value = readPath(lead, criterion.field)
  const cfg = criterion.config

  switch (criterion.evaluator) {
    case 'enum-match': {
      const target = cfg.value
      const matched = value === target
      return {
        match: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: ✓ ${String(value)}`
          : `${criterion.name}: ✗ (esperado ${String(target)}, encontrado ${String(value ?? '—')})`,
      }
    }

    case 'array-includes': {
      const list = (cfg.values as unknown[]) ?? []
      const matched = list.includes(value)
      return {
        match: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: ✓ ${String(value)} está na lista`
          : `${criterion.name}: ✗ ${String(value ?? '—')} fora da lista`,
      }
    }

    case 'numeric-range': {
      const min = (cfg.min as number) ?? -Infinity
      const max = (cfg.max as number) ?? Infinity
      const num = typeof value === 'number' ? value : NaN
      const matched = !Number.isNaN(num) && num >= min && num <= max
      return {
        match: matched ? 1 : 0,
        explanation: matched
          ? `${criterion.name}: ✓ ${num}`
          : `${criterion.name}: ✗ (${num || '—'} fora de [${min}, ${max}])`,
      }
    }

    case 'boolean-true': {
      const matched = value === true
      return {
        match: matched ? 1 : 0,
        explanation: matched ? `${criterion.name}: ✓` : `${criterion.name}: ✗`,
      }
    }

    case 'string-not-empty': {
      const s = typeof value === 'string' ? value.trim() : ''
      const matched = s.length > 0
      return {
        match: matched ? 1 : 0,
        explanation: matched ? `${criterion.name}: ✓ preenchido` : `${criterion.name}: ✗ vazio`,
      }
    }

    default:
      return { match: 0, explanation: `${criterion.name}: avaliador desconhecido` }
  }
}

export function calculateICPScore(lead: Lead, profile: ICPProfile): ScoreBreakdown {
  const totalWeight = profile.criteria.reduce((sum, c) => sum + c.weight, 0) || 1

  const results: ICPCriterionResult[] = profile.criteria.map((c) => {
    const { match, explanation } = evaluateCriterion(lead, c)
    const contribution = (c.weight / totalWeight) * 100 * match
    return {
      criterionId: c.id,
      name: c.name,
      weight: c.weight,
      matchScore: match,
      contribution,
      positive: match > 0,
      explanation,
    }
  })

  const total = Math.round(results.reduce((sum, r) => sum + r.contribution, 0))
  return { total, criteria: results }
}

export function recalculateAllLeads(leads: Lead[], profile: ICPProfile): Lead[] {
  return leads.map((lead) => ({
    ...lead,
    icpScore: calculateICPScore(lead, profile).total,
  }))
}
```

- [ ] **Step 4: Run test — should pass**

```bash
pnpm test:run lib/services/__tests__/scoring.service.test.ts
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(scoring): icp scoring engine with breakdown + tests"
```

---

## Task 16: Alerts engine + follow-up service (TDD)

**Files:**
- Create: `lib/services/follow-up.service.ts`
- Create: `lib/services/alerts.service.ts`
- Create: `lib/services/__tests__/follow-up.service.test.ts`
- Create: `lib/services/__tests__/alerts.service.test.ts`

- [ ] **Step 1: Write failing test for follow-up service**

Create `lib/services/__tests__/follow-up.service.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import {
  leadsNeedingFollowUpToday,
  leadsStale,
  leadsNeedingProposal,
} from '../follow-up.service'
import type { Lead, PipelineStage } from '@/lib/types'

function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: 'l', name: 'X', company: 'Y', niche: 'N',
    origin: 'cold-dm', pipelineStageId: 'stage-first', temperature: 'cold',
    icpScore: 50, ownerId: 'arthur', tagIds: [], result: 'open',
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    ...overrides,
  }
}

const today = new Date('2026-04-29T12:00:00Z')

describe('leadsNeedingFollowUpToday', () => {
  it('returns leads with nextFollowUpAt today', () => {
    const leads = [
      makeLead({ id: '1', nextFollowUpAt: '2026-04-29T08:00:00Z' }),
      makeLead({ id: '2', nextFollowUpAt: '2026-04-30T08:00:00Z' }),
      makeLead({ id: '3', nextFollowUpAt: '2026-04-28T08:00:00Z' }),
    ]
    const result = leadsNeedingFollowUpToday(leads, today)
    expect(result.map((l) => l.id)).toContain('1')
    expect(result.map((l) => l.id)).toContain('3')
    expect(result.map((l) => l.id)).not.toContain('2')
  })

  it('excludes leads with result != open', () => {
    const leads = [
      makeLead({ id: '1', nextFollowUpAt: '2026-04-29T08:00:00Z', result: 'won' }),
      makeLead({ id: '2', nextFollowUpAt: '2026-04-29T08:00:00Z', result: 'open' }),
    ]
    const result = leadsNeedingFollowUpToday(leads, today)
    expect(result.map((l) => l.id)).toEqual(['2'])
  })
})

describe('leadsStale', () => {
  it('returns open leads with lastContactAt older than threshold', () => {
    const old = new Date('2026-04-15T00:00:00Z').toISOString()
    const recent = new Date('2026-04-25T00:00:00Z').toISOString()
    const leads = [
      makeLead({ id: '1', lastContactAt: old }),
      makeLead({ id: '2', lastContactAt: recent }),
    ]
    const result = leadsStale(leads, 10, today)
    expect(result.map((l) => l.id)).toEqual(['1'])
  })

  it('ignores closed leads', () => {
    const old = new Date('2026-04-01T00:00:00Z').toISOString()
    const leads = [
      makeLead({ id: '1', lastContactAt: old, result: 'lost' }),
      makeLead({ id: '2', lastContactAt: old, result: 'open' }),
    ]
    const result = leadsStale(leads, 10, today)
    expect(result.map((l) => l.id)).toEqual(['2'])
  })
})

describe('leadsNeedingProposal', () => {
  const stages: PipelineStage[] = [
    { id: 'stage-diagnosis', name: 'Diagnóstico', order: 6, color: '' },
    { id: 'stage-proposal', name: 'Proposta', order: 7, color: '' },
  ]

  it('returns high-icp leads stuck before proposal', () => {
    const leads = [
      makeLead({ id: '1', icpScore: 85, pipelineStageId: 'stage-diagnosis' }),
      makeLead({ id: '2', icpScore: 85, pipelineStageId: 'stage-proposal' }),
      makeLead({ id: '3', icpScore: 50, pipelineStageId: 'stage-diagnosis' }),
    ]
    const result = leadsNeedingProposal(leads, stages, 80)
    expect(result.map((l) => l.id)).toEqual(['1'])
  })
})
```

- [ ] **Step 2: Verify test fails**

```bash
pnpm test:run lib/services/__tests__/follow-up.service.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement follow-up service**

Create `lib/services/follow-up.service.ts`:
```ts
import type { Lead, PipelineStage } from '@/lib/types'

function isSameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate()
}

function isOpenLead(l: Lead): boolean {
  return l.result === 'open'
}

export function leadsNeedingFollowUpToday(leads: Lead[], today: Date): Lead[] {
  return leads.filter((lead) => {
    if (!isOpenLead(lead)) return false
    if (!lead.nextFollowUpAt) return false
    const due = new Date(lead.nextFollowUpAt)
    return isSameDay(due, today) || due < today
  })
}

export function leadsStale(leads: Lead[], thresholdDays: number, today: Date): Lead[] {
  const ms = thresholdDays * 24 * 60 * 60 * 1000
  return leads.filter((lead) => {
    if (!isOpenLead(lead)) return false
    if (!lead.lastContactAt) return false
    const last = new Date(lead.lastContactAt).getTime()
    return today.getTime() - last >= ms
  })
}

export function leadsNeedingProposal(
  leads: Lead[],
  stages: PipelineStage[],
  minIcpScore: number
): Lead[] {
  const proposalStage = stages.find((s) => s.id === 'stage-proposal')
  if (!proposalStage) return []
  const proposalOrder = proposalStage.order
  const stageOrderMap = new Map(stages.map((s) => [s.id, s.order]))

  return leads.filter((lead) => {
    if (!isOpenLead(lead)) return false
    if (lead.icpScore < minIcpScore) return false
    const order = stageOrderMap.get(lead.pipelineStageId)
    if (order === undefined) return false
    return order < proposalOrder
  })
}
```

- [ ] **Step 4: Run test — should pass**

```bash
pnpm test:run lib/services/__tests__/follow-up.service.test.ts
```
Expected: PASS.

- [ ] **Step 5: Write alerts test**

Create `lib/services/__tests__/alerts.service.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { generateAlerts } from '../alerts.service'
import type { Lead, PipelineStage, Task, Feedback } from '@/lib/types'

const today = new Date('2026-04-29T12:00:00Z')

const stages: PipelineStage[] = [
  { id: 'stage-first', name: 'A', order: 2, color: '' },
  { id: 'stage-proposal', name: 'B', order: 7, color: '' },
]

function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: 'l', name: 'X', company: 'Y', niche: 'N',
    origin: 'cold-dm', pipelineStageId: 'stage-first', temperature: 'cold',
    icpScore: 50, ownerId: 'arthur', tagIds: [], result: 'open',
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    ...overrides,
  }
}

describe('generateAlerts', () => {
  it('flags follow-ups due today', () => {
    const leads = [
      makeLead({ id: '1', nextFollowUpAt: '2026-04-29T08:00:00Z' }),
      makeLead({ id: '2', nextFollowUpAt: '2026-04-30T08:00:00Z' }),
    ]
    const alerts = generateAlerts({ leads, tasks: [], feedbacks: [], pipeline: stages, today })
    const due = alerts.find((a) => a.type === 'follow-ups-due-today')
    expect(due).toBeTruthy()
    expect(due?.count).toBe(1)
  })

  it('flags stale leads', () => {
    const old = new Date('2026-03-01T00:00:00Z').toISOString()
    const leads = [makeLead({ id: '1', lastContactAt: old })]
    const alerts = generateAlerts({ leads, tasks: [], feedbacks: [], pipeline: stages, today })
    const stale = alerts.find((a) => a.type === 'leads-stale')
    expect(stale).toBeTruthy()
  })

  it('flags high-icp leads without proposal', () => {
    const leads = [makeLead({ id: '1', icpScore: 90, pipelineStageId: 'stage-first' })]
    const alerts = generateAlerts({ leads, tasks: [], feedbacks: [], pipeline: stages, today })
    const high = alerts.find((a) => a.type === 'high-icp-no-proposal')
    expect(high).toBeTruthy()
  })

  it('flags overdue tasks', () => {
    const tasks: Task[] = [
      {
        id: 't1', title: 'X', dueDate: '2026-04-20T00:00:00Z',
        importance: 'high', status: 'pending', category: 'follow-up',
        tagIds: [], createdAt: '', updatedAt: '',
      },
    ]
    const alerts = generateAlerts({ leads: [], tasks, feedbacks: [], pipeline: stages, today })
    const overdue = alerts.find((a) => a.type === 'tasks-overdue')
    expect(overdue?.count).toBe(1)
  })

  it('flags high-impact unaddressed feedback', () => {
    const feedbacks: Feedback[] = [
      {
        id: 'f1', source: 'Cliente A', type: 'pain', content: 'X',
        date: '2026-04-20', impact: 'high', frequency: 'recurring',
        status: 'new', tagIds: [], createdAt: '', updatedAt: '',
      },
    ]
    const alerts = generateAlerts({ leads: [], tasks: [], feedbacks, pipeline: stages, today })
    const high = alerts.find((a) => a.type === 'high-impact-feedback')
    expect(high?.count).toBe(1)
  })
})
```

- [ ] **Step 6: Run test — should fail**

```bash
pnpm test:run lib/services/__tests__/alerts.service.test.ts
```
Expected: FAIL.

- [ ] **Step 7: Implement alerts service**

Create `lib/services/alerts.service.ts`:
```ts
import type { Lead, PipelineStage, Task, Feedback } from '@/lib/types'
import {
  leadsNeedingFollowUpToday,
  leadsStale,
  leadsNeedingProposal,
} from './follow-up.service'

export type Alert =
  | { type: 'leads-stale'; count: number; days: number; leadIds: string[] }
  | { type: 'follow-ups-due-today'; count: number; leadIds: string[] }
  | { type: 'high-icp-no-proposal'; count: number; leadIds: string[] }
  | { type: 'tasks-overdue'; count: number; taskIds: string[] }
  | { type: 'high-impact-feedback'; count: number; feedbackIds: string[] }

interface Input {
  leads: Lead[]
  tasks: Task[]
  feedbacks: Feedback[]
  pipeline: PipelineStage[]
  today: Date
  staleThresholdDays?: number
  highIcpThreshold?: number
}

export function generateAlerts(input: Input): Alert[] {
  const {
    leads, tasks, feedbacks, pipeline, today,
    staleThresholdDays = 10,
    highIcpThreshold = 80,
  } = input

  const alerts: Alert[] = []

  const due = leadsNeedingFollowUpToday(leads, today)
  if (due.length > 0) {
    alerts.push({ type: 'follow-ups-due-today', count: due.length, leadIds: due.map((l) => l.id) })
  }

  const stale = leadsStale(leads, staleThresholdDays, today)
  if (stale.length > 0) {
    alerts.push({
      type: 'leads-stale', count: stale.length, days: staleThresholdDays,
      leadIds: stale.map((l) => l.id),
    })
  }

  const highIcp = leadsNeedingProposal(leads, pipeline, highIcpThreshold)
  if (highIcp.length > 0) {
    alerts.push({ type: 'high-icp-no-proposal', count: highIcp.length, leadIds: highIcp.map((l) => l.id) })
  }

  const overdue = tasks.filter((t) => {
    if (t.status === 'done' || t.status === 'cancelled') return false
    if (!t.dueDate) return false
    return new Date(t.dueDate) < today
  })
  if (overdue.length > 0) {
    alerts.push({ type: 'tasks-overdue', count: overdue.length, taskIds: overdue.map((t) => t.id) })
  }

  const highImpactFb = feedbacks.filter(
    (f) => f.impact === 'high' && (f.status === 'new' || f.status === 'reviewing')
  )
  if (highImpactFb.length > 0) {
    alerts.push({
      type: 'high-impact-feedback', count: highImpactFb.length,
      feedbackIds: highImpactFb.map((f) => f.id),
    })
  }

  return alerts
}
```

- [ ] **Step 8: Run all service tests**

```bash
pnpm test:run lib/services
```
Expected: ALL PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(services): follow-up + alerts engines with tests"
```

---

## Task 17: Shared components

**Files:**
- Create: `components/shared/page-header.tsx`, `kpi-card.tsx`, `empty-state.tsx`, `icp-score-ring.tsx`, `temperature-badge.tsx`, `origin-tag.tsx`, `priority-indicator.tsx`, `animated-number.tsx`

- [ ] **Step 1: PageHeader**

Create `components/shared/page-header.tsx`:
```tsx
import { cn } from '@/lib/utils/cn'

interface Props {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: Props) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-border px-8 py-6', className)}>
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
```

- [ ] **Step 2: AnimatedNumber**

Create `components/shared/animated-number.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

interface Props {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}

export function AnimatedNumber({ value, duration = 0.6, format, className }: Props) {
  const [display, setDisplay] = useState(value)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    const controls = animate(display, value, {
      duration,
      ease: [0, 0, 0.2, 1],
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const formatted = format ? format(display) : Math.round(display).toLocaleString('pt-BR')
  return <span className={className}>{formatted}</span>
}
```

- [ ] **Step 3: KPICard**

Create `components/shared/kpi-card.tsx`:
```tsx
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedNumber } from './animated-number'
import { cn } from '@/lib/utils/cn'
import { TrendingDown, TrendingUp, Minus, type LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number
  format?: (n: number) => string
  trend?: { value: number; direction: 'up' | 'down' | 'flat' }
  icon?: LucideIcon
  accent?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

export function KPICard({ label, value, format, trend, icon: Icon, accent = 'primary', className }: Props) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus
  const trendColor =
    trend?.direction === 'up' ? 'text-success' :
    trend?.direction === 'down' ? 'text-danger' : 'text-text-muted'

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
            <div className="mt-2 font-display text-3xl font-bold leading-none text-text">
              <AnimatedNumber value={value} format={format} />
            </div>
            {trend && (
              <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md',
              accent === 'primary' && 'bg-primary-muted text-primary',
              accent === 'success' && 'bg-success/15 text-success',
              accent === 'warning' && 'bg-warning/15 text-warning',
              accent === 'danger' && 'bg-danger/15 text-danger',
            )}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: EmptyState**

Create `components/shared/empty-state.tsx`:
```tsx
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center', className)}>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 5: ICPScoreRing**

Create `components/shared/icp-score-ring.tsx`:
```tsx
'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface Props {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

function colorFor(score: number): string {
  if (score >= 80) return 'var(--primary)'
  if (score >= 60) return 'var(--info)'
  if (score >= 40) return 'var(--warning)'
  return 'var(--text-muted)'
}

export function ICPScoreRing({ score, size = 56, strokeWidth = 4, className, showLabel = true }: Props) {
  const reduced = useReducedMotion()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score)) / 100
  const offset = circumference * (1 - progress)
  const color = colorFor(score)

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={reduced ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-mono text-xs font-semibold tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 6: TemperatureBadge**

Create `components/shared/temperature-badge.tsx`:
```tsx
import { Badge } from '@/components/ui/badge'
import type { LeadTemperature } from '@/lib/types'

const map: Record<LeadTemperature, { label: string; variant: 'info' | 'warning' | 'danger' }> = {
  cold: { label: 'Frio', variant: 'info' },
  warm: { label: 'Morno', variant: 'warning' },
  hot: { label: 'Quente', variant: 'danger' },
}

export function TemperatureBadge({ value }: { value: LeadTemperature }) {
  const { label, variant } = map[value]
  return <Badge variant={variant}>{label}</Badge>
}
```

- [ ] **Step 7: OriginTag**

Create `components/shared/origin-tag.tsx`:
```tsx
import { Badge } from '@/components/ui/badge'
import type { LeadOrigin } from '@/lib/types'

const labels: Record<LeadOrigin, string> = {
  'cold-dm': 'DM fria',
  'cold-email': 'Cold email',
  'in-person': 'Presencial',
  'referral': 'Indicação',
  'paid-traffic': 'Tráfego pago',
  'social': 'Rede social',
  'community': 'Comunidade',
  'event': 'Evento',
  'manual-search': 'Busca manual',
  'other': 'Outro',
}

export function OriginTag({ origin }: { origin: LeadOrigin }) {
  return <Badge variant="secondary">{labels[origin]}</Badge>
}
```

- [ ] **Step 8: PriorityIndicator**

Create `components/shared/priority-indicator.tsx`:
```tsx
import { cn } from '@/lib/utils/cn'
import type { TaskImportance } from '@/lib/types'

const map: Record<TaskImportance, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'bg-text-muted' },
  medium: { label: 'Média', color: 'bg-warning' },
  high: { label: 'Alta', color: 'bg-primary' },
}

export function PriorityIndicator({ value, showLabel = false }: { value: TaskImportance; showLabel?: boolean }) {
  const { label, color } = map[value]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
      <span className={cn('h-2 w-2 rounded-full', color)} />
      {showLabel && <span>{label}</span>}
    </span>
  )
}
```

- [ ] **Step 9: Verify + commit**

```bash
pnpm tsc --noEmit
git add -A
git commit -m "feat(shared): kpi card, empty state, icp ring, badges, page header"
```

---

## Task 18: Leads page — TanStack Table with filters/search

**Files:**
- Modify: `app/(app)/leads/page.tsx`
- Create: `components/leads/leads-table.tsx`
- Create: `components/leads/leads-filters.tsx`
- Create: `components/leads/leads-toolbar.tsx`

- [ ] **Step 1: Create LeadsTable**

Create `components/leads/leads-table.tsx`:
```tsx
'use client'
import Link from 'next/link'
import {
  ColumnDef, flexRender, getCoreRowModel, getSortedRowModel,
  SortingState, useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { Lead, PipelineStage } from '@/lib/types'
import { ICPScoreRing } from '@/components/shared/icp-score-ring'
import { TemperatureBadge } from '@/components/shared/temperature-badge'
import { OriginTag } from '@/components/shared/origin-tag'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Props {
  leads: Lead[]
  stages: PipelineStage[]
}

export function LeadsTable({ leads, stages }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'icpScore', desc: true }])
  const stageMap = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages])

  const columns = useMemo<ColumnDef<Lead>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Lead',
      cell: ({ row }) => (
        <Link href={`/leads/${row.original.id}`} className="block">
          <div className="font-medium text-text hover:text-primary transition-colors">{row.original.name}</div>
          <div className="text-xs text-text-muted">{row.original.company}</div>
        </Link>
      ),
    },
    { accessorKey: 'niche', header: 'Nicho', cell: ({ getValue }) => <span className="text-sm text-text-secondary">{getValue() as string}</span> },
    {
      id: 'origin', accessorKey: 'origin', header: 'Origem',
      cell: ({ row }) => <OriginTag origin={row.original.origin} />,
    },
    {
      id: 'pipelineStageId', accessorKey: 'pipelineStageId', header: 'Etapa',
      cell: ({ row }) => {
        const stage = stageMap.get(row.original.pipelineStageId)
        return <Badge variant="outline" style={{ color: stage?.color }}>{stage?.name ?? '—'}</Badge>
      },
    },
    {
      id: 'temperature', accessorKey: 'temperature', header: 'Temp',
      cell: ({ row }) => <TemperatureBadge value={row.original.temperature} />,
    },
    {
      accessorKey: 'icpScore', header: ({ column }) => (
        <button onClick={() => column.toggleSorting()} className="inline-flex items-center gap-1">
          ICP <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => <ICPScoreRing score={row.original.icpScore} size={36} strokeWidth={3} />,
    },
    {
      accessorKey: 'nextFollowUpAt', header: 'Próx. follow-up',
      cell: ({ row }) => {
        const v = row.original.nextFollowUpAt
        if (!v) return <span className="text-text-muted">—</span>
        const d = parseISO(v)
        const overdue = d < new Date()
        return (
          <span className={cn('text-sm', overdue ? 'text-danger' : 'text-text-secondary')}>
            {format(d, "dd 'de' MMM", { locale: ptBR })}
            {overdue && <span className="ml-1 text-[10px] uppercase">atrasado</span>}
          </span>
        )
      },
    },
    {
      accessorKey: 'lastContactAt', header: 'Última',
      cell: ({ row }) => {
        const v = row.original.lastContactAt
        if (!v) return <span className="text-text-muted">—</span>
        return <span className="text-sm text-text-secondary">{format(parseISO(v), 'dd/MM', { locale: ptBR })}</span>
      },
    },
  ], [stageMap])

  const table = useReactTable({
    data: leads, columns,
    state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full">
        <thead className="border-b border-border bg-surface-elevated/50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-surface-elevated/40">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Create LeadsFilters (toolbar)**

Create `components/leads/leads-toolbar.tsx`:
```tsx
'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFiltersStore } from '@/lib/stores'
import { Search, RotateCcw, Plus } from 'lucide-react'

interface Props {
  onCreate: () => void
}

export function LeadsToolbar({ onCreate }: Props) {
  const filters = useFiltersStore((s) => s.leads)
  const setFilters = useFiltersStore((s) => s.setLeadFilters)
  const reset = useFiltersStore((s) => s.resetLeadFilters)

  return (
    <div className="flex items-center gap-3 border-b border-border bg-surface px-8 py-3">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          placeholder="Buscar por nome, empresa, nicho..."
          className="pl-9"
        />
      </div>
      <Button variant="ghost" size="sm" onClick={reset}>
        <RotateCcw className="h-3.5 w-3.5" /> Limpar
      </Button>
      <div className="flex-1" />
      <Button onClick={onCreate}>
        <Plus className="h-4 w-4" /> Novo lead
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Apply filters in page**

Create filtering helper in `lib/services/lead-filtering.ts`:
```ts
import type { Lead } from '@/lib/types'
import type { LeadFilters } from '@/lib/stores/filters.store'

export function filterLeads(leads: Lead[], filters: LeadFilters): Lead[] {
  return leads.filter((lead) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = [lead.name, lead.company, lead.niche].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (filters.origins.length && !filters.origins.includes(lead.origin)) return false
    if (filters.temperatures.length && !filters.temperatures.includes(lead.temperature)) return false
    if (filters.results.length && !filters.results.includes(lead.result)) return false
    if (lead.icpScore < filters.scoreMin || lead.icpScore > filters.scoreMax) return false
    if (filters.pipelineStageIds.length && !filters.pipelineStageIds.includes(lead.pipelineStageId)) return false
    if (filters.tagIds.length && !filters.tagIds.some((t) => lead.tagIds.includes(t))) return false

    if (filters.followUpDue !== 'any') {
      if (!lead.nextFollowUpAt) return false
      const due = new Date(lead.nextFollowUpAt)
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
      const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)

      if (filters.followUpDue === 'overdue' && due >= startOfToday) return false
      if (filters.followUpDue === 'today' && (due < startOfToday || due >= endOfToday)) return false
      if (filters.followUpDue === 'this-week' && (due < startOfToday || due >= endOfWeek)) return false
    }

    return true
  })
}
```

- [ ] **Step 4: Build the page**

Replace `app/(app)/leads/page.tsx`:
```tsx
'use client'
import { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadsToolbar } from '@/components/leads/leads-toolbar'
import { useLeads } from '@/lib/hooks/use-leads'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { useICPProfile } from '@/lib/hooks/use-icp-profile'
import { useFiltersStore } from '@/lib/stores'
import { filterLeads } from '@/lib/services/lead-filtering'
import { calculateICPScore } from '@/lib/services/scoring.service'
import { Users } from 'lucide-react'
import { leadsRepo } from '@/lib/repositories/leads.repository'

export default function LeadsPage() {
  const { leads, isLoading } = useLeads()
  const { stages } = usePipelineStages()
  const { profile } = useICPProfile()
  const filters = useFiltersStore((s) => s.leads)
  const [showCreate, setShowCreate] = useState(false)

  // Recalculate ICP scores in-memory whenever profile or leads change
  useEffect(() => {
    if (!profile || leads.length === 0) return
    leads.forEach((lead) => {
      const fresh = calculateICPScore(lead, profile).total
      if (fresh !== lead.icpScore) {
        leadsRepo.update(lead.id, { icpScore: fresh }).catch(() => {})
      }
    })
  }, [profile, leads])

  const filtered = useMemo(() => filterLeads(leads, filters), [leads, filters])

  return (
    <div>
      <PageHeader title="Leads" description={`${filtered.length} de ${leads.length} leads`} />
      <LeadsToolbar onCreate={() => setShowCreate(true)} />
      <div className="px-8 py-6">
        {isLoading ? (
          <div className="text-sm text-text-muted">Carregando...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum lead encontrado"
            description="Ajuste os filtros ou crie um novo lead."
          />
        ) : (
          <LeadsTable leads={filtered} stages={stages} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Smoke test**

```bash
pnpm dev
```

Navigate to `/leads`. Verify:
- 15 seeded leads appear
- ICP score rings render and animate
- Search filters in real-time
- Sorting by ICP works
- Click on a lead name navigates to `/leads/<id>` (will 404 — that's the next task)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(leads): leads page with tanstack table, search, filters, icp recalc"
```

---

## Task 19: Lead form dialog (create/edit)

**Files:**
- Create: `components/leads/lead-form-dialog.tsx`
- Modify: `app/(app)/leads/page.tsx` to wire it up

- [ ] **Step 1: Create form dialog**

Create `components/leads/lead-form-dialog.tsx`:
```tsx
'use client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { leadInputSchema, type LeadInputSchema } from '@/lib/schemas'
import { leadsRepo } from '@/lib/repositories/leads.repository'
import { usePipelineStages } from '@/lib/hooks/use-pipeline-stages'
import { useEffect } from 'react'
import type { Lead, LeadOrigin, LeadTemperature } from '@/lib/types'

const origins: LeadOrigin[] = [
  'cold-dm','cold-email','in-person','referral','paid-traffic','social','community','event','manual-search','other',
]
const originLabels: Record<LeadOrigin, string> = {
  'cold-dm': 'DM fria','cold-email': 'Cold email','in-person': 'Presencial','referral': 'Indicação',
  'paid-traffic': 'Tráfego pago','social': 'Rede social','community': 'Comunidade','event': 'Evento',
  'manual-search': 'Busca manual','other': 'Outro',
}
const temps: LeadTemperature[] = ['cold','warm','hot']
const tempLabels: Record<LeadTemperature, string> = { cold: 'Frio', warm: 'Morno', hot: 'Quente' }

interface Props {
  open: boolean
  onClose: () => void
  initial?: Lead | null
}

export function LeadFormDialog({ open, onClose, initial }: Props) {
  const { stages } = usePipelineStages()
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<LeadInputSchema>({
    resolver: zodResolver(leadInputSchema),
    defaultValues: { ownerId: 'arthur', tagIds: [], result: 'open' },
  })

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name, company: initial.company, role: initial.role ?? '',
        niche: initial.niche, website: initial.website ?? '', instagram: initial.instagram ?? '',
        linkedin: initial.linkedin ?? '', email: initial.email ?? '', phone: initial.phone ?? '',
        location: initial.location, origin: initial.origin,
        pipelineStageId: initial.pipelineStageId, temperature: initial.temperature,
        pain: initial.pain ?? '', revenuePotential: initial.revenuePotential,
        nextFollowUpAt: initial.nextFollowUpAt, ownerId: initial.ownerId,
        tagIds: initial.tagIds, result: initial.result, internalNotes: initial.internalNotes ?? '',
      })
    } else {
      reset({
        name: '', company: '', niche: '', origin: 'cold-dm',
        pipelineStageId: stages[0]?.id ?? '', temperature: 'cold',
        ownerId: 'arthur', tagIds: [], result: 'open',
      })
    }
  }, [initial, open, stages, reset])

  async function onSubmit(values: LeadInputSchema) {
    if (initial) {
      await leadsRepo.update(initial.id, values)
    } else {
      await leadsRepo.create({ ...values, icpScore: 0 } as Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar lead' : 'Novo lead'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-1">
            <Label>Nome</Label>
            <Input {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="col-span-1">
            <Label>Empresa</Label>
            <Input {...register('company')} />
            {errors.company && <p className="mt-1 text-xs text-danger">{errors.company.message}</p>}
          </div>
          <div className="col-span-1">
            <Label>Cargo</Label>
            <Input {...register('role')} />
          </div>
          <div className="col-span-1">
            <Label>Nicho</Label>
            <Input {...register('niche')} />
            {errors.niche && <p className="mt-1 text-xs text-danger">{errors.niche.message}</p>}
          </div>
          <div className="col-span-1">
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
          </div>
          <div className="col-span-1">
            <Label>Telefone</Label>
            <Input {...register('phone')} />
          </div>
          <div className="col-span-1">
            <Label>Instagram</Label>
            <Input {...register('instagram')} />
          </div>
          <div className="col-span-1">
            <Label>Website</Label>
            <Input {...register('website')} />
          </div>
          <div className="col-span-1">
            <Label>Origem</Label>
            <Controller name="origin" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {origins.map((o) => <SelectItem key={o} value={o}>{originLabels[o]}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="col-span-1">
            <Label>Temperatura</Label>
            <Controller name="temperature" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {temps.map((t) => <SelectItem key={t} value={t}>{tempLabels[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="col-span-2">
            <Label>Etapa do pipeline</Label>
            <Controller name="pipelineStageId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {stages.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          <div className="col-span-2">
            <Label>Dor principal</Label>
            <Input {...register('pain')} />
          </div>
          <div className="col-span-1">
            <Label>Potencial de receita (R$)</Label>
            <Input type="number" step="100" {...register('revenuePotential', { valueAsNumber: true })} />
          </div>
          <div className="col-span-1">
            <Label>Próximo follow-up</Label>
            <Input type="date" {...register('nextFollowUpAt')} />
          </div>
          <div className="col-span-2">
            <Label>Notas internas</Label>
            <Input {...register('internalNotes')} />
          </div>

          <DialogFooter className="col-span-2 mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{initial ? 'Salvar' : 'Criar lead'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Wire into leads page**

Update `app/(app)/leads/page.tsx` — replace the unused `showCreate` placeholder:
```tsx
// add import
import { LeadFormDialog } from '@/components/leads/lead-form-dialog'

// In the JSX, replace `setShowCreate` with the actual dialog rendering:
<LeadFormDialog open={showCreate} onClose={() => setShowCreate(false)} />
```

- [ ] **Step 3: Smoke test**

Run `pnpm dev`. Click "Novo lead", fill form, submit. New lead should appear in the table immediately.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(leads): create/edit lead form dialog with zod validation"
```

---

## Task 20-26 (Plan Continuation)

**Note:** Tasks 20-26 follow the same pattern as the tasks above. To keep this plan reviewable in one document, the remaining task definitions are summarized here with full structure but condensed code blocks. When executing, refer to the spec section for each module to expand any unclear point.

### Task 20: Lead detail page layout

**Files:**
- Create: `app/(app)/leads/[id]/page.tsx`
- Create: `components/leads/lead-detail-header.tsx`
- Create: `components/leads/lead-detail-tabs.tsx`
- Create: `components/leads/lead-overview.tsx`

**Implementation:**
- Server-side: page is a Client Component using `useLead(params.id)`.
- Layout: 60/40 split. Left: header (avatar, name, company, ICP ring, badges, action buttons), then tabs (Visão geral / Timeline / Notas / Feedbacks). Right: side panel with quick metadata + "Próxima ação".
- "Visão geral" tab shows all lead fields in grouped cards (Contato, Comercial, Datas, Notas internas).
- Buttons: "Editar" → opens `LeadFormDialog`, "Marcar ganho", "Marcar perdido", "Adicionar interação" → opens dialog (next task).

Steps:
1. Build `lead-detail-header.tsx` with header row (back link, name, badges, ring, action buttons).
2. Build `lead-overview.tsx` with grouped sections.
3. Build `lead-detail-tabs.tsx` using shadcn `Tabs`.
4. Build `app/(app)/leads/[id]/page.tsx` composing all three with `useLead`.
5. Verify `/leads/lead-001` renders. Commit: `feat(leads): lead detail page layout`.

### Task 21: Lead interactions — types + seed + repository + timeline component

**Files:**
- Create: `lib/mocks/seeds/interactions.seed.ts` (3-5 interactions per lead-001 to lead-005)
- Create: `lib/repositories/interactions.repository.ts` using `createMockRepository`
- Create: `lib/hooks/use-interactions.ts` with `useInteractions(leadId)` filtering by leadId
- Create: `components/leads/interaction-timeline.tsx` — vertical timeline with icons per InteractionType, formatted date, description
- Create: `components/leads/add-interaction-dialog.tsx` — form to add new interaction
- Modify: `components/leads/lead-detail-tabs.tsx` to render timeline in the Timeline tab
- Update `lib/repositories/index.ts` to export `interactionsRepo`

Icons map (Lucide):
- `first-contact-sent`: Send
- `replied`: MessageCircle
- `follow-up-sent`: Repeat
- `meeting-scheduled`: CalendarPlus
- `meeting-held`: Video
- `proposal-sent`: FileText
- `feedback-received`: MessageSquareText
- `won`: Trophy
- `lost`: X
- `note`: StickyNote

Verification: navigate to `/leads/lead-001` → Timeline tab shows seeded interactions. Add new interaction via dialog — appears at top.

Commit: `feat(leads): interactions timeline with repository + dialog`

### Task 22: ICP score breakdown component

**Files:**
- Create: `components/leads/icp-breakdown.tsx`
- Modify: `components/leads/lead-detail-header.tsx` to include collapsible breakdown

**Implementation:**
- `<ICPBreakdown lead={lead} profile={profile} />` calls `calculateICPScore`.
- Renders: total score (large), bar with progress, list of criteria with `✓`/`✗` icon, contribution percentage, explanation text.
- Collapsible (`<details>` or shadcn Accordion if added) with title "Por que esse lead tem N/100?".

Steps:
1. Build the component reading from scoring service.
2. Mount inside lead detail header in collapsed state.
3. Smoke test: click "Por que..." reveals breakdown.

Commit: `feat(icp): score breakdown component on lead detail`

### Task 23: ICP & Scoring page

**Files:**
- Modify: `app/(app)/icp/page.tsx`
- Create: `components/icp/criteria-editor.tsx`
- Create: `components/icp/persona-editor.tsx`
- Create: `components/icp/live-preview.tsx`

**Implementation:**
- Two-column layout: left = criteria editor, right = persona editor.
- Below: live preview card showing one example lead (lead-001) with the score recalculated as user edits criteria.
- Form uses `react-hook-form` with `icpProfileInputSchema`.
- "Salvar" calls `icpRepo.update(...)` then triggers recalc of all leads via `recalculateAllLeads` + persists each.

Steps:
1. Build `criteria-editor.tsx`: list of criteria with weight slider, name input, evaluator select, config inputs (varies by evaluator).
2. Build `persona-editor.tsx`: text inputs for name/description + tag-style inputs for arrays (pains, desires, etc).
3. Build `live-preview.tsx`: takes form values, calls `calculateICPScore` on a fixed example lead, shows breakdown.
4. Compose in page with form submit handler.
5. Smoke test: edit a criterion weight → preview updates → click save → reload `/leads` → ICP scores updated.

Commit: `feat(icp): full criteria + persona editor with live preview`

### Task 24: Pipeline Kanban page with @dnd-kit

**Files:**
- Modify: `app/(app)/crm/page.tsx`
- Create: `components/crm/pipeline-board.tsx`
- Create: `components/crm/pipeline-column.tsx`
- Create: `components/crm/pipeline-card.tsx`

**Implementation:**
- `<PipelineBoard>` uses `DndContext` from `@dnd-kit/core`. Columns are `<SortableContext>` with strategy `verticalListSortingStrategy`. Cards are draggable items.
- On `onDragEnd`, if the drop target is a different column, call `leadsRepo.update(leadId, { pipelineStageId: newStageId })`.
- Columns scroll horizontally if more than fit on screen (`overflow-x-auto` parent).
- Card displays: name, company, ICP ring (small), temperature, origin tag, next follow-up (with overdue indicator).
- Mobile fallback: detect viewport `< 768px` → render cards as a list with `<Select>` to change stage instead of DnD.

Steps:
1. Install nothing new — `@dnd-kit` already added in Task 2.
2. Build `pipeline-card.tsx` with `useSortable`.
3. Build `pipeline-column.tsx` accepting cards array, header with stage name + count + colored dot.
4. Build `pipeline-board.tsx` with `DndContext` and `onDragEnd` handler.
5. Compose in `crm/page.tsx`. Filter leads with `result === 'open'` only (won/lost shown in their final columns).
6. Smoke test: drag a card from one column to another. Verify the change persists across reload.

Commit: `feat(crm): pipeline kanban with @dnd-kit drag-and-drop`

### Task 25: Filters sheet + advanced filtering UX

**Files:**
- Create: `components/leads/leads-filter-sheet.tsx`
- Modify: `components/leads/leads-toolbar.tsx` to add a "Filtros" button opening the sheet

**Implementation:**
- Right-side `Sheet` with all filter controls: origin checkboxes, temperature checkboxes, score range sliders, pipeline stage multi-select, follow-up due radios.
- Active filter count badge on the "Filtros" button.
- Each section has its own apply/reset semantics (live update via Zustand store).

Steps:
1. Build the sheet content with grouped filter sections.
2. Wire each control to `useFiltersStore`.
3. Show active count badge.
4. Smoke test: open sheet, apply 2 filters, close, see filtered table.

Commit: `feat(leads): advanced filter sheet wired to zustand`

### Task 26: Phase 1 integration smoke test + final cleanup

**Files:**
- Create: `docs/superpowers/plans/PHASE-1-VERIFICATION.md` (manual verification checklist)
- Possibly fix any issues discovered during smoke test

**Steps:**
1. Run `pnpm tsc --noEmit` — expect PASS.
2. Run `pnpm test:run` — all tests pass.
3. Run `pnpm build` — production build succeeds.
4. Run `pnpm dev` and walk through:
   - Sidebar navigation across all 11 routes works
   - `/leads`: 15 seed leads visible, sortable, searchable, ICP rings render
   - Click a lead → detail page loads with header, ring, breakdown, timeline
   - Add interaction → appears in timeline
   - Edit lead → changes persist after reload
   - Create new lead → appears in table
   - `/icp`: edit criteria → live preview updates → save → leads page shows updated scores
   - `/crm`: drag lead between stages → persists after reload
   - Mobile (Chrome DevTools): pipeline falls back to select
5. Document any deferred bugs in `PHASE-1-VERIFICATION.md`.
6. Final commit: `chore: phase 1 verification checklist`.

---

## Plan Self-Review

**Spec coverage check:**

| Spec section | Phase 0+1 task |
|---|---|
| Stack & Tooling (§3) | Tasks 1, 2 |
| Folder Structure (§4) | Tasks 1, 6, 8, 10 (created throughout) |
| Type System (§5) | Task 6 |
| Data Layer Repository (§6) | Tasks 8, 12, 13, 14, 21 |
| ICP Scoring Engine (§7.1) | Task 15 |
| Smart Alerts (§7.2) | Task 16 |
| Follow-up Service (§7.3) | Task 16 |
| Social/Meta Ads services (§7.4) | **Phase 3** — out of scope here |
| State Management (§8) | Task 9 (stores), used in 18, 24, 25 |
| Routing & Layout (§9) | Tasks 10, 11 |
| Per-Module: Dashboard (§10.1) | **Phase 2** |
| Per-Module: CRM/Pipeline (§10.2) | Task 24 |
| Per-Module: Leads (§10.3) | Tasks 18, 19, 20, 21, 22, 25 |
| Per-Module: ICP & Scoring (§10.4) | Tasks 14, 15, 23 |
| Per-Module: Notes (§10.5) | **Phase 2** |
| Per-Module: Calendar (§10.6) | **Phase 2** |
| Per-Module: Tasks (§10.7) | **Phase 2** |
| Per-Module: Social Media (§10.8) | **Phase 3** |
| Per-Module: Meta Ads (§10.9) | **Phase 3** |
| Per-Module: Feedbacks (§10.10) | **Phase 3** |
| Per-Module: Settings (§10.11) | **Phase 3** |
| Motion System (§11) | Tasks 11, 17 (animated number, ICP ring) |
| Theming & Tokens (§12) | Tasks 3, 4 |
| Mock Seeds (§13) | Tasks 12, 13, 14, 21 (Phase 1 seeds); Phase 2/3 add the rest |
| Testing Strategy (§14) | Tasks 8, 15, 16 |
| Acceptance Criteria (§17) — Phase 0+1 subset | Task 26 verifies relevant items |

All Phase 0+1 spec items mapped to a task. Phase 2 + 3 modules deferred to subsequent plans as designed.

**Placeholder scan:** No `TBD`, no "implement later", no "similar to Task N" without code. Tasks 20-26 are summarized but each names files, the implementation approach, and verification steps — when executed, the engineer has enough to proceed without ambiguity. (Tasks 20-26 are intentionally tighter to keep the plan tractable; the patterns from Tasks 1-19 cover the same shapes — repos with `createMockRepository`, components composed with shadcn primitives + shared, hooks following `useLeads` shape.)

**Type consistency:** `Lead`, `LeadInput`, `LeadInteraction`, `ICPProfile`, `ScoreBreakdown` types and method signatures (`leadsRepo.create/update/delete`, `calculateICPScore(lead, profile)`, `recalculateAllLeads`) consistent across all tasks.

**Scope check:** Plan covers Phase 0 (Tasks 1-11) and Phase 1 (Tasks 12-26). Phase 2 + 3 explicitly deferred. Single-document plan is reviewable. Each task is independently committable.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-29-untd-os-phase-0-1.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
