# Socratech Motion Lab

Plataforma local para gestionar la producción audiovisual de marketing de Socratech: planificación editorial, coordinación de proyectos, cola persistente en SQLite, ejecución de agentes CLI e identidad visual oficial sobre HyperFrames.

## Requisitos previos

- **Node.js `24.22.3`** y **npm `11.19.1`** (ver `.nvmrc`).
- **Docker** y **Docker Compose** (para ejecución en contenedores).
- **CLIs opcionales de agentes** en el host:
  - `codex` (`codex-cli`) con sesión iniciada (`codex login status`).
  - `agy` (`Antigravity CLI`).

## Estructura del monorepo

```text
socratech-motion-lab/
├── apps/
│   ├── api/                 # Backend NestJS + Prisma (SQLite) + WebSockets + Event Bus + Cola persistente
│   └── web/                 # Frontend React + Vite + React Router + Zustand + TanStack Query
├── packages/
│   ├── brand/               # Tokens oficiales, ThinkerMark SVG y biblioteca React de marca
│   └── contracts/           # Contratos TypeScript compartidos y timing.schema.json
├── motion/                  # Motor HyperFrames migrado (components-library, brand-system.css, gsap, showcase)
├── assets/                  # Originales inmutables (brand-source, fonts, references)
├── docs/                    # Documentación de marca migrada, arquitectura y producción
├── workspaces/              # Workspaces aislados por proyecto (ignorado en Git)
├── start.sh                 # Script de inicio rápido (NVM + Prisma + API + Web)
└── docker-compose.yml
```

## Ejecución local (sin Docker)

### Inicio rápido (recomendado)

```bash
./start.sh
```

El script activa Node `24.22.3` vía NVM, prepara `apps/api/.env` si no existe, compila los paquetes compartidos, inicializa SQLite/Prisma si falta `dev.db` y levanta backend y frontend en paralelo (`Ctrl+C` detiene ambos).

### Paso a paso manual

```bash
# 1. Activar Node 24.22.3
nvm use

# 2. Configurar variables de entorno locales
cp .env.example apps/api/.env

# 3. Instalar dependencias (si aún no se ejecutó)
npm install

# 4. Generar cliente Prisma y aplicar migraciones SQLite
npm run prisma:generate
npm run prisma:migrate

# 5. Compilar paquetes compartidos
npm run build --workspace=@socratech/contracts
npm run build --workspace=@socratech/brand

# 6. Iniciar backend y frontend en terminales separadas
npm run dev:api
npm run dev:web
```

- **Frontend:** `http://localhost:5173`
- **Backend REST:** `http://localhost:3001/api`
- **WebSockets:** `ws://localhost:3001/ws`

## Ejecución con Docker Compose

```bash
docker compose up --build
```

> Nota: Dentro de Docker, el backend utiliza SQLite montado en `./apps/api/prisma` sin contenedor de base de datos adicional. Si necesitás ejecutar los binarios locales `codex` o `agy` instalados en tu máquina host, ejecutá `apps/api` directamente en el host con `npm run dev:api`.

## Pruebas automatizadas

```bash
npm test
```

## Identidad visual

La paleta oficial prioritaria (`#101A39`, `#121D42`, `#10204D`, `#FBFBF4`, `#CEEF62`, `#949EB9`, `#56607B`, `#FFFFFF`) y los componentes oficiales (`EditorialTitle`, `OrbitMotif`, `TechDiagram`, `ThinkerMark`, `EditorialDivider`, `BrandOutro`, `SocratechBrandShowcase`) están documentados en `docs/brand/` y expuestos en `@socratech/brand`.

**Pendiente documentado de fuentes:** `packages/brand/tokens/tokens.css` enlaza localmente `Inter-400.woff2` e `Inter-700.woff2` bajo el alias `"Manrope"` mientras se incorporan los binarios `.woff2` estáticos de `Manrope`.
