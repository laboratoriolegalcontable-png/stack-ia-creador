#!/bin/bash
# System Doctor — Auto-instalador para macOS y Linux
# Uso: curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/install.sh | bash
# O localmente: bash ~/.claude/skills/system-doctor/install.sh

set -e

REPO_RAW="https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main"
CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills/system-doctor"
AGENTS_DIR="$CLAUDE_DIR/agents"
COMMANDS_DIR="$CLAUDE_DIR/commands"
LOG="$HOME/.claude/skills/system-doctor/install.log"

# Colores
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
info() { echo -e "${BLUE}[--]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[XX]${NC} $1"; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SYSTEM DOCTOR — Auto-instalador        ║${NC}"
echo -e "${BLUE}║   Mac y Linux · Estudio Oro S.A.S.       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Detectar OS ─────────────────────────────────────────────
OS=$(uname -s)
if [[ "$OS" == "Darwin" ]]; then
    PLATFORM="macOS"
elif [[ "$OS" == "Linux" ]]; then
    PLATFORM="Linux"
else
    err "Sistema no soportado: $OS"
    exit 1
fi
ok "Plataforma detectada: $PLATFORM"

# ── 2. Crear estructura de directorios ───────────────────────────────────
info "Creando directorios..."
mkdir -p "$SKILLS_DIR" "$AGENTS_DIR" "$COMMANDS_DIR"
ok "Directorios creados: $CLAUDE_DIR"

# ── 3. Detectar si estamos dentro del repo o descargando ─────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd 2>/dev/null || echo "")"

copy_or_download() {
    local src_path="$1"
    local dest="$2"
    local filename="$(basename "$dest")"

    if [[ -f "$REPO_ROOT/$src_path" ]]; then
        cp "$REPO_ROOT/$src_path" "$dest"
        ok "Copiado: $filename"
    else
        info "Descargando: $filename..."
        curl -fsSL "$REPO_RAW/$src_path" -o "$dest" 2>/dev/null && ok "Descargado: $filename" || warn "No se pudo obtener: $filename"
    fi
}

# ── 4. Instalar archivos del skill ──────────────────────────────────────
info "Instalando archivos del System Doctor..."
copy_or_download ".claude/skills/system-doctor/SKILL.md"     "$SKILLS_DIR/SKILL.md"
copy_or_download ".claude/skills/system-doctor/REFERENCE.md" "$SKILLS_DIR/REFERENCE.md"

# ── 5. Instalar sub-agentes ─────────────────────────────────────────────
info "Instalando sub-agentes..."
for agent in doctor-memoria doctor-limpieza doctor-procesos doctor-blindaje doctor-backup; do
    copy_or_download ".claude/agents/${agent}.md" "$AGENTS_DIR/${agent}.md"
done

# ── 6. Instalar comando slash ────────────────────────────────────────────
info "Instalando comando /system-doctor..."
copy_or_download ".claude/commands/system-doctor.md" "$COMMANDS_DIR/system-doctor.md"

# ── 7. Crear script de limpieza automatica ────────────────────────────────
info "Creando script de limpieza automatica..."
cat > "$SKILLS_DIR/auto-clean.sh" << 'SCRIPT'
#!/bin/bash
LOG="$HOME/.claude/skills/system-doctor/auto-clean.log"
DATE=$(date "+%Y-%m-%d %H:%M:%S")
echo "[$DATE] === Iniciando limpieza automatica ===" >> "$LOG"

BEFORE=$(df -h / | awk 'NR==2{print $3}')
rm -rf ~/Library/Caches/* 2>/dev/null
rm -rf ~/Library/Logs/* 2>/dev/null
rm -rf /private/tmp/* 2>/dev/null
sudo rm -rf /private/var/tmp/* 2>/dev/null
sudo dscacheutil -flushcache 2>/dev/null
sudo killall -HUP mDNSResponder 2>/dev/null
npm cache clean --force 2>/dev/null
pip3 cache purge 2>/dev/null
brew cleanup --prune=7 2>/dev/null

AFTER=$(df -h / | awk 'NR==2{print $3}')
echo "[$DATE] Disco: $BEFORE -> $AFTER" >> "$LOG"
echo "[$DATE] === Limpieza completada ===" >> "$LOG"

if [[ -n "$MAKE_WEBHOOK_SYSTEM_DOCTOR" ]]; then
    HOSTNAME=$(hostname)
    curl -s -X POST "$MAKE_WEBHOOK_SYSTEM_DOCTOR" \
         -H "Content-Type: application/json" \
         -d "{\"message\":\"[System Doctor] Limpieza automatica completada en $HOSTNAME.\"}" > /dev/null
fi
SCRIPT
chmod +x "$SKILLS_DIR/auto-clean.sh"
ok "Script auto-clean.sh creado"

# ── 8. Crear LEARNINGS.md si no existe ─────────────────────────────────
if [[ ! -f "$SKILLS_DIR/LEARNINGS.md" ]]; then
    printf "# System Doctor — Aprendizajes del Sistema\n\n---\n\n## Registro de sesiones\n\n" > "$SKILLS_DIR/LEARNINGS.md"
    ok "LEARNINGS.md inicializado"
fi

# ── 9. Instalar herramientas recomendadas (macOS) ──────────────────────────
if [[ "$PLATFORM" == "macOS" ]]; then
    info "Verificando herramientas recomendadas..."

    if ! command -v brew &>/dev/null; then
        warn "Homebrew no encontrado. Instalando..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" 2>/dev/null && ok "Homebrew instalado" || warn "No se pudo instalar Homebrew"
    else
        ok "Homebrew: ya instalado"
    fi

    TOOLS=(htop ncdu duf procs)
    for tool in "${TOOLS[@]}"; do
        if ! command -v "$tool" &>/dev/null; then
            brew install --quiet "$tool" 2>/dev/null && ok "Instalado: $tool" || warn "No se pudo instalar: $tool"
        else
            ok "Ya instalado: $tool"
        fi
    done
fi

# ── 10. Configurar cron semanal (opcional) ───────────────────────────────
read -r -p "$(echo -e "${YELLOW}Configurar limpieza automatica cada domingo a las 3am? [s/N]:${NC} ")" CRON_CONFIRM
if [[ "${CRON_CONFIRM,,}" == "s" ]]; then
    CRON_CMD="0 3 * * 0 $SKILLS_DIR/auto-clean.sh >> $SKILLS_DIR/auto-clean.log 2>&1"
    (crontab -l 2>/dev/null | grep -v "system-doctor"; echo "$CRON_CMD") | crontab -
    ok "Cron configurado: domingos 3am"
else
    info "Cron no configurado. Podes activarlo despues con: /system-doctor programar"
fi

# ── 11. Resumen final ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   System Doctor instalado correctamente  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Probalo ahora: ${YELLOW}/system-doctor diagnostico${NC}"
echo -e "  Emergencia:    ${YELLOW}/system-doctor emergencia${NC}"
echo ""

# Registrar instalacion en LEARNINGS.md
printf "\n## $(date '+%Y-%m-%d') — INSTALACION — $PLATFORM\n- Sistema instalado en: $CLAUDE_DIR\n\n" >> "$SKILLS_DIR/LEARNINGS.md"
