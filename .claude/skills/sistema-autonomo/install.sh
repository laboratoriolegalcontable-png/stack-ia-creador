#!/usr/bin/env bash
# =============================================================================
# SISTEMA AUTÓNOMO DE AGENTES (SAA) — Installer Universal v1.0
# Estudio Oro S.A.S. / Diego Orosa
#
# Uso:
#   bash install.sh                    # Instala en directorio actual
#   bash install.sh /ruta/al/proyecto  # Instala en ruta específica
#   bash install.sh --dry-run          # Muestra qué haría sin ejecutar
#
# Lo que instala:
#   1. .claude/skills/sistema-autonomo/ (este sistema)
#   2. .claude/skills/kairos-legendario/ (si no existe)
#   3. .claude/memory/sistema-autonomo.md (memoria inicial)
#   4. .claude/hooks/saa-session-start.sh (hook de sesión)
#   5. Actualiza .claude/settings.json (agrega hooks + permisos)
#   6. Actualiza CLAUDE.md (sección SAA)
#   7. Commit inicial
# =============================================================================

set -euo pipefail

# ─── Colores ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Config ───────────────────────────────────────────────────────────────────
SAA_VERSION="1.0.0"
SAA_DATE=$(date +%Y-%m-%d)
DRY_RUN=false
TARGET_DIR="${1:-$(pwd)}"

# ─── Parse args ───────────────────────────────────────────────────────────────
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  TARGET_DIR="${2:-$(pwd)}"
fi

# ─── Source dir (donde está este script) ──────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_SOURCE="$(dirname "$SCRIPT_DIR")"

# ─── Funciones ────────────────────────────────────────────────────────────────
log()  { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }
dry()  { echo -e "${CYAN}[DRY-RUN] $1${NC}"; }
head() { echo -e "\n${BOLD}${BLUE}━━━ $1 ━━━${NC}"; }

run() {
  if $DRY_RUN; then dry "$*"; else eval "$@"; fi
}

mkfile() {
  local path="$1"; shift
  local content="$*"
  if $DRY_RUN; then
    dry "Crear: $path"
  else
    mkdir -p "$(dirname "$path")"
    echo "$content" > "$path"
  fi
}

# ─── Detectar tipo de proyecto ────────────────────────────────────────────────
detect_project_type() {
  local dir="$1"

  if [[ -f "$dir/src/api/routes.ts" ]]; then
    echo "diego-orosa"
  elif [[ -f "$dir/public/sw.js" ]] && [[ -f "$dir/public/manifest.json" ]]; then
    echo "pwa-vanilla"
  elif [[ -f "$dir/next.config.js" ]] || [[ -f "$dir/next.config.ts" ]] || [[ -f "$dir/next.config.mjs" ]]; then
    echo "nextjs"
  elif [[ -f "$dir/supabase/config.toml" ]] || [[ -d "$dir/supabase/functions" ]]; then
    echo "supabase"
  elif [[ -f "$dir/package.json" ]]; then
    local pkg
    pkg=$(cat "$dir/package.json" 2>/dev/null || echo "{}")
    if echo "$pkg" | grep -q '"express"'; then
      echo "express"
    elif echo "$pkg" | grep -q '"react"'; then
      echo "react"
    else
      echo "node"
    fi
  elif [[ -f "$dir/requirements.txt" ]] || [[ -f "$dir/pyproject.toml" ]]; then
    echo "python"
  elif [[ -f "$dir/index.html" ]]; then
    echo "static"
  else
    echo "generic"
  fi
}

# ─── Banner ──────────────────────────────────────────────────────────────────
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
head "PASO 1: Estructura .claude/"

CLAUDE_DIR="$TARGET_DIR/.claude"
run "mkdir -p '$CLAUDE_DIR/skills/sistema-autonomo/subagents'"
run "mkdir -p '$CLAUDE_DIR/skills/sistema-autonomo/hooks'"
run "mkdir -p '$CLAUDE_DIR/memory'"
run "mkdir -p '$CLAUDE_DIR/hooks'"
run "mkdir -p '$CLAUDE_DIR/agents'"
log "Estructura de directorios creada"

# ─── PASO 2: Copiar sistema-autonomo skill ────────────────────────────────────
head "PASO 2: Instalando skill sistema-autonomo"

