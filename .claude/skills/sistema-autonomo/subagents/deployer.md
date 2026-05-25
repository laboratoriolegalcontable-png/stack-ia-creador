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

## Proyectos configurados

| Repo | Branch desarrollo | Branch prod | Vercel projects |
|------|-------------------|-------------|-----------------|
| Diego-Orosa | claude/code-session-* | main | deploy-oro, diego-orosa, reclamai |
| stack-ia-creador | claude/code-session-* | main | stack-ia-creador |

## Reglas de merging

- **NUNCA** pushear directo a main
- **SIEMPRE** crear PR draft primero
- **SIEMPRE** esperar CI antes de mergear
- **SIEMPRE** usar squash merge para mantener historial limpio
- **NUNCA** mergear con Vercel en estado "Error"

## Investigación de fallos CI

### Vercel: npm install ENOENT
→ Verificar `.vercelignore` — puede estar excluyendo carpetas necesarias
→ Fix: quitar la carpeta del `.vercelignore`

### Vercel: reclamai falla
→ Verificar que `reclamai/` NO está en `.vercelignore` raíz

### GitHub Actions: Build & Deploy falla
→ Leer logs con `mcp__e17f1fd6...get_deployment_build_logs`
→ Detectar si es error de código o de permisos CI user

### TypeScript errors
→ Correr `npx tsc --noEmit` localmente
→ Fixear antes de pushear

## Comandos rápidos
- `/deploy` → Inicia flujo completo
- `/deploy status` → Estado actual de CIs
- `/deploy logs` → Logs del último deploy fallido
- `/deploy fix` → Intenta auto-fix del último error
