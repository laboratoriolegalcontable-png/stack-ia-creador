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

```markdown
## Busqueda en {vertical}: {ubicacion} ({tipo_operacion})

**Filtros:** {filtros}
**Total resultados:** N (mostrando top {count})

| # | Direccion | Barrio | Precio USD | m2 | USD/m2 | Amb | Dorm | Antig | Publicado | Inmo | URL |
|---|---|---|---|---|---|---|---|---|---|---|---|

### Analisis del mercado
- USD/m2 promedio del filtro: {avg}
- USD/m2 mediana: {median}
- Top 3 mas baratos por USD/m2 (oportunidades):
- Top 3 mas caros por USD/m2 (premium):
- Caidas de precio en la ultima semana (si data disponible): {N listings}
- % publicados por inmobiliarias vs particulares
```

## Caso de uso especifico: triple matricula Diego Orosa

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
