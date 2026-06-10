---
description: Sistema de captación de clientes — leads en frío, calificación, primer contacto, seguimiento
allowed-tools: Read, Write, Bash, WebSearch
---

# /captacion-clientes

Máquina de captación para Estudio Oro.

## Uso

`/captacion-clientes [nicho]` — ej: "personas con causas penales abiertas en CABA", "inmobiliarias necesitan asesoría DNU 70/2023"

## Proceso

1. **Identificar fuente de leads**:
   - Scrapling (Google Maps, directorios profesionales)
   - LinkedIn (perfiles del nicho)
   - Apify (Twitter/Reddit con quejas del nicho)
   - Referidos de clientes activos
2. **Calificación A/B/C**:
   - A (≥80): contactar en <15 min
   - B (50-79): drip de 5 emails
   - C (<50): nurturing 14 días
3. **Primer contacto**:
   - Email personalizado (línea 1: dato específico del prospect, no genérico)
   - WhatsApp si tenemos teléfono
   - Mensaje en LinkedIn si es B2B
4. **Seguimiento estructurado**:
   - Día 1: Primer mensaje
   - Día 3: Caso de éxito
   - Día 7: Oferta concreta
   - Día 14: Última oportunidad
5. **Cierre**:
   - Llamada de 15 min
   - Propuesta escrita
   - Contrato firmado digital (DocuSign)

## Output

- Lista de 50 leads con datos completos
- Mensaje 1 personalizado para cada uno
- Calendario de seguimiento de 14 días
- Tracking en Google Sheets / Notion

## Reglas

- NUNCA usar bases de datos compradas.
- Cumplir Ley 25.326 de Datos Personales (consentimiento).
- Cada mensaje debe ser personalizable — no copy/paste mass.
