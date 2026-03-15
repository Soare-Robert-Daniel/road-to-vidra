# AGENTS.md

## Build & Test Commands

- `npm run dev` - Start Vite dev server (http://localhost:5173)
- `npm run build` - Build for production to `dist/`
- `npm run preview` - Preview production build locally
- `npm run lint` - Run oxlint (preferred linter)
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with oxfmt
- `npm run format:check` - Check formatting without changes

## Architecture

**Stack**: Preact + Vite + TailwindCSS + TypeScript
**Main entry**: `src/index.tsx`
**Structure**:

- `src/components/` - Reusable Preact components
- `src/hooks/` - Custom React hooks
- `src/solar.ts` - Solar calculation logic (uses suncalc)
- `src/storage.ts` - Browser storage utilities
- `src/config.ts` - Configuration constants
- `src/utils.tsx` - JSX utility functions

## Code Style

- **Language**: TypeScript (ES2020 target), JSX with Preact
- **Imports**: ESM only (`"type": "module"`)
- **Formatting**: oxfmt (Rust formatter), oxlint (Rust linter)
- **CSS**: Tailwind v4 via @tailwindcss/vite
- **React**: Preact with compatibility layer (react → preact/compat)
- **Naming**: camelCase functions/vars, PascalCase components
- **Hooks**: React hooks enforced (oxlint rules)
- **No unused vars**: Error-level (oxlint)
- **JSX keys**: Required in lists/fragments (oxlint)
