# Rappi — monitor de competencia restaurante

## Cuando usar
Tengo un restaurante (Lobo Confiteria) y quiero un radar diario del estado
de mis competidores: rating, ticket promedio, ofertas activas, horarios.

## Inputs
- `competidores`: lista de restaurant_ids o slugs en Rappi
- `mi_restaurante`: opcional, para comparar mis metricas vs ellos
- `zona`: zona de delivery para comparar disponibilidad

## Pasos

1. Para cada `competidor` en `competidores`:
   - Navegar a `https://www.rappi.com.{tld}/restaurantes/{slug}`
   - Extraer:
     - Rating actual + cantidad de reviews
     - Ticket promedio (estimado de los productos visibles en el menu)
     - Ofertas activas (banner + items con descuento)
     - Horario de operacion hoy
     - Esta abierto ahora?
     - ETA actual desde la zona
     - Cantidad de items en el menu
     - Item mas pedido (Rappi a veces lo marca como "Top vendido")
2. Si `mi_restaurante` setado, scrapear lo mismo
3. Comparar y armar matriz

## Output

```markdown
## Radar de competencia — {fecha}

**Zona:** {zona}
**Competidores monitoreados:** {N}{ + tu restaurante}

### Estado actual

| Restaurante | ★ | Reviews | Ticket prom | Items menu | Abierto | ETA | Ofertas hoy |
|---|---|---|---|---|---|---|---|

### Movimientos desde la ultima corrida (si historico disponible)

- {competidor X}: rating subio de 4.3 a 4.5 (+0.2)
- {competidor Y}: lanzo nueva oferta "20% off martes"
- {competidor Z}: aparece cerrado hoy (atipico)

### Insights
- 💪 Mejor posicionado: {competidor} (rating + ETA + ofertas)
- 📉 Mas debilitado: {competidor} (rating bajando o cerrado mucho)
{Si mi_restaurante:}
- 📊 Tu vs promedio competencia:
  - Rating: tu {X} vs promedio {Y} → {+/-}
  - Ticket: tu {X} vs promedio {Y} → {+/-}
  - ETA: tu {X} vs promedio {Y} → {+/-}
```

## Setup para job diario

```bash
cat > ~/.bh-prompts/radar-lobo.md <<'EOF'
Usa la skill rappi/competencia-restaurante.md con:
- competidores: [
    "lobo-confiteria",  # mi
    "competidor-1-slug",
    "competidor-2-slug",
    ... (8 totales)
  ]
- mi_restaurante: "lobo-confiteria"
- zona: "Palermo, CABA"

Compara con la corrida de ayer si esta en disco.
EOF

bash .claude/skills/browser-harness/scripts/schedule.sh \
  --cron "0 10 * * *" \
  --name "radar-lobo" \
  --prompt-file ~/.bh-prompts/radar-lobo.md \
  --output-channel telegram
```

## Gotchas

- "Ticket promedio" es una estimacion del agente promediando 5-10 items
  visibles del menu — no es el dato real de Rappi.
- "Top vendido" no siempre esta visible — depende de version A/B de Rappi.
- Restaurantes pueden cambiar de slug cuando se rebrandean — el agente
  debe verificar que el slug sigue activo.
