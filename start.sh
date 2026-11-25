#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# 1. Cargar NVM y activar Node 24.22.3
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  nvm use 24.22.3 >/dev/null
else
  echo "Error: No se encontró NVM en $NVM_DIR. Asegurate de usar Node 24.22.3."
  exit 1
fi

# 2. Preparar .env de apps/api si no existe
if [ ! -f "apps/api/.env" ]; then
  echo "Creando apps/api/.env desde .env.example..."
  cp .env.example apps/api/.env
fi

# Cargar variables de entorno de apps/api/.env
set -a
# shellcheck source=/dev/null
. "apps/api/.env"
set +a

# 3. Asegurar paquetes compartidos compilados
if [ ! -d "packages/contracts/dist" ]; then
  echo "Compilando @socratech/contracts..."
  npm run build --workspace=@socratech/contracts
fi

if [ ! -d "packages/brand/dist" ]; then
  echo "Compilando @socratech/brand..."
  npm run build --workspace=@socratech/brand
fi

# 4. Asegurar Prisma Client y migraciones SQLite
if [ ! -f "apps/api/prisma/dev.db" ]; then
  echo "Inicializando base de datos SQLite y migraciones..."
  npm run prisma:generate
  npm run prisma:migrate
fi

# 5. Levantar backend y frontend con apagado limpio
API_PID=""
WEB_PID=""

cleanup() {
  echo ""
  echo "Deteniendo Socratech Motion Lab..."
  if [ -n "$WEB_PID" ] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
  if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Iniciando Backend API (http://localhost:${PORT:-3001}/api)..."
npm run dev:api &
API_PID=$!

echo "Iniciando Frontend Web (http://localhost:5173)..."
npm run dev:web &
WEB_PID=$!

echo "Stack iniciado. Presioná Ctrl+C para detener ambos servicios."
wait "$API_PID" "$WEB_PID"
