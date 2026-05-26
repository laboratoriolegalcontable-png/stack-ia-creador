#!/usr/bin/env bash
# ⚡ kairos-install.sh — Sistema Autónomo v2.0
# Compatible: macOS (zsh/bash) + Linux
# Uso: bash kairos-install.sh [nombre-proyecto] [stack]
# Ejemplo: bash kairos-install.sh mi-app nextjs

set -e

PROYECTO="${1:-nuevo-proyecto}"
STACK="${2:-custom}"
DATE_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_SHORT=$(date +"%Y-%m-%d")
TARGET_DIR="$(pwd)"

echo ""
echo "⚡ Kairos Supremo — Instalando en: $(pwd)/$PROYECTO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Crear directorio del proyecto si se pasó nombre
if [ "$PROYECTO" != "." ]; then
  mkdir -p "$PROYECTO"
  cd "$PROYECTO"
  TARGET_DIR="$(pwd)"
fi

# Inicializar git si no existe
if [ ! -d ".git" ]; then
  git init
  echo "✅ git init"
fi

# 1. Estructura .claude/
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
  ".claude/skills/pipeline-supremo" \
  ".claude/skills/diagnostico-supremo" \
  ".claude/subagents"
echo "✅ Estructura .claude/ creada"

# 2. user_preferences.json — IDIOMA: ESPAÑOL (CRÍTICO)
cat > ".claude/memory/learned_patterns/user_preferences.json" << EOF
{
  "_meta": { "created": "$DATE_UTC", "project": "$PROYECTO" },
  "IDIOMA": "ESPAÑOL",
  "language": {
    "primary": "es",
    "always_respond_in": "ESPAÑOL",
    "rule": "SIEMPRE en español — permanente e irrevocable",
    "priority": "MAXIMA"
  },
  "autonomy_settings": {
    "level": 5,
    "auto_install_skills": true,
    "auto_commit_memory": true,
    "require_confirmation": "solo acciones destructivas irreversibles"
  },
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

# 3. project_specifics.json
cat > ".claude/memory/learned_patterns/project_specifics.json" << EOF
{
  "_meta": { "created": "$DATE_UTC" },
  "$PROYECTO": {
    "type": "$STACK",
    "installed": "$DATE_SHORT",
    "autonomy_level": 5
  },
  "generic_new_project": {
    "auto_detect": true,
    "auto_install_system": true,
    "autonomy_level": 4
  }
}
EOF

# 4. skill_updates.json
cat > ".claude/memory/skill_evolution/skill_updates.json" << EOF
{
  "_meta": { "created": "$DATE_UTC" },
  "installed_skills": [
    { "name": "kairos-supremo", "version": "1.0.0", "installed": "$DATE_SHORT", "status": "active" },
    { "name": "kairos-legendario", "version": "2.0.0", "installed": "$DATE_SHORT", "status": "active" },
    { "name": "skill-auto-installer", "version": "1.0.0", "installed": "$DATE_SHORT", "status": "active" },
    { "name": "skill-memory-persistence", "version": "1.0.0", "installed": "$DATE_SHORT", "status": "active" }
  ],
  "auto_evolution": { "enabled": true, "auto_create": true }
}
EOF

# 5. Kairos Legendario config
cat > ".claude/orchestration/kairos-legendario-config.json" << EOF
{
  "_meta": { "version": "2.0.0", "created": "$DATE_UTC" },
  "identity": { "name": "Kairos Legendario", "version": "2.0.0" },
  "decision_matrix": {
    "thresholds": {
      "critical_autonomous_actions": 0.85,
      "critical_capabilities": 0.75,
      "standard_operations": 0.65
    }
  },
  "autonomy_scales": { "current_level": 5 },
  "action_policies": {
    "git_commit": { "auto": true, "threshold": 0.70 },
    "git_push":   { "auto": true, "threshold": 0.75 },
    "file_create": { "auto": true, "threshold": 0.65 },
    "file_delete": { "auto": false, "require_confirm": true },
    "deploy_vercel": { "auto": true, "threshold": 0.80 },
    "create_pr": { "auto": true, "threshold": 0.70 }
  },
  "learning": { "enabled": true }
}
EOF
echo "✅ Kairos Legendario config instalado"

# 6. Skills base (contenido inline — sin dependencias externas)
cat > ".claude/skills/kairos-supremo/kairos-supremo.md" << 'EOF'
---
name: kairos-supremo
version: 1.0.0
description: Cerebro central del ecosistema. Coordina todos los agentes, MCPs y skills.
autonomy_level: 5
---
# ⚡ Kairos Supremo

## Reglas Supremas (inmutables)
- 🌐 IDIOMA: ESPAÑOL — siempre, sin excepción
- 🤖 AUTONOMÍA: Nivel 5
- 🧠 MEMORIA: persistir vía git en cada sesión

## Umbrales
| ≥ 0.85 | Acciones críticas autónomas |
| ≥ 0.75 | Capacidades críticas |
| ≥ 0.65 | Operaciones reversibles |

## Comandos
/kairos-supremo status   → dashboard completo
/kairos-supremo evolve   → auto-perfeccionamiento
/kairos-supremo memory   → memoria de sesiones
EOF

cat > ".claude/skills/skill-auto-installer/skill-auto-installer.md" << 'EOF'
---
name: skill-auto-installer
version: 1.0.0
description: Auto-registro de skills desde MCPs disponibles.
---
# 🔧 Skill Auto-Installer
Detecta MCPs disponibles y crea skills automáticamente.
Umbral Kairos: 0.70 | Reversible: SÍ | Auto-commit: SÍ
EOF

cat > ".claude/skills/skill-memory-persistence/skill-memory-persistence.md" << 'EOF'
---
name: skill-memory-persistence
version: 1.0.0
description: Persistencia de memoria entre sesiones vía git. IDIOMA ESPAÑOL permanente.
---
# 🧠 Skill Memory Persistence
- IDIOMA: ESPAÑOL — permanente, nunca cambiar
- Auto-carga al inicio de sesión
- Auto-commit al finalizar sesión
EOF

cat > ".claude/skills/pipeline-supremo/pipeline-supremo.md" << 'EOF'
---
name: pipeline-supremo
version: 1.0.0
description: Commit + Push + Deploy + PR en un solo comando.
---
# 🚀 Pipeline Supremo
/pipeline-supremo "descripción"  → pipeline completo automático
EOF

cat > ".claude/skills/diagnostico-supremo/diagnostico-supremo.md" << 'EOF'
---
name: diagnostico-supremo
version: 1.0.0
description: Diagnóstico completo del ecosistema con auto-fix.
---
# 🔍 Diagnóstico Supremo
/diagnostico-supremo        → escaneo completo
/diagnostico-supremo --fix  → diagnosticar + auto-fix
EOF
echo "✅ Skills base instaladas"

# 7. Subagentes
cat > ".claude/subagents/code-refinement-agent.json" << EOF
{
  "name": "code-refinement-agent",
  "version": "1.0.0",
  "created": "$DATE_UTC",
  "role": "Revisa y optimiza código automáticamente",
  "triggers": ["git push", "/refine"],
  "behavior": { "language": "ESPAÑOL", "auto_commit_fixes": true }
}
EOF

cat > ".claude/subagents/mcp-orchestration-agent.json" << EOF
{
  "name": "mcp-orchestration-agent",
  "version": "1.0.0",
  "created": "$DATE_UTC",
  "role": "Mapea MCPs disponibles como skills",
  "triggers": ["session_start"],
  "behavior": { "auto_create_skills": true, "language": "ESPAÑOL" }
}
EOF
echo "✅ Subagentes configurados"

# 8. settings.json
cat > ".claude/settings.json" << 'EOF'
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "python3 -c \"import json,os; f='.claude/memory/learned_patterns/user_preferences.json'; d=json.load(open(f)) if os.path.exists(f) else {}; print(f\\\"⚡ Kairos Supremo ACTIVO | IDIOMA: {d.get('IDIOMA','ESPAÑOL')} | Autonomía: Nivel {d.get('autonomy_settings',{}).get('level',5)}\\\")\" 2>/dev/null || echo '⚡ Kairos Supremo ACTIVO | IDIOMA: ESPAÑOL | Autonomía: Nivel 5'",
        "timeout": 5,
        "statusMessage": "⚡ Cargando Kairos Supremo..."
      }]
    }],
    "Stop": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "DATE=$(date -u +\"%Y-%m-%dT%H:%M:%SZ\"); mkdir -p .claude/memory/session_logs; F=.claude/memory/session_logs/$(date +%Y-%m-%d).json; python3 -c \"import json,os; f='$F'; d=json.load(open(f)) if os.path.exists(f) else {'IDIOMA':'ESPAÑOL'}; d['session_end']='$DATE'; d['memory_updated']=True; open(f,'w').write(json.dumps(d,indent=2,ensure_ascii=False))\" 2>/dev/null || true; echo '🧠 Memoria de sesión guardada'",
        "timeout": 8,
        "statusMessage": "🧠 Guardando memoria..."
      }]
    }]
  },
  "permissions": {
    "allow": ["Skill","Read","Glob","Grep","Bash(git*)","Bash(npm*)","Bash(node*)","Bash(ls*)","Bash(find*)","Bash(echo*)","Bash(date*)","Bash(mkdir*)","Bash(python3*)","Edit(.claude/**)","Write(.claude/**)"],
    "deny": ["Read(.env)","Read(.env.*)","Edit(.env)","Write(.env)"]
  }
}
EOF
echo "✅ settings.json configurado"

