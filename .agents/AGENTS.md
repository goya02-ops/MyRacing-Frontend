# AGENTS.md - MyRacing Frontend

## Contexto

Sistema de inscripción a carreras de simuladores con usuarios comunes, premium y administradores.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Vitest, Tailwind CSS, Radix UI, Tremor, TanStack Query, pnpm.

---

## Comandos

```bash
# Desarrollo
pnpm dev              # Servidor dev en http://localhost:5173
pnpm preview         # Preview del build

# Build y Lint
pnpm build           # tsc -b && vite build
pnpm lint            # ESLint
pnpm lint --fix      # ESLint con auto-fix

# Testing
pnpm test            # vitest run (una vez)
pnpm test:watch     # vitest (modo watch)
pnpm test:coverage  # Coverage en coverage/index.html
pnpm test src/lib/utils.test.ts  # Un solo archivo
pnpm test -- -t "pattern"       # Filtrar por nombre
```

---

## Environment

- **Requerido:** `.env.local` con `VITE_API_BASE_URL=http://localhost:3000/api`
- La app NO funciona sin esta variable.

---

## Estructura

```
src/
├── components/        # Componentes reusable
│   └── tremor/       # Componentes Tremor
├── pages/           # Páginas principales
├── hooks/           # Hooks custom
├── lib/utils.ts     # Utilidades
├── types/           # Tipos globales
├── context/         # React Contexts
├── utils/           # Utilidades por dominio
├── test/           # Setup de testing
└── App.tsx         # Entry point
```

---

## Convenciones

- **Imports:** Relativos (`../../../components/...`)
- **Archivos:** kebab-case (`login-form.tsx`)
- **Componentes:** PascalCase, exports nombrados
- **Estilos:** Tailwind con `clsx`/`tw` para condicionales
- **API:** TanStack Query (`useQuery`, `useMutation`)
- **No commits:** Prohibido `git commit`, `git push`, PRs

---

## Skills

Cargar solo cuando aplique:

- `frontend-design` - UI/layout
- `component-refactoring` - Si complexity > 50 o 300+ líneas
- `docker-expert` / `multi-stage-dockerfile`
- `mysql` / `neon-postgres`
- `vitest`
- `typescript-advanced-types`