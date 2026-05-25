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

## Patrón de módulo (src/shared/{nombre}.ts)

```typescript
// {nombre}.ts — Módulo {Nombre} | Estudio Oro S.A.S.
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface {NombreType} {
  id: string;
  // ... campos
  createdAt: string;
  updatedAt: string;
}

// CRUD
export async function create{Nombre}(data: Omit<{NombreType}, 'id' | 'createdAt' | 'updatedAt'>): Promise<{NombreType}> { ... }
export async function update{Nombre}(id: string, data: Partial<{NombreType}>): Promise<{NombreType} | null> { ... }
export async function list{Nombre}s(filter?: string): Promise<{NombreType}[]> { ... }
export async function delete{Nombre}(id: string): Promise<boolean> { ... }
export async function get{Nombre}Stats(): Promise<Record<string, unknown>> { ... }

// Acciones específicas según el dominio
```

## Patrón de rutas (routes.ts)

```typescript
// ── {Nombre} ──────────────────────────────────────────────────────
router.get('/api/{kebab-nombre}/stats', requireApiKey, async (_req, res) => {
  try { res.json(await get{Nombre}Stats()); } 
  catch { res.status(500).json({ error: 'Error al obtener stats' }); }
});
router.get('/api/{kebab-nombre}', requireApiKey, async (req, res) => {
  try { res.json(await list{Nombre}s(qp(req, 'filter'))); } 
  catch { res.status(500).json({ error: 'Error al listar' }); }
});
router.post('/api/{kebab-nombre}', requireApiKey, async (req, res) => {
  try { res.status(201).json(await create{Nombre}(req.body)); } 
  catch { res.status(400).json({ error: 'Bad request' }); }
});
router.put('/api/{kebab-nombre}/:id', requireApiKey, async (req, res) => {
  try {
    const item = await update{Nombre}(param(req, 'id'), req.body);
    if (!item) return res.status(404).json({ error: 'No encontrado' }) as any;
    res.json(item);
  } catch { res.status(500).json({ error: 'Error al actualizar' }); }
});
router.delete('/api/{kebab-nombre}/:id', requireApiKey, async (req, res) => {
  try {
    const ok = await delete{Nombre}(param(req, 'id'));
    if (!ok) return res.status(404).json({ error: 'No encontrado' }) as any;
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Error al eliminar' }); }
});
```

## Módulos de dominio disponibles (para inspirar spec)

| Dominio | Acciones especiales |
|---------|---------------------|
| tracker | click, conversion, stats |
| log | publish, approve |
| crm | followup, status |
| incident | status-update, resolve |
| onboarding | step, complete |
| proposal | send, accept, reject |
| contract | renew, terminate |

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
