# Rappi — domain skill seed

Rappi cubre delivery de comida, supermercado, farmacia, mascotas, cashRappi
y "RappiPay" en AR, MX, BR, CO, CL, UY, PE. La URL base es
`https://www.rappi.com.{tld}` y NORMALMENTE requiere ingresar una direccion
para mostrar resultados (Rappi necesita saber tu zona de cobertura).

## Tareas soportadas

| Tarea | Archivo | Ejemplo |
|---|---|---|
| Restaurantes por zona | `restaurants.md` | "top restaurantes Palermo abiertos ahora" |
| Comparar precios supermercado | `supermercados.md` | "precio leche La Serenisima en Carrefour, Coto, Dia" |
| Monitor competencia | `competencia-restaurante.md` | "rating y ticket promedio de competidores de Lobo en Palermo" |
| Ofertas activas hoy | `ofertas-hoy.md` | "ofertas vigentes de gastronomia hoy" |

## Gotchas

- **REQUIERE direccion**: sin direccion ingresada, Rappi no muestra restaurantes.
  El skill setea direccion del usuario por default (Diego usa Palermo)
  o pide al usuario una direccion explicita.
- **Cobertura cambia por hora**: un restaurante puede estar abierto a las 13h
  y cerrado a las 16h. Siempre extraer "abierto/cerrado" en el momento del query.
- **Boost / Plus**: algunos restaurantes pagan a Rappi para aparecer arriba.
  Marcar los que tengan badge "Plus" o "Promocionado".
- **ETA**: el tiempo de delivery cambia segun demanda y trafico. Mostrar el ETA
  del momento del query.
- **Sesion**: si pones direccion una vez, Rappi recuerda — usar Chrome con
  sesion para no tener que re-ingresar cada vez.

## URL templates

- Restaurantes: `https://www.rappi.com.{tld}/restaurantes`
- Buscar: `https://www.rappi.com.{tld}/buscar/{query}`
- Categoria: `https://www.rappi.com.{tld}/restaurantes/categoria/{slug}`
- Comercio especifico: `https://www.rappi.com.{tld}/restaurantes/{store-id}`
