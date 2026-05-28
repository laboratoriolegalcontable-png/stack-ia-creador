---
name: kairos-sentinel
description: >
  Monitor autonomo de todos los sistemas del ecosistema Estudio Oro.
  Vigila Vercel, Supabase, Make.com, GitHub Actions, bots WhatsApp y Kairos Legendario.
  Detecta fallos antes que el usuario y actua automaticamente: alerta, diagnostica, propone fix.
  Se activa solo cuando hay problemas o cuando el usuario pide status.
version: 1.0.0
---

# Kairos Sentinel — Monitor Autonomo del Ecosistema

## Cuando activar

- Palabras clave: "sentinel", "monitoreo", "esta caido", "fallo", "no responde", "CI rojo"
- Palabras clave: "build fail", "deploy error", "supabase down", "bot callado", "no llegan mensajes"
- Palabras clave: "status", "estado de los sistemas", "como estan los servicios"
- Palabras clave: "alerta", "critico", "urgente", "revisar deploy"
- Comandos: `/kairos-sentinel`, `@Kairos sentinel`, `/sentinel`
- Se activa automaticamente cuando cualquier otra skill detecta un error de sistema
- Cuando el PR de GitHub tiene CI failing → se activa para diagnosticar

## Que monitorea

### Vercel (deploy-oro + reclamai + diego-orosa)

```
IDs de proyecto:
- deploy-oro:    prj_iiyUjfRw6GZjkzQsuLBNo0KZm6s7
- reclamai:      prj_MX2MohcC1b5aa4daUQsQ0xcp1Tno
- diego-orosa:   prj_ZHOBJhlaKAYq6xQdQJtSXOAtBrwW
```

Verifica: estado del ultimo deployment, errores de build, runtime errors, status de edge functions.

### Supabase (moljmujlfvtsgkjbtwss)

Verifica: edge functions activas, errores en logs, estado de pg_cron jobs, RLS activo,
secrets configurados, uso de quota.

Edge functions criticas:
- `narakia-handler` (v90) — debe estar ACTIVE
- `natalia-bot` (v52) — debe estar ACTIVE
- `megan-bot` (v39) — debe estar ACTIVE
- `narakia-memory` (v3) — debe estar ACTIVE
- `daily-report` (v2) — debe correr 8am ARG

### Make.com (team 2012148)

Escenarios criticos:
- s4472022 — email bienvenida Estudio Oro
- s4561747 — WhatsApp via Whapi
- s5147949 — WhatsApp Diego personal
- s4562335 — reporte semanal

Verifica: ultimo run exitoso, errores, escenario activo/inactivo.

### GitHub Actions

Verifica CI en todas las ramas activas. Diagnostica build failures. Propone fixes.

### Bots WhatsApp

Verifica: Lucrecia (narakia-handler), Natalia (natalia-bot), Megan (megan-bot).
Detecta: silencio > 2h cuando deberia haber actividad, webhook descalineado.

## Comandos disponibles

```
@Kairos sentinel status
```
Dashboard completo de todos los sistemas. Formato semaforo (verde/amarillo/rojo).

```
@Kairos sentinel [sistema]
```
Status especifico de un sistema: `vercel` | `supabase` | `make` | `github` | `bots`

```
@Kairos sentinel fix [problema]
```
Diagnostica un problema especifico y ejecuta el fix si es conocido. Si no, escala a Diego.

```
@Kairos sentinel watch [proyecto]
```
Activa monitoreo continuo de un proyecto especifico. Alertas a WhatsApp si falla.

```
@Kairos sentinel logs [servicio] [lineas]
```
Muestra los ultimos N logs de un servicio. Default: 20 lineas.

## Protocolos de respuesta automatica

### Nivel 1 — Auto-fix (sentinel lo resuelve solo)

| Problema | Fix automatico |
|----------|---------------|
| Webhook Whapi descalineado | GET /narakia-handler?action=setup_webhook |
| Edge function pausada | `supabase functions deploy [nombre]` |
| Escenario Make.com inactivo | `scenarios_activate` via MCP Make |
| CLAUDE.local.md desactualizado | Regenera con kairos-genesis |

### Nivel 2 — Fix + notificacion a Diego

| Problema | Accion |
|----------|--------|
| Build de Vercel failing | Diagnostica, aplica fix, notifica resultado |
| Error critico en Supabase | Diagnostica, propone SQL fix, notifica para aprobacion |
| Bot sin responder > 30min | Debug completo, notifica con causa raiz |
| MP_ACCESS_TOKEN faltante | Activa kairos-vault, notifica |

### Nivel 3 — Escalacion inmediata a Diego

| Problema | Canal |
|----------|-------|
| Data loss o corrupcion | WhatsApp URGENTE via s5147949 |
| Security breach detectado | WhatsApp + bloqueo preventivo |
| Todos los bots caidos | WhatsApp CRITICO |
| Vercel + Supabase simultaneos | WhatsApp CRITICO |

## Dashboard format

Cuando ejecutas `@Kairos sentinel status`:

```
SENTINEL STATUS — [timestamp Argentina]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VERCEL
  deploy-oro     ✅ READY    ultima deploy: hace 2h
  reclamai       ✅ READY    ultima deploy: hace 2h
  diego-orosa    ✅ READY    ultima deploy: hace 2h

SUPABASE
  narakia-handler ✅ v90 ACTIVE
  natalia-bot     ✅ v52 ACTIVE
  megan-bot       ✅ v39 ACTIVE
  narakia-memory  ✅ v3 ACTIVE
  daily-report    ✅ v2 ACTIVE | ultimo run: 8:00am OK

MAKE.COM
  s5147949 (Diego WA)  ✅ activo
  s4562335 (reporte)   ✅ activo
  s4561747 (Whapi)     ✅ activo

GITHUB
  PR #348    🔄 CI en progreso (Vercel building)
  main       ✅ sin PRs criticos

BOTS
  Lucrecia (Whapi)  ✅ activa | ultimo mensaje: hace 15min
  Natalia (Meta)    ✅ activa | ultimo mensaje: hace 1h
  Megan (Meta)      ✅ activa

ALERTAS ACTIVAS: ninguna
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Integracion con Forge y Genesis

- Cuando sentinel detecta un sistema no configurado → llama a genesis para bootstrapearlo
- Cuando sentinel detecta una skill vieja → llama a forge para actualizarla
- Sentinel es el primer skill que genesis instala en cualquier proyecto nuevo

## Memoria de incidentes

Sentinel guarda cada incidente en `~/.claude/sentinel-log.md`:
```
[fecha] [sistema] [severidad] [descripcion] [resolucion] [tiempo-de-respuesta]
```
Esto permite detectar patrones (mismo problema recurrente → propone fix estructural).
