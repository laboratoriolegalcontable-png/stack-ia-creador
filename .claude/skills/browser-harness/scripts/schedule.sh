#!/usr/bin/env bash
# Browser Harness — autonomous scheduler
# Crea jobs recurrentes que corren browser-harness sin que el usuario este presente.
# Soporta cron (Linux/Mac), launchd (Mac nativo) y Task Scheduler (Windows via PowerShell).

set -euo pipefail

CRON=""
NAME=""
PROMPT_FILE=""
OUTPUT_CHANNEL="file"

usage() {
  cat <<EOF
Usage: schedule.sh --cron "CRON_EXPR" --name JOB_NAME --prompt-file PATH [--output-channel CHANNEL]

  --cron           Expresion cron (ej: "0 8 * * *" para 8 AM diario)
  --name           Identificador del job (se usa para logs y como prefijo de archivo)
  --prompt-file    Archivo .md con el prompt que se le pasa a browser-harness
  --output-channel telegram | slack | email | file (default: file)

Ejemplos:
  schedule.sh --cron "0 8 * * *" --name amazon-daily \\
    --prompt-file ~/.bh-prompts/amazon-daily.md

  schedule.sh --cron "*/30 9-18 * * 1-5" --name competencia-ads \\
    --prompt-file ~/.bh-prompts/fb-ads-competencia.md \\
    --output-channel telegram
EOF
  exit 1
}

while [ $# -gt 0 ]; do
  case "$1" in
    --cron) CRON="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --prompt-file) PROMPT_FILE="$2"; shift 2 ;;
    --output-channel) OUTPUT_CHANNEL="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Flag desconocido: $1"; usage ;;
  esac
done

[ -z "$CRON" ] && usage
[ -z "$NAME" ] && usage
[ -z "$PROMPT_FILE" ] && usage
[ ! -f "$PROMPT_FILE" ] && { echo "Prompt file no existe: $PROMPT_FILE"; exit 1; }

# NAME is interpolated into shell paths, filenames, plist labels and the generated
# wrapper script. Restrict it to safe characters to prevent command injection and
# malformed scheduling artifacts.
if ! [[ "$NAME" =~ ^[a-zA-Z0-9_-]{1,64}$ ]]; then
  echo "Nombre inválido: '$NAME'. Permitidos: letras, números, guión y guión bajo (max 64 chars)." >&2
  exit 1
fi

# Repo root = the project that ships this skill. The wrapper needs to cd here so
# `claude -p` finds .claude/skills/. We compute it from SKILL_DIR (set later) to
# avoid hardcoding a username/path.
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$SKILL_DIR/../.." && pwd)"

OS=$(uname -s)
RUNS_DIR="$HOME/.bh-runs/$NAME"
BIN_DIR="$HOME/.bh-bin"
mkdir -p "$RUNS_DIR" "$BIN_DIR"

WRAPPER="$BIN_DIR/run-$NAME.sh"
cat > "$WRAPPER" <<EOF
#!/usr/bin/env bash
set -euo pipefail
export BH_DOMAIN_SKILLS=1
export PATH="\$HOME/.local/bin:\$PATH"
BH_HOME="\${BH_HOME:-\$HOME/Developer/browser-harness}"
TIMESTAMP=\$(date +%Y-%m-%d_%H%M%S)
OUT="$RUNS_DIR/\$TIMESTAMP.md"
# Working directory for claude -p (needs .claude/skills/ to be discoverable).
# Resolved at schedule time from the script location, no hardcoded user path.
cd "$REPO_ROOT"

# Circuit breaker: aborta si detecta runs anomalos
source "$REPO_ROOT/.claude/skills/browser-harness/scripts/bh-guard.sh"
if ! bh_guard_check "$NAME"; then
  echo "Aborted by circuit breaker" > "\$OUT"
  exit 0
fi

claude -p --dangerously-skip-permissions --max-turns 20 --model claude-haiku-4-5-20251001 < "$PROMPT_FILE" > "\$OUT" 2>&1 || echo "FAILED" >> "\$OUT"

