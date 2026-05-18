# Mercado Libre — busqueda de productos

## Inputs
- `query`: texto libre (ej: "auriculares bluetooth")
- `country`: AR | MX | CL | CO (default AR)
- `max_price`: precio maximo en moneda local (opcional)
- `min_price`: precio minimo (opcional)
- `condition`: nuevo | usado | both (default both)
- `shipping`: full | free | any (default any)
- `count`: cantidad a devolver (default 20)

## Pasos

1. Navegar a `https://www.mercadolibre.com.{country_tld}/`
   - AR → `.com.ar`, MX → `.com.mx`, CL → `.cl`, CO → `.com.co`
2. Escribir `query` en el search bar y Enter
3. Aplicar filtros del sidebar segun inputs:
   - Condicion → click checkbox
   - Precio → escribir min/max en el filtro de rango
   - "Envio gratis" o "Envio full" → click filter
4. Para cada listing del grid (hasta `count`):
   - Titulo
   - Precio (al contado, sin cuotas)
   - Precio original tachado (si existe → calcular % descuento)
   - Imagen URL
   - Seller name + tipo (oficial / MercadoLider / particular)
   - Envio full (yes/no)
   - Envio gratis (yes/no)
   - Cantidad vendida (texto "+5000 vendidos" si visible)
   - Rating del producto (si visible)
   - URL del listing

## Output

```markdown
## Busqueda: "{query}" en {country}

**Filtros aplicados:** {filtros}
**Total listings encontrados:** N (mostrando top {count})

| # | Titulo (60c) | Precio | Desc % | Seller | Tipo | Full | Vendidos | URL |
|---|---|---|---|---|---|---|---|---|

### Insights
- Rango de precio: {min} - {max}
- Precio promedio: {avg}
- % con envio full: {%}
- Sellers oficiales presentes: {lista}
- Producto mas vendido (segun "+N vendidos"): {titulo}
```

## Gotchas

- Si la busqueda devuelve >10000 resultados, ML pagina — solo extraer
  primera pagina (es lo que el usuario realmente ve).
- "Mejores vendedores" es un re-orden interno de ML — si el usuario quiere
  "los que mas se venden", aplicar `&_OrderId=BEST_SELLERS_DES` a la URL.
- Sponsored listings: ML mezcla anuncios con resultados organicos. Marcar
  los que tengan etiqueta "Publicidad" para que el usuario sepa.
