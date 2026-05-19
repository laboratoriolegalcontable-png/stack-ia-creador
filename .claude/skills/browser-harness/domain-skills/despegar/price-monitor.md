# Despegar — monitor de precio recurrente

## Cuando usar
Quiero comprar un vuelo X pero todavia no — espero a que baje. Necesito
que algo me monitoree el precio cada N horas y me avise cuando cae.

## Inputs
- `query`: dict con origen, destino, fechas (igual que flights.md)
- `target_price`: precio objetivo en `currency` (alerta cuando precio <= target)
- `frequency_hours`: cada cuantas horas chequear (default 6)
- `output_log`: ruta del CSV historico (default `~/.bh-runs/despegar/{slug}.csv`)
- `notify_channel`: telegram | slack | email | file (default telegram)

## Pasos

1. Ejecutar la misma busqueda de `flights.md`
2. Tomar el precio mas barato de los primeros 10 resultados
3. Appendear al CSV: `timestamp, precio_min, aerolinea_min, directo_yn, vuelos_disponibles`
4. Comparar con `target_price`:
   - Si precio_min <= target → ENVIAR ALERTA
5. Calcular delta vs ultimas 7 corridas — si hay caida >10% → ENVIAR ALERTA "caida"
6. Si lleva 14+ dias sin moverse → ENVIAR mensaje "este precio se estanco,
   probablemente este es tu precio final"

## Setup como job recurrente

```bash
# Crear el prompt file
cat > ~/.bh-prompts/monitor-buemad-jun.md <<'EOF'
Usa la skill despegar/price-monitor.md con estos parametros:
- origen: BUE
- destino: MAD
- fecha_ida: 2026-06-10
- fecha_vuelta: 2026-06-25
- pasajeros: {adultos: 2}
- clase: economica
- currency: USD
- target_price: 700
- frequency_hours: 6
- output_log: ~/.bh-runs/despegar/buemad-jun.csv
- notify_channel: telegram
EOF

# Agendar cada 6 horas
bash .claude/skills/browser-harness/scripts/schedule.sh \
  --cron "0 */6 * * *" \
  --name "despegar-buemad-jun" \
  --prompt-file ~/.bh-prompts/monitor-buemad-jun.md \
  --output-channel telegram
```

## Output al gatillar alerta

```markdown
🚨 ALERTA DE PRECIO — Despegar

**Ruta:** BUE → MAD
**Fechas:** 2026-06-10 → 2026-06-25
**Pasajeros:** 2 adultos

**Precio actual:** USD {X} — {aerolinea} ({directo/escala})
**Precio objetivo:** USD {target}
**Delta vs ayer:** ⬇ {Y}%

📊 Historico (ultimas 7 corridas):
- ...

👉 [Reservar ahora]({url})

⚠ Recuerda: el precio puede cambiar antes de que termines la reserva.
```

## Gotchas

- Despegar a veces muestra precios distintos en mobile vs desktop. Browser
  Harness usa desktop por consistencia.
- Las cookies de "vuelo visto" pueden inflar el precio en re-visitas — el
  agente usa un perfil incognito para el monitor.
- Si la fecha de viaje ya paso y el job sigue corriendo → auto-cancelar el job
  y notificar al usuario.
