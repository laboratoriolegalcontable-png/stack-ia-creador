# Tienda Nube — descubrir tiendas por categoria

## Cuando usar
Quiero la lista de tiendas TN activas en mi rubro para hacer prospecting de
competencia o de partnership.

## Inputs
- `categoria`: string libre (ej: "pasteleria", "indumentaria femenina", "vinos")
- `pais`: AR | MX | BR (default AR)
- `count`: cantidad de tiendas (default 30)

## Pasos

1. Navegar a `https://www.tiendanube.com/tiendas/` (catalogo publico de tiendas)
2. Buscar `categoria` en el search/filter
3. Para cada tienda en los resultados:
   - Nombre de la tienda
   - URL del dominio
   - Logo
   - Descripcion corta
   - Categoria principal
   - Ubicacion / provincia
   - Numero de productos (si visible)
   - Antiguedad (si visible)
4. Para cada tienda, abrir en tab nueva y extraer:
   - Si hay info de contacto publica (email, WhatsApp, Instagram)
   - Rango de precio general (sampling de 3-5 productos)
   - Si tiene envios a todo el pais o solo zona

## Output

```markdown
## Tiendas TN activas: "{categoria}" en {pais}

**Total encontradas:** N (mostrando top {count})

| # | Tienda | URL | Categoria | Ubicacion | # Productos | Precio range | Instagram | Email |
|---|---|---|---|---|---|---|---|---|

### Segmentacion
- Tiendas grandes (>500 productos): {N}
- Tiendas chicas (<50 productos): {N}
- Tiendas con presencia en redes sociales: {N}

### Sugerencia para lead hunting
Las {N} tiendas marcadas con ⭐ tienen entre 50-500 productos, tienen Instagram
activo Y contacto publico — son leads ideales para [propuesta].
```

## Caso de uso para Estudio Oro IA

Si la categoria menciona rubros donde Estudio Oro vende automatizacion
(legal, contable, salud) — agregar columna "potencial cliente IA?" con flag
basado en:
- Tiene mas de 100 productos → necesita automatizar
- Hace mas de 2 anos que opera → genera datos
- Tiene contacto publico → se puede prospectar

## Gotchas

- TN ha cambiado varias veces la URL del catalogo publico — Browser Harness
  detecta y se adapta.
- No todas las tiendas estan en el catalogo publico — algunas tienen flag
  "no listada".
- Las stats que muestra TN ("X productos", "X anos") no siempre son visibles
  publicamente — depende del plan.
