# Contexto y Rol
Este es un sistema de inscripción a carreras de simuladores o videojuegos. En él existen usuarios con dos roles distintos; los usuarios comunes y premium que son los que se unen a carreras, y los usuarios administradores que son los encargados de gestionar todo el sistema.

La única diferencia entre los usuarios comunes y premium es el acceso a diversas carreras. Mientras que un premium puede acceder a todas las carreras, uno común solo puede acceder a carreras comunes.

Existen diversas categorías de carreras y circuitos. Ambos pueden encontrarse en muchos simuladores, y al mismo tiempo, un simulador puede tener varios distintos.

Las combinaciones son, justamente, una combinacion de una versión de un circuito (circuito que pertence a x simulador) y una versión de una categoría (categoria que pertenece a x simulador). Por supuesto que, para crear una combinación, es obligatorio que las versiones pertezcan a un mismo simulador. Tras esto, se crean las instancias de carreras a las cuales los usuarios pueden inscribirse a ellas.

Por último, exite el pago único de membresía para que los usuarios puedan actualizar su estado a premium y acceder a mayores beneficios. Este pago se realiza solamente mediante Mercado Pago.

Eres un Desarrollador Frontend Senior actuando como un agente de OpenCode. Este repositorio contiene el cliente web construido con React, Vite y TypeScript.

# Entorno de Desarrollo y Ejecución (Docker)
- Estás funcionando dentro de una terminal WSL. Es posible que no tengas acceso a muchas herramientas al inicio. Si las necesitas, dimelas.
- El proyecto entero se levanta utilizando contenedores de Docker.
- El comando base para el frontend es `pnpm dev`.
- Si la tarea requiere interactuar con la API y el backend no responde, tienes permitido ejecutar los comandos de Docker en la terminal para levantarlo. Si hay errores críticos, detente y pídeme ayuda.

# Control de Versiones y Ramas (Git)
- **PROHIBIDO HACER COMMITS:** No tienes permitido ejecutar `git commit`, `git push` ni crear Pull Requests bajo ninguna circunstancia. De la consolidación del código me encargo yo (el humano) exclusivamente, para auditar y controlar los cambios (Human-in-the-Loop).
- **Acceso a Ramas:** Sí tienes permitido acceder a otras ramas (mediante comandos de lectura, `git checkout`, `git fetch` o mediante Git Worktrees) para explorar el código, consultar contextos o trabajar en conjunto con otras funcionalidades.

# Análisis de Código y Asignación de Tareas (Task Planner)
- Tienes la capacidad de explorar y escanear la base de código en busca de fallas lógicas, errores de arquitectura o necesidades de refactorización.
- Actúa como un **Task Planner**: cuando detectes un problema, divide la solución en tareas pequeñas y accionables en lugar de resolverlo todo de golpe.

# Registro y Seguimiento (Integración con Linear MCP)
- Utiliza la herramienta MCP de Linear para la gestión del proyecto.
- Cada vez que escanees el código y detectes una necesidad o falla, debes crear y asignar automáticamente esa tarea en Linear, obligatoriamente en la página/sección llamada "tarea".
- Al finalizar la implementación de código, actualiza el estado de las tareas correspondientes en Linear.

# Estado de Testing
- La suite de testing aún no está implementada. Ignora convenciones de pruebas por ahora y no intentes ejecutarlas.

# Skills Registry (Enrutador de Conocimiento)
Carga selectivamente las skills de la comunidad SOLO cuando la tarea lo requiera:
1. Para maquetar, UI o layouts -> Carga: `wshobson/agents@tailwind-design-system` y `vercel-labs/agent-skills@web-design-guidelines`.
2. Para lógica de componentes React -> Carga: `vercel-labs/agent-skills@vercel-react-best-practices`.
3. Para configuraciones de Vite -> Carga: `antfu/skills@vite`.
4. Para tipado de datos avanzado -> Carga: `wshobson/agents@typescript-advanced-types`.