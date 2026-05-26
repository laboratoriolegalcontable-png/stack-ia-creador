---
name: diagnostico-supremo
version: 1.0.0
description: Diagnóstico completo del ecosistema en tiempo real — CI, deploys, Supabase, Make, errores, dependencias. Detecta y propone fix automático.
autonomy_level: 5
installed: 2026-05-26
---

# 🔍 Diagnóstico Supremo

> *Escanea todo el ecosistema en segundos. Detecta problemas. Propone fixes. Ejecuta si tiene permiso.*

## Uso

```
/diagnostico-supremo             → diagnóstico completo
/diagnostico-supremo --ci        → solo CI y GitHub Actions
/diagnostico-supremo --deploy    → solo estado de deploys Vercel/Netlify
/diagnostico-supremo --db        → solo Supabase
/diagnostico-supremo --fix       → diagnosticar + auto-fix si conf ≥ 0.80
/diagnostico-supremo --quick     → solo errores críticos (< 5 seg)
```

## Qué Escanea

### 🔴 Crítico (alertar inmediatamente)
- CI/CD fallando en PRs abiertos
- Deploy en estado ERROR o CANCELED
- Supabase edge functions con errores
- Dependencias con vulnerabilidades críticas (Dependabot)
- Keys hardcodeadas en commits recientes

### 🟡 Advertencia
- PR sin revisar > 24hs
- Tests fallando en local
- Dependencias desactualizadas (major version)
- Make.com scenarios inactivos
- Hooks de git no ejecutables

### 🟢 Informativo
- Estado de deploys activos
- Skills instaladas vs disponibles
- Memoria de sesiones (tamaño, última actualización)
- MCPs respondiendo

## Formato de Reporte

```
🔍 DIAGNÓSTICO SUPREMO — [fecha] [hora UTC]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GITHUB / CI
  ✅ PR #441 Diego-Orosa — CI verde
  ✅ PR #81 stack-ia-creador — CI verde

VERCEL DEPLOYMENTS
  ✅ deploy-oro — READY (hace 2 min)
  ✅ diego-orosa — READY
  ⚠️  reclamai — CANCELED (esperado: no hay cambios)

SUPABASE
  ✅ narakia-handler — activo
  ✅ natalia-bot v52 — activo
  🔴 MP_ACCESS_TOKEN — FALTANTE en vault

DEPENDENCIAS
  ⚠️  97 vulnerabilidades (34 high, 49 moderate, 14 low)
  → Ejecutar: npm audit fix --force (con precaución)

MAKE.COM
  ✅ 3 scenarios activos
  ⚠️  s4977882 — last run hace 7 días

MEMORIA SISTEMA
  ✅ user_preferences.json — IDIOMA: ESPAÑOL activo
  ✅ session_logs — 1 sesión registrada
  ✅ pre-commit hooks — ejecutables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRÍTICO: 1 problema  |  ADVERTENCIAS: 3  |  OK: 9
ACCIÓN SUGERIDA: resolver MP_ACCESS_TOKEN en Supabase vault
```

## Auto-Fix Integrado

Para cada problema detectado, Kairos Supremo evalúa:
```
¿Tiene fix conocido?
  SÍ → ¿conf ≥ 0.80? → ejecutar automáticamente
  NO → proponer solución manual + pasos exactos en ESPAÑOL
```

Fixes automáticos posibles:
- Hacer hooks ejecutables (`chmod +x`)
- Regenerar `session_logs` si están corruptos
- Reactivar scenario de Make si está inactivo
- Agregar permisos faltantes en `settings.json`
