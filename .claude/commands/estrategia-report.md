---
description: Reporte estratégico semanal del Estudio Oro — KPIs, ingresos, leads, proyectos, riesgos
allowed-tools: Read, Bash, WebFetch
---

# /estrategia-report

Reporte estratégico de 1 página para el Director.

## Uso

`/estrategia-report [semana | mes | trimestre]` — default: semana

## Secciones

1. **Pulso del negocio** — 1 línea: ¿estamos verde, amarillo o rojo?
2. **KPIs** (vs. semana anterior, % delta):
   - Leads totales (A/B/C)
   - Tasa de conversión Lead A → cliente
   - Ingresos facturados / cobrados
   - Casos activos / cerrados
   - Costo por lead (CPL) en ads
3. **Top 3 wins** — qué salió bien
4. **Top 3 fricciones** — qué nos trabó
5. **Proyectos en marcha** — estado de cada uno (OroGest, OMEGA, Escudo, Lobo, SmartLedgerPro)
6. **Riesgos abiertos** — vencimientos, dependencias críticas, single point of failure
7. **Decisiones para la semana** — 3 cosas que necesitan input de Diego

## Output

Markdown de 1 página, listo para mandar por WhatsApp el lunes a las 8am.

## Reglas

- Datos duros, no opiniones.
- Marcá `[VERIFICAR]` cualquier número estimado.
- Si hay un riesgo bloqueante, va arriba de todo con 🚨.
