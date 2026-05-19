# Instagram — top reels por engagement

## Cuando usar
Quiero saber cuales son los reels con mas vistas/likes de una cuenta — util
para entender que contenido funciona en la competencia.

## Inputs
- `username`: handle sin @
- `count`: cuantos reels devolver (default 10)
- `window_days`: cuantos dias hacia atras (default 90)

## Pasos

1. Navegar a `https://www.instagram.com/{username}/reels/`
2. Esperar grid de reels
3. Para cada reel visible:
   - Hover para revelar play count (Instagram muestra views en hover)
   - Click para abrir
   - Extraer: URL, views, likes, comments, fecha, duracion, primeros 100 chars del caption
   - ESC para cerrar
4. Scroll infinito hasta cubrir `window_days` o juntar al menos `count * 2` candidatos
5. Filtrar por fecha (>= hoy - window_days)
6. Ordenar por views descendente
7. Devolver top `count`

## Output

```markdown
## Top {count} reels de @{username} — ultimos {window_days} dias

| Rank | Fecha | Views | Likes | Comments | Engagement % | Duracion | Caption (80c) | URL |
|---|---|---|---|---|---|---|---|---|

Engagement % = (likes + comments) / views * 100
```

Adicional: identificar patrones — "8 de los top 10 son reels de menos de 15s",
"todos los reels que pasan 100K views tienen caption con CTA en primera linea".

## Gotchas

- Si la cuenta NO tiene reels publicos: devolver mensaje claro, no inventar.
- El play count es aproximado (IG redondea: "1.2M" no "1.234.567").
- Algunos reels viejos no muestran views — saltearlos.
