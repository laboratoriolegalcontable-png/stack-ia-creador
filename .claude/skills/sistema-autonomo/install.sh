#!/usr/bin/env bash
# =============================================================================
# SISTEMA AUTÓNOMO DE AGENTES (SAA) — Installer Universal v1.0
# Estudio Oro S.A.S. / Diego Orosa
#
# Uso:
#   bash install.sh                    # Instala en directorio actual
#   bash install.sh /ruta/al/proyecto  # Instala en ruta específica
#   bash install.sh --dry-run          # Muestra qué haría sin ejecutar
# =============================================================================

set -euo pipefail

# ─── Colores ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Config ─────────────────────────────────────────────────────
SAA_VERSION="1.0.0"
SAA_DATE=$(date +%Y-%m-%d)
DRY_RUN=false
TARGET_DIR="${1:-$(pwd)}"

# ─── Parse args ───────────────────────────────────────────────────
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  TARGET_DIR="${2:-$(pwd)}"
fi

# ─── Source dir ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SOURCE="$(dirname "$SCRIPT_DIR")"

# ─── Funciones ────────────────────────────────────────────────────
log()  { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }
dry()  { echo -e "${CYAN}[DRY-RUN] $1${NC}"; }

run() {
  if $DRY_RUN; then dry "$*"; else eval "$@"; fi
}

# ─── Detectar tipo de proyecto ────────────────────────────────────────────
detect_project_type() {
  local dir="$1"
  if [[ -f "$dir/src/api/routes.ts" ]]; then echo "diego-orosa"
  elif [[ -f "$dir/public/sw.js" ]] && [[ -f "$dir/public/manifest.json" ]]; then echo "pwa-vanilla"
  elif [[ -f "$dir/next.config.js" ]] || [[ -f "$dir/next.config.ts" ]] || [[ -f "$dir/next.config.mjs" ]]; then echo "nextjs"
  elif [[ -f "$dir/supabase/config.toml" ]] || [[ -d "$dir/supabase/functions" ]]; then echo "supabase"
  elif [[ -f "$dir/package.json" ]]; then echo "node"
  elif [[ -f "$dir/requirements.txt" ]] || [[ -f "$dir/pyproject.toml" ]]; then echo "python"
  elif [[ -f "$dir/index.html" ]]; then echo "static"
  else echo "generic"
  fi
}

# ─── Banner ─────────────────────────────────────────────────────
echo -e "${BOLD}${BLUE}"
cat << 'EOF'
 ╔═══════════════════════════════════════════════════════════╗
 ║   SISTEMA AUTÓNOMO DE AGENTES (SAA) v1.0                 ║
 ║   Estudio Oro S.A.S. / Diego Orosa                       ║
 ╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

if $DRY_RUN; then
  warn "MODO DRY-RUN: mostrando acciones sin ejecutar"
fi

info "Directorio destino: $TARGET_DIR"
PROJECT_TYPE=$(detect_project_type "$TARGET_DIR")
info "Tipo de proyecto detectado: ${BOLD}$PROJECT_TYPE${NC}"

# ─── PASO 1: Estructura base ─────────────────────────────────────────────────
CLAUDE_DIR="$TARGET_DIR/.claude"
run "mkdir -p '$CLAUDE_DIR/skills/sistema-autonomo/subagents'"
run "mkdir -p '$CLAUDE_DIR/skills/sistema-autonomo/hooks'"
run "mkdir -p '$CLAUDE_DIR/memory'"
run "mkdir -p '$CLAUDE_DIR/hooks'"
run "mkdir -p '$CLAUDE_DIR/agents'"
log "Estructura de directorios creada"

# ─── PASO 2: Copiar sistema-autonomo skill ──────────────────────────────────────────
DEST_SKILL="$CLAUDE_DIR/skills/sistema-autonomo"

if [[ -d "$SCRIPT_DIR" ]] && ! $DRY_RUN; then
  cp -r "$SCRIPT_DIR/." "$DEST_SKILL/"
  log "Skill sistema-autonomo instalado desde fuente"
else
  dry "Copiar: $SCRIPT_DIR → $DEST_SKILL"
  log "Skill sistema-autonomo instalado (dry)"
fi

# ─── PASO 3: Memoria inicial ───────────────────────────────────────────────────
MEMORY_FILE="$CLAUDE_DIR/memory/sistema-autonomo.md"

if [[ ! -f "$MEMORY_FILE" ]] || $DRY_RUN; then
  if $DRY_RUN; then
    dry "Crear: $MEMORY_FILE"
  else
    cat > "$MEMORY_FILE" << MDEOF
# SISTEMA AUTÓNOMO DE AGENTES — Memoria Persistente
## Instalado: $SAA_DATE
## Versión: $SAA_VERSION
## Proyecto: $PROJECT_TYPE

## Estado del Sistema
- Instalación: ✅ Completa
MDEOF
  fi
  log "Memoria inicial creada"
else
  log "Memoria existente preservada"
fi

# ─── PASO 4: settings.json ────────────────────────────────────────────────────
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

if [[ -f "$SETTINGS_FILE" ]]; then
  if grep -q "saa-session-start\|sistema-autonomo" "$SETTINGS_FILE" 2>/dev/null; then
    log "Hook SAA ya configurado en settings.json"
  else
    warn "settings.json existe — agregar manualmente el hook SAA si es necesario"
  fi
else
  if ! $DRY_RUN; then
    cat > "$SETTINGS_FILE" << 'SETTINGSEOF'
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/skills/sistema-autonomo/hooks/session-start.sh",
            "timeout": 15,
            "statusMessage": "🤖 SAA v1.0 — cargando memoria y sub-agentes..."
          }
        ]
      }
    ]
  }
}
SETTINGSEOF
  fi
  log "settings.json creado"
fi

# ─── PASO 5: Commit ───────────────────────────────────────────────────────────────
if $DRY_RUN; then
  dry "git add .claude/ && git commit -m 'feat(saa): SAA v$SAA_VERSION'"
else
  cd "$TARGET_DIR"
  if git rev-parse --git-dir > /dev/null 2>&1; then
    git add .claude/ 2>/dev/null || true
    git commit -m "feat(saa): Sistema Autónomo de Agentes v$SAA_VERSION — $PROJECT_TYPE" 2>/dev/null || true
    log "Commit inicial creado"
  else
    warn "No es un repositorio git — commit omitido"
  fi
fi

# ─── Resumen ─────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}${GREEN}"
cat << EOF
 ╔═══════════════════════════════════════════════════════════╗
 ║   ✅ SAA v$SAA_VERSION INSTALADO EXITOSAMENTE               ║
 ╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo -e "${BOLD}Proyecto:${NC} $PROJECT_TYPE | ${BOLD}Directorio:${NC} $TARGET_DIR"
echo -e "Usen ${CYAN}/saa${NC} para ver el estado del sistema"
