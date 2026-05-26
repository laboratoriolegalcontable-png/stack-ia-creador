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
/pipeline-supremo --deploy-only   → solo deploy, sin PR
```

## Pasos del Pipeline

```
1. git add -A                          → stagea todos los cambios
2. git commit -m "🚀 [auto-mensaje]"  → commit con timestamp
3. git push origin [branch]           → push a origin
4. Vercel deploy check                → verifica deployment automático
5. Crear draft PR (si no existe)      → PR con resumen de cambios
6. Notificación de resultado          → reportar en ESPAÑOL
```

## Auto-Mensaje Inteligente

Si no se pasa mensaje, genera uno basado en:
- Archivos modificados (`git diff --name-only`)
- Tipo de cambio (feat/fix/refactor/docs)
- Proyecto activo (Diego-Orosa vs stack-ia-creador)

Ejemplos:
```
🚀 feat: 3 rutas API + skill nueva (kairos-supremo)
🔧 fix: ESLint errors en routes/newsletter.js
📝 docs: actualizar CLAUDE.md con reglas Kairos
```

## Kairos Supremo Integration

- Umbral para ejecutar: 0.70 (reversible)
- Si push falla → reintentar hasta 4 veces (2s, 4s, 8s, 16s)
- Si deploy falla → diagnóstico automático con `/diagnostico-supremo`
- Notificación final siempre en ESPAÑOL

## Ejemplo de Salida

```
🚀 Pipeline Supremo — Iniciando...

✅ git add -A           (5 archivos)
✅ git commit           🔧 fix: actualizar settings.json + Kairos Supremo
✅ git push             → origin/claude/nice-hypatia-F1zC3
✅ Vercel               → Building (deploy-oro, diego-orosa)
✅ PR #441              → actualizado con nuevos commits
✅ CI Status            → verde ✅

⏱️  Tiempo total: 8.2 segundos
🎯 Todo listo. Proyecto en producción.
```
