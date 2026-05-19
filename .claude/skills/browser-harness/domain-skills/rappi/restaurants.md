# Rappi — restaurantes por zona

## Inputs
- `direccion`: direccion exacta o "Palermo, CABA" (default: direccion guardada del usuario)
- `pais`: AR | MX | CL | CO | UY | PE | BR (default AR)
- `categoria`: pizzeria, sushi, hamburguesas, pasteleria, vegetariano, etc (opcional)
- `abierto_ahora`: bool (default true)
- `min_rating`: rating minimo 1-5 (default 4)
- `max_eta`: tiempo maximo de delivery en minutos (default 60)
- `count`: cantidad (default 20)

## Pasos

1. Navegar a `https://www.rappi.com.{tld}/restaurantes`
2. Si no hay direccion seteada, abrir modal de direccion e ingresar `direccion`
3. Esperar carga de la lista (loader desaparece)
4. Aplicar filtros del UI:
   - Abierto ahora: toggle
   - Rating: filter chip
   - ETA max: filter chip
   - Categoria: click en la categoria del menu lateral
5. Para cada restaurante visible (hasta `count`):
   - Nombre
   - Categoria principal
   - Rating (4.5 ★)
   - Cantidad de reviews
   - ETA (ej: "30-45 min")
   - Ticket minimo / monto minimo de pedido
   - Costo de envio
   - Esta abierto: yes/no
   - Badge "Plus" / "Promocionado" yes/no
   - Distancia a la direccion ingresada (si visible)
   - URL del restaurante en Rappi

## Output

```markdown
## Restaurantes en {direccion} — Rappi

**Filtros:** abierto={abierto_ahora}, rating>={min_rating}, eta<={max_eta}min{, cat={categoria}}
**Total encontrados:** N (mostrando top {count})

| # | Nombre | Categoria | ★ Rating | Reviews | ETA | Min pedido | Envio | Abierto | Plus | URL |
|---|---|---|---|---|---|---|---|---|---|---|

### Recomendaciones
- ⭐ Mejor opcion ahora: {nombre} ({rating}, ETA {eta} min, envio gratis)
- 💸 Mas barato (menor ticket minimo): {nombre}
- ⚡ Mas rapido: {nombre} (ETA {eta})
- ⚠ Patrones detectados:
  - {N} restaurantes con rating <4 — saltearlos
  - {N} restaurantes con ETA >90 min — saturados o lejos
```

## Caso de uso Lobo Confiteria

Si la categoria es "pasteleria" o "panaderia" y la direccion es Palermo →
adicional: comparar con los 8 competidores conocidos guardados en
`~/.bh-prompts/competencia-lobo.json` y marcar cuales aparecen, su rating
actual, y si estan abiertos.

## Gotchas

- Rappi a veces oculta el costo de envio hasta que entras al restaurante
  — entrar al detalle solo cuando es necesario.
- Algunos restaurantes muestran "Pedido minimo $X" pero el costo real con
  envio es mucho mas — calcular el total para una orden tipica.
- Restaurantes nuevos (<2 semanas en Rappi) pueden no tener reviews aun —
  marcarlos con flag "nuevo".
