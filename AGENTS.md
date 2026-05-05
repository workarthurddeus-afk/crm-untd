<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UNTD OS / UNTD CRM - Codex Operating Context

This file is the primary operating guide for Codex inside this repository. Treat it as the first-stop instruction layer for implementation, review, refactor, debugging, and UI work.

## Project Overview

- UNTD OS / UNTD CRM is a personal command center for Arthur, founder of UNTD.
- The product is built for one power user, not for a generic multi-tenant corporate CRM.
- The system exists to improve daily operational speed, clarity, focus, and follow-through.
- Core domains already present in the repository include leads, CRM/pipeline, ICP, notes, calendar, tasks, feedbacks, social media, Meta Ads, and an executive dashboard.
- Product quality is measured by whether Arthur can open the app and immediately know:
  - what to do
  - for whom
  - why it matters now

## Source Of Truth

Before major work, read the documents that define the product:

1. `AGENTS.md`
2. `DESIGN.md`
3. `PRODUCT.md`
4. `README.md` when you need setup or script context

For UI/UX decisions:

- Always read `DESIGN.md` before changing layouts, surfaces, motion, spacing, states, or typography.

For scope, workflows, or prioritization decisions:

- Always read `PRODUCT.md` before making product tradeoffs or inventing user flows.

## Detected Stack

Current stack and tooling detected from `package.json` and the repository:

- `next@16.2.4`
- React `19.2.4`
- TypeScript `5`
- App Router structure in `app/`
- Tailwind CSS `4`
- Framer Motion `12`
- Zod for schemas
- Zustand present in dependencies
- Radix UI primitives already installed
- Lucide icons already installed
- `@tanstack/react-table` already installed
- `date-fns` and `date-fns-tz` already installed
- `vitest` + `jsdom` already installed for tests
- `eslint` + `eslint-config-next` already installed

Repository structure already reflects a layered architecture:

- `app/` for routes
- `components/` for UI
- `lib/types/`
- `lib/schemas/`
- `lib/mocks/seeds/`
- `lib/repositories/`
- `lib/services/`
- `lib/hooks/`
- `lib/utils/`
- repository and service tests already exist under `lib/**/__tests__/`

## Commands Available

Detected scripts:

- `npm run dev` -> `next dev`
- `npm run build` -> `next build`
- `npm run start` -> `next start`
- `npm run lint` -> `eslint`
- `npm run test` -> `vitest`
- `npm run test:run` -> `vitest run`

Equivalent local binaries are available under `node_modules/.bin/` and may be used when `pnpm` is not available in the shell.

## Next.js Rule

Preserve this rule at all times:

- This project uses a Next.js version with breaking changes.
- Before writing or changing code related to Next.js APIs, routing, rendering, conventions, server/client boundaries, layouts, metadata, fonts, or app structure, read the relevant docs in `node_modules/next/dist/docs/`.

Do not assume legacy Next.js patterns still apply.

## Product Rules

All product decisions must stay aligned with these constraints:

- Arthur is the only primary operator.
- Speed of operation matters more than configurability.
- The app is a daily command center, not a broad admin suite.
- UX should emphasize clear next actions, important context, and decision support.
- Workflows should support acquisition, prospecting, follow-up, note capture, planning, and execution.

Avoid turning the product into:

- a generic enterprise CRM
- a settings-heavy system with low leverage
- a template-like startup dashboard
- a scattered set of unrelated modules without a central daily workflow

## Design Rules

Before any UI or UX task, read `DESIGN.md`.

The design system is mandatory. Preserve these qualities:

- dark premium interface
- primary background anchored around `#0f0e17`
- brand primary anchored around `#5332ea`
- sharp, beautiful, premium UI
- not a generic admin panel
- not visually similar to HubSpot or Salesforce
- not generic AI-product UI
- no excessive glow or neon treatment
- strong visual hierarchy
- motion with meaning
- dense but calm information design
- controlled depth on cards and surfaces
- polished empty states
- responsive layouts
- basic accessibility and keyboard-awareness

