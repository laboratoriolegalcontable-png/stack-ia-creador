---
name: notificacion-suprema
version: 1.0.0
description: Sistema de notificaciones inteligentes. Conecta eventos del ecosistema (deploys, CI, errores, tareas) con WhatsApp vía Make/Integromat automáticamente.
autonomy_level: 5
installed: 2026-05-26
---

# 📱 Notificación Suprema

> *El ecosistema te avisa solo. Sin ruido. Solo lo importante.*

## Uso

```
/notificacion-suprema send "mensaje"    → enviar notificación ahora
/notificacion-suprema test              → test de canal activo
/notificacion-suprema config            → ver configuración actual
/notificacion-suprema on [evento]       → activar notif para evento
/notificacion-suprema off [evento]      → desactivar notif para evento
```

## Canales Disponibles

| Canal | MCP | Estado |
|-------|-----|--------|
| WhatsApp (Whapi) | Make/Integromat | ✅ activo |
| Slack | mcp__e1a79aea | ✅ activo |
| Gmail | mcp__8d682f3c | ✅ activo |

## Eventos Configurables

### 🔴 Críticos (siempre notificar)
```
deploy_failed          → Vercel/Netlify deploy falló
ci_failed              → GitHub CI rojo
supabase_error         → edge function con error
security_alert         → Dependabot crítico
```

### 🟡 Importantes (notificar por defecto)
```
deploy_success         → Deploy exitoso ✅
pr_merged              → PR mergeado
new_pr                 → PR nuevo abierto
kairos_decision        → Kairos tomó decisión crítica
```

### 🟢 Informativos (desactivados por defecto)
```
session_start          → inicio de sesión Claude
session_end            → fin de sesión + resumen
skill_created          → skill nueva instalada
memory_saved           → memoria persistida
```

## Formato de Mensaje WhatsApp

```
⚡ *Kairos Supremo*
━━━━━━━━━━━━━━━
[TIPO] [PROYECTO]
[descripción en español]

📍 [link si aplica]
🕐 [hora UTC]
```

Ejemplo real:
```
⚡ *Kairos Supremo*
━━━━━━━━━━━━━━━
✅ DEPLOY Diego-Orosa
deploy-oro en producción

📍 https://deploy-oro.vercel.app
🕐 06:15 UTC
```

## Integración con Make MCP

Usa el escenario `s4561747_oraculo_enviar_whats_app_via_whapi` para WhatsApp.

Al activarse:
1. Detectar evento del ecosistema
2. Formatear mensaje en ESPAÑOL
3. Llamar Make MCP con payload
4. Confirmar envío (no reintentar si falla, solo loggear)

## Reglas
- Solo WhatsApp a números BOSS_PHONES del proyecto
- Nunca exponer keys o secrets en notificaciones
- Máximo 1 notificación por minuto por canal
- Siempre en ESPAÑOL
