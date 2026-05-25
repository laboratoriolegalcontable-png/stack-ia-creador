#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# KAIROS LEGENDARIO v1.0 — Instalador Universal
# Uso: curl -fsSL [URL] | bash
# O: bash install.sh [nombre-proyecto] [tipo]
# ═══════════════════════════════════════════════════════════════

set -e

KAIROS_VERSION="3.5.0"
KAIROS_COLOR="\033[38;5;214m"  # Gold
KAIROS_GREEN="\033[38;5;82m"
KAIROS_RED="\033[38;5;196m"
KAIROS_RESET="\033[0m"
KAIROS_BOLD="\033[1m"

# ── PARSEO DE ARGUMENTOS ──
# Soporta:
#   install.sh                          → instala en directorio actual
#   install.sh nombre-proyecto [tipo]   → instala en directorio actual con nombre
#   install.sh --target /ruta/destino   → instala en ruta específica
TARGET=""
PROJECT_NAME=""
PROJECT_TYPE="auto"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target|-t)
      TARGET="$2"
      shift 2
      ;;
    --type)
      PROJECT_TYPE="$2"
      shift 2
      ;;
    --help|-h)
      echo "Uso: bash install.sh [opciones]"
      echo "  --target /ruta    Instala KAIROS en esa ruta (la crea si no existe)"
      echo "  --type [tipo]     Tipo de proyecto (auto | nextjs | express | supabase)"
      echo "  nombre-proyecto   Nombre del proyecto (default: carpeta actual)"
      exit 0
      ;;
    *)
      PROJECT_NAME="$1"
      shift
      ;;
  esac
done

# Ir al destino si se especificó --target
if [ -n "$TARGET" ]; then
  TARGET="$(realpath "$TARGET" 2>/dev/null || echo "$TARGET")"
  [ ! -d "$TARGET" ] && mkdir -p "$TARGET" && echo -e "${KAIROS_GREEN}✓ Directorio creado: ${TARGET}${KAIROS_RESET}"
  cd "$TARGET"
fi

PROJECT_NAME="${PROJECT_NAME:-$(basename "$(pwd)")}"

echo -e "${KAIROS_COLOR}${KAIROS_BOLD}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          KAIROS LEGENDARIO v${KAIROS_VERSION} — Instalando           ║"
echo "║          Proyecto: ${PROJECT_NAME}                        "
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${KAIROS_RESET}"

# ── DETECCIÓN DE STACK ──
detect_stack() {
  if [ -f "package.json" ]; then
    if grep -q '"next"' package.json 2>/dev/null; then
      echo "nextjs"
    elif grep -q '"express"' package.json 2>/dev/null; then
      echo "express"
    elif grep -q '"react"' package.json 2>/dev/null; then
      echo "react"
    else
      echo "node"
    fi
  elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
    echo "python"
  elif [ -f "Cargo.toml" ]; then
    echo "rust"
  elif [ -f "go.mod" ]; then
    echo "go"
  elif [ -f "index.html" ]; then
    echo "static"
  else
    echo "generic"
  fi
}

STACK=$(detect_stack)
echo -e "${KAIROS_GREEN}✓ Stack detectado: ${STACK}${KAIROS_RESET}"

# ── CREAR ESTRUCTURA ──
echo -e "\n${KAIROS_BOLD}Creando estructura KAIROS...${KAIROS_RESET}"

mkdir -p .claude/skills/kairos-legendario
mkdir -p .claude/commands

echo -e "${KAIROS_GREEN}✓ Directorios creados${KAIROS_RESET}"

# ── GIT INIT SI NECESARIO ──
if [ ! -d ".git" ]; then
  git init
  echo -e "${KAIROS_GREEN}✓ Git inicializado${KAIROS_RESET}"
fi

# ── CREAR/ACTUALIZAR CLAUDE.md ──
if [ ! -f "CLAUDE.md" ]; then
  cat > CLAUDE.md << CLAUDEMD
# CLAUDE.md — ${PROJECT_NAME}
## Configurado por KAIROS LEGENDARIO v${KAIROS_VERSION} — $(date +%Y-%m-%d)

## CONTEXTO DEL PROYECTO
- **Nombre:** ${PROJECT_NAME}
- **Stack:** ${STACK}
- **Instalado:** $(date +%Y-%m-%d)

