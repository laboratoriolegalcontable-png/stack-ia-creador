#!/bin/bash
# System Doctor — Setup automatico sin preguntas (Mac y Linux)
# Se ejecuta solo, instala todo y programa la limpieza semanal.
#
# Un comando, cero interaccion:
#   curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/setup.sh | bash
#   o: bash ~/.claude/skills/system-doctor/setup.sh

set -e

REPO_RAW="https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main"
CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills/system-doctor"
AGENTS_DIR="$CLAUDE_DIR/agents"
COMMANDS_DIR="$CLAUDE_DIR/commands"

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${BLUE}→${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }

echo -e "\n${BLUE}System Doctor — Setup automatico${NC}\n"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." 2>/dev/null && pwd || echo "")"

# Funcion: copiar local o descargar
get_file() {
    local rel="$1" dest="$2"
    local local_src="$REPO_ROOT/$rel"
    mkdir -p "$(dirname "$dest")"
    if [[ -f "$local_src" ]]; then
        cp "$local_src" "$dest" && ok "$(basename "$dest")"
    else
        curl -fsSL "$REPO_RAW/$rel" -o "$dest" 2>/dev/null && ok "$(basename "$dest")" || warn "No se pudo obtener $(basename "$dest")"
    fi
}

# ── Archivos del skill ─────────────────────────────────────────────────────
info "Instalando skill y sub-agentes..."
get_file ".claude/skills/system-doctor/SKILL.md"     "$SKILLS_DIR/SKILL.md"
get_file ".claude/skills/system-doctor/REFERENCE.md" "$SKILLS_DIR/REFERENCE.md"
get_file ".claude/skills/system-doctor/install.sh"   "$SKILLS_DIR/install.sh"
get_file ".claude/skills/system-doctor/install.ps1"  "$SKILLS_DIR/install.ps1"
chmod +x "$SKILLS_DIR/install.sh" 2>/dev/null || true

for agent in doctor-memoria doctor-limpieza doctor-procesos doctor-blindaje doctor-backup; do
    get_file ".claude/agents/${agent}.md" "$AGENTS_DIR/${agent}.md"
done
get_file ".claude/commands/system-doctor.md" "$COMMANDS_DIR/system-doctor.md"

# ── Script de limpieza semanal ─────────────────────────────────────────────
info "Creando auto-clean.sh..."
cat > "$SKILLS_DIR/auto-clean.sh" << 'EOF'
#!/bin/bash
LOG="$HOME/.claude/skills/system-doctor/auto-clean.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")
echo "[$DATE] === Limpieza automatica ===" >> "$LOG"

# Caches y temporales (rutas 100% seguras)
rm -rf ~/Library/Caches/* 2>/dev/null
rm -rf ~/Library/Logs/* 2>/dev/null
rm -rf /private/tmp/* 2>/dev/null
sudo rm -rf /private/var/tmp/* 2>/dev/null
sudo dscacheutil -flushcache 2>/dev/null
sudo killall -HUP mDNSResponder 2>/dev/null
npm cache clean --force 2>/dev/null
pip3 cache purge 2>/dev/null
brew cleanup --prune=7 2>/dev/null

FREE=$(df -h / | awk 'NR==2{print $4}')
echo "[$DATE] OK — Disco libre: $FREE" >> "$LOG"

# Notificar a Kairos
[[ -n "$MAKE_WEBHOOK_SYSTEM_DOCTOR" ]] && \
  curl -s -X POST "$MAKE_WEBHOOK_SYSTEM_DOCTOR" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"[System Doctor] Limpieza semanal OK en $(hostname). Libre: $FREE\"}" > /dev/null
EOF
chmod +x "$SKILLS_DIR/auto-clean.sh"
ok "auto-clean.sh"

# ── LEARNINGS.md ────────────────────────────────────────────────────────────
[[ ! -f "$SKILLS_DIR/LEARNINGS.md" ]] && \
    printf "# System Doctor — Aprendizajes\n\n---\n\n" > "$SKILLS_DIR/LEARNINGS.md" && ok "LEARNINGS.md"

# ── Herramientas (macOS) ────────────────────────────────────────────────────
if [[ "$(uname -s)" == "Darwin" ]]; then
    info "Verificando herramientas..."
    if command -v brew &>/dev/null; then
        brew install --quiet htop ncdu duf 2>/dev/null && ok "htop ncdu duf" || true
    else
        warn "Homebrew no encontrado — instalar en https://brew.sh"
    fi
fi

# ── Cron semanal (domingos 3am, sin preguntar) ──────────────────────────────
info "Configurando cron semanal (domingos 3am)..."
CRON_CMD="0 3 * * 0 $SKILLS_DIR/auto-clean.sh >> $SKILLS_DIR/auto-clean.log 2>&1"
(crontab -l 2>/dev/null | grep -v "system-doctor"; echo "$CRON_CMD") | crontab - && ok "Cron configurado"

# ── Agregar webhook al perfil si existe en el env ──────────────────────────
if [[ -n "$MAKE_WEBHOOK_SYSTEM_DOCTOR" ]]; then
    PROFILE="${BASH_PROFILE:-$HOME/.zshrc}"
    [[ -f "$HOME/.bashrc" ]] && PROFILE="$HOME/.bashrc"
    grep -q "MAKE_WEBHOOK_SYSTEM_DOCTOR" "$PROFILE" 2>/dev/null || \
        echo "export MAKE_WEBHOOK_SYSTEM_DOCTOR='$MAKE_WEBHOOK_SYSTEM_DOCTOR'" >> "$PROFILE"
    ok "Webhook guardado en $PROFILE"
fi

# ── Registrar instalacion ───────────────────────────────────────────────────
printf "\n## $(date '+%Y-%m-%d') — AUTO-SETUP — $(uname -s)\n- Instalacion: $CLAUDE_DIR\n- Cron: activo domingos 3am\n\n" >> "$SKILLS_DIR/LEARNINGS.md"

echo -e "\n${GREEN}Sistema instalado y programado automaticamente.${NC}"
echo -e "Probalo ahora: ${YELLOW}/system-doctor diagnostico${NC}\n"
