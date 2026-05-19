# Mercado Libre — ofertas del dia

## Inputs
- `country`: AR | MX | CL | CO
- `category`: electrodomesticos, tecnologia, hogar, ropa, etc (opcional)
- `min_discount`: % minimo de descuento (default 30)
- `count`: cuantas devolver (default 20)

## Pasos

1. Navegar a `https://www.mercadolibre.com.{tld}/ofertas`
2. Si `category` definido, click en la categoria en el sidebar
3. Ordenar por "Mayor descuento"
4. Para cada oferta (hasta `count`):
   - Titulo
   - Precio actual
   - Precio original
   - % descuento (calculado o tomado del badge)
   - Stock visible (ej: "Quedan 3" o nada)
   - Seller + MercadoLider yes/no + Envio Full yes/no
   - Fecha de vencimiento de la oferta si visible (algunas son "termina hoy")
   - URL

## Output

```markdown
## Ofertas del dia — {country}{, categoria: X}

**Filtro:** descuento >= {min_discount}%
**Total ofertas encontradas:** N (mostrando top {count})

| # | Titulo (60c) | Precio | Original | Desc % | Stock | Seller | MELI | Full | URL |
|---|---|---|---|---|---|---|---|---|---|

### Highlights
- ⭐ MEJORES: subrayar las que sean MELI + Full + descuento > 50%
- Vencimientos urgentes: las que digan "termina hoy" o "ultimas horas"
- Categorias dominantes: top 3 categorias representadas
```

## Gotchas

- Hay 2 tipos de ofertas: "Ofertas del dia" (curadas por ML) y "Liquidaciones"
  (cualquier descuento). Si el usuario no especifica, usar las curadas.
- Algunos vendedores inflan el precio original para mostrar mas descuento.
  Si el "% descuento" parece sospechoso (>80%), marcarlo con ⚠️.
- Stock "Quedan N" es honesto, pero "Mas de 50 disponibles" es estimacion.
