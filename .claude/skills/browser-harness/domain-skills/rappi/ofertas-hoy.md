# Rappi — ofertas vigentes hoy

## Inputs
- `categoria`: gastronomia | supermercado | farmacia | mascotas | bebidas (default todo)
- `zona`: direccion
- `min_descuento`: % minimo (default 20)
- `count`: cantidad (default 20)

## Pasos

1. Navegar a `https://www.rappi.com.{tld}/ofertas` o seccion "Ofertas" del home
2. Si `categoria` setada, filtrar
3. Para cada oferta visible:
   - Comercio
   - Item ofertado o tipo de oferta ("20% off en todo", "envio gratis")
   - % descuento
   - Precio final (si producto puntual)
   - Vigencia (hoy, fin de semana, todo el mes, etc)
   - Codigo de cupon necesario yes/no
4. Filtrar por `min_descuento`
5. Ordenar por mayor descuento

## Output

```markdown
## Ofertas en Rappi — {zona} ({fecha})

**Filtros:** categoria={categoria}, min_descuento={min_descuento}%
**Total ofertas:** {N}

| # | Comercio | Categoria | Oferta | % off | Vigencia | Codigo |
|---|---|---|---|---|---|---|

### Highlights
- 🔥 Mayor descuento: {comercio} ({oferta}, {%})
- ⏰ Vencen hoy: {N} ofertas → priorizar
- 💳 Sin cupon necesario: {N} ofertas → mas faciles de usar
```

## Gotchas

- Algunas ofertas requieren pagar con RappiPay — marcarlas.
- "Envio gratis" no es descuento del producto, es del fee — calcular impacto
  real (suele ser $300-800 ahorrados).
- Ofertas de "primera compra" no aplican si ya tenes cuenta — el agente
  detecta y filtra.