DEST_SKILL="$CLAUDE_DIR/skills/sistema-autonomo"

if [[ -d "$SCRIPT_DIR" ]] && ! $DRY_RUN; then
  cp -r "$SCRIPT_DIR/." "$DEST_SKILL/"
  log "Skill sistema-autonomo instalado desde fuente"
else
  dry "Copiar: $SCRIPT_DIR → $DEST_SKILL"
  log "Skill sistema-autonomo instalado (dry)"
fi

# ─── PASO 3: Copiar kairos-legendario ────────────────────────────────────────
head "PASO 3: Verificando KAIROS LEGENDARIO"

KAIROS_DEST="$CLAUDE_DIR/skills/kairos-legendario"
KAIROS_SOURCE="$SKILLS_SOURCE/kairos-legendario"

if [[ -d "$KAIROS_DEST" ]]; then
  log "KAIROS LEGENDARIO ya existe — manteniendo versión actual"
elif [[ -d "$KAIROS_SOURCE" ]]; then
  run "cp -r '$KAIROS_SOURCE' '$KAIROS_DEST'"
  log "KAIROS LEGENDARIO instalado desde fuente"
else
  warn "KAIROS LEGENDARIO no encontrado — instalar manualmente con /kairos-legendario"
fi

# ─── PASO 4: Memoria inicial ─────────────────────────────────────────────────
head "PASO 4: Inicializando memoria persistente"

MEMORY_FILE="$CLAUDE_DIR/memory/sistema-autonomo.md"

if [[ ! -f "$MEMORY_FILE" ]] || $DRY_RUN; then
  MEMORY_CONTENT="# SISTEMA AUTÓNOMO DE AGENTES — Memoria Persistente
## Instalado: $SAA_DATE
## Versión: $SAA_VERSION
## Proyecto: $PROJECT_TYPE

## Estado del Sistema
- Instalación: ✅ Completa
- @memoria: activo
- @guardian: activo
- @deployer: activo
- @backend-gen: $([ "$PROJECT_TYPE" = "diego-orosa" ] || [ "$PROJECT_TYPE" = "express" ] && echo "activo" || echo "standby")
- @frontend-gen: $([ "$PROJECT_TYPE" = "pwa-vanilla" ] || [ "$PROJECT_TYPE" = "nextjs" ] || [ "$PROJECT_TYPE" = "react" ] && echo "activo" || echo "standby")
- @kairos-link: activo
- @mejorador: activo

## Sesiones
<!-- El sistema actualiza esto automáticamente -->
| Fecha | Tareas | Sub-agentes | Aprendizajes |
|-------|--------|-------------|--------------|
| $SAA_DATE | Instalación inicial | todos | ninguno |

## Aprendizajes Acumulados
<!-- @mejorador escribe aquí después de cada sesión -->

## Mejoras Pendientes
<!-- Items detectados por @mejorador -->
- [ ] Completar configuración para proyecto tipo: $PROJECT_TYPE

## Contexto KAIROS Activo
- CCC 28.979/2020: monitorear
- FB/IG tokens Make.com: vencen 29/05/2026
- Paula bot sin número: pendiente
- MP_WEBHOOK_SECRET: pendiente

## Skills Más Usados Esta Semana
<!-- Actualizado por @mejorador -->

## Errores Frecuentes Detectados
<!-- Actualizado por @guardian -->

## Notas de Sesión
<!-- Notas importantes que deben persistir -->
"
  if $DRY_RUN; then
    dry "Crear: $MEMORY_FILE"
  else
    echo "$MEMORY_CONTENT" > "$MEMORY_FILE"
  fi
  log "Memoria inicial creada"
else
  log "Memoria existente preservada"
fi

# ─── PASO 5: Hook de sesión ───────────────────────────────────────────────────
head "PASO 5: Instalando hook SAA SessionStart"

HOOK_FILE="$CLAUDE_DIR/hooks/saa-session-start.sh"
cat > /tmp/saa-session-hook.sh << 'HOOKEOF'
#!/usr/bin/env bash
# SAA — SessionStart Hook
# Carga memoria persistente e inyecta contexto del Sistema Autónomo de Agentes

set -uo pipefail

MEMORY_FILE="$(cd "$(dirname "$0")/.." && pwd)/memory/sistema-autonomo.md"
SKILLS_DIR="$(cd "$(dirname "$0")/.." && pwd)/skills"
SAA_VERSION="1.0.0"

