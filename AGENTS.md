# AGENTS.md

This file is for agentic coding tools working in this repository.

## Project Snapshot

- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase
- Package manager: prefer `pnpm` because `pnpm-lock.yaml` is committed
- Source root: `src/`
- Path alias: `@/*` maps to `src/*`
- App shape: marketing site + Supabase-backed admin UI

## Rule Files Present

- No repo-local `AGENTS.md` existed before this file
- No `.cursorrules` file exists
- No `.cursor/rules/` directory exists
- No `.github/copilot-instructions.md` file exists

## Install And Run

Install dependencies:

```bash
pnpm install
```

Run local dev server:

```bash
pnpm dev
```

Create production build:

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

Run lint:

```bash
pnpm lint
```

Run type-check manually:

```bash
pnpm exec tsc --noEmit
```

## Test Status

- There is no `test` script in `package.json`
- No Jest, Vitest, Playwright, or Cypress dependency is installed
- No `*.test.*` or `*.spec.*` files are currently present
- There is no working single-test command yet

If tests are added later, document both full-suite and single-test commands here.

Likely future single-test patterns:

```bash
pnpm vitest path/to/file.test.ts
pnpm vitest path/to/file.test.ts -t "test name"
pnpm jest path/to/file.test.ts
pnpm playwright test tests/example.spec.ts -g "test name"
```

## Recommended Verification Order

Run these after code changes when possible:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

If something cannot be run, say so explicitly in your final note.

## Repository Layout

- `src/app/` - routes, layouts, pages, server actions
- `src/components/` - app-specific components
- `src/components/ui/` - shared UI primitives and generated-style components
- `src/lib/` - helpers, Supabase clients, auth, mapping logic
- `src/hooks/` - client hooks
- `src/app/globals.css` - design tokens and global CSS
- `.env.example` - environment variable contract

## Environment Variables

Defined in `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
ADMIN_EMAILS=
```

Guidelines:

- Never hardcode secrets or keys
- Reuse existing env variable names
- Required env access should fail fast, matching `src/lib/supabase/config.ts`
- `ADMIN_EMAILS` is a comma-separated allowlist

## Core Coding Style

- Follow the local style of the file you touch instead of reformatting unrelated code
- Prefer small, focused edits over broad cleanup
- Use ASCII unless the file already contains Korean copy or another clear reason exists
- Keep comments minimal; only add them when logic is not obvious

## Formatting Conventions

- The repo has mixed formatting styles
- App and lib files often use semicolons
- Many `src/components/ui/*` files are semicolonless generated-style components
- Do not normalize a whole file or folder unless the task requires it
- Preserve wrapping and spacing style already used nearby

## Imports

- Group imports as: framework/third-party, internal `@/...`, side effects
- Prefer `@/...` aliases for files under `src/`
- Use `import type` for type-only imports when it keeps runtime imports cleaner
- Match local style for mixed imports such as `import { type Foo } from "..."`

## TypeScript

- `strict: true` is enabled; keep code type-safe
- Avoid `any`
- Prefer explicit types for data crossing boundaries like Supabase results or action state
- Use union types for constrained states
- Add return types to exported helpers when they improve clarity
- Keep DB row shapes separate from UI-facing mapped shapes when useful

## Naming

- Components and types: PascalCase
- Variables and functions: camelCase
- Constants: UPPER_SNAKE_CASE only for real constants
- Route segments and filenames: follow Next.js conventions
- Keep raw database field names in snake_case only when mirroring Supabase rows
- Prefer camelCase for mapped frontend/domain objects

## React And Next.js

- Default to server components unless client behavior is required
- Add `"use client"` only when using hooks, browser APIs, or interactive handlers
- Use `"use server"` for server actions
- Use `import "server-only"` for server-only modules
- Use `next/image` for images and `next/link` for internal navigation
- Follow App Router patterns already established in `src/app/`

## Supabase Conventions

- Use `src/lib/supabase/server.ts` for server-side clients
- Use `src/lib/supabase/browser.ts` for browser-side clients
- Do not create duplicate Supabase client factories in feature files
- Keep env access centralized in `src/lib/supabase/config.ts`
- Reuse `requireAdminUser()` for admin-only server flows
- Reuse existing storage URL helpers and mapping functions when possible

## Error Handling

- Fail fast for missing required env vars with thrown errors
- Use `redirect()` for auth gating and login protection
- Use `notFound()` for missing route resources
- In server actions, prefer returning structured `ActionState` objects for user-facing failures
- Validate form input early and return readable error messages
- Convert Supabase errors into actionable UI messages where possible
- Use client-side `console.error` only when the UI can degrade safely

## Forms And Actions

- Existing admin forms use `useActionState(...)` with shared `ActionState`
- Reuse `initialActionState` for new actions where appropriate
- Keep success/error feedback compatible with `sonner` toasts
- Use `.bind(...)` when an action needs pre-bound IDs or paths
- Preserve `multipart/form-data` on file-upload forms

## Styling And UI

- Reuse shared helpers like `cn(...)`
- Prefer existing UI primitives in `src/components/ui/` before creating duplicates
- Prefer Tailwind CSS utilities as the primary styling approach for new UI work
- Prefer composing styles directly in components with Tailwind rather than adding page-specific classes to `src/app/globals.css`
- Use `src/app/globals.css` mainly for design tokens, theme variables, resets, and truly global rules
- When styles repeat, extract small React wrapper components before introducing new global CSS selectors
- Treat custom CSS classes as an exception for cases Tailwind cannot express cleanly or for app-wide styling primitives
- Preserve the current visual language on marketing and admin pages
- Do not replace custom layouts with generic template code
- Keep responsive behavior intact for desktop and mobile
- Respect reduced-motion handling already present in the app and CSS

## Accessibility

- Keep meaningful labels on form controls
- Keep useful `alt` text on images
- Preserve keyboard and focus behavior
- Preserve existing `aria-*` attributes and semantics

## Generated Or Shared Files

- Treat `src/components/ui/*` as shared primitives
- Many of these appear generated or adapted from shadcn-style tooling
- Avoid unnecessary refactors in those files
- If you must edit one, preserve its local formatting conventions

## Final Notes For Agents

- Mention when a command is unavailable rather than inventing one
- Do not claim tests passed when no test runner exists
- Prefer minimal, reversible changes that align with current patterns
- If the repo later adds tests, formatter config, Cursor rules, or Copilot instructions, update this file immediately
