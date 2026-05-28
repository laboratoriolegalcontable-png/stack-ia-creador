---
name: kairos-memory-v4
description: >
  Sistema de memoria persistente de doble capa para Claude Code.
  Capa 1 (local): escribe en CLAUDE.md y archivos de sesion en ~/.claude/memory/.
  Capa 2 (servidor): sincroniza con Supabase via narakia-memory para acceso cross-canal.
  Aprende automaticamente de cada sesion. Recuerda decisiones, patrones y contexto del negocio.
version: 4.0.0
---

# Kairos Memory v4 — Memoria Persistente Cross-Sesion

## Cuando activar

- Palabras clave: "recuerda que", "guarda esto", "para la proxima sesion", "no olvides"
- Palabras clave: "que recuerdas de", "contexto de", "historial de", "aprendizaje"
- Palabras clave: "snapshot", "memoria", "guardar contexto", "persistir"
- Comandos: `/kairos-memory-v4`, `@Kairos memory`, `/memory`
- Automatico: al finalizar cualquier sesion larga (>15 intercambios), ofrece snapshot
- Automatico: cuando se toma una decision importante, la guarda sin que el usuario pida

## Arquitectura de doble capa

```
CAPA 1 — LOCAL (instantanea, sin red)
~/.claude/
├── memory/
│   ├── decisions.md      ← decisiones importantes tomadas en sesiones pasadas
│   ├── patterns.md       ← patrones recurrentes detectados
│   ├── projects.md       ← estado actual de cada proyecto
│   ├── contacts.md       ← personas clave, roles, telefonos
│   └── sessions/
│       ├── 2026-05-24.md ← snapshot de la sesion de hoy
│       └── [fecha].md    ← archivo por sesion

CAPA 2 — SERVIDOR (persistente, accesible desde WhatsApp y web)
Supabase moljmujlfvtsgkjbtwss → narakia-memory v3
├── user_profiles.memory_summary  ← resumen comprimido por usuario
├── user_profiles.last_context    ← ultimo contexto completo
└── narakia_messages              ← historial de interacciones
```

## Tipos de memoria que maneja

### Memoria de decision

Se guarda automaticamente cuando Claude detecta una decision importante:

```markdown
# decisions.md — formato
[2026-05-24] [proyecto: reclamai] [tipo: arquitectura]
DECISION: usar Supabase RLS en vez de middleware de autorización
RAZON: mas seguro, menos codigo, nativo de Supabase
IMPACTO: todas las tablas de reclamai deben tener RLS habilitado
NO REVERTIR porque: security by default
```

### Memoria de patron

Se acumula cuando Claude detecta que algo se repite:

```markdown
# patterns.md — formato
[patron: debug-supabase]
TRIGGER: "no llegan mensajes de Lucrecia"
CAUSA RAIZ MAS COMUN: webhook Whapi apuntando a URL incorrecta
FIX: GET /narakia-handler?action=setup_webhook
FRECUENCIA: 3 veces (2026-05-19, 2026-05-20, 2026-05-20)
```

### Memoria de proyecto

Estado actualizado de cada proyecto:

```markdown
# projects.md — formato
[proyecto: reclamai]
ESTADO: READY en Vercel
ULTIMO DEPLOY: 2026-05-24
PENDIENTE: MP_ACCESS_TOKEN en Supabase edge functions
PROXIMO HITO: beta testing con 5 usuarios
```

### Memoria de contacto

Personas clave del ecosistema:

```markdown
# contacts.md — formato
[Diego Orosa] boss_phone=5491140253204 rol=director
[Lucrecia] canal=Whapi phone=5491168777777 persona=coordinadora
[Natalia] canal=Meta phone=1137854822734580 persona=tech
[Megan] canal=Meta persona=inversiones
```

## Comandos disponibles

```
@Kairos memory save [tipo] [contenido]
```
Guarda un item en la capa local. Tipos: `decision` | `patron` | `proyecto` | `contacto` | `libre`

