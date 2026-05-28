#!/usr/bin/env bash
# =============================================================================
# KAIROS AUTOSTART — Auto-instalacion y auto-curado autonomo del ecosistema
# =============================================================================
# Se ejecuta en cada SessionStart. Garantiza que el ecosistema Kairos Forge
# (forge + sentinel + genesis + memory-v4) este presente y con memoria viva,
# en este proyecto y de forma GLOBAL para cualquier proyecto nuevo o generico.
#
# REGLAS DE ORO (no negociables):
#   1. IDEMPOTENTE      — correrlo N veces deja el mismo estado.
#   2. NO DESTRUCTIVO   — nunca pisa, borra ni rompe nada existente.
#   3. SILENCIOSO ANTE FALLO — cualquier error no aborta la sesion (|| true).
#   4. AUTONOMO         — no pide permiso para curar lo que falta.
# =============================================================================

# Nunca abortar la sesion por un fallo del hook.
set +e

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"
REPO_ROOT="$(cd "$HOOK_DIR/../.." 2>/dev/null && pwd || echo "")"
GLOBAL_SKILLS="$HOME/.claude/skills"
GLOBAL_MEM="$HOME/.claude/memory"
KAIROS=(kairos-forge kairos-sentinel kairos-genesis kairos-memory-v4)

note() { echo "$1"; }

# ---------------------------------------------------------------------------
# 1. Instalacion GLOBAL del ecosistema (lo hace disponible para TODO proyecto,
#    incluidos proyectos nuevos genericos que aun no tienen .claude propio).
#    Solo corre si falta — idempotente.
# ---------------------------------------------------------------------------
ensure_global_ecosystem() {
  local installer="$REPO_ROOT/.claude/skills/kairos-forge/install.sh"
  if [ ! -f "$GLOBAL_SKILLS/kairos-forge/SKILL.md" ] && [ -f "$installer" ]; then
    bash "$installer" >/dev/null 2>&1 || true
  fi
}

# ---------------------------------------------------------------------------
# 2. Memoria persistente — semillas solo si faltan (nunca pisa).
# ---------------------------------------------------------------------------
seed_memory() {
  mkdir -p "$GLOBAL_MEM/sessions" 2>/dev/null
  mkdir -p "$REPO_ROOT/.claude/memory" 2>/dev/null
  local f
  for f in decisions patterns projects contacts; do
    [ -f "$GLOBAL_MEM/$f.md" ] || printf '# Kairos Memory v4 — %s\n# (autocreado por kairos-autostart, %s)\n---\n' \
      "$f" "$(date +%Y-%m-%d)" > "$GLOBAL_MEM/$f.md" 2>/dev/null
  done
}

# ---------------------------------------------------------------------------
# 3. Registro idempotente del ecosistema.
# ---------------------------------------------------------------------------
ensure_registry() {
  local reg="$HOME/.claude/forge-registry.md"
  if [ ! -f "$reg" ]; then
    {
      echo "# Kairos Forge Registry"
      echo ""
      echo "| Skill | Version | Instalado | Proyectos |"
      echo "|-------|---------|-----------|-----------|"
      echo "| kairos-forge | 1.0.0 | auto | todos |"
      echo "| kairos-sentinel | 1.0.0 | auto | todos |"
      echo "| kairos-genesis | 1.0.0 | auto | todos |"
      echo "| kairos-memory-v4 | 4.0.0 | auto | todos |"
    } > "$reg" 2>/dev/null
  fi
}

# ---------------------------------------------------------------------------
# 4. Genesis para proyecto generico: si el cwd NO tiene .claude/CLAUDE.local.md
#    y NO es uno de los repos conocidos, deja una semilla minima (sin pisar).
# ---------------------------------------------------------------------------
ensure_generic_bootstrap() {
  local cwd_local="$PWD/.claude/CLAUDE.local.md"
  if [ ! -f "$cwd_local" ] && [ -d "$PWD/.claude" ]; then
    cat > "$cwd_local" 2>/dev/null << 'GEN_EOF'
# Kairos — Proyecto generico (semilla autocreada)

El ecosistema Kairos (forge / sentinel / genesis / memory-v4) esta disponible
globalmente. Usalo asi:

- `@Kairos genesis bootstrap` — detectar el stack y instalar skills correctos
- `@Kairos forge skill [nombre] "[desc]"` — crear un skill nuevo
- `@Kairos sentinel status` — estado de los sistemas
- `@Kairos memory snapshot` — guardar el contexto de esta sesion

Editar libremente: este archivo es solo una semilla, no se vuelve a pisar.
GEN_EOF
  fi
}

# ---------------------------------------------------------------------------
# Ejecutar todo (cada paso aislado, sin frenar la sesion).
# ---------------------------------------------------------------------------
ensure_global_ecosystem
seed_memory
ensure_registry
ensure_generic_bootstrap

# ---------------------------------------------------------------------------
# Banner de contexto para Claude (stdout = contexto de SessionStart).
# ---------------------------------------------------------------------------
present=0
for k in "${KAIROS[@]}"; do
  [ -f "$REPO_ROOT/.claude/skills/$k/SKILL.md" ] && present=$((present+1))
done

note "KAIROS FORGE — ecosistema autonomo activo ($present/4 skills en proyecto)."
note "Auto-instalado y auto-curado. Memoria persistente en ~/.claude/memory/."
note "Comandos: @Kairos forge | sentinel | genesis | memory. Nunca pisa nada existente."

exit 0
