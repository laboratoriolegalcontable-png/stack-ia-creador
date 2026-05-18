# Tienda Nube — comparacion de precios entre tiendas

## Cuando usar
Tengo un producto (mio o de competencia) y quiero saber a que precio lo
venden las otras tiendas TN del mismo nicho.

## Inputs
- `query`: nombre del producto a buscar (ej: "torta brownie 1kg")
- `stores`: lista de dominios a comparar (ej: ["tienda1.com.ar", "tienda2.com.ar"])
  - Si no se pasa, primero correr `discover-stores.md` para encontrar tiendas
    del rubro
- `currency`: ARS | USD (default ARS)

## Pasos

1. Para cada `store` en `stores`:
   - Navegar a `{store}/` y buscar `query` en el search bar interno
   - Si NO tiene search bar, navegar a `{store}/productos` y filtrar por nombre
   - Extraer los primeros 3 productos que matcheen
   - Para cada match: SKU, titulo, precio, peso/cantidad si en el titulo, stock, URL
2. Normalizar precios — convertir a precio por unidad de referencia (ej: ARS/kg)
3. Construir tabla comparativa

## Output

```markdown
## Comparacion de precios: "{query}"

**Tiendas comparadas:** N
**Productos matcheados:** M

### Tabla cruda

| Tienda | Titulo (50c) | Precio | Stock | URL |
|---|---|---|---|---|

### Tabla normalizada (por unidad)

| Tienda | ARS / kg | vs promedio | Stock |
|---|---|---|---|

### Insights
- Tienda mas barata: {nombre} ({precio})
- Tienda mas cara: {nombre} ({precio})
- Diferencia max: {%}
- Promedio del mercado: {ARS/kg}
- ⚠ Tiendas sin stock del producto: {lista}
```

## Caso de uso para Lobo Confiteria

Si el `query` es un producto de panaderia/pasteleria (torta, panes, salsas):
1. Las tiendas default a comparar son las 8 competidoras de Palermo definidas
   en `~/.bh-prompts/competencia-lobo.json`
2. El reporte se manda automaticamente a Telegram del equipo de Lobo

## Gotchas

- Productos con nombre identico pueden ser variantes distintas (250g vs 500g) —
  intentar detectar y normalizar.
- Stock "agotado" en una tienda no necesariamente significa que no se hace —
  puede estar pausado. Distinguir si es posible.
- Tiendas multimarca pueden tener el mismo producto varias veces — usar SKU
  para deduplicar.
