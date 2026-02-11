# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ferdium is an Electron desktop app that aggregates messaging services (Slack, WhatsApp, Gmail, etc.) into a single window. It's a hard fork of Franz with no restrictions. Uses Electron + React + MobX + TypeScript with an embedded AdonisJS internal server.

## Essential Commands

```bash
pnpm install              # Install dependencies (requires Node 22.18.0, pnpm 10.14.0)
pnpm dev                  # Start esbuild in watch mode (serves on http://127.0.0.1:8080)
pnpm start                # Launch Electron with built app (run after dev or build)
pnpm start:all-dev        # Dev + Electron together (waits for dev server, then launches)
pnpm debug                # Same as start:all-dev but with DEBUG=Ferdium:* logging

pnpm test                 # Run Jest tests with coverage
pnpm test:watch           # Jest in watch mode
pnpm test -- --testPathPattern="test/helpers"  # Run specific test files

pnpm typecheck            # TypeScript type checking (tsc --noEmit)
pnpm lint                 # ESLint with zero warnings allowed (--max-warnings 0)
pnpm lint:fix             # ESLint with auto-fix + cache
pnpm prepare-code         # Full pre-commit check: typecheck + lint:fix + biome + prettier + translations
pnpm build                # Production build: esbuild + electron-builder
```

## Git Hooks

- **pre-commit**: Runs `pnpm prepare-code` then `pnpm test` (skipped if node_modules missing)
- **commit-msg**: Enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint (e.g., `fix:`, `feat:`, `chore:`)

## Architecture

### Process Model (Electron)

- **Main process** (`src/index.ts`): App lifecycle, window management, IPC handlers, deep linking, auto-updates, tray icon, global shortcuts
- **Renderer process** (`src/app.tsx`): React UI with MobX state management and React Router

### State Management (MobX)

All stores are in `src/stores/` and initialized together in `src/stores/index.ts`. Each store receives references to all other stores, the API layer, and actions:

| Store | Purpose |
|-------|---------|
| `AppStore` | Global app state, timers, focus |
| `ServicesStore` | Service instances lifecycle, unread counts |
| `RecipesStore` | Available recipe templates |
| `UserStore` | Authentication and user profile |
| `SettingsStore` | App settings persistence |
| `UIStore` | UI state (sidebar, theme) |
| `FeaturesStore` | Feature flags |

Feature-specific stores: `workspaceStore`, `communityRecipesStore`, `todosStore` (in `src/features/`)

### API Layer

`src/api/index.ts` creates the API interface with two backends:
- **ServerApi** (`server`): Remote Ferdium server communication
- **LocalApi** (`local`): Embedded AdonisJS server for offline/local-first operation

Individual API classes: `AppApi`, `ServicesApi`, `RecipesApi`, `UserApi`, `FeaturesApi`, `RecipePreviewsApi`

### Recipe/Service System

- **Recipe** (`src/models/Recipe.ts`): Template defining a service type (URL pattern, message capabilities, dark mode, custom user agent)
- **Service** (`src/models/Service.ts`): Running instance of a recipe with its own WebView, partition isolation, observable state (unread counts, enabled/muted, notification settings)
- Recipes are loaded from the `ferdium-recipes` git submodule into `recipes/`

### Internal Server

`src/internal-server/`: AdonisJS 5 backend with SQLite database running on localhost. Provides local API for offline functionality. Has its own controllers, models, migrations, and routes.

### Feature Modules

Each feature in `src/features/` is self-contained with its own store, components, and initialization:
- `workspaces` - Service grouping
- `todos` - Built-in todo functionality
- `basicAuth` - HTTP basic auth handling
- `quickSwitch` - Service switching (Cmd/Ctrl+K)
- `serviceProxy` - Per-service proxy configuration
- `appearance` - Theme/accent color management
- `communityRecipes` - Community recipe browser

### Key Directories

- `src/components/` - React UI components (organized by feature area: auth, settings, services, layout)
- `src/actions/` - MobX action dispatchers
- `src/helpers/` - Utility functions (URL, validation, userAgent, i18n)
- `src/themes/` - Theme configs (dark, default, legacy)
- `src/i18n/` - Translations (managed via `pnpm manage-translations`)
- `src/electron/` - Main process utilities (IPC API, Settings, deep linking)
- `src/lib/` - System integrations (Menu, Tray, TouchBar, DBus)

### Build System

Uses **esbuild** (`esbuild.mjs`) for bundling. Compiles TS/TSX to CommonJS, processes SCSS, copies static assets to `./build`. Packaging via **electron-builder** (`electron-builder.yml`) for macOS/Windows/Linux.

### Styling

SCSS files in `src/styles/`. MUI (Material-UI) 5 for component library. Emotion for CSS-in-JS. Themes defined in `src/themes/`.

## Testing

Jest with `esbuild-runner/jest` transform. Tests in `src/` (colocated) and `test/` directories. Node test environment. Internal server tests currently skipped (see `jest.config.js`).

## Code Quality

- ESLint: Airbnb + TypeScript + React + Unicorn + Sonar configs. Zero warnings policy.
- Biome: Secondary linter for import organization.
- Prettier: Single quotes, arrow parens avoided.
- TypeScript: Strict mode with decorators enabled (for MobX).
