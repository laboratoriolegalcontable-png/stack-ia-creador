#!/bin/bash
# =============================================================================
# blindaje/guard.sh — hook PreToolUse: anti-loop + freno de gasto (tokens/API).
#
# FILOSOFÍA: fail-open. Cualquier error interno => exit 0 (deja pasar).
# El guard NUNCA debe romper una sesión legítima.
#
# Frena (deny) SOLO en casos patológicos o ante freno manual:
#   1) Existe el flag EMERGENCY_BRAKE  -> bloquea todo hasta que lo borres.
#   2) Misma llamada idéntica repetida >= HARD veces seguidas (loop real).
#   3) Llamadas totales de la sesión >= MAX_CALLS (backstop de gasto).
# Avisa (no bloquea) en umbrales suaves.
#
# Tuning por entorno:
#   BLINDAJE_LOOP_SOFT (def 12)  BLINDAJE_LOOP_HARD (def 30)
#   BLINDAJE_MAX_CALLS (def 1500) BLINDAJE_GUARD_OFF=1 desactiva por completo.
# =============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh" 2>/dev/null || exit 0
[ -n "${BLINDAJE_GUARD_OFF:-}" ] && exit 0

LOOP_SOFT="${BLINDAJE_LOOP_SOFT:-12}"
LOOP_HARD="${BLINDAJE_LOOP_HARD:-30}"
MAX_CALLS="${BLINDAJE_MAX_CALLS:-1500}"

deny() {  # $1 = razón
  local reason="$1"
  blz_log "GUARD DENY: $reason"
  printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"[blindaje] $reason\"}}"
  echo "[blindaje] FRENO: $reason" >&2
  exit 2
}

warn() {  # $1 = mensaje (no bloquea)
  printf '%s\n' "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"additionalContext\":\"[blindaje] $1\"}}"
  exit 0
}

# Freno de emergencia manual.
if [ -f "$BRAKE_FLAG" ]; then
  deny "freno de emergencia activo. Borralo para continuar: rm '$BRAKE_FLAG'"
fi

# Leer input del hook (stdin) y derivar firma de la llamada.
INPUT="$(cat 2>/dev/null)"
HASH="$(printf '%s' "$INPUT" | python3 -c '
import sys, json, hashlib
try:
    d = json.load(sys.stdin)
    sig = json.dumps([d.get("tool_name",""), d.get("tool_input",{})], sort_keys=True, ensure_ascii=False)
    print(hashlib.sha1(sig.encode("utf-8")).hexdigest()[:12])
except Exception:
    print("")
' 2>/dev/null)"
[ -z "$HASH" ] && exit 0   # sin firma utilizable => fail-open

# Registrar y recortar el historial (cap 200 líneas).
{ echo "$HASH"; } >> "$GUARD_DB" 2>/dev/null || exit 0
LINES="$(wc -l < "$GUARD_DB" 2>/dev/null | tr -d ' ')"
if [ "${LINES:-0}" -gt 200 ]; then
  tail -n 200 "$GUARD_DB" > "$GUARD_DB.tmp" 2>/dev/null && mv "$GUARD_DB.tmp" "$GUARD_DB" 2>/dev/null || true
  LINES=200
fi

# Backstop de gasto total de la sesión (proxy por nº de llamadas).
if [ "${LINES:-0}" -ge "$MAX_CALLS" ]; then
  : > "$BRAKE_FLAG" 2>/dev/null || true
  deny "límite de $MAX_CALLS llamadas alcanzado (backstop de gasto). Revisá y borrá $BRAKE_FLAG para seguir."
fi

# Conteo de repeticiones idénticas consecutivas al final del historial.
REPEAT="$(tail -n "$LOOP_HARD" "$GUARD_DB" 2>/dev/null | awk -v h="$HASH" '
  { if ($0==h) c++; else c=0 } END { print c+0 }')"

if [ "${REPEAT:-0}" -ge "$LOOP_HARD" ]; then
  : > "$BRAKE_FLAG" 2>/dev/null || true
  deny "loop detectado: misma llamada repetida $REPEAT veces. Freno activado para no malgastar tokens/API."
elif [ "${REPEAT:-0}" -ge "$LOOP_SOFT" ]; then
  warn "posible loop: misma llamada repetida $REPEAT veces. Si es intencional seguí; si no, cambiá de estrategia."
fi

exit 0
