# Mercado Libre — domain skill seed

Cubre los 4 paises principales: AR, MX, CL, CO. El dominio cambia
(`mercadolibre.com.ar`, `.mx`, `.cl`, `.com.co`) pero la estructura HTML es
la misma. Browser Harness detecta el pais por el dominio y adapta moneda.

## Tareas soportadas

| Tarea | Archivo | Ejemplo |
|---|---|---|
| Buscar productos | `search.md` | "auriculares bluetooth bajo USD 50 en AR" |
| Top ofertas del dia | `ofertas-dia.md` | "top 20 ofertas de electrodomesticos en AR" |
| Monitor de precio | `price-tracker.md` | "precio del MLA-XXXXX cada 30 min" |
| Listings de un seller | `seller-listings.md` | "todos los listings activos de SellerX" |
| Vehiculos / Inmuebles | `vertical-search.md` | "deptos venta Palermo, 2-3 amb, USD 200K max" |

## Gotchas

- Mercado Libre NO requiere login para buscar — funciona sin sesion.
- "MercadoLider" tiene 3 niveles (gold, platinum, diamante). Detectar el badge.
- "Envio Full" significa que el producto esta en deposito de ML — entrega 24h.
  Importante para clasificar sellers serios.
- Precios en cuotas confunden al parser — siempre extraer el precio "al
  contado", no el "12 cuotas de X".
- "Cancelado por el vendedor" — algunos listings aparecen y desaparecen
  rapido. Si un listing falla al cargar, NO retry — pasar al siguiente.

## Selectores criticos

```
Listing card:   li.ui-search-layout__item
Precio:         span.andes-money-amount__fraction
Cents:          span.andes-money-amount__cents
Seller info:    p.ui-search-official-store-label
Envio full:     svg[aria-label="Full"]
MELI lider:     img[alt*="MercadoLider"]
Rating seller:  span.ui-pdp-reviews__rating__summary__average
```