When making UI decisions, optimize for:

- clarity under high information density
- confidence and intent
- fast scanning
- high signal per screen
- visual rhythm without noise

## Impeccable / .codex Rules

Current repository status:

- `.codex/` is not present right now.

If `.codex/` is added later, treat it as an additional design-polish layer for UI tasks.

When a task involves UI/UX and `.codex/` exists, apply behavior equivalent to:

- `craft`: build with strong structure and visual quality
- `polish`: refine spacing, states, transitions, and microinteractions
- `layout`: improve composition, density, and hierarchy
- `typeset`: improve typography and readability
- `harden`: fix overflow, responsiveness, accessibility, and edge states
- `audit` / `critique`: evaluate the UI before finalizing

If slash commands are unavailable, apply those principles manually using `DESIGN.md` plus any `.codex/` guidance.

## Architecture Rules

Respect the architecture already present in the repository.

- Inspect existing patterns before creating new ones.
- Do not rewrite stable modules without a clear reason.
- Keep data layer separate from UI.
- Prefer extending the current architecture instead of introducing a parallel one.
- Avoid giant files when a module naturally splits into smaller units.
- Build reusable components rather than one-off UI fragments when repetition appears.
- Do not install dependencies until you verify whether the repository already has an adequate solution.
- Do not commit automatically.

### Data Layer Convention

Prefer this structure for new domain modules:

1. `lib/types/`
2. `lib/schemas/`
3. `lib/mocks/seeds/`
4. `lib/repositories/`
5. `lib/services/`
6. `lib/hooks/`
7. `lib/**/__tests__/`

Expect UI to consume hooks and services rather than duplicating business logic inside components.

## Recommended Workflow Per Feature

### Phase 1 - Data Layer

- create or extend types
- create or extend schemas
- create realistic mocks/seeds
- create repositories
- create services
- create hooks for UI consumption
- create focused tests

### Phase 2 - UI

- build or update page
- build or update components
- connect hooks and service actions
- handle loading, empty, and error states
- verify responsiveness
- verify accessibility basics

### Phase 3 - Integration

- connect module back into dashboard
- add cross-links between modules
- add quick actions
- polish interaction details
- fix regressions and edge cases

## Validation Rules

### When changing the data layer

- run TypeScript check
- run focused tests
- run focused lint where practical

Recommended commands:

- `node_modules/.bin/tsc --noEmit`
- `node_modules/.bin/vitest run <target>`
- `node_modules/.bin/eslint <target files>`

### When changing UI

- run TypeScript check
- run focused lint where practical
- verify hydration behavior
- check for invalid HTML nesting such as `button` inside `button`
- verify responsive behavior
- verify empty/loading/error states
- verify basic accessibility

If a local dev server is required for the task, start it and report the URL used.

## Working Tree Safety

- Do not revert changes you did not make unless explicitly asked.
- The repository may already contain uncommitted work in unrelated areas.
- If the working tree is dirty, inspect carefully and work around existing changes.
- Do not auto-commit.
- Do not auto-create branches unless explicitly requested.

## Final Task Report

For every completed task, respond with:

- what was changed
- main files involved
- commands executed
- errors or pending items
- a suggested commit command

Do not silently skip verification. If something was not run, say so explicitly.

## Current Repository Snapshot

As of the current repository state:

- dashboard route exists and is structured as a Founder Command Center
- notes data layer exists
- notes UI exists
- calendar data layer exists
- calendar UI work exists and should be treated as in progress until intentionally finalized
- tests exist and currently pass in the working tree when run with `vitest`
- global lint still has out-of-scope existing errors that should not be hidden

## Practical Defaults For Codex

- Prefer repository patterns already used in `notes`, `tasks`, `leads`, and `calendar`.
- Prefer focused, incremental edits over broad rewrites.
- Prefer mocked/local data contracts that can later be swapped for Supabase or external APIs.
- Prefer services and hooks as the stable interface for UI consumption.
- Preserve product sharpness and brand tone in UI work.
- Preserve operational clarity in product flows.
