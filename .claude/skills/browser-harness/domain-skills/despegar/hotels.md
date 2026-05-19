# Despegar — busqueda de hoteles

## Inputs
- `destino`: ciudad / barrio / hotel especifico
- `checkin`: YYYY-MM-DD
- `checkout`: YYYY-MM-DD
- `huespedes`: dict {adultos: N, menores: M, habitaciones: K}
- `min_stars`: minimo de estrellas (1-5, default 3)
- `max_price_per_night`: tope por noche en `currency`
- `currency`: USD por default
- `amenities`: lista (wifi, pileta, desayuno, parking, mascotas, etc)
- `count`: cantidad (default 20)

## Pasos

1. Navegar a `https://www.despegar.com.{tld}/hoteles/`
2. Llenar destino, fechas, huespedes
3. Click "Buscar"
4. Aplicar filtros del sidebar:
   - Estrellas: checkbox del min_stars en adelante
   - Precio: slider hasta max_price_per_night
   - Amenities: marcar los pedidos
5. Para cada hotel (hasta `count`):
   - Nombre
   - Direccion (calle + barrio)
   - Estrellas
   - Rating de huespedes (1-10) + cantidad de reviews
   - Precio total para la estadia
   - Precio por noche
   - Tipo de habitacion ofrecida
   - Politica de cancelacion (reembolsable, ventana de cancelacion)
   - Desayuno incluido yes/no
   - Distancia al centro o punto de referencia
   - Imagen principal
   - URL

## Output

```markdown
## Hoteles en {destino}
**Fechas:** {checkin} → {checkout} ({noches} noches)
**Huespedes:** {N} adultos{ + M menores} en {K} habitacion(es)
**Filtros:** {min_stars}+ ★, max ${max_price_per_night}/noche, amenities: {lista}

| # | Hotel | ★ | Rating | Reviews | $/noche | Total | Desayuno | Cancelable | Distancia | URL |
|---|---|---|---|---|---|---|---|---|---|---|

### Recomendaciones
- ⭐ Mejor relacion precio/rating: {hotel} ({rating} con {precio}/noche)
- 💎 Premium: {hotel} (4-5 estrellas, ubicacion central)
- 💸 Mas barato decente: {hotel} ({precio}/noche, rating >7)
- ⚠ Evitar: {hotel} (rating <6 con muchas reviews → senal clara)
```

## Gotchas

- Algunos hoteles tienen "Precio exclusivo PASSPORT" — es el plan de
  fidelidad de Despegar. Mostrar ambos precios si visible.
- Hoteles con "Sin desayuno" suelen tener opcion paga adicional — listar.
- Imagenes y descripciones pueden ser viejas — usar rating reciente como
  mejor senal de calidad actual.
- Si el destino es muy turistico en temporada alta, los precios cambian
  hora a hora — re-correr la busqueda para confirmar antes de reservar.
