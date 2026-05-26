#!/bin/bash
# ⚡ kairos-install.sh — Sistema Autónomo v2.0
# Instala Kairos Supremo en cualquier proyecto nuevo
# Uso: bash kairos-install.sh [nombre-proyecto] [stack]
# Ejemplo: bash kairos-install.sh mi-app nextjs

set -e
PROYECTO=${1:-"nuevo-proyecto"}
STACK=${2:-"custom"}
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_SHORT=$(date +"%Y-%m-%d")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO="/home/user/Diego-Orosa"

echo "⚡ Kairos Supremo — Instalando en: $PROYECTO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Crear estructura de directorios
mkdir -p \
  ".claude/memory/learned_patterns" \
  ".claude/memory/skill_evolution" \
  ".claude/memory/performance_metrics" \
  ".claude/memory/session_logs" \
  ".claude/orchestration" \
  ".claude/skills/kairos-supremo" \
  ".claude/skills/kairos-legendario" \
  ".claude/skills/skill-auto-installer" \
  ".claude/skills/skill-memory-persistence" \
  ".claude/subagents"
echo "✅ Estructura de directorios creada"

# 2. user_preferences.json — IDIOMA: ESPAÑOL (crítico)
cat > ".claude/memory/learned_patterns/user_preferences.json" << EOF
{
  "_meta": { "created": "$DATE", "project": "$PROYECTO" },
  "IDIOMA": "ESPAÑOL",
  "language": {
    "primary": "es",
    "always_respond_in": "ESPAÑOL",
    "rule": "SIEMPRE en español — permanente e irrevocable",
    "priority": "MAXIMA"
  },
  "autonomy_settings": { "level": 5 },
  "kairos_legendario": {
    "enabled": true,
    "confidence_threshold_critical": 0.85,
    "confidence_threshold_capabilities": 0.75
  },
  "installed": "$DATE_SHORT",
  "owner": "laboratoriolegalcontable@gmail.com"
}
EOF
echo "✅ IDIOMA: ESPAÑOL guardado en memoria"

# 3. Copiar skills base desde Diego-Orosa
for skill in kairos-supremo kairos-legendario skill-auto-installer skill-memory-persistence; do
  SRC="$SOURCE_REPO/.claude/skills/$skill"
  if [ -d "$SRC" ]; then
    cp -r "$SRC/." ".claude/skills/$skill/"
    echo "✅ Skill copiada: $skill"
  fi
done

# 4. Copiar subagentes
for agent in code-refinement-agent mcp-orchestration-agent skill-evolution-agent; do
  SRC="$SOURCE_REPO/.claude/subagents/${agent}.json"
  if [ -f "$SRC" ]; then
    cp "$SRC" ".claude/subagents/"
    echo "✅ Subagente copiado: $agent"
  fi
done

# 5. Copiar orchestration
cp "$SOURCE_REPO/.claude/orchestration/kairos-legendario-config.json" ".claude/orchestration/" 2>/dev/null && echo "✅ Kairos config copiado" || true

# 6. settings.json
cat > ".claude/settings.json" << 'EOF'
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "python3 -c \"import json,os; f='.claude/memory/learned_patterns/user_preferences.json'; d=json.load(open(f)) if os.path.exists(f) else {}; print(f\\\"⚡ Kairos Supremo ACTIVO | IDIOMA: {d.get('IDIOMA','ESPAÑOL')}\\\")\" 2>/dev/null || echo '⚡ Kairos Supremo ACTIVO'",
        "timeout": 5,
        "statusMessage": "⚡ Cargando Kairos Supremo..."
      }]
    }],
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "DATE=$(date -u +\"%Y-%m-%dT%H:%M:%SZ\"); mkdir -p .claude/memory/session_logs; F=.claude/memory/session_logs/$(date +%Y-%m-%d).json; python3 -c \"import json,os; f='$F'; d=json.load(open(f)) if os.path.exists(f) else {'IDIOMA':'ESPAÑOL'}; d['session_end']='$DATE'; d['memory_updated']=True; open(f,'w').write(json.dumps(d,indent=2,ensure_ascii=False))\" 2>/dev/null || true; echo '🧠 Memoria guardada'",
        "timeout": 8,
        "statusMessage": "🧠 Guardando memoria..."
      }]
    }]
  },
  "permissions": {
    "allow": ["Skill","Read","Glob","Grep","Bash(git*)","Bash(npm*)","Bash(ls*)","Bash(find*)","Edit(**/.claude/**)","Write(**/.claude/**)"],
    "deny": ["Read(.env)","Read(.env.*)","Edit(.env)","Write(.env)"]
  }
}
EOF
echo "✅ settings.json configurado"

# 7. CLAUDE.md
cat > "CLAUDE.md" << EOF
# CLAUDE.md — $PROYECTO

## 🌐 REGLAS PERMANENTES

> **IDIOMA: ESPAÑOL** — siempre, sin importar el idioma del mensaje.
> **AUTONOMÍA: Nivel 5** — Kairos Supremo activo.
> **MEMORIA: Auto-persistencia** — git commit al finalizar sesión.

## Proyecto
- **Nombre**: $PROYECTO
- **Stack**: $STACK
- **Instalado**: $DATE_SHORT

## Sistema Instalado
- ⚡ Kairos Supremo v1.0
- 🧠 Memory Persistence
- 🔧 Skill Auto-Installer
- 📦 MCP Orchestration Agent
EOF
echo "✅ CLAUDE.md creado"

# 8. Pre-commit hook
mkdir -p ".git/hooks"
cat > ".git/hooks/pre-commit" << 'HOOK'
#!/bin/bash
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MEMORY_FILE=".claude/memory/session_logs/$(date +%Y-%m-%d).json"
mkdir -p ".claude/memory/session_logs"
python3 -c "
import json,os
f='$MEMORY_FILE'
d=json.load(open(f)) if os.path.exists(f) else {'IDIOMA':'ESPAÑOL'}
d.setdefault('commits',[]).append({'time':'$DATE','memory_updated':True})
open(f,'w').write(json.dumps(d,indent=2,ensure_ascii=False))
" 2>/dev/null || true
git add ".claude/memory/session_logs/" 2>/dev/null || true
exit 0
HOOK
chmod +x ".git/hooks/pre-commit"
echo "✅ Pre-commit hook configurado"

# 9. Primer commit
if git rev-parse --git-dir > /dev/null 2>&1; then
  git add .claude/ CLAUDE.md 2>/dev/null || true
  git commit -m "🤖 init: Kairos Supremo v2.0 instalado en $PROYECTO" 2>/dev/null || true
  echo "✅ Commit inicial creado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ ¡Kairos Supremo instalado en $PROYECTO!"
echo "🌐 IDIOMA: ESPAÑOL activo"
echo "🤖 Autonomía: Nivel 5"
echo "🧠 Memoria: persistente vía git"
echo ""
echo "Próximos pasos:"
echo "  → Abrir Claude Code en este directorio"
echo "  → /kairos-supremo status  (ver estado completo)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
