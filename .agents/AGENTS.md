# Contexto y Rol

Este es un sistema de inscripción a carreras de simuladores o videojuegos con usuarios comunes, premium y administradores.

**Tech Stack:** React 19, Vite 7, TypeScript 5.9, Vitest, Tailwind CSS, Radix UI, Tremor, TanStack Query, pnpm.

---

## Comandos de Desarrollo

```bash
# Desarrollo
pnpm dev                    # Iniciar servidor dev (http://localhost:5173)
pnpm preview               # Preview del build producción

# Build y Lint
pnpm build                 # Build producción (tsc -b && vite build)
pnpm lint                  # Ejecutar ESLint en todo el proyecto
pnpm lint --fix            # Ejecutar ESLint con auto-fix

# Testing - Ejecutar un único test o grupo
pnpm test                       # Ejecutar todos los tests
pnpm test:watch                 # Modo watch
pnpm test:coverage             # Coverage HTML en coverage/index.html

# Ejecutar UN SOLO archivo de test:
pnpm test src/lib/utils.test.ts

# Ejecutar test específico por nombre (regex):
pnpm test -- -t "should format"

# Ejecutar un solo archivo con filtro:
pnpm test src/lib/utils.test.ts -- --reporter=verbose
```

---

## Estilo de Código y Convenciones

### Imports y Estructura de Archivos
- Usar imports relativos desde el directorio actual: `../../../components/tremor/TremorComponents.tsx`
- Rutas de características en `src/features/[FeatureName]/`
- Componentes UI reusable en `src/components/tremor/` y `src/components/`
- Utilidades en `src/lib/utils.ts`
- Hooks custom en `src/hooks/`
- Tipos globales en `src/types/`
- No agregar comentarios innecesarios a menos que el usuario lo pida explícitamente

### Nomenclatura
- **Componentes:** PascalCase (`LoginForm`, `RaceList`)
- **Funciones/Variables:** camelCase (`onChange`, `formData`)
- **Constantes:** UPPER_SNAKE_CASE para configs/options
- **Archivos:** kebab-case (`login-form.tsx`, `utils.ts`)
- **Types/Interfaces:** PascalCase (`UserData`, `RaceProps`)

### TypeScript
- Preferir `interface` sobre `type` para objetos públicos
- Usar `type Props = { ... }` para props de componentes
- Evitar `any`; si es necesario, documentar por qué
- Tipar funciones con parámetros y retornos explícitos
- Usar utility types cuando aplique (`Partial`, `Required`, `Pick`, `Omit`)
- Usar `satisfies` para validaciones de tipos sin perder inferencia

### Componentes React
- Usar funciones componentes con TypeScript
- Exportar como funciones nombradas: `export function LoginForm(...)`
- Props con destructuring y valores por defecto
- Usar `className` para estilos Tailwind
- Preferir composición sobre herencia
- Usar `forwardRef` solo cuando sea necesario para refs externas

### Estilos (Tailwind CSS)
- Preferir clases Tailwind sobre estilos inline
- Usar `clsx` o `tailwind-merge` (`tw`) para combinar clases condicionales
- Componentes Tremor para dashboards y UI compleja
- Componentes Radix UI para accesibilidad (Dialog, Select, Tabs, etc.)
- Usar `@tailwindcss/forms` para estilos de formularios

### TanStack Query
- Usar `useQuery` y `useMutation` para fetch de datos
- Manejar estados de loading, error y success explícitamente
- Invalidar queries después de mutaciones
- Usar `select` para transformar datos
- Configurar `staleTime` apropiado (por defecto 5min)

### Error Handling
- Usar try/catch para operaciones asíncronas
- Mostrar errores en UI mediante Toast Context
- Tipar errores de API explícitamente
- Implementar Error Boundaries para capturar errores de componentes

### ESLint Rules
- Plugins: `@eslint-react/eslint-plugin`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Reglas configuradas:
  - `@eslint-react/no-missing-key`: warn
  - `@eslint-react/dom/no-missing-button-type`: off
  - `@typescript-eslint/no-explicit-any`: off

### Testing (Vitest)
- Archivos de test: `*.test.ts` o `*.test.tsx` junto al código
- Nombres descriptivos: `describe('LoginForm', () => { it('should show error on invalid credentials', ...) })`
- Usar `@testing-library/react`, `@testing-library/jest-dom`
- Configuración en `vite.config.ts` (environment: happy-dom)
- Usar `user-event` para interacciones de usuario
- Setup file: `src/test/setup.ts`

---

## Reglas de Git y Desarrollo

- **PROHIBIDO HACER COMMITS:** No tienes permitido ejecutar `git commit`, `git push` ni crear Pull Requests.
- **Acceso a Ramas:** Sí tienes permitido usar `git checkout`, `git fetch`, `git worktree`.
- **Docker:** El proyecto se levanta con contenedores Docker. Si necesitas el backend y no responde, puedes levantarlo tú mismo.

---

## Integración con Linear MCP

- Usar herramientas MCP de Linear para gestión de tareas.
- Crear y asignar tareas en Linear cuando detectes necesidades o fallas.
- Actualizar estado de tareas al finalizar implementaciones.

---

## Skills Registry

Cargar skills SOLO cuando la tarea lo requiera:

1. **UI/Layout:** `frontend-design` (disponible en .agents/skills/)
2. **Componentes complejos:** `component-refactoring` (si complexity > 50 o lineCount > 300)
3. **Docker:** `docker-expert` o `multi-stage-dockerfile`
4. **MySQL/Postgres:** `mysql` o `neon-postgres`
5. **Testing:** `vitest` para testing con Vitest
6. **TypeScript avanzado:** `typescript-advanced-types` para tipos complejos
7. **Encontrar skills:** `find-skills` para descubrir nuevas skills

---

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── tremor/          # Componentes Tremor
├── features/           # Funcionalidades por dominio
│   └── [FeatureName]/
├── hooks/              # Hooks custom
├── lib/                # Utilidades y configs
│   └── utils.ts
├── pages/              # Páginas principales
├── routes/             # Configuración de rutas
├── types/              # Tipos globales
├── test/               # Setup de testing
└── App.tsx             # Componente principal
```

---

## Estado del Proyecto

- Testing: Suite configurada con Vitest. Tests en `src/lib/utils.test.ts`.
- La mayoría de componentes NO tienen tests aún.
- Puedes crear nuevos tests siguiendo las convenciones de testing.
- Pagos: Mercadopago SDK configurado (`@mercadopago/sdk-react`)
