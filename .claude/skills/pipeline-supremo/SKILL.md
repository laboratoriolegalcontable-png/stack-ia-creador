---
name: pipeline-supremo
version: 1.0.0
description: Pipeline completo en un solo comando — commit + push + deploy + PR + notificación. Cero fricción.
autonomy_level: 5
installed: 2026-05-26
---

# 🚀 Pipeline Supremo

> Un solo comando. Commit → Push → Deploy → PR → Notificación. Todo automático.

## Uso

```
/pipeline-supremo                  → pipeline completo con auto-mensaje
/pipeline-supremo "descripción"   → pipeline con mensaje personalizado
/pipeline-supremo --dry-run       → simula sin ejecutar
```

## Pasos del Pipeline

```
1. git add -A
2. git commit -m "🚀 [auto-mensaje]"
3. git push origin [branch]
4. Vercel deploy check
5. Crear draft PR (si no existe)
6. Notificación de resultado
```

## Kairos Supremo Integration

- Umbral para ejecutar: 0.70 (reversible)
- Si push falla → reintentar hasta 4 veces (2s, 4s, 8s, 16s)
- Si deploy falla → diagnóstico automático con `/diagnostico-supremo`

*v1.0 — 2026-05-26*
