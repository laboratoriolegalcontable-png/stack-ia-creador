#!/bin/bash
# =============================================================================
# blindaje/lib.sh — rutas y helpers compartidos del sistema de blindaje.
# Diseñado para ser "source"-eado por los demás scripts. Nunca bloquea.
# =============================================================================

# Resolver rutas relativas al propio script (portable entre máquinas).
_BLINDAJE_SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$(cd "$_BLINDAJE_SELF/../../.." && pwd)"   # scripts -> blindaje -> skills -> .claude
REPO_DIR="$(cd "$CLAUDE_DIR/.." && pwd)"

# Estado de runtime (NO se versiona — ver .gitignore).
STATE_DIR="$CLAUDE_DIR/blindaje"
BACKUPS_DIR="$STATE_DIR/backups"
LOG_FILE="$STATE_DIR/blindaje.log"
BRAKE_FLAG="$STATE_DIR/EMERGENCY_BRAKE"
GUARD_DB="$STATE_DIR/guard-calls.tsv"

# Archivos a respaldar si existen (candidatos; backup copia solo los presentes).
# Repo-agnóstico: cada repo puede tener un subconjunto distinto.
CRITICAL_FILES=(
  ".claude/settings.json"
  ".claude/shared-memory.json"
  ".claude/CLAUDE.local.md"
  "CLAUDE.md"
  "CLAUDE.local.md"
)

# Archivos que SÍ o SÍ deben existir (alarma de ausencia). Subconjunto mínimo.
MUST_EXIST=(
  ".claude/settings.json"
)

# Detección de borrado masivo de skills: se alarma si el conteo actual cae por
# debajo de DROP_RATIO del conteo guardado en el último backup (repo-agnóstico).
SKILLS_DROP_RATIO="${BLINDAJE_SKILLS_DROP_RATIO:-0.6}"
# Piso absoluto opcional (0 = desactivado).
SKILLS_MIN="${BLINDAJE_SKILLS_MIN:-0}"
# Backups a retener.
BACKUPS_KEEP="${BLINDAJE_BACKUPS_KEEP:-20}"

mkdir -p "$STATE_DIR" "$BACKUPS_DIR" 2>/dev/null || true

blz_log() {
  # Log silencioso a archivo; nunca falla la sesión.
  local msg="$1"
  printf '%s  %s\n' "$(date -u +%FT%TZ)" "$msg" >> "$LOG_FILE" 2>/dev/null || true
}

blz_is_json() {
  # Devuelve 0 si el archivo es JSON válido.
  python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$1" >/dev/null 2>&1
}

blz_latest_backup() {
  ls -1d "$BACKUPS_DIR"/*/ 2>/dev/null | sort | tail -n 1
}

blz_skills_now() {
  ls -1 "$CLAUDE_DIR/skills" 2>/dev/null | wc -l | tr -d ' '
}

# Conteo de skills en el backup más reciente (vía su skills-manifest.tsv).
blz_skills_last_backup() {
  local b; b="$(blz_latest_backup)"
  [ -n "$b" ] && [ -f "$b/skills-manifest.tsv" ] || { echo ""; return; }
  grep -c . "$b/skills-manifest.tsv" 2>/dev/null || echo ""
}