# Leer memoria si existe
MEMORY_CONTEXT=""
if [[ -f "$MEMORY_FILE" ]]; then
  MEMORY_CONTEXT=$(cat "$MEMORY_FILE" 2>/dev/null || echo "")
fi

# Detectar proyecto
PROJECT_TYPE="generic"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [[ -f "$REPO_ROOT/src/api/routes.ts" ]]; then PROJECT_TYPE="diego-orosa"
elif [[ -f "$REPO_ROOT/public/sw.js" ]]; then PROJECT_TYPE="pwa-vanilla"
elif [[ -f "$REPO_ROOT/next.config.js" ]] || [[ -f "$REPO_ROOT/next.config.ts" ]]; then PROJECT_TYPE="nextjs"
fi

# Output para Claude Code (additionalContext)
python3 - << PYEOF
import json

memory = """$MEMORY_CONTEXT"""
project_type = "$PROJECT_TYPE"
version = "$SAA_VERSION"

lines = [
    "# 🤖 SISTEMA AUTÓNOMO DE AGENTES (SAA) v" + version + " — ACTIVO",
    "",
    "## Sub-agentes activos esta sesión:",
    "- **@memoria** → Lee/escribe .claude/memory/sistema-autonomo.md",
    "- **@guardian** → Vigila calidad después de cada Edit/Write",
    "- **@deployer** → Orquesta deploys automáticamente",
    "- **@kairos-link** → Filtra por directivas EON (responde siempre 'Doctor,')",
    "- **@mejorador** → Mejora el sistema al final de la sesión",
    "",
    "## Proyecto detectado: " + project_type,
]

if project_type == "diego-orosa":
    lines += [
        "- **@backend-gen** → ACTIVO (Express + Supabase)",
        "- Patrón de módulos: src/shared/*.ts + rutas en routes.ts",
        "- Tests: tests/*.test.ts",
    ]
elif project_type == "pwa-vanilla":
    lines += [
        "- **@frontend-gen** → ACTIVO (Vanilla JS PWA)",
        "- Patrón: public/app.js + styles.css (sin frameworks)",
        "- Service Worker: public/sw.js",
    ]
elif project_type == "nextjs":
    lines += [
        "- **@frontend-gen** → ACTIVO (Next.js + Vercel)",
    ]

if memory:
    lines += [
        "",
        "## 💾 Memoria de sesiones anteriores:",
        memory[:800] + ("..." if len(memory) > 800 else ""),
    ]

lines += [
    "",
    "## ⚡ Comandos SAA disponibles:",
    "/saa status | /saa memoria | /gen-module [nombre] | /gen-ui [nombre] | /deploy | /guardian",
    "",
    "## 🔗 KAIROS LEGENDARIO integrado:",
    "Todas las respuestas importantes con prefijo 'Doctor,' según protocolo EON.",
]

output = {
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": "\n".join(lines)
    }
}
print(json.dumps(output))
PYEOF
HOOKEOF

if $DRY_RUN; then
  dry "Crear: $HOOK_FILE"
else
  cp /tmp/saa-session-hook.sh "$HOOK_FILE"
  chmod +x "$HOOK_FILE"
fi
log "Hook SAA SessionStart instalado"

# ─── PASO 6: Actualizar settings.json ────────────────────────────────────────
head "PASO 6: Actualizando .claude/settings.json"

SETTINGS_FILE="$CLAUDE_DIR/settings.json"

