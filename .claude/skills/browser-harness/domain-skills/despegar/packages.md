# Despegar — paquetes vuelo + hotel

## Cuando usar
Quiero comparar paquetes combinados vs comprar separado. Los paquetes
suelen ser 10-20% mas baratos que sumar vuelo + hotel.

## Inputs
- `origen`: ciudad de salida
- `destino`: ciudad destino
- `checkin`: YYYY-MM-DD
- `checkout`: YYYY-MM-DD
- `huespedes`: dict
- `min_stars`: minimo estrellas del hotel
- `regimen`: solo_alojamiento | desayuno | media_pension | todo_incluido
- `count`: cantidad (default 10)

## Pasos

1. Navegar a `https://www.despegar.com.{tld}/paquetes/`
2. Llenar formulario completo
3. Aplicar filtros: estrellas, regimen
4. Para cada paquete:
   - Precio total
   - Vuelo: aerolinea, directo/escalas, duracion, equipaje
   - Hotel: nombre, estrellas, rating, regimen, ubicacion
   - Politica de cancelacion del paquete completo
   - Ahorro estimado vs comprar separado (Despegar muestra el comparativo)
   - URL

## Output

```markdown
## Paquetes {origen} → {destino}
**Fechas:** {checkin} → {checkout} ({noches} noches)
**Huespedes:** {N}
**Filtros:** {min_stars}+ ★, regimen={regimen}

| # | Hotel | ★ | Aerolinea | Regimen | Precio total | $/dia/persona | Ahorro vs separado | URL |
|---|---|---|---|---|---|---|---|---|

### Comparativo paquete vs separado

| | Comprar paquete | Comprar separado | Ahorro |
|---|---|---|---|
| Mejor opcion barata | ${X} | ${Y} | ${Z} ({%}) |
| Mejor opcion premium | ${X} | ${Y} | ${Z} ({%}) |

### Insights
- Si el ahorro del paquete es >15% → recomendar paquete
- Si el ahorro es <5% → recomendar comprar separado (mas flexibilidad)
- Todo incluido suele convenir si la estadia es >5 noches
```

## Gotchas

- "Todo incluido" puede no incluir excursiones, propinas, ni cierto bebidas
  premium — verificar el detalle del hotel.
- Algunos paquetes son no reembolsables — alertar al usuario antes de
  recomendar.
- En temporada alta (vacaciones de invierno, fin de ano), el paquete puede
  no salir mas barato que separado — ojo.
