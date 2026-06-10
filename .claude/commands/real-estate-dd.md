---
description: Due diligence inmobiliaria completa — auditoría jurídica del título antes de comercializar
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
---

# /real-estate-dd

Due diligence inmobiliaria con la doble matrícula del Estudio Oro (abogado + corredor CUCICBA).

## Uso

`/real-estate-dd [dirección | matrícula | titular]`

## Checklist (12 puntos)

1. **Título de propiedad** — escritura, antecedentes, cadena dominial 20 años
2. **Inhibiciones** — del titular en Registro de la Propiedad
3. **Hipotecas y embargos** — vigentes sobre el inmueble
4. **Boleta ABL/inmobiliario** — deudas de impuestos municipales/provinciales
5. **Expensas** — al día / deudas / tipo de consorcio
6. **Reglamento de copropiedad** — restricciones, uso permitido
7. **Plano y catastro** — coincide con la realidad
8. **Habilitación municipal** — si es local comercial
9. **Servicios** — luz, gas, agua sin deuda y a nombre del titular
10. **Sucesión / divorcio** — si hay condóminos no declarados
11. **Usucapión** — riesgo de ocupación de terceros
12. **Plusvalía / blanqueo** — origen de fondos del comprador

## Output

Reporte de auditoría con semáforo (🟢 OK / 🟡 Verificar / 🔴 Bloqueante) en cada uno de los 12 puntos + conclusión: "Aprobada para comercializar / Aprobada con observaciones / Rechazada".

## Reglas

- Marcá `[VERIFICAR REGISTRO]` cualquier dato que requiera consulta en el RPI.
- Si hay observaciones bloqueantes (🔴), no autorizar comercialización hasta resolverlas.
- Esta auditoría es el diferencial único del Estudio Oro: corredor CUCICBA + triple matrícula de abogado.