## KAIROS LEGENDARIO — ACTIVACIÓN AUTOMÁTICA
Kairos Legendario está instalado. Se activa con:
- \`/kl\` — Dashboard del sistema
- \`/kl-instalar\` — Reinstalar/actualizar
- \`/kl-memoria\` — Ver memoria del sistema
- \`/kl-forge\` — Crear nuevo skill o proyecto
- \`/kl-guardian\` — Auditar el código
- \`/kl-claude-sdk\` — Incorporar Claude API

## REGLAS DEL PROYECTO
1. NUNCA pushear a main directamente
2. NUNCA hardcodear API keys
3. SIEMPRE verificar antes de pushear
4. SIEMPRE actualizar memory.md al final del sprint

## SKILLS ACTIVOS
- kairos-legendario (PRIORIDAD MÁXIMA)
- [agregar más según el proyecto]

## MEMORIA
Ver: .claude/skills/kairos-legendario/memory.md
CLAUDEMD
  echo -e "${KAIROS_GREEN}✓ CLAUDE.md creado${KAIROS_RESET}"
else
  # Agregar sección KAIROS si no existe
  if ! grep -q "KAIROS LEGENDARIO" CLAUDE.md 2>/dev/null; then
    cat >> CLAUDE.md << KAIROSBLOCK

## KAIROS LEGENDARIO — Integrado $(date +%Y-%m-%d)
Sistema autónomo activo. Comandos: /kl /kl-instalar /kl-memoria /kl-forge /kl-guardian
Memoria: .claude/skills/kairos-legendario/memory.md
KAIROSBLOCK
    echo -e "${KAIROS_GREEN}✓ CLAUDE.md actualizado con KAIROS${KAIROS_RESET}"
  else
    echo -e "${KAIROS_GREEN}✓ CLAUDE.md ya tiene KAIROS${KAIROS_RESET}"
  fi
fi

# ── CREAR memory.md INICIAL ──
if [ ! -f ".claude/skills/kairos-legendario/memory.md" ]; then
  cat > .claude/skills/kairos-legendario/memory.md << MEMMD
# KAIROS MEMORIA — ${PROJECT_NAME}
## Instalado: $(date +%Y-%m-%d)

## PROYECTO
- Stack: ${STACK}
- Estado: NUEVO

## PENDIENTES
- [ ] Configurar variables de entorno
- [ ] Primera feature

## APRENDIZAJES
[Se completa durante el desarrollo]

## DECISIONES
[Se agrega durante el desarrollo]
MEMMD
  echo -e "${KAIROS_GREEN}✓ memory.md creado${KAIROS_RESET}"
fi

# ── CREAR .env.example SEGÚN STACK ──
if [ ! -f ".env.example" ] && [ ! -f ".env.local.example" ]; then
  if [ "$STACK" = "nextjs" ]; then
    cat > .env.local.example << ENVEX
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Agregar más variables aquí
ENVEX
  elif [ "$STACK" = "express" ] || [ "$STACK" = "node" ]; then
    cat > .env.example << ENVEX
# Supabase
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Agregar más variables aquí
PORT=3000
ENVEX
  else
    cat > .env.example << ENVEX
# Variables de entorno
ANTHROPIC_API_KEY=your_anthropic_api_key
ENVEX
  fi
  echo -e "${KAIROS_GREEN}✓ .env.example creado${KAIROS_RESET}"
fi

# ── GITIGNORE ──
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << GITIGN
node_modules/
.env
.env.local
.env.*.local
dist/
.next/
__pycache__/
*.pyc
.DS_Store
GITIGN
  echo -e "${KAIROS_GREEN}✓ .gitignore creado${KAIROS_RESET}"
fi

# ── INSTALAR CLAUDE SDK SI ES NODE ──
if [ "$STACK" = "nextjs" ] || [ "$STACK" = "express" ] || [ "$STACK" = "node" ] || [ "$STACK" = "react" ]; then
  if [ -f "package.json" ] && ! grep -q '"@anthropic-ai/sdk"' package.json 2>/dev/null; then
    echo -e "\n${KAIROS_BOLD}Instalando Claude SDK...${KAIROS_RESET}"
    npm install @anthropic-ai/sdk --save 2>/dev/null && echo -e "${KAIROS_GREEN}✓ @anthropic-ai/sdk instalado${KAIROS_RESET}" || echo -e "${KAIROS_RED}⚠ Instalar manualmente: npm install @anthropic-ai/sdk${KAIROS_RESET}"
  fi
fi

# ── PRIMER COMMIT ──
git add -A 2>/dev/null
git diff --staged --quiet || git commit -m "feat: KAIROS LEGENDARIO v${KAIROS_VERSION} instalado en ${PROJECT_NAME}" 2>/dev/null && echo -e "${KAIROS_GREEN}✓ Commit inicial creado${KAIROS_RESET}"

# ── RESUMEN FINAL ──
echo -e "\n${KAIROS_COLOR}${KAIROS_BOLD}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     KAIROS LEGENDARIO — Instalación completada ✅         ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  Proyecto: ${PROJECT_NAME}"
echo "║  Stack: ${STACK}"
echo "║  Archivos creados:"
echo "║    ✓ CLAUDE.md"
echo "║    ✓ .claude/skills/kairos-legendario/memory.md"
echo "║    ✓ .env.example"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  PRÓXIMOS PASOS:"
echo "║  1. Copiar .env.example → .env y rellenar valores"
echo "║  2. Escribir /kl para ver el dashboard del sistema"
echo "║  3. Escribir /kl-forge para crear el primer feature"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${KAIROS_RESET}"
