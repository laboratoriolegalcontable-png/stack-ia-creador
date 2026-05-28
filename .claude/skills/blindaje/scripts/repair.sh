#!/bin/bash
# =============================================================================
# blindaje/repair.sh — auto-reparación NO destructiva.
# Solo restaura archivos críticos que estén AUSENTES o con JSON CORRUPTO,
# tomándolos del backup más reciente que tenga una copia válida.
# Nunca sobrescribe un archivo que esté presente y válido.
# Antes de restaurar un archivo corrupto, lo aparta como .corrupt-<ts>.
# =============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh" 2>/dev/null || exit 0

# Busca, recorriendo backups de más nuevo a más viejo, una copia válida de $1.
find_good_copy() {
  local rel="$1" b cand
  while read -r b; do
    cand="$b$rel"
    [ -f "$cand" ] || continue
    if [[ "$rel" == *.json ]]; then
      blz_is_json "$cand" && { echo "$cand"; return 0; }
    else
      echo "$cand"; return 0
    fi
  done < <(ls -1d "$BACKUPS_DIR"/*/ 2>/dev/null | sort -r)
  return 1
}

main() {
  local fixed=0 f src needs ts good
  ts="$(date -u +%Y%m%dT%H%M%SZ)"

  for f in "${CRITICAL_FILES[@]}"; do
    src="$REPO_DIR/$f"
    needs=""
    if [ ! -f "$src" ]; then
      needs="ausente"
    elif [[ "$f" == *.json ]] && ! blz_is_json "$src"; then
      needs="corrupto"
    fi
    [ -z "$needs" ] && continue

    if good="$(find_good_copy "$f")"; then
      mkdir -p "$(dirname "$src")" 2>/dev/null || true
      # Apartar el corrupto (jamás borrar) antes de restaurar.
      if [ "$needs" = "corrupto" ]; then
        cp -p "$src" "$src.corrupt-$ts" 2>/dev/null || true
      fi
      cp -p "$good" "$src" 2>/dev/null && {
        fixed=$((fixed+1))
        blz_log "repair: restaurado $f ($needs) desde $good"
        echo "[blindaje] restaurado: $f ($needs)"
      }
    else
      blz_log "repair: SIN backup válido para $f ($needs)"
      echo "[blindaje] sin backup válido para: $f ($needs) — revisión manual."
    fi
  done

  if [ "$fixed" -eq 0 ]; then
    echo "[blindaje] nada que reparar (todo presente y válido)."
  else
    echo "[blindaje] $fixed archivo(s) restaurado(s). Verificá con git diff antes de commitear."
  fi
}

main 2>/dev/null || true
exit 0