# 9. CLAUDE.md
cat > "CLAUDE.md" << EOF
# CLAUDE.md — $PROYECTO

## 🌐 REGLAS PERMANENTES DEL SISTEMA

> **IDIOMA: ESPAÑOL** — Responder SIEMPRE en español, sin importar el idioma del mensaje. Permanente.
> **AUTONOMÍA: Nivel 5** — Kairos Supremo activo. Config: \`.claude/orchestration/kairos-legendario-config.json\`
> **MEMORIA: Auto-persistencia** — git commit al finalizar sesión.

## Proyecto
- **Nombre**: $PROYECTO
- **Stack**: $STACK
- **Instalado**: $DATE_SHORT

## Skills Activas
- ⚡ Kairos Supremo v1.0
- ⚡ Kairos Legendario v2.0
- 🔧 Skill Auto-Installer
- 🧠 Memory Persistence
- 🚀 Pipeline Supremo
- 🔍 Diagnóstico Supremo
EOF
echo "✅ CLAUDE.md creado"

# 10. Pre-commit hook
mkdir -p ".git/hooks"
cat > ".git/hooks/pre-commit" << 'HOOK'
#!/usr/bin/env bash
DATE_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MEMORY_FILE=".claude/memory/session_logs/$(date +%Y-%m-%d).json"
mkdir -p ".claude/memory/session_logs"
python3 -c "
import json,os
f='$MEMORY_FILE'
d=json.load(open(f)) if os.path.exists(f) else {'IDIOMA':'ESPAÑOL','commits':[]}
d.setdefault('commits',[]).append({'time':'$DATE_UTC','memory_updated':True})
open(f,'w').write(json.dumps(d,indent=2,ensure_ascii=False))
" 2>/dev/null || true
git add ".claude/memory/session_logs/" 2>/dev/null || true
exit 0
HOOK
chmod +x ".git/hooks/pre-commit"
echo "✅ Pre-commit hook configurado"

# 11. Primer commit
git add .claude/ CLAUDE.md 2>/dev/null || true
git commit -m "🤖 init: Kairos Supremo v2.0 — $PROYECTO ($STACK)

- IDIOMA: ESPAÑOL permanente
- Autonomía: Nivel 5
- Kairos Supremo + Legendario activos
- Memory persistence vía git
- Skills: auto-installer, pipeline-supremo, diagnostico-supremo
- Subagentes: code-refinement, mcp-orchestration" 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ ¡Kairos Supremo instalado en: $TARGET_DIR"
echo ""
echo "   🌐 IDIOMA: ESPAÑOL activo"
echo "   🤖 Autonomía: Nivel 5"
echo "   🧠 Memoria: persistente vía git"
echo ""
echo "   Próximos pasos:"
echo "   → Abrí Claude Code en este directorio"
echo "   → /kairos-supremo status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
