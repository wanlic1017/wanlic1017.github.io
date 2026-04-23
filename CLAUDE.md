# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # Type-check + production build
npm run lint      # ESLint on all TS/TSX files
npm run preview   # Preview production build
```

There is no test infrastructure — no test runner, no test files.

## Architecture

**Haerenga** is a React 19 SPA (with TypeScript + Vite + Tailwind CSS 4) for showcasing revision resources for Otago HSFY students.

### Routing

`App.tsx` defines all routes via React Router DOM:

- `/` → `HomePage` — landing page with hero and subject cards
- `/hubs191` → `HubsPage` — modules list for HUBS191
- `/cels191` → `CelsPage` — modules list for CELS191
- `/:subjectSlug/:moduleSlug` → `ModulePage` — module detail with pricing

### Data layer

All content lives in `src/data/subjects.ts`. It exports:
- `SubjectItem` and `ModuleItem` types
- A `subjects` array (the source of truth for all subjects/modules)
- `getSubjectBySlug()` and `getModuleBySlugs()` helper functions

Pages consume this data directly — there is no backend or API yet. When a backend is added, `subjects.ts` is the integration point.

### Components vs Pages

- `src/pages/` — route-level components, one per route
- `src/components/` — reusable UI: `Navbar`, `Footer`, `SubjectCard`, `ModuleCard`

All styling is Tailwind utility classes — no CSS modules, no component-scoped CSS. `App.css` exists but contains only leftover Vite template styles and is largely unused.

### TypeScript config

Two tsconfig files: `tsconfig.app.json` (app code, strict mode, ES2023 target) and `tsconfig.node.json` (Vite config). The root `tsconfig.json` references both.
