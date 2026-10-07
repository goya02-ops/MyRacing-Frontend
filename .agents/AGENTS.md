# AGENTS.md - MyRacing Frontend

## Contexto

Sistema de inscripción a carreras de simuladores con usuarios comunes, premium y administradores.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Vitest, Tailwind CSS 3, Radix UI, Tremor, TanStack Query, pnpm.

---

## Comandos

```bash
# Desarrollo
pnpm dev              # Servidor dev en http://localhost:5173
pnpm preview         # Preview del build

# Build y Lint
pnpm build           # tsc -b && vite build
pnpm lint            # ESLint

# Testing (TDD: test en rojo -> codigo minimo -> refactor)
pnpm test            # vitest run (una vez)
pnpm test:watch     # vitest (modo watch)
pnpm test:coverage  # Coverage (gate de main: total >=80%)
pnpm test src/lib/utils.test.ts  # Un solo archivo
```

Verificación estándar: `pnpm lint && pnpm build && pnpm test`.

---

## Environment

- **Requerido:** `.env.local` con `VITE_API_BASE_URL=http://localhost:3000/api`
- La app NO funciona sin esta variable.

---

## Estructura

```
src/
├── features/<Feature>/   # Cada feature: components/, hooks/, pages/
├── components/           # Componentes compartidos
│   └── tremor/           # Componentes vendor Tremor (no modificar salvo issue propio)
├── hooks/                # Hooks compartidos
├── services/             # apiClient + servicios (via fetchWithAuth)
├── contexts/             # React Contexts
├── types/                # Tipos y entidades
├── lib/utils.ts          # Utilidades
├── test/                 # Setup de testing (happy-dom)
└── App.tsx               # Entry point
```

Tests colocados como `src/**/*.{test,spec}.*`; config de Vitest en `vite.config.ts`.

---

## Convenciones

- **Componentes y archivos:** PascalCase (`CategoryForm.tsx`), exports nombrados
- **Imports:** Relativos (`../../../components/...`)
- **API:** TanStack Query (`useQuery`, `useMutation`); servicios via `src/services/apiClient.ts` (fetchWithAuth + refresh). No hacer `fetch` ad-hoc salvo `authService`
- **Errores:** validar `res.ok` en servicios; no usar `alert()` para errores
- **React 19:** `ref` como prop, no `forwardRef` (deprecado)

---

## Gitflow (un issue = una rama = un PR)

- Rama por issue: `feature/<id-tema>` → PR a `develop` → PR a `main` (+tag)
- Commits atómicos por paso lógico, mensaje convencional (`feat:`/`fix:`/`test:`/`refactor:`/`chore:`)
- Los gates deciden (sin aprobación humana): a `develop` solo entra con tests verdes; a `main` además con coverage ≥80% y Quality Gate verde

---

## Skills

Cargar solo cuando aplique (ver `.agents/SKILLS.md`):

- `vitest` - Testing (siempre en issues de tests)
- `typescript-advanced-types` - Tipos complejos

## Subagentes

Definiciones de referencia en `.opencode/agents/` (programador/tester/juez).
Flujo TDD y protocolo en el `AGENTS.md` raíz de DevOps.
