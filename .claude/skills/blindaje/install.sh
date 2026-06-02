#!/bin/bash
# =============================================================================
# blindaje/install.sh — cablea el blindaje en .claude/settings.json.
# IDEMPOTENTE: si ya está instalado, no duplica nada.
# SEGURO: respalda settings.json antes de tocarlo y deduplica claves
# repetidas (preserva comportamiento). Reversible vía el .bak generado.
# =============================================================================

set -uo pipefail
SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$(cd "$SELF/.." && pwd)"   # blindaje -> skills .. -> .claude? no: blindaje está en skills/
# Corregir: SELF = .../.claude/skills/blindaje ; CLAUDE_DIR debe ser .../.claude
CLAUDE_DIR="$(cd "$SELF/../.." && pwd)"
SETTINGS="$CLAUDE_DIR/settings.json"

chmod +x "$SELF/scripts/"*.sh 2>/dev/null || true

if [ ! -f "$SETTINGS" ]; then
  echo "[blindaje] no existe $SETTINGS — abortando sin tocar nada."; exit 1
fi

TS="$(date -u +%Y%m%dT%H%M%SZ)"
cp -p "$SETTINGS" "$SETTINGS.bak-$TS" 2>/dev/null && echo "[blindaje] backup: $SETTINGS.bak-$TS"

python3 - "$SETTINGS" << 'PY'
import json, sys
p = sys.argv[1]
raw = open(p, encoding="utf-8").read()
d = json.loads(raw)  # json.loads ya deduplica claves repetidas (toma la última)

d.setdefault("hooks", {})
hooks = d["hooks"]

def has_cmd(groups, needle):
    for g in groups or []:
        for h in g.get("hooks", []):
            if needle in h.get("command", ""):
                return True
    return False

# --- SessionStart: backup -> repair -> verify (append-only) ---
ss = hooks.setdefault("SessionStart", [])
if not has_cmd(ss, "blindaje/scripts/backup.sh"):
    ss.append({"hooks": [
        {"type": "command",
         "command": 'bash "$CLAUDE_PROJECT_DIR/.claude/skills/blindaje/scripts/backup.sh"',
         "timeout": 15, "statusMessage": "[blindaje] snapshot de memoria..."},
        {"type": "command",
         "command": 'bash "$CLAUDE_PROJECT_DIR/.claude/skills/blindaje/scripts/repair.sh"',
         "timeout": 15, "statusMessage": "[blindaje] auto-reparacion..."},
        {"type": "command",
         "command": 'bash "$CLAUDE_PROJECT_DIR/.claude/skills/blindaje/scripts/verify.sh"',
         "timeout": 15, "statusMessage": "[blindaje] verificacion de integridad..."},
    ]})
    print("[blindaje] SessionStart cableado.")
else:
    print("[blindaje] SessionStart ya estaba cableado (sin cambios).")

# --- PreToolUse: guard anti-loop / freno (append-only) ---
pt = hooks.setdefault("PreToolUse", [])
if not has_cmd(pt, "blindaje/scripts/guard.sh"):
    pt.append({"matcher": "", "hooks": [
        {"type": "command",
         "command": 'bash "$CLAUDE_PROJECT_DIR/.claude/skills/blindaje/scripts/guard.sh"',
         "timeout": 10},
    ]})
    print("[blindaje] PreToolUse (guard) cableado.")
else:
    print("[blindaje] PreToolUse (guard) ya estaba cableado (sin cambios).")

json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("[blindaje] settings.json reescrito y validado.")
PY

# Validación final.
if python3 -c "import json; json.load(open('$SETTINGS'))" 2>/dev/null; then
  echo "[blindaje] OK — settings.json es JSON válido."
else
  echo "[blindaje] ERROR — JSON inválido; restaurando backup."
  cp -p "$SETTINGS.bak-$TS" "$SETTINGS"
  exit 1
fi
