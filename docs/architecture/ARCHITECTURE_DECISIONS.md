# Arquitectura y Decisiones Técnicas — Socratech Motion Lab

## 1. Arquitectura general (Monolito modular)

- **Backend (`apps/api`):** NestJS + TypeScript, REST (`/api/*`), WebSockets (`/ws` vía Socket.IO), Event Bus interno (`@nestjs/event-emitter`) y persistencia **SQLite + Prisma**. Sin Redis ni RabbitMQ.
- **Frontend (`apps/web`):** React 19 + Vite + TypeScript, React Router, Zustand (estado de UI y feed de eventos), TanStack Query (caché e invalidación por eventos WS) y biblioteca compartida `@socratech/brand`.
- **Contratos (`packages/contracts`):** Tipos TypeScript compartidos para proyectos, tareas, resultados de agentes, capacidades de runtime y eventos WS.
- **Motor Visual (`motion/`):** HyperFrames migrado (`components-library.js`, `brand-system.css`, `gsap`, `showcase`).

## 2. Coordinación, cola persistente y recuperación ante fallos

- **SQLite como fuente de verdad:** `Project`, `Task`, `AgentRun`, `EventLog`, `KnowledgeEntry`, `ScriptDraft`.
- **Concurrencia controlada:**
  - Máximo **1 tarea `RUNNING` por proyecto**.
  - Proyectos distintos pueden ejecutarse en paralelo hasta `MAX_PARALLEL_PROJECTS` (por defecto `2`).
- **Recuperación tras reinicio (`QueueService.onModuleInit`):**
  - Toda tarea y `AgentRun` que hubiera quedado en `RUNNING` se marca automáticamente como `INTERRUPTED`, conservando cualquier salida parcial en `resultJson`.
  - **No se reintenta ni re-ejecuta automáticamente.** Requiere acción explícita del operador (`POST /api/tasks/:id/recover` o desde el dashboard).
- **Fallos de agentes:** Si un runtime no está disponible, no está autenticado o devuelve error, el ejecutor detiene la tarea en `FAILED`, conserva resultados parciales y no cambia de proveedor silenciosamente.

## 3. Runtimes de agentes verificados

- **`codex-cli`:** `codex exec --skip-git-repo-check --ephemeral --json "<prompt>"` dentro del workspace aislado del proyecto.
- **`agy-cli`:** `agy -p "<prompt>" --output-format json --add-dir <workspace>` dentro del workspace aislado del proyecto.

## 4. Estado del alcance (Implementado, Pendiente y Bloqueado)

### Implementado en esta fundación
- Migración completa de documentación de marca, tokens CSS/JSON, `ThinkerMark` SVGs, fuentes locales, originales (`assets/brand-source/`) y motor HyperFrames (`motion/`).
- Biblioteca compartida `@socratech/brand` con los componentes oficiales y su integración en el dashboard.
- Monorepo npm workspaces (`packages/contracts`, `packages/brand`, `apps/api`, `apps/web`).
- Esquema Prisma SQLite + migración inicial + `QueueService` persistente con recuperación segura.
- `RuntimeRegistryService` y `AgentExecutorService` con contrato estructurado `AgentExecutionResult` para `codex-cli` y `agy-cli`.
- Módulo `EditorialModule` base (conocimiento institucional y borradores A/B versionados).
- Dashboard React conectado al backend vía REST + WebSockets.
- Docker Compose (`api` + `web`) y pruebas unitarias en backend y frontend.

### Pendiente (siguientes hitos del pipeline)
- Generación automática de storyboard y renderizado headless completo con HyperFrames desde el coordinador.
- Pipeline de audio: locución, transcripción/ASR, sincronización, subtítulos y mezcla.
- Flujo de revisión/aprobación completo y versionado de renders finales inmutables.
- Incorporación de archivos `.woff2` estáticos de `Manrope` (actualmente mapeado localmente a `Inter-*.woff2`).

### Bloqueado / Requiere credenciales externas
- **Discord (`#motion-labs`):** Requiere token de bot institucional y configuración de canal.
- **Google Sheets / Apps Script:** Requiere URL de Apps Script institucional desplegado y permisos.
- **Google Drive:** Requiere credenciales OAuth institucionales y ID de carpeta raíz.
