---
description: Procesa la bandeja de entrada (email, WhatsApp, leads) y prioriza acciones del día
allowed-tools: Read, Bash, WebFetch
---

# /process-inbox

Triaje matutino de mensajes pendientes.

## Uso

`/process-inbox` — sin parámetros, procesa todas las fuentes activas.

## Fuentes

1. **Gmail** (MCP) — emails sin responder de las últimas 48hs
2. **WhatsApp Whapi** — mensajes inbound de clientes
3. **Valentina chat web** — leads del widget reclamai.ar (panel `/admin/leads`)
4. **OrogesT** — tickets nuevos / casos sin asignar
5. **Notificaciones PJN** — movimientos judiciales pendientes de revisar

## Output

Lista priorizada para Diego, dividida en 3 bloques:

### 🔴 Urgente (responder hoy antes de 12hs)
- Lead A (score ≥80) sin contactar
- Vencimiento procesal en <48hs
- Cliente premium con queja activa

### 🟡 Importante (responder en 24hs)
- Lead B (50-79)
- Email de cliente activo
- Movimientos judiciales

### 🟢 Nurturing (esta semana)
- Lead C (<50)
- Newsletters
- Spam/promociones para archivar

## Reglas

- Cada item con: remitente, asunto, acción sugerida, link al hilo.
- No incluir spam ni ya respondidos.
- Si hay >5 items urgentes, marcarlo como "Día rojo — pedir refuerzos al equipo".
