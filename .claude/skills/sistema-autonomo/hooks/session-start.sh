#!/usr/bin/env bash
# SAA — SessionStart Hook
# Carga memoria persistente + inyecta contexto del Sistema Autónomo de Agentes

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MEMORY_FILE="$(cd "$SCRIPT_DIR/../../.." && pwd)/.claude/memory/sistema-autonomo.md"
SAA_VERSION="1.0.0"

# Detectar proyecto
PROJECT_TYPE="generic"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

if [[ -f "$REPO_ROOT/src/api/routes.ts" ]]; then
  PROJECT_TYPE="diego-orosa"
elif [[ -f "$REPO_ROOT/public/sw.js" ]] && [[ -f "$REPO_ROOT/public/manifest.json" ]]; then
  PROJECT_TYPE="pwa-vanilla"
elif [[ -f "$REPO_ROOT/next.config.js" ]] || [[ -f "$REPO_ROOT/next.config.ts" ]] || [[ -f "$REPO_ROOT/next.config.mjs" ]]; then
  PROJECT_TYPE="nextjs"
elif [[ -f "$REPO_ROOT/supabase/config.toml" ]]; then
  PROJECT_TYPE="supabase"
fi

# Leer memoria
MEMORY_CONTENT=""
if [[ -f "$MEMORY_FILE" ]]; then
  MEMORY_CONTENT=$(head -50 "$MEMORY_FILE" 2>/dev/null || echo "")
fi

python3 - << PYEOF
import json, os

project_type = "$PROJECT_TYPE"
version = "$SAA_VERSION"
memory = """$MEMORY_CONTENT"""

lines = [
    "# 🤖 SISTEMA AUTÓNOMO DE AGENTES (SAA) v" + version + " — ACTIVO",
    "",
    "**Proyecto:** " + project_type,
    "",
    "## Sub-agentes activos:",
    "| Agente | Estado | Función |",
    "|--------|--------|---------|" ,
    "| @memoria | ✅ | Lee/escribe .claude/memory/sistema-autonomo.md |",
    "| @guardian | ✅ | Calidad automática post-Edit/Write |",
    "| @deployer | ✅ | Deploys con CI check automático |",
    "| @kairos-link | ✅ | Directivas EON — responde 'Doctor,' |",
    "| @mejorador | ✅ | Auto-mejora al final de sesión |",
]

if project_type == "diego-orosa":
    lines.append("| @backend-gen | ✅ | Módulos Express + rutas REST |")
elif project_type in ("pwa-vanilla", "nextjs", "react"):
    lines.append("| @frontend-gen | ✅ | Componentes UI + ARIA |")

lines += [
    "",
    "## ⚡ Comandos SAA:",
    "`/saa` `/saa status` `/saa memoria` `/gen-module [X]` `/gen-ui [X]` `/deploy` `/guardian` `/mejorar`",
    "",
    "## 🔗 KAIROS LEGENDARIO: activo — protocolo EON vigente",
]

if memory and len(memory) > 50:
    lines += [
        "",
        "## 💾 Memoria de sesiones anteriores:",
        memory[:600] + ("..." if len(memory) > 600 else ""),
    ]

output = {
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": "\n".join(lines)
    }
}
print(json.dumps(output))
PYEOF
