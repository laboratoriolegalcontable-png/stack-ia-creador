# Despegar — busqueda de vuelos

## Inputs
- `origen`: IATA o ciudad (ej: "BUE" o "Buenos Aires")
- `destino`: IATA o ciudad
- `fecha_ida`: YYYY-MM-DD
- `fecha_vuelta`: YYYY-MM-DD (opcional, sino solo ida)
- `pasajeros`: dict {adultos: N, menores: M, infantes: K}
- `clase`: economica | premium | business | first (default economica)
- `currency`: USD | ARS | etc (default USD)
- `max_price`: precio maximo aceptable en `currency`
- `direct_only`: solo vuelos directos (default false)
- `count`: cantidad a devolver (default 10)

## Pasos

1. Navegar a `https://www.despegar.com.{tld}/vuelos/`
2. Llenar formulario: origen, destino, fechas, pasajeros, clase
3. Click "Buscar"
4. Esperar resultados (loader desaparece, lista visible)
5. Aplicar filtros laterales si hace falta:
   - "Solo directos" si `direct_only`
   - "Maximo {max_price}" en el slider de precio
6. Para cada vuelo (hasta `count`):
   - Aerolinea (puede ser combinado de varias)
   - Precio total final (incluye tasas)
   - Precio por persona
   - Vuelo directo: yes/no
   - Numero de escalas
   - Duracion total (en horas)
   - Horario de salida + llegada (origen)
   - Horario de salida + llegada (vuelta si aplica)
   - Equipaje incluido (cabina / despachado)
   - Politica de cancelacion (reembolsable / no)
   - URL para reservar

## Output

```markdown
## Vuelos: {origen} → {destino}
**Fechas:** {ida}{ → {vuelta}}
**Pasajeros:** {N} adultos{ + M menores}
**Filtros aplicados:** directos={direct_only}, max={max_price}

| # | Aerolinea | Precio total | x persona | Directo | Escalas | Duracion | Equipaje | Cancelable | URL |
|---|---|---|---|---|---|---|---|---|---|

### Insights
- Vuelo mas barato: {aerolinea} @ {precio}
- Vuelo mas rapido: {aerolinea} @ {duracion}
- Vuelo con mejor relacion precio/comodidad: {aerolinea} (subrayado)
- Aerolineas dominantes: top 3
- Rango de precios visto: {min} - {max}
- Sugerencia: {"buena epoca para comprar" o "esperar 2-3 dias"} basado en
  patron de precios actuales
```

## Caso de uso: Diego Orosa triple matricula

Si el `origen-destino` es BUE-MAD, MAD-BUE, MVD-MAD o variaciones — agregar
flag "trip business" y calcular costo total ida+vuelta + tiempo total de
viaje. Diego suele preferir AR Plus o Iberia Plus para acumular millas.

## Gotchas

- Precios "desde" en la portada NO son los precios finales. Siempre entrar
  al detalle.
- Algunas aerolineas no aparecen en Despegar (Flybondi a veces queda fuera).
- Vuelos con tarifa "low cost" suelen NO incluir equipaje despachado —
  detectar y advertir.
- Si la fecha esta muy cerca (<7 dias), los precios pueden ser irreales por
  saturacion — informar al usuario.
