# Mercado Libre — price tracker recurrente

## Cuando usar
El usuario quiere monitorear el precio de un producto especifico a lo largo
del tiempo. Pensado para correr agendado (ej: cada 30 min, cada 6h, diario).

## Inputs
- `mla_id` o `url` del listing
- `alert_below`: precio que dispara alerta (opcional)
- `alert_above`: precio que dispara alerta de subida (opcional)
- `output_log`: ruta donde acumular historico (default `~/.bh-runs/price-tracker/{mla_id}.csv`)

## Pasos

1. Navegar a la URL del listing
2. Esperar carga completa (`span.andes-money-amount__fraction` visible)
3. Extraer:
   - Precio actual (al contado)
   - Precio original tachado si existe
   - Stock disponible (numero o "sin stock")
   - Seller name + tipo
   - Estado del listing (activo / pausado / sin stock / cancelado)
   - Timestamp (now)
4. Appendear linea al CSV:
   ```
   timestamp,price,original_price,stock,status
   ```
5. Si `alert_below` o `alert_above` configurados y se gatillan:
   - Enviar notificacion (Telegram/Slack si env vars presentes)
   - Crear archivo `.alert` en `~/.bh-runs/price-tracker/{mla_id}-{timestamp}.alert`

## Output a usuario

```markdown
## Precio actual de {titulo del listing}

- **Precio:** {precio} ({moneda})
- **vs precio anterior:** {diff} ({arrow up/down/equal})
- **Stock:** {stock}
- **Historico (ultimas 10 mediciones):**

| Timestamp | Precio | Cambio | Stock |
|---|---|---|---|

{Si hay alerta gatillada:}
🚨 **ALERTA**: el precio cayo por debajo de {alert_below}.
```

## Pensado para agendarse

```bash
# Trackear MLA-1234567890 cada 30 minutos en horario comercial L-V
bash schedule.sh --cron "*/30 9-18 * * 1-5" --name "price-MLA-1234567890" \
  --prompt-file ~/.bh-prompts/track-mla-1234567890.md \
  --output-channel telegram
```

## Gotchas

- Si el listing es eliminado/cancelado, NO fallar — registrar `status=cancelled`
  y stop tracking automaticamente.
- Algunos sellers tienen "precio que cambia segun cantidad" — siempre extraer
  el precio para 1 unidad.
- En periodos de inflacion alta (Argentina), ML ajusta precios diariamente.
  Esperable ver cambios de 1-3% diarios sin que sea anomalia.
