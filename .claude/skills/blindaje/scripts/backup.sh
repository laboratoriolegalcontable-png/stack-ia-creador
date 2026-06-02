#!/bin/bash
# =============================================================================
# blindaje/backup.sh — snapshot append-only de la config y memoria críticas.
# NUNCA modifica los originales. Solo copia a un directorio con timestamp.
# Apto para correr en SessionStart (fail-open: cualquier error => exit 0).
# =============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh" 2>/dev/null || exit 0

main() {
  local ts dest
  ts="$(date -u +%Y%m%dT%H%M%SZ)"
  dest="$BACKUPS_DIR/$ts"
  mkdir -p "$dest" 2>/dev/null || return 0

  # Copiar archivos críticos preservando subruta.
  local f src
  for f in "${CRITICAL_FILES[@]}"; do
    src="$REPO_DIR/$f"
    if [ -f "$src" ]; then
      mkdir -p "$dest/$(dirname "$f")" 2>/dev/null || true
      cp -p "$src" "$dest/$f" 2>/dev/null || true
    fi
  done

  # Manifiesto de skills (nombre + versión) para detectar drift/borrados.
  python3 - "$CLAUDE_DIR/skills" "$dest/skills-manifest.tsv" 2>/dev/null << 'PY' || true
import os, re, sys
sd, out = sys.argv[1], sys.argv[2]
rows = []
if os.path.isdir(sd):
    for n in sorted(os.listdir(sd)):
        sk = os.path.join(sd, n, "SKILL.md")
        ver = ""
        if os.path.isfile(sk):
            t = open(sk, encoding="utf-8", errors="ignore").read()
            m = re.search(r'^---\s*(.*?)\s*---', t, re.S)
            if m:
                v = re.search(r'^version:\s*(.+)$', m.group(1), re.M)
                ver = v.group(1).strip() if v else ""
        rows.append(f"{n}\t{ver}")
open(out, "w", encoding="utf-8").write("\n".join(rows))
PY

  # Inventarios simples de agents/commands/hooks.
  ls -1 "$CLAUDE_DIR/agents"   > "$dest/agents.txt"   2>/dev/null || true
  ls -1 "$CLAUDE_DIR/commands" > "$dest/commands.txt" 2>/dev/null || true
  ls -1 "$CLAUDE_DIR/hooks"    > "$dest/hooks.txt"    2>/dev/null || true

  blz_log "backup OK -> $dest ($(ls -1 "$CLAUDE_DIR/skills" 2>/dev/null | wc -l | tr -d ' ') skills)"

  # Prune: conservar solo los últimos BACKUPS_KEEP.
  local n
  n="$(ls -1d "$BACKUPS_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${n:-0}" -gt "$BACKUPS_KEEP" ]; then
    ls -1d "$BACKUPS_DIR"/*/ 2>/dev/null | sort | head -n "$((n - BACKUPS_KEEP))" \
      | while read -r old; do rm -rf "$old" 2>/dev/null || true; done
  fi
}

main 2>/dev/null || true
exit 0
