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

## Auto-Fix Integrado

Para cada problema detectado, evalúa:
```
¿Tiene fix conocido?
  SÍ → ¿conf ≥ 0.80? → ejecutar automáticamente
  NO → proponer solución manual + pasos exactos en ESPAÑOL
```

*v1.0 — 2026-05-26*