if [[ ! -f "$SETTINGS_FILE" ]]; then
  # Crear settings desde cero según el tipo de proyecto
  if $DRY_RUN; then
    dry "Crear: $SETTINGS_FILE"
  else
    case "$PROJECT_TYPE" in
      diego-orosa)
        cat > "$SETTINGS_FILE" << 'SETTINGSEOF'
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bash .claude/hooks/saa-session-start.sh",
        "timeout": 15000,
        "description": "SAA — Sistema Autónomo de Agentes v1.0"
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "matcher": "Edit|Write",
        "command": "npx eslint --fix $CLAUDE_FILE 2>/dev/null || true",
        "timeout": 15000,
        "description": "@guardian: ESLint auto-fix"
      }
    ]
  },
  "permissions": {
    "allow": [
      "Skill",
      "Read",
      "Glob",
      "Grep",
      "Bash(git*)",
      "Bash(npm run*)",
      "Bash(npm test*)",
      "Bash(npx eslint*)",
      "Bash(npx jest*)",
      "Bash(npx tsc*)",
      "Bash(node*)",
      "Bash(ls*)",
      "Bash(find*)",
      "Bash(echo*)"
    ],
    "deny": [
      "Read(.env*)",
      "Edit(.env*)",
      "Write(.env*)",
      "Read(*.pem)",
      "Read(*.key)",
      "Edit(secrets/**)",
      "Write(secrets/**)"
    ]
  }
}
SETTINGSEOF
        ;;
      pwa-vanilla)
        cat > "$SETTINGS_FILE" << 'SETTINGSEOF'
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bash .claude/hooks/saa-session-start.sh",
        "timeout": 15000,
        "description": "SAA — Sistema Autónomo de Agentes v1.0"
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "matcher": "Edit|Write",
        "command": "npx prettier --write $CLAUDE_FILE 2>/dev/null || true",
        "timeout": 15000,
        "description": "@guardian: Prettier auto-format"
      }
    ]
  },
  "permissions": {
    "allow": [
      "Skill",
      "Read",
      "Glob",
      "Grep",
      "Bash(git*)",
      "Bash(npm run*)",
      "Bash(npm test*)",
      "Bash(npx prettier*)",
      "Bash(ls*)",
      "Bash(find*)",
      "Bash(echo*)"
    ],
    "deny": [
      "Read(.env*)",
      "Edit(.env*)",
      "Write(.env*)",
      "Read(*.pem)",
      "Read(*.key)"
    ]
  }
}
SETTINGSEOF
        ;;
      *)
        cat > "$SETTINGS_FILE" << 'SETTINGSEOF'
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bash .claude/hooks/saa-session-start.sh",
        "timeout": 15000,
        "description": "SAA — Sistema Autónomo de Agentes v1.0"
      }
    ]
  },
  "permissions": {
    "allow": [
      "Skill",
      "Read",
      "Glob",
      "Grep",
      "Bash(git*)",
      "Bash(npm run*)",
      "Bash(npm test*)",
      "Bash(ls*)",
      "Bash(find*)",
      "Bash(echo*)"
    ],
    "deny": [
      "Read(.env*)",
      "Edit(.env*)",
      "Write(.env*)",
      "Read(*.pem)",
      "Read(*.key)"
    ]
  }
}
SETTINGSEOF
        ;;
    esac
  fi
  log "settings.json creado"
else
  # Verificar si el hook SAA ya está
  if grep -q "saa-session-start" "$SETTINGS_FILE" 2>/dev/null; then
    log "Hook SAA ya configurado en settings.json"
  else
    warn "settings.json existe — agregar manualmente el hook SAA:"
    echo '    { "type": "command", "command": "bash .claude/hooks/saa-session-start.sh", "timeout": 15000 }'
  fi
fi

# ─── PASO 7: Sub-agentes ─────────────────────────────────────────────────────
head "PASO 7: Instalando sub-agentes"

install_subagent() {
  local name="$1"
  local dest="$CLAUDE_DIR/agents/$name.md"
  if [[ -f "$SCRIPT_DIR/subagents/$name.md" ]]; then
    run "cp '$SCRIPT_DIR/subagents/$name.md' '$dest'"
    log "Sub-agente @$name instalado"
  else
    warn "Sub-agente @$name no encontrado en fuente"
  fi
}

for agent in memoria guardian deployer backend-gen frontend-gen kairos-link mejorador; do
  install_subagent "$agent"
done

# ─── PASO 8: CLAUDE.md ───────────────────────────────────────────────────────
head "PASO 8: Actualizando CLAUDE.md"

CLAUDE_MD="$TARGET_DIR/CLAUDE.md"
SAA_SECTION="
## 🤖 SISTEMA AUTÓNOMO DE AGENTES (SAA) v$SAA_VERSION
Instalado: $SAA_DATE | Tipo de proyecto: $PROJECT_TYPE

### Sub-agentes activos:
- @memoria → .claude/memory/sistema-autonomo.md
- @guardian → Calidad automática después de Edit/Write
- @deployer → Deploys automáticos con CI check
- @backend-gen → Generación de módulos Express
- @frontend-gen → Generación de componentes UI
- @kairos-link → Directivas EON KAIROS LEGENDARIO
- @mejorador → Auto-mejora del sistema

