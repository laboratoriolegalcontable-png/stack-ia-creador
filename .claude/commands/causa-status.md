---
description: Resume el estado actual de una causa judicial, próximas fechas y movimientos pendientes
allowed-tools: Read, Bash, WebFetch
---

# /causa-status

Reporte ejecutivo del estado de una causa judicial.

## Uso

`/causa-status [número-de-causa | nombre-cliente | tema]`

## Proceso

1. Buscá la causa en el sistema de gestión (OroGest, Supabase tabla `narakia_leads`, archivos locales).
2. Si no está cargada, pedí: número de expediente, juzgado, carátula, fecha de inicio.
3. Generá un reporte de 1 página con:
   - **Carátula y datos**: número, juzgado, fuero, partes
   - **Última actuación**: fecha y resumen
   - **Próxima fecha**: audiencia, vencimiento de plazo, vista
   - **Pendientes nuestros**: qué tenemos que hacer y para cuándo
   - **Pendientes de la contraparte / juzgado**
   - **Riesgos**: qué puede pasar si no actuamos
   - **Recomendación inmediata**: 1 acción concreta para esta semana

## Reglas

- Marcá `[VERIFICAR PJN]` cualquier dato que no esté cargado en el sistema y deba chequearse en pjn.gov.ar.
- Si hay vencimientos en menos de 7 días, marcá la línea con 🔴.
- Tono ejecutivo, 1 página máximo.
