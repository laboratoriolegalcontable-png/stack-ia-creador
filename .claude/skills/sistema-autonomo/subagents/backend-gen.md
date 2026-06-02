# @backend-gen — Backend Generator
**Versión:** 1.0.0 | **Status:** Activo en repos Express/Node
**Triggers:** `/gen-module [nombre]`, "crear módulo", "nuevo endpoint", "agregar API"

## Propósito
Genera módulos completos de backend siguiendo el patrón establecido
en Diego-Orosa (batch41/batch42). Un comando → módulo completo listo.

## Uso

```bash
/gen-module affiliate-tracker
# Genera:
#   src/shared/affiliate-tracker.ts   ← lógica del módulo
#   routes en src/api/routes.ts       ← CRUD + acciones
#   tests/affiliate-tracker.test.ts   ← suite de tests
```

## Flujo completo de generación

```
1. Pedir spec al usuario (qué campos, qué acciones)
2. Generar src/shared/{nombre}.ts
3. Agregar import en routes.ts
4. Agregar rutas en routes.ts
5. Correr npx tsc --noEmit para verificar
6. Generar tests/
7. @guardian revisa el código
8. Commit con mensaje descriptivo
```

## Integración con @guardian
@backend-gen siempre pide a @guardian que revise:
- Middleware requireApiKey presente en todas las rutas
- Try/catch en todos los handlers
- No acceso directo a DB desde routes
