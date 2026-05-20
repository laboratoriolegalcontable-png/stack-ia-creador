#!/usr/bin/env bash
# Setup completo de jobs autonomos pre-armados para Diego Orosa.
# Crea los archivos de prompt y agenda los 7 jobs en una sola corrida.

set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPTS_DIR="$HOME/.bh-prompts"
SCHEDULE="$SKILL_DIR/scripts/schedule.sh"

mkdir -p "$PROMPTS_DIR"

# Copiar los prompts pre-armados del repo a ~/.bh-prompts
cp -n "$SKILL_DIR"/prompts/*.md "$PROMPTS_DIR/" 2>/dev/null || true

log() { printf "\033[1;36m[setup-jobs]\033[0m %s\n" "$*"; }

# 1. Briefing matutino — L-V 6:30 AM
log "Job 1/7: briefing-matutino (L-V 6:30 AM)"
# Este usa el script especial, no schedule.sh generico
case "$(uname -s)" in
  Darwin)
    PLIST="$HOME/Library/LaunchAgents/com.bh.briefing-matutino.plist"
    cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.bh.briefing-matutino</string>
  <key>ProgramArguments</key><array><string>$SKILL_DIR/scripts/briefing-matutino.sh</string></array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>30</integer><key>Weekday</key><integer>1</integer></dict>
    <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>30</integer><key>Weekday</key><integer>2</integer></dict>
    <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>30</integer><key>Weekday</key><integer>3</integer></dict>
    <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>30</integer><key>Weekday</key><integer>4</integer></dict>
    <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>30</integer><key>Weekday</key><integer>5</integer></dict>
  </array>
  <key>StandardOutPath</key><string>$HOME/.bh-runs/briefing-matutino/launchd.out</string>
  <key>StandardErrorPath</key><string>$HOME/.bh-runs/briefing-matutino/launchd.err</string>
</dict></plist>
EOF
    launchctl unload "$PLIST" 2>/dev/null || true
    launchctl load "$PLIST"
    ;;
  Linux)
    LINE="30 6 * * 1-5 $SKILL_DIR/scripts/briefing-matutino.sh  # bh:briefing-matutino"
    (crontab -l 2>/dev/null | grep -v "# bh:briefing-matutino"; echo "$LINE") | crontab -
    ;;
esac

# 2-7: usar schedule.sh
log "Job 2/7: lobo-radar-rappi (Diario 10 AM)"
bash "$SCHEDULE" --cron "0 10 * * *" --name "lobo-radar-rappi" \
  --prompt-file "$PROMPTS_DIR/lobo-radar-rappi.md" --output-channel telegram

log "Job 3/7: lobo-canasta-super (Lunes 9 AM)"
bash "$SCHEDULE" --cron "0 9 * * 1" --name "lobo-canasta-super" \
  --prompt-file "$PROMPTS_DIR/lobo-canasta-super.md" --output-channel telegram

log "Job 4/7: triple-matricula (Jueves 9 AM)"
bash "$SCHEDULE" --cron "0 9 * * 4" --name "triple-matricula" \
  --prompt-file "$PROMPTS_DIR/triple-matricula.md" --output-channel telegram

log "Job 5/7: ads-competencia (Cada 6h)"
bash "$SCHEDULE" --cron "0 */6 * * *" --name "ads-competencia" \
  --prompt-file "$PROMPTS_DIR/ads-competencia.md" --output-channel telegram

log "Job 6/7: narakia-prs (Cada 30min L-V 9-18)"
bash "$SCHEDULE" --cron "*/30 9-18 * * 1-5" --name "narakia-prs" \
  --prompt-file "$PROMPTS_DIR/narakia-prs.md" --output-channel telegram

log "Job 7/7: vuelo-buemad-jun (Cada 6h)"
bash "$SCHEDULE" --cron "0 */6 * * *" --name "vuelo-buemad-jun" \
  --prompt-file "$PROMPTS_DIR/vuelo-buemad-jun.md" --output-channel telegram

cat <<EOF

────────────────────────────────────────
✅ 7 jobs autonomos activos.

Resultados se acumulan en:
  ~/.bh-runs/<job-name>/YYYY-MM-DD.md

Notificaciones a Telegram (si TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID estan
en tu shell). Sin esas vars, los outputs solo quedan en disco.

Para verlos a posteriori, abrir el dashboard:
  open .claude/skills/browser-harness/dashboard.html

Para parar un job:
  Mac:   launchctl unload ~/Library/LaunchAgents/com.bh.<name>.plist
  Linux: crontab -e  → borrar la linea con # bh:<name>
────────────────────────────────────────
EOF
