#!/usr/bin/env bash
# =============================================================================
# KAIROS FORGE — Instalador publico GENERICO (no-destructivo)
# Instala el ecosistema (forge + sentinel + genesis + memory-v4) en cualquier
# proyecto o maquina. Version GENERICA: sin IDs ni datos internos de ningun
# negocio — apto para repos publicos y proyectos nuevos.
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/kairos-forge/install.sh | bash
#   # o, con el repo clonado:
#   bash .claude/skills/kairos-forge/install.sh
#
# Garantia NO-DESTRUCTIVA: respalda cualquier archivo que fuera a sobrescribir
# en ~/.claude/.forge-backups/<timestamp>/ y solo siembra memoria si falta.
# =============================================================================

set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
SKILLS_DIR="$HOME/.claude/skills"
MEMORY_DIR="$HOME/.claude/memory"
log()   { echo -e "${GREEN}[forge]${NC} $1"; }
warn()  { echo -e "${YELLOW}[forge]${NC} $1"; }
header(){ echo -e "\n${BLUE}====================================${NC}\n${BLUE}  $1${NC}\n${BLUE}====================================${NC}\n"; }

header "KAIROS FORGE — Instalador generico"

mkdir -p "$SKILLS_DIR/kairos-forge" "$SKILLS_DIR/kairos-sentinel" \
         "$SKILLS_DIR/kairos-genesis" "$SKILLS_DIR/kairos-memory-v4" \
         "$MEMORY_DIR/sessions"

# -- Blindaje no-destructivo: respaldar antes de escribir --
BACKUP_DIR="$HOME/.claude/.forge-backups/$(date +%Y%m%d-%H%M%S)"
backup_if_exists() {
  local f="$1"
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -p "$f" "$BACKUP_DIR/$(echo "$f" | sed 's#^/##; s#/#_#g')" 2>/dev/null || true
    warn "Respaldado: $f"
  fi
}
for s in kairos-forge kairos-sentinel kairos-genesis kairos-memory-v4; do
  backup_if_exists "$SKILLS_DIR/$s/SKILL.md"
done
[ -d "$BACKUP_DIR" ] && log "Respaldos en: $BACKUP_DIR"

# -- Si el repo esta clonado al lado, copiar los SKILL.md reales --
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"
REPO_SKILLS=""
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/SKILL.md" ]; then
  REPO_SKILLS="$(cd "$SCRIPT_DIR/../" 2>/dev/null && pwd || echo "")"
fi
if [ -n "$REPO_SKILLS" ]; then
  for s in kairos-forge kairos-sentinel kairos-genesis kairos-memory-v4; do
    if [ -f "$REPO_SKILLS/$s/SKILL.md" ]; then
      cp "$REPO_SKILLS/$s/SKILL.md" "$SKILLS_DIR/$s/SKILL.md"
      log "Instalado: $s"
    fi
  done
  [ -f "$REPO_SKILLS/kairos-forge/REFERENCE.md" ] && cp "$REPO_SKILLS/kairos-forge/REFERENCE.md" "$SKILLS_DIR/kairos-forge/REFERENCE.md"
  [ -f "$REPO_SKILLS/kairos-forge/INTEGRATION.md" ] && cp "$REPO_SKILLS/kairos-forge/INTEGRATION.md" "$SKILLS_DIR/kairos-forge/INTEGRATION.md"
else
  warn "Repo no detectado localmente — clona el repo y re-ejecuta para copiar los SKILL.md."
fi

# -- Sembrar memoria GENERICA solo si falta (no-destructivo) --
init_file() { [ -f "$1" ] || { echo "$2" > "$1"; log "Sembrado: $1"; }; }

init_file "$MEMORY_DIR/decisions.md" "# Memory v4 — Decisions
Formato: [YYYY-MM-DD] [proyecto] DECISION: ... RAZON: ... NO REVERTIR: ...
---
"
init_file "$MEMORY_DIR/patterns.md" "# Memory v4 — Patterns
Formato: [patron: nombre] TRIGGER: ... CAUSA_RAIZ: ... FIX: ... PREVENCION: ...
---
"
init_file "$MEMORY_DIR/projects.md" "# Memory v4 — Projects
Estado de cada proyecto. Una seccion por proyecto.
Los IDs/secretos viven en el CLAUDE.md privado del proyecto, NUNCA aca.
---
## [nombre-del-proyecto]
TIPO:
STACK:
ESTADO:
"
init_file "$MEMORY_DIR/contacts.md" "# Memory v4 — Contacts
Personas clave por rol. Sin telefonos ni datos sensibles (van en CLAUDE.md privado).
---
[Owner] rol=director
"

# -- Registry generico --
REGISTRY="$HOME/.claude/forge-registry.md"
if [ ! -f "$REGISTRY" ]; then
  cat > "$REGISTRY" << 'REG_EOF'
# Kairos Forge Registry

| Skill | Version | Instalado | Proyectos |
|-------|---------|-----------|-----------|
| kairos-forge | 1.1.0 | auto | todos |
| kairos-sentinel | 1.0.0 | auto | todos |
| kairos-genesis | 1.0.0 | auto | todos |
| kairos-memory-v4 | 4.0.0 | auto | todos |
REG_EOF
  log "forge-registry.md creado"
fi

header "Instalacion completada"
echo "  @Kairos forge skill|upgrade|audit|project"
echo "  @Kairos sentinel status   ·  @Kairos genesis bootstrap   ·  @Kairos memory snapshot"
echo ""
echo -e "${GREEN}Kairos Forge listo (generico · no-destructivo).${NC}"
