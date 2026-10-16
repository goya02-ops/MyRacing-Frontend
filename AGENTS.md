# AGENTS.md - MyRacing Frontend

React 19 + Vite 7 + TS + Tailwind 3/Tremor + TanStack Query. pnpm 12, Node 22.

Metodología, gates, E2E de pagos, Sonar y skills: ver `../AGENTS.md` (raíz DevOps, fuente canónica).

## Verificación

`pnpm lint` (`eslint . --max-warnings 0`) · `pnpm build` (`tsc -b && vite build`)
`pnpm test` (`vitest run`) · `pnpm test:coverage` · `pnpm test:e2e` (`playwright test`)

Estándar: `pnpm lint && pnpm build && pnpm test`. Un archivo: `pnpm test <archivo>`.

## Env

`.env.local` (ver `.env.example`): `VITE_API_BASE_URL` + `VITE_MP_PUBLIC_KEY`.
Se lee vía `import.meta.env` (`services/apiClient.ts:1-2`).

## API y estructura

- Servicios vía `fetchWithAuth` (`services/apiClient.ts`, con refresh-token); solo
  `authService.ts` usa `fetch` crudo. Validar `res.ok` (patrón `throwIfNotOk` en `apiService.ts`).
- `src/features/<Feature>/{components,hooks,pages}`; compartidos en `src/hooks/`,
  `src/services/`, `src/context/` (singular).
- No tocar `src/components/tremor/` salvo que se pida (migración MUI en curso).
- Preferir toasts para errores de UX (convención suave, sin lint que lo imponga).

## Quirks propios

- Vitest en `vite.config.ts` (happy-dom, setup `src/test/setup.ts`). Tests que lean
  el repo: `process.cwd()` + `join`, nunca `import.meta.url` (`test/ci-gate.test.ts`).
- E2E full-stack con `reuseExistingServer` (`playwright.config.ts`); detalle de pagos
  en el AGENTS.md raíz. Browsers: `pnpm exec playwright install --with-deps chromium`
  (nunca `npx`). Local: backend en `:3000`, override con `PLAYWRIGHT_BASE_URL`.
- MCP `mui` local vía `pnpm exec mcp` (ver `opencode.json`); deploy Vercel auto a `main`.
