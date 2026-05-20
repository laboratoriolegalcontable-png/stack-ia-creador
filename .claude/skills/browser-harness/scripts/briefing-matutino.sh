#!/usr/bin/env bash
# Briefing matutino de Diego Orosa
# Corre 5 tareas en paralelo (con gaps para no triggar captchas) y consolida en un solo .md
# Pensado para ejecutarse 6:30 AM ART (8:30 AM Madrid) de Lunes a Viernes.

set -euo pipefail

export BH_DOMAIN_SKILLS=1
BH_HOME="${BH_HOME:-$HOME/Developer/browser-harness}"
OUT_DIR="$HOME/.bh-runs/briefing-matutino"
DATE=$(date +%Y-%m-%d)
OUT="$OUT_DIR/$DATE.md"
mkdir -p "$OUT_DIR"

cd "$BH_HOME"

run_step() {
  local name="$1"; local prompt="$2"; local gap="${3:-30}"
  local step_out="$OUT_DIR/$DATE-$name.partial.md"
  echo "[$(date +%H:%M:%S)] >>> Iniciando $name ..." | tee -a "$OUT"
  uv run browser-harness "$prompt" > "$step_out" 2>&1 || echo "FAILED" >> "$step_out"
  echo -e "\n## $name\n" >> "$OUT"
  cat "$step_out" >> "$OUT"
  echo "[$(date +%H:%M:%S)] <<< $name completado. Sleeping ${gap}s..." | tee -a "$OUT"
  sleep "$gap"
}

cat > "$OUT" <<EOF
# Briefing Matutino — $DATE

Generado por browser-harness/briefing-matutino.sh a $(date)

EOF

run_step "lobo-instagram" \
  "Andate a instagram.com/lobo.confiteria. Sacame los ultimos 10 posts, engagement aproximado de cada uno (likes + comments), y detecta el post con mas engagement de las ultimas 2 semanas. Tabla en Markdown."

run_step "lobo-competencia-rappi" \
  "Abri rappi.com.ar, buscar pastelerias en Palermo. Sacame las 10 con mejor rating Y mas tiempo abiertas hoy. Para cada una: nombre, rating, cantidad de reviews, tiempo de delivery, ticket promedio si esta visible. Tabla."

run_step "estudio-oro-boletin" \
  "Andate a boletinoficial.gob.ar. Sacame los decretos y resoluciones de las ultimas 24 horas que mencionen: 'derecho penal', 'inmobiliario', 'codigo civil', 'comercio'. Para cada uno: numero, fecha, organismo, sumilla en 1 linea. Tabla."

run_step "inmobiliaria-zonaprop" \
  "Andate a zonaprop.com.ar. Buscar departamentos en venta en Palermo, 2 o 3 ambientes, hasta USD 200.000. Sacame los 15 mas recientes con: link, precio, m2, dolares por m2, fecha de publicacion. Identificar los que tengan mayor caida de precio respecto a la semana pasada si el dato esta visible."

run_step "narakia-github-prs" \
  "Andate a github.com/laboratoriolegalcontable-png. Lista los PRs abiertos en los 5 repos principales (Diego-Orosa, stack-ia-creador). Para cada PR: numero, titulo, autor, status de CI, dias abierto. Marcar los que llevan >7 dias abiertos."

cat >> "$OUT" <<EOF

---

## Status final

Generado en: $(date)
Tiempo total: ~5-8 minutos (incluyendo gaps anti-captcha)
Output completo: $OUT
EOF

# Notificacion opcional a Telegram
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendDocument" \
    -F chat_id="$TELEGRAM_CHAT_ID" \
    -F document=@"$OUT" \
    -F caption="Briefing matutino $DATE" >/dev/null && \
  echo "[$(date +%H:%M:%S)] Telegram enviado."
fi

echo ""
echo "Briefing listo en: $OUT"
