#!/bin/bash
# =============================================================================
# blindaje/verify.sh — chequeo de integridad. Reporta drift; no modifica nada.
# Salida legible a stdout (para SessionStart additionalContext) + log.
# Exit 0 siempre (informativo). Devuelve "PROBLEMS=n" en el log.
# =============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh" 2>/dev/null || exit 0

main() {
  local problems=0 msgs=()

  # 1a) Archivos que deben existir.
  local f src
  for f in "${MUST_EXIST[@]}"; do
    src="$REPO_DIR/$f"
    [ -f "$src" ] || { problems=$((problems+1)); msgs+=("FALTA: $f"); }
  done

  # 1b) JSON válido para cualquier .json presente de la lista.
  for f in "${CRITICAL_FILES[@]}"; do
    src="$REPO_DIR/$f"
    if [ -f "$src" ] && [[ "$f" == *.json ]] && ! blz_is_json "$src"; then
      problems=$((problems+1)); msgs+=("JSON CORRUPTO: $f")
    fi
  done

  # 2) Detección de caída de skills vs último backup (repo-agnóstico).
  local nskills prev
  nskills="$(blz_skills_now)"
  prev="$(blz_skills_last_backup)"
  if [ -n "$prev" ] && [ "${prev:-0}" -gt 0 ]; then
    # alarma si nskills < ratio*prev  (aritmética entera: 100*n < ratio100*prev)
    local ratio100; ratio100="$(awk -v r="$SKILLS_DROP_RATIO" 'BEGIN{printf "%d", r*100}')"
    if [ "$((100*nskills))" -lt "$((ratio100*prev))" ]; then
      problems=$((problems+1)); msgs+=("CAÍDA DE SKILLS: $nskills (antes $prev)")
    fi
  fi
  if [ "${SKILLS_MIN:-0}" -gt 0 ] && [ "${nskills:-0}" -lt "$SKILLS_MIN" ]; then
    problems=$((problems+1)); msgs+=("SKILLS BAJO PISO: $nskills < $SKILLS_MIN")
  fi

  blz_log "verify: problems=$problems skills=$nskills"

  if [ "$problems" -eq 0 ]; then
    echo "[blindaje] integridad OK — $nskills skills, archivos críticos íntegros."
  else
    echo "[blindaje] ALERTA: $problems problema(s) detectado(s):"
    local m; for m in "${msgs[@]}"; do echo "  - $m"; done
    echo "  -> ejecutá: bash $CLAUDE_DIR/skills/blindaje/scripts/repair.sh"
  fi
}

main 2>/dev/null || true
exit 0
