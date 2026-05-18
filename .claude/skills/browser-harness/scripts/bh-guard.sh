#!/usr/bin/env bash
# Browser Harness — Circuit Breaker
# Se sourcea desde cada wrapper. Aborta si detecta runs anomalos.

# Limites por defecto (override con env vars)
BH_MAX_RUNS_PER_HOUR="${BH_MAX_RUNS_PER_HOUR:-3}"
BH_MAX_RUNS_PER_DAY="${BH_MAX_RUNS_PER_DAY:-20}"
BH_MAX_TOTAL_RUNS_PER_DAY="${BH_MAX_TOTAL_RUNS_PER_DAY:-100}"
BH_MAX_DAILY_COST_USD="${BH_MAX_DAILY_COST_USD:-10}"
BH_COST_PER_RUN_USD="${BH_COST_PER_RUN_USD:-0.05}"

bh_alert() {
  local msg="$1"
  echo "[CIRCUIT-BREAKER] $msg" >&2
  if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
      -d chat_id="$TELEGRAM_CHAT_ID" \
      -d text="⚠️ Circuit Breaker: $msg" >/dev/null
  fi
}

bh_count_files_since() {
  local dir="$1"
  local since_epoch="$2"
  local count=0
  [ -d "$dir" ] || { echo 0; return; }
  for f in "$dir"/*.md; do
    [ -f "$f" ] || continue
    local mtime
    mtime=$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null || echo 0)
    [ "$mtime" -gt "$since_epoch" ] && count=$((count + 1))
  done
  echo "$count"
}

bh_guard_check() {
  local job_name="$1"
  local job_dir="$HOME/.bh-runs/$job_name"
  local now hour_ago day_ago

  now=$(date +%s)
  hour_ago=$((now - 3600))
  day_ago=$((now - 86400))

  # 1. Corridas de ESTE job en la ultima hora
  local recent_hour
  recent_hour=$(bh_count_files_since "$job_dir" "$hour_ago")
  if [ "$recent_hour" -ge "$BH_MAX_RUNS_PER_HOUR" ]; then
    bh_alert "$job_name corrio $recent_hour veces en 1 hora (max $BH_MAX_RUNS_PER_HOUR). Abortando."
    return 1
  fi

  # 2. Corridas de ESTE job en el dia
  local recent_day
  recent_day=$(bh_count_files_since "$job_dir" "$day_ago")
  if [ "$recent_day" -ge "$BH_MAX_RUNS_PER_DAY" ]; then
    bh_alert "$job_name corrio $recent_day veces en 24h (max $BH_MAX_RUNS_PER_DAY). Abortando."
    return 1
  fi

  # 3. Corridas globales (todos los jobs) en el dia
  local global_count=0
  for d in "$HOME"/.bh-runs/*/; do
    [ -d "$d" ] || continue
    local c
    c=$(bh_count_files_since "$d" "$day_ago")
    global_count=$((global_count + c))
  done
  if [ "$global_count" -ge "$BH_MAX_TOTAL_RUNS_PER_DAY" ]; then
    bh_alert "Total de jobs hoy: $global_count (max $BH_MAX_TOTAL_RUNS_PER_DAY). Abortando $job_name."
    return 1
  fi

  # 4. KILL SWITCH: si costo estimado del dia supera el limite, apaga TODO
  local estimated_cost
  estimated_cost=$(awk -v n="$global_count" -v c="$BH_COST_PER_RUN_USD" 'BEGIN { printf "%.2f", n * c }')
  if awk -v e="$estimated_cost" -v m="$BH_MAX_DAILY_COST_USD" 'BEGIN { exit !(e >= m) }'; then
    bh_alert "KILL SWITCH: costo estimado hoy \$$estimated_cost >= \$$BH_MAX_DAILY_COST_USD. Apagando TODOS los jobs."
    # Descargar todos los plists
    for plist in "$HOME"/Library/LaunchAgents/com.bh.*.plist; do
      [ -f "$plist" ] && launchctl unload "$plist" 2>/dev/null
    done
    bh_alert "Todos los jobs detenidos. Reactivar manualmente con setup-jobs-diego.sh cuando estes listo."
    return 1
  fi

  return 0
}
