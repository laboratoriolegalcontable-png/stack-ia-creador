---
description: Análisis financiero del negocio — ingresos, costos, margen, cash flow, proyección, inversiones
allowed-tools: Read, Write, Bash
---

# /finanzas-analisis

Análisis financiero del Estudio Oro S.A.S. y proyectos afiliados.

## Uso

`/finanzas-analisis [periodo]` — ej: "mes-actual", "trimestre", "año-fiscal"

## Output

### 1. Estado de Resultados
- Ingresos brutos
- Honorarios cobrados (cuota litis vs. fees)
- Costos directos (papeleo, peritos, viáticos)
- Costos fijos (oficina, software, sueldos)
- EBITDA
- Impuestos (Ganancias, IIBB CABA, IVA si aplica)
- Resultado neto

### 2. Cash Flow
- Saldo inicial
- Ingresos cobrados (no facturados)
- Egresos del mes
- Saldo final
- Días de runway al ritmo actual

### 3. KPIs
- Ticket promedio por cliente
- LTV (Lifetime Value)
- CAC (Costo de Adquisición)
- LTV / CAC ratio (sano: >3)
- Margen bruto
- Tiempo promedio de cobro

### 4. Cuentas por cobrar
- Lista de honorarios pendientes
- Días de atraso
- Probabilidad de cobro

### 5. Recomendaciones
- 3 acciones para mejorar el cash flow
- 1 cuenta a cobrar urgente
- 1 ajuste de precios sugerido (si aplica)

## Reglas

- Datos exactos del sistema, sin estimaciones inventadas.
- Marcá `[VERIFICAR ARCA]` cualquier dato fiscal pendiente.
- En pesos argentinos + equivalente USD al MEP del día.
