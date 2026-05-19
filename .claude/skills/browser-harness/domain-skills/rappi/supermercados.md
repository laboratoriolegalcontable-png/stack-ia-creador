# Rappi — comparar precios en supermercados

## Cuando usar
Quiero saber cual super tiene mas barato un producto especifico, o hacer
una canasta de productos y comparar entre supermercados.

## Inputs
- `productos`: lista de strings (ej: ["leche La Serenisima 1L", "harina 000 1kg"])
- `supers`: lista de IDs de supermercados (default: Carrefour, Coto, Dia, Disco, Jumbo)
- `direccion`: para saber cobertura
- `pais`: AR | MX | CL | etc

## Pasos

1. Setear direccion en Rappi
2. Para cada `super` en `supers`:
   - Entrar al supermercado (URL: `/restaurantes/{store-id}` o `/supermercado/{slug}`)
   - Para cada `producto` en `productos`:
     - Buscar en el search bar interno del super
     - Tomar el primer match relevante (el agente decide cual es el match correcto)
     - Extraer: SKU, titulo, marca, precio, precio anterior si en oferta, presentacion (1L, 1kg, etc)
   - Si el producto NO esta disponible en ese super, marcarlo como `null`
3. Construir tabla cruzada

## Output

```markdown
## Comparacion supermercados — {direccion}

**Productos buscados:** {N}
**Supermercados comparados:** {M}

### Tabla cruzada

| Producto | Carrefour | Coto | Dia | Disco | Jumbo | Mas barato |
|---|---|---|---|---|---|---|

### Canasta total

| Super | Total canasta | Diff vs mas barato | Productos faltantes |
|---|---|---|---|

### Conclusion
- 🏆 Mejor opcion para esta canasta: {super} (${total})
- ⚠ {super} no tiene {N} productos — habria que comprar en 2 supers
- 💡 Si compras solo {producto X}, el mas barato es {super}
- 💡 Si compras solo {producto Y}, el mas barato es {super}
```

## Caso de uso Lobo Confiteria

Si la lista de productos incluye items de panaderia / pasteleria (harina,
azucar, manteca, levadura, huevos, frutos secos) → es la canasta para Lobo.
Correr este job 1x por semana automatizado y mandar a Telegram del equipo.

## Gotchas

- "Sin stock" en Rappi no siempre significa que el super no lo tiene —
  puede ser solo en esa zona de delivery.
- Las marcas blancas suelen ser mas baratas pero el match del buscador no
  siempre las prioriza — el agente debe elegir consciente.
- Algunos supers cobran "fee de servicio" en Rappi que no es visible
  hasta el checkout — alertar.
- Las ofertas tipo "2x1" o "lleva 3 paga 2" son dificiles de parsear —
  marcar con asterisco si se detectan.
