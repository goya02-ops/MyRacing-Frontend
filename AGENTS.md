# AGENTS.md - MyRacing Frontend

React 19 + Vite 7 + TypeScript + Tailwind 3/Tremor + TanStack Query. pnpm 12, Node 22.

## Verificación

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Vite dev server (port 5173)          |
| `pnpm build`     | `tsc -b && vite build`               |
| `pnpm lint`      | eslint con `--max-warnings 0` (gate)     |
| `pnpm test`      | Vitest (happy-dom, setup src/test)   |
| `pnpm test:e2e`  | Playwright (job E2E full stack en CI) |

Verificación estándar: `pnpm lint && pnpm build && pnpm test`.

**Branch protection**: merge a `develop` se bloquea si fallan los tests. Merge a `main` exige además cobertura ≥80% (vitest coverage thresholds) y Quality Gate de SonarCloud verde.
Comandos extra: `pnpm dev`, `pnpm test:watch`, `pnpm test:coverage`,
`pnpm test <archivo>` (un solo archivo).

## Environment

- **Requerido:** `.env.local` con `VITE_API_BASE_URL=http://localhost:3000/api`
  (más `VITE_MP_PUBLIC_KEY` para pagos). La app NO funciona sin estas variables.

## Gotchas

- La API se configura con `VITE_API_BASE_URL` en `.env.local` (default `http://localhost:3000/api`). El README puede decir `.env` pero el código usa `import.meta.env`.
- Vitest está configurado dentro de `vite.config.ts` (happy-dom, setup `src/test/setup.ts`, tests colocados `src/**/*.{test,spec}.*`, coverage v8 con thresholds).
- Los tests que lean archivos del repo deben resolver rutas con `process.cwd()` + `join`: happy-dom no expone `import.meta.url` con esquema `file:` (ver `src/test/ci-gate.test.ts`).
- E2E local requiere browsers: `pnpm exec playwright install --with-deps chromium` (nunca `npx`, Sonar S6505/S8543).
- Los servicios deben usar `src/services/apiClient.ts` (fetchWithAuth + refresh token). No hacer `fetch` ad-hoc salvo `authService`.
- Manejo de errores: validar `res.ok` en los servicios; errores de UX via toasts (no `alert()`).
- E2E de pagos contra sandbox MP real (detalle en `e2e/payment/seed.ts` y
  `e2e/payment/helpers.ts`): seed login-first (rate-limit 5 req/15min/IP),
  emails `@test.com` válidos, no tipear iframes de MP, `test.setTimeout()`,
  `trace` + `screenshot` on failure, DB efímera requerida. Estrategia
  mock-vs-real pendiente de unificar entre specs.
- En código prohibido referenciar issues (ver metodología en el
  `AGENTS.md` raíz de DevOps). Commits/PRs/issues sí las nombran.
- Si algo cruza al otro repo (API, auth, pagos), elevar al chat orquestador
  en vez de asumir (ver multi-chat en el `AGENTS.md` raíz).
- Skills: testing con **Vitest** (no Jest); `tdd` siempre en issues de tests;
  `react-best-practices`, `composition-patterns`, `playwright-best-practices`
  cuando apliquen (vendoreadas en `.agents/skills/`).
  Subagentes de referencia en `.opencode/agents/` (programador/tester/juez;
  flujo TDD en el `AGENTS.md` raíz de DevOps).

## Estructura

`src/features/<Feature>/{components,hooks,pages}` — cada feature tiene componentes, hooks (TanStack Query) y pages. Hooks compartidos en `src/hooks/`, servicios en `src/services/`, contexts en `src/context/`.

## Convenciones

- **Componentes y archivos:** PascalCase (`CategoryForm.tsx`), exports nombrados.
- **Imports:** relativos (`../../../components/...`).
- **API:** TanStack Query (`useQuery`, `useMutation`); servicios via `src/services/apiClient.ts` (fetchWithAuth + refresh). No hacer `fetch` ad-hoc salvo `authService`.
- **React 19:** `ref` como prop, no `forwardRef` (deprecado).
- **Tremor:** no tocar `src/components/tremor/` salvo que el issue lo pida
  (está en curso la migración a MUI).
