# AGENTS.md - MyRacing Frontend

React 19 + Vite 7 + TypeScript + Tailwind 3/Tremor + TanStack Query. pnpm 10, Node 20+.

## Verificación

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Vite dev server (port 5173)          |
| `pnpm build`     | `tsc -b && vite build`               |
| `pnpm lint`      | eslint                               |
| `pnpm test`      | Vitest (happy-dom, setup src/test)   |
| `pnpm test:e2e`  | Playwright (pendiente, issue FE-1)   |

Verificación estándar: `pnpm lint && pnpm build && pnpm test`.

## Gotchas

- La API se configura con `VITE_API_BASE_URL` en `.env.local` (default `http://localhost:3000/api`). El README puede decir `.env` pero el código usa `import.meta.env`.
- Vitest está configurado dentro de `vite.config.ts` (happy-dom, setup `src/test/setup.ts`, tests colocados `src/**/*.{test,spec}.*`, coverage v8 con thresholds).
- Los servicios deben usar `src/services/apiClient.ts` (fetchWithAuth + refresh token). No hacer `fetch` ad-hoc salvo `authService`.
- Manejo de errores: validar `res.ok` en los servicios (issue FE-15); evitar `alert()` para errores (evaluar toast, FE-16).
- Skills: el proyecto usa **Vitest**, no Jest — la skill de testing recomendada en SKILLS.md debe alinearse (FE-18).

## Estructura

`src/features/<Feature>/{components,hooks,pages}` — cada feature tiene componentes, hooks (TanStack Query) y pages. Hooks compartidos en `src/hooks/`, servicios en `src/services/`, contexts en `src/context/`.
