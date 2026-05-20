# Tienda Nube — catalogo publico

## Inputs
- `store_url`: URL raiz de la tienda (ej: `https://mitienda.com.ar`)
- `category`: slug de categoria especifica (opcional)
- `count_max`: tope de productos (default sin tope, ojo con tiendas grandes)
- `with_stock_only`: filtrar productos sin stock (default true)

## Pasos

1. Navegar a `{store_url}/productos` (o `/categoria/{category}` si especificado)
2. Detectar paginacion — TN suele paginar de 12 / 24 / 48 productos
3. Para cada producto del listado:
   - Titulo
   - Precio actual
   - Precio anterior tachado (si hay)
   - Imagen principal
   - URL del producto
   - Etiquetas visibles (oferta, nuevo, agotado)
4. Click en cada producto para extraer detalle:
   - SKU
   - Descripcion (primeras 200c)
   - Stock disponible (numero si visible, sino "disponible")
   - Variantes (color, talle, etc) con sus precios y stock
   - Categorias asignadas
5. Volver al listado, repetir

## Output

```markdown
## Catalogo de {nombre_tienda}

**URL:** {store_url}
**Total productos:** N (extraidos: {count_extracted})
**Categoria:** {category if any}

| SKU | Titulo (60c) | Precio | Antes | Stock | Variantes | Categorias | URL |
|---|---|---|---|---|---|---|---|

### Analisis
- Rango de precio: {min} - {max}
- Precio promedio: {avg}
- % en oferta (con precio antes): {%}
- % sin stock: {%}
- Categoria con mas productos: {nombre} ({N})
- Productos sin imagen: {N} (potencial calidad baja del catalogo)
```

## Gotchas

- Tiendas muy grandes (>1000 productos) → ofrecer `count_max` razonable y
  hacer en background.
- Productos con multiples variantes pueden inflar el conteo — el SKU base es
  uno solo.
- Algunas tiendas tienen carga lazy de imagenes que tarda — esperar antes
  de scrapear.
- Si la tienda usa custom theme exotico (muy de marca), Browser Harness
  puede necesitar 2-3 paginas de exploracion antes de fijar los selectores.
