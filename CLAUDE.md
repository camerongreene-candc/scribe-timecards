# scribe-timecards

## Overview

pnpm monorepo for the Scribe Timecards app.

- `packages/client` — React + Vite + TypeScript SPA
- `packages/server` — Node + Express REST API, TypeScript via tsx
- `packages/shared` — shared TypeScript types only, no runtime deps

## Package manager

pnpm with workspaces. Version is pinned via `"packageManager"` in root `package.json`.

Use `pnpm --filter @scribe-timecards/<name>` to scope any command to a single package.

## Dev environment

- Client: http://localhost:5173
- Server: http://localhost:3000
- Client proxies `/api/*` to the server (configured in `packages/client/vite.config.ts`)

## Adding dependencies

```bash
pnpm add <pkg> --filter @scribe-timecards/client
pnpm add -D <pkg> --filter @scribe-timecards/server
pnpm add -D -w <pkg>   # root-level tooling only
```

## Shared types

`packages/shared/src/index.ts` is the single source of truth for types shared across the boundary.
Both Vite and tsx handle the TypeScript source directly — no build step needed in dev.

## TypeScript

All packages extend `tsconfig.base.json` at the root. Strict mode is on everywhere.