```
@Kairos memory recall [query]
```
Busca en toda la memoria local y en Supabase. Devuelve los fragmentos mas relevantes.

```
@Kairos memory snapshot
```
Toma un snapshot completo de la sesion actual y lo guarda en `~/.claude/memory/sessions/[fecha].md`.
Incluye: tareas completadas, decisiones tomadas, codigo escrito, problemas resueltos.

```
@Kairos memory context [proyecto]
```
Carga todo el contexto guardado de un proyecto especifico.

```
@Kairos memory sync
```
Sincroniza la memoria local con Supabase narakia-memory (capa 2).
Util cuando cambias de dispositivo o queres acceder desde WhatsApp.

```
@Kairos memory clean [dias]
```
Archiva snapshots de sesiones viejas (default: mas de 30 dias). No borra, archiva.

## Auto-aprendizaje (sin que el usuario pida nada)

Memory v4 aprende automaticamente en estos casos:

### Durante la sesion

1. **Cada vez que se toma una decision de arquitectura** → guarda en decisions.md
2. **Cada vez que se resuelve un bug** → guarda en patterns.md (causa + fix)
3. **Cada vez que se cambia algo importante en produccion** → actualiza projects.md
4. **Cada vez que se menciona una persona con contexto** → actualiza contacts.md

### Al finalizar la sesion

5. **Si la sesion duro >15 intercambios** → ofrece snapshot automatico
6. **Si se crearon archivos nuevos** → registra que se creo y por que
7. **Si se mergearon PRs** → registra el cambio en projects.md

### Trigger de memoria urgente

Si detecta algo que NO debe olvidarse bajo ninguna circunstancia:
```
@Kairos memory save decision "CRITICO: [descripcion completa]"
```
Esto escribe en CLAUDE.md directamente (la memoria mas persistente que existe).

## Sincronizacion con narakia-memory v3

Memory v4 extiende narakia-memory con capacidades del lado del cliente:

```
narakia-memory v3 (servidor)     kairos-memory-v4 (cliente)
├── get_context(user_id)    ←→   recall [usuario]
├── save_context(summary)   ←→   snapshot
└── summarize (Haiku)       ←→   compress [sesion]
```

El flujo de sincronizacion:
1. Al inicio de sesion: memory v4 descarga el contexto de Supabase via narakia-memory
2. Durante la sesion: guarda en local (~/.claude/memory/)
3. Al final de sesion: sync sube el delta a Supabase

## Formato del snapshot de sesion

```markdown
# Sesion [fecha] — [duracion estimada]

## Contexto inicial
[con que llego el usuario a esta sesion]

## Tareas completadas
- [tarea 1]: [resultado]
- [tarea 2]: [resultado]

## Decisiones tomadas
- [decision 1]: [razon]
- [decision 2]: [razon]

## Problemas resueltos
- [problema]: [causa raiz] → [fix aplicado]

## Archivos creados/modificados
- [archivo]: [que hace]

## Pendientes para la proxima sesion
- [item 1]
- [item 2]

## Aprendizajes clave
[lo mas importante que aprendio Claude sobre este proyecto en esta sesion]
```

## Prioridad de memoria (de mas a menos persistente)

1. `CLAUDE.md` — decisions criticas, invariantes, contexto esencial del proyecto
2. `~/.claude/memory/decisions.md` — decisiones importantes (permanente)
3. `Supabase user_profiles.memory_summary` — contexto cross-canal (8h TTL)
4. `~/.claude/memory/sessions/[fecha].md` — snapshot de sesion (30 dias)
5. Contexto activo de la conversacion (dura la sesion)

La regla: si algo es tan importante que no queres explicarlo de nuevo nunca mas, va a CLAUDE.md.
Si es contexto de proyecto que cambia, va a decisions.md y se sincroniza con Supabase.
