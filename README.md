# scribe-timecards

Monorepo for the Scribe Timecards app — React frontend, Node/Express backend, shared TypeScript types.

## Prerequisites

- **Node.js 22+** (LTS — [download](https://nodejs.org))
- **Corepack** (ships with Node 22 — no separate install needed)

If you use a Node version manager, the repo includes an [`.nvmrc`](.nvmrc) so you can switch automatically:

```bash
# nvm
nvm install   # installs Node 22 if not already present
nvm use       # switches to the version in .nvmrc
```

## Getting started

```bash
corepack enable    # one-time: activates the pinned pnpm version
pnpm install       # installs all workspace dependencies
pnpm dev           # starts client (localhost:5173) + server (localhost:3000)
```

That's it. The client proxies `/api/*` requests to the server automatically.

## Packages

| Package | Description | Dev port |
|---------|-------------|----------|
| `packages/client` | React + Vite + TypeScript SPA | 5646 |
| `packages/server` | Node + Express REST API | 3000 |
| `packages/shared` | Shared TypeScript types (no runtime) | — |

## Common commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start all packages in dev mode |
| `pnpm build` | Production build for server and client |
| `pnpm type-check` | Run `tsc --noEmit` across all packages |
| `pnpm --filter @scribe-timecards/client <cmd>` | Scope a command to the client |
| `pnpm --filter @scribe-timecards/server <cmd>` | Scope a command to the server |

## Adding dependencies

```bash
# Add to a specific package
pnpm add <pkg> --filter @scribe-timecards/client
pnpm add -D <pkg> --filter @scribe-timecards/server

# Add to root (dev tooling only)
pnpm add -D -w <pkg>
```

## Shared types

API contracts and shared interfaces live in `packages/shared/src/index.ts`.
Both client and server import from `@scribe-timecards/shared`.
No build step required — both Vite and tsx consume the TypeScript source directly.
