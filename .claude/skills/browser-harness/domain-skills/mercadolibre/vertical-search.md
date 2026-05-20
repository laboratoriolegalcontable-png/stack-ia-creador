# Mercado Libre — busqueda vertical (vehiculos, inmuebles)

## Cuando usar
Buscar en las verticales especializadas, NO en el catalogo general. Estas
verticales tienen filtros propios y estructura distinta.

## Inputs
- `vertical`: vehiculos | inmuebles | servicios
- `country`: AR | MX | CL | CO
- `tipo_operacion`: venta | alquiler | temporario (solo inmuebles)
- `ubicacion`: barrio / ciudad / provincia
- `filtros`: dict con filtros especificos (ambientes, dormitorios, anos, km, etc)
- `count`: cantidad (default 30)

## Pasos para inmuebles (caso mas comun en Estudio Oro)

1. Navegar a `https://inmuebles.mercadolibre.com.{tld}/`
2. Seleccionar tipo de operacion (Venta / Alquiler)
3. Buscar ubicacion en el search bar
4. Aplicar filtros:
   - Tipo de propiedad (departamento, casa, ph, terreno)
   - Ambientes / Dormitorios
   - Precio min/max + moneda (USD o moneda local)
   - Superficie m2
   - Antigüedad
   - Amenities (cochera, pileta, etc)
5. Para cada listing:
   - Titulo
   - Precio (USD si visible, sino moneda local)
   - Expensas
   - m2 totales + m2 cubiertos
   - Ambientes
   - Dormitorios
   - Banos
   - Antigüedad
   - Direccion completa visible (calle + altura si disponible)
   - Barrio
   - Inmobiliaria / Particular
   - Fecha de publicacion
   - URL
6. Calcular USD/m2 para cada uno

## Output

Importante: el precio puede venir en USD o en la moneda local del país
(ARS, MXN, CLP, COP). NO asumir USD. La tabla incluye una columna `Moneda`
para preservar la fuente original, y `Precio/m2` se calcula en la **misma
moneda** que `Precio` (no convertir). Si el usuario pide ranking unificado
en USD, hacer la conversión en una sección aparte usando la tasa del día
y citarla explícitamente.

```markdown
## Busqueda en {vertical}: {ubicacion} ({tipo_operacion})

**Filtros:** {filtros}
**Total resultados:** N (mostrando top {count})

| # | Direccion | Barrio | Precio | Moneda | m2 | Precio/m2 | Amb | Dorm | Antig | Publicado | Inmo | URL |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

### Analisis del mercado (por moneda)
- Precio/m2 promedio (USD): {avg_usd} — sobre los N listings publicados en USD
- Precio/m2 promedio (moneda local): {avg_local} {currency} — sobre los M listings en moneda local
- Mediana USD: {median_usd}
- Mediana local: {median_local} {currency}
- Top 3 más baratos por Precio/m2 dentro de cada moneda (oportunidades)
- Top 3 más caros por Precio/m2 dentro de cada moneda (premium)
- Caídas de precio en la última semana (si la data está disponible): {N listings}
- % publicados por inmobiliarias vs particulares

### Conversión opcional a USD
Si el usuario lo pide, convertir los precios en moneda local usando la tasa
de cambio del día (citar fuente y fecha). NO mezclar USD nativo con USD
convertido en el mismo ranking sin marcar cuál es cuál.
```

## Caso de uso especifico: comparativo triple matricula (BUE-MAD-MVD)

Si el usuario menciona "triple matricula" o "comparativo BUE-MAD-MVD":
1. Correr esta skill 3 veces:
   - inmuebles.mercadolibre.com.ar / Palermo
   - idealista.com (NO ML, usar otra skill) / Madrid Centro
   - mercadolibre.com.uy / Punta Carretas Montevideo
2. Devolver tabla comparativa unificada con USD/m2 por ciudad.

## Gotchas

- Las direcciones a veces estan ocultas (solo barrio) — los inmuebles caros
  no publican calle exacta.
- "Apto profesional" es importante para Estudio Oro — filtrar por amenities.
- "Permuta" no es venta — filtrar fuera si el usuario busca solo venta.
