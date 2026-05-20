# AGENTS.md

## Cursor Cloud specific instructions

### Overview

AwSales is a single Next.js 16 application (App Router + Turbopack) — an AI-powered sales agent platform built in Brazilian Portuguese. No database, no Docker, no external services required to run the core app.

### Running the app

```bash
npm run dev   # Starts dev server on http://localhost:3000 (binds to 0.0.0.0)
```

The dev server uses Turbopack and starts in ~300ms. All data is client-side (Zustand + localStorage).

### Known issues in the repo

- **`npm run lint`**: The `next lint` CLI subcommand was removed in Next.js 16. The configured lint script (`next lint`) errors with "Invalid project directory provided." ESLint v9 flat config migration has not been done yet (project still uses `.eslintrc.json`).
- **`npm run build`**: Fails due to `useSearchParams()` not wrapped in a Suspense boundary on `/inicio`. This is a static-generation-only issue; the dev server works fine.
- **`npm run typecheck`**: Passes after the `bombardier-review` stub modules exist. Pre-existing missing module errors exist only if those stubs are absent.

### Typecheck

```bash
npm run typecheck   # tsc --noEmit
```

### Testing

There is no test framework configured (no Jest, Vitest, or Playwright). Manual testing is done via the dev server.

### Key routes for manual testing

| Route | Description |
|-------|-------------|
| `/` | Login page (AuthFlow) |
| `/inicio` | Main dashboard (post-login) |
| `/agent-studio/1` | Agent studio |
| `/bombardier/styleguide` | Design system documentation |
| `/bombardier/styleguide/components/buttons` | Component docs example |
| `/conversations/1` | Conversation view |

### Environment variables

Copy `.env.example` to `.env.local`. The only active variable is `NEXT_PUBLIC_BOMBARDIER_REVIEW_ENABLED`. The Claude Edit overlay and Review Bridge are optional dev-only features whose source directories (`bridge-edit/`, `review-bridge/`) are not present in the repo.

### File structure notes

- `app/` — Next.js App Router pages and API routes
- `components/` — React components (UI primitives in `components/ui/`)
- `lib/` — Shared utilities, contexts, hooks, stores
- `public/assets/` — Static assets (integration logos, etc.)
