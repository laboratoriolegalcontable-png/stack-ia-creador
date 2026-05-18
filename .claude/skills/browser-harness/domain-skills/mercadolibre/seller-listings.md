# Mercado Libre — todos los listings de un seller

## Cuando usar
Quiero auditar el catalogo completo de un competidor o seller especifico.

## Inputs
- `seller_id` o `seller_url` (ej: `https://listado.mercadolibre.com.ar/_CustId_12345678`)
- `count_max`: tope de listings a extraer (default 100, sin limite duro)
- `active_only`: solo activos (default true)

## Pasos

1. Navegar a la pagina de listings del seller
2. Para cada pagina de resultados (ML pagina cada 50):
   - Extraer todos los listings con: titulo, precio, MLA-id, condicion,
     vendidos, stock, envio, badge MELI
   - Click "Siguiente" hasta `count_max` o fin
3. Para el seller mismo, extraer:
   - Nivel MercadoLider (gold / platinum / diamante / ninguno)
   - Antiguedad
   - Total ventas historicas
   - % buenas calificaciones
   - Tiempo de respuesta promedio

## Output

```markdown
## Catalogo de {seller_name}

### Seller info
- Nivel: {nivel}
- Antiguedad: {anos} anos
- Total ventas historicas: {N}
- Calificacion: {%} buenas
- Tiempo de respuesta: {minutos/horas}

### Listings activos: {N}

| MLA | Titulo (60c) | Precio | Vendidos | Stock | Full | URL |
|---|---|---|---|---|---|---|

### Analisis de catalogo
- Categorias dominantes: top 3
- Ticket promedio: {precio promedio}
- Producto estrella (mas vendido): {titulo} ({N vendidos})
- Listings nuevos (ultimos 30 dias si data disponible): {N}
- Productos con stock bajo (<5 unidades): {N} → potencial oportunidad
```

## Gotchas

- Sellers grandes (>1000 listings) tardan mucho — ofrecer `count_max` razonable.
- Si el seller cambio de nombre, la URL vieja redirige — registrar el nuevo nombre.
- ML oculta el seller real de algunas tiendas oficiales (muestra solo la marca).
  Detectar y notificar.
