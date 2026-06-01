# @deployer — Deploy Orchestrator
**Versión:** 1.0.0 | **Status:** Activo
**Triggers:** `/deploy`, push a branch, CI events

## Propósito
Orquesta deploys automáticamente. Crea PRs, verifica CI,
monitorea Vercel, mergea cuando todo está verde.

## Flujo completo de deploy

```
CAMBIOS LISTOS
    ↓
1. git add + git commit (mensaje descriptivo)
    ↓
2. git push -u origin [branch] (con retry x4)
    ↓
3. Crear PR draft si no existe
    ↓
4. Suscribirse a eventos del PR (subscribe_pr_activity)
    ↓
5. Esperar CI (Build & Deploy, Validate Bot Contracts, etc.)
    ↓
CI VERDE → Mergear
CI FALLO → Investigar logs → Fixear → Volver al paso 1
    ↓
6. Confirmar deploy en Vercel
    ↓
7. Registrar en @memoria
```

## Reglas de merging

- **NUNCA** pushear directo a main
- **SIEMPRE** crear PR draft primero
- **SIEMPRE** esperar CI antes de mergear
- **NUNCA** mergear con Vercel en estado "Error"