### Comandos: /saa | /gen-module | /gen-ui | /deploy | /guardian
### Instalador: bash .claude/skills/sistema-autonomo/install.sh [ruta]
"

if [[ -f "$CLAUDE_MD" ]]; then
  if grep -q "SISTEMA AUTÓNOMO DE AGENTES" "$CLAUDE_MD" 2>/dev/null; then
    log "CLAUDE.md ya tiene sección SAA"
  else
    if $DRY_RUN; then
      dry "Agregar sección SAA a: $CLAUDE_MD"
    else
      echo "$SAA_SECTION" >> "$CLAUDE_MD"
      log "Sección SAA agregada a CLAUDE.md"
    fi
  fi
else
  if $DRY_RUN; then
    dry "Crear: $CLAUDE_MD"
  else
    cat > "$CLAUDE_MD" << MDEOF
# CLAUDE.md — $(basename "$TARGET_DIR")
## Tipo de proyecto: $PROJECT_TYPE
## Generado por SAA v$SAA_VERSION — $SAA_DATE
$SAA_SECTION
MDEOF
    log "CLAUDE.md creado"
  fi
fi

# ─── PASO 9: .gitignore ──────────────────────────────────────────────────────
head "PASO 9: Verificando .gitignore"

GITIGNORE="$TARGET_DIR/.gitignore"
GITIGNORE_SAA="
# SAA — Sistema Autónomo de Agentes
.claude/memory/*.tmp
.claude/hooks/*.log
"

if [[ -f "$GITIGNORE" ]]; then
  if ! grep -q "SAA" "$GITIGNORE" 2>/dev/null; then
    if ! $DRY_RUN; then echo "$GITIGNORE_SAA" >> "$GITIGNORE"; fi
    log ".gitignore actualizado"
  else
    log ".gitignore ya tiene reglas SAA"
  fi
else
  if ! $DRY_RUN; then
    cat > "$GITIGNORE" << GITEOF
node_modules/
.env
.env.local
.env.*.local
dist/
build/
*.log
$GITIGNORE_SAA
GITEOF
  fi
  log ".gitignore creado"
fi

# ─── PASO 10: Commit ─────────────────────────────────────────────────────────
head "PASO 10: Commit inicial"

if $DRY_RUN; then
  dry "git add .claude/ CLAUDE.md .gitignore"
  dry "git commit -m 'feat(saa): Sistema Autónomo de Agentes v$SAA_VERSION instalado'"
else
  cd "$TARGET_DIR"
  if git rev-parse --git-dir > /dev/null 2>&1; then
    git add .claude/ CLAUDE.md .gitignore 2>/dev/null || true
    git commit -m "feat(saa): Sistema Autónomo de Agentes v$SAA_VERSION — $PROJECT_TYPE

- Sub-agentes: @memoria, @guardian, @deployer, @backend-gen, @frontend-gen, @kairos-link, @mejorador
- Hook SessionStart: saa-session-start.sh
- Memoria persistente: .claude/memory/sistema-autonomo.md
- KAIROS LEGENDARIO integrado
- Auto-mejora habilitada

https://claude.ai/code/session_01UKnogYkASu1UbELnDfCvrD" 2>/dev/null || true
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

echo -e "${BOLD}Proyecto:${NC} $PROJECT_TYPE"
echo -e "${BOLD}Directorio:${NC} $TARGET_DIR"
echo -e ""
echo -e "${BOLD}Próximos pasos:${NC}"
echo -e "  1. Abrí Claude Code en: $TARGET_DIR"
echo -e "  2. El hook SAA se activará automáticamente en la próxima sesión"
echo -e "  3. Usá ${CYAN}/saa status${NC} para ver el estado del sistema"
echo -e "  4. Usá ${CYAN}/gen-module [nombre]${NC} para generar módulos de backend"
echo -e "  5. Usá ${CYAN}/gen-ui [nombre]${NC} para generar componentes de UI"
echo -e ""
echo -e "${YELLOW}💡 Tip:${NC} KAIROS LEGENDARIO está integrado — todas las respuestas"
echo -e "   importantes comenzarán con 'Doctor,' según protocolo EON."