# Notificacion segun canal
case "$OUTPUT_CHANNEL" in
  telegram)
    [ -n "\${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "\${TELEGRAM_CHAT_ID:-}" ] && \\
      curl -s -X POST "https://api.telegram.org/bot\$TELEGRAM_BOT_TOKEN/sendDocument" \\
        -F chat_id="\$TELEGRAM_CHAT_ID" \\
        -F document=@"\$OUT" \\
        -F caption="bh:$NAME @ \$TIMESTAMP" >/dev/null
    ;;
  slack)
    [ -n "\${SLACK_WEBHOOK_URL:-}" ] && \\
      curl -s -X POST "\$SLACK_WEBHOOK_URL" \\
        -H 'Content-Type: application/json' \\
        -d "{\"text\":\"bh:$NAME completado — ver \$OUT\"}" >/dev/null
    ;;
  email)
    [ -n "\${BH_EMAIL_TO:-}" ] && command -v mail >/dev/null && \\
      mail -s "bh:$NAME @ \$TIMESTAMP" "\$BH_EMAIL_TO" < "\$OUT"
    ;;
  file)
    : # ya quedo en disco
    ;;
esac
EOF
chmod +x "$WRAPPER"

case "$OS" in
  Darwin)
    PLIST="$HOME/Library/LaunchAgents/com.bh.$NAME.plist"
    # launchd's StartCalendarInterval admite solo enteros puros en cada clave
    # (no rangos `9-18`, no pasos `*/30`, no listas `1,3,5`) y no acepta cron's
    # day-of-month, month ni weekday a menos que sean enteros únicos.
    # Estrategia:
    #   - Si el cron es trivial (Min/Hour enteros en rango, resto `*`) → launchd
    #   - Si no, fallback a crontab (macOS también lo soporta), que sí maneja
    #     toda la sintaxis cron sin pérdida silenciosa de campos.
    IFS=' ' read -r CMIN CHOUR CDOM CMON CDOW <<< "$CRON"
    # in_range $val $min $max — true if $val is a base-10 integer in [min, max].
    # launchd silently accepts out-of-range integers (e.g. Minute=60, Hour=24)
    # and the resulting plist either never fires or fires unpredictably.
    in_range() {
      [[ "$1" =~ ^(0|[1-9][0-9]*)$ ]] && [ "$1" -ge "$2" ] && [ "$1" -le "$3" ]
    }

    if in_range "$CMIN" 0 59 && in_range "$CHOUR" 0 23 \
       && [ "$CDOM" = "*" ] && [ "$CMON" = "*" ] && [ "$CDOW" = "*" ]; then
      cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>            <string>com.bh.$NAME</string>
  <key>ProgramArguments</key> <array><string>$WRAPPER</string></array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Minute</key><integer>$CMIN</integer>
    <key>Hour</key><integer>$CHOUR</integer>
  </dict>
  <key>StandardOutPath</key>  <string>$RUNS_DIR/launchd.out</string>
  <key>StandardErrorPath</key><string>$RUNS_DIR/launchd.err</string>
</dict>
</plist>
EOF
      launchctl unload "$PLIST" 2>/dev/null || true
      launchctl load "$PLIST"
      echo "[OK] Job $NAME agendado via launchd (cron trivial). PList: $PLIST"
    else
      # Cron complejo o valores fuera de rango → usar crontab en macOS también
      CRON_LINE="$CRON $WRAPPER  # bh:$NAME"
      ( crontab -l 2>/dev/null | grep -v "# bh:$NAME"; echo "$CRON_LINE" ) | crontab -
      echo "[OK] Job $NAME agendado via crontab en macOS (expresión cron no representable en launchd)."
      echo "       Línea: $CRON_LINE"
    fi
    ;;
  Linux)
    # Linux: agregar a crontab del usuario
    CRON_LINE="$CRON $WRAPPER  # bh:$NAME"
    ( crontab -l 2>/dev/null | grep -v "# bh:$NAME"; echo "$CRON_LINE" ) | crontab -
    echo "[OK] Job $NAME agendado via cron."
    echo "Linea agregada: $CRON_LINE"
    ;;
  *)
    echo "OS no soportado por schedule.sh: $OS"
    echo "Para Windows, usa Task Scheduler manualmente apuntando a: $WRAPPER"
    exit 1
    ;;
esac

cat <<EOF

─────────────────────────────────────────
Job activo. Detalles:
  Nombre:    $NAME
  Cron:      $CRON
  Prompt:    $PROMPT_FILE
  Output:    $RUNS_DIR/
  Canal:     $OUTPUT_CHANNEL
  Wrapper:   $WRAPPER

Para borrar el job:
  $0 --remove --name $NAME    # (proximamente; por ahora editar a mano)
─────────────────────────────────────────
EOF
