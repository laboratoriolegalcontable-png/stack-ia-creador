# Despegar — domain skill seed

Despegar.com es la OTA dominante en LATAM (vuelos, hoteles, paquetes,
asistencia, autos). Cubre AR, MX, BR, CL, CO, UY, etc. El subdominio cambia
por pais (`despegar.com.ar`, `.com.mx`, etc) pero la estructura es la misma.

## Tareas soportadas

| Tarea | Archivo | Ejemplo |
|---|---|---|
| Vuelos | `flights.md` | "vuelos BUE-MAD octubre menores a USD 800" |
| Hoteles | `hotels.md` | "hoteles 4-5 estrellas Punta del Este enero" |
| Paquetes vuelo+hotel | `packages.md` | "paquete Cancun 7 noches todo incluido" |
| Monitor de precio recurrente | `price-monitor.md` | "trackear vuelo X diariamente" |

## Estructura URLs

- Vuelos: `https://www.despegar.com.{tld}/vuelos/`
- Hoteles: `https://www.despegar.com.{tld}/hoteles/`
- Paquetes: `https://www.despegar.com.{tld}/paquetes/`

## Gotchas globales

- Despegar muestra precios "desde" agresivos pero el precio final con tasas
  cambia mucho. SIEMPRE extraer el precio final, no el de portada.
- Los precios incluyen o no impuestos segun pais — verificar.
- Algunos vuelos se muestran con escalas ocultas (1 escala que parece directo).
  Siempre extraer "Vuelo directo: sí/no".
- La pagina renderea con React lazy — Browser Harness espera 2-3s despues
  de cargar antes de scrapear.
- Para fechas flexibles (+/- 3 dias), Despegar tiene una matriz de precios —
  extraerla si esta visible.
