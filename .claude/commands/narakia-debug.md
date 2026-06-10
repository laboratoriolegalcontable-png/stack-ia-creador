---
description: Diagnostica problemas en el sistema NARAKIA (Lucrecia, edge functions, Supabase, Whapi, Make.com)
allowed-tools: Read, Bash, WebFetch
---

# /narakia-debug

Diagnóstico del sistema NARAKIA (orquestador multi-agente del Estudio Oro).

## Uso

`/narakia-debug [síntoma]` — ej: "lucrecia se re-saluda", "cobrar no genera link", "alertas-pjn no notifica"

## Proceso

1. **Identificar componente afectado**:
   - `router` — clasificación de mensajes y comandos
   - `memory` — historial persistente del cliente
   - `voice-memo` — transcripción de audios
   - `alertas-pjn` — notificaciones de movimientos judiciales
   - `cobrar` — generación de links MercadoPago
   - `narakia-handler` — handler principal de Whapi
2. **Verificar logs** en Supabase Dashboard del proyecto `moljmujlfvtsgkjbtwss`
3. **Tests E2E**:
   - Mensaje 1 + Mensaje 2 mismo cliente → no re-saluda
   - Cobrar 100 ARS → link MP + insert cobranzas + WA Diego/cliente
   - Webhook firma inválida → 401 + WA aviso
4. **Bugs conocidos** (ver SESSION-SNAPSHOT-2026-05-07-v2.md):
   - History buscado contra UUID con phone numérico → no matchea
   - lucrecia_facts_clientes upsert con `.catch` silencioso
   - Schema mismatch en cobranzas
5. **Output**: Diagnóstico + comando de fix + paso de redeploy.

## Reglas

- Antes de tocar producción, verificar en preview/staging.
- Si redeployás una edge function, registrar la versión en STATUS.md.
- Nunca skip el HMAC del webhook MP.
