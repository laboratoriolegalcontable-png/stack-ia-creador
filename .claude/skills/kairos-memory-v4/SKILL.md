---
name: kairos-memory-v4
description: >
  Memoria persistente de doble capa para Claude Code.
  Capa 1 local: ~/.claude/memory/ (decisions, patterns, projects, sessions).
  Capa 2 servidor: backend del proyecto (sync cross-canal opcional).
  Aprende automaticamente de cada sesion. Seeds en /seed sobreviven contenedores efimeros.
version: 4.0.0
---

# Kairos Memory v4 — Memoria Persistente Cross-Sesion

## Cuando activar

- Palabras clave: recuerda que, guarda esto, para la proxima sesion, no olvides
- Palabras clave: que recuerdas, snapshot, memoria, guardar contexto, persistir
- Comandos: `/kairos-memory-v4`, `@Kairos memory`, `/memory`
- Automatico: sesion >15 intercambios → ofrece snapshot
- Automatico: decision de arquitectura detectada → guarda en decisions.md

## Estructura local

```
~/.claude/memory/
├── decisions.md   ← decisiones importantes (permanente)
├── patterns.md    ← bugs + fixes detectados automaticamente
├── projects.md    ← estado actualizado de cada proyecto
├── contacts.md    ← personas clave, roles
└── sessions/      ← snapshot por sesion (fecha.md)
```

## Persistencia en contenedores efimeros

Los archivos en `seed/` estan rastreados en git. El autostart los copia a
`~/.claude/memory/` SOLO si faltan (no-destructivo). Asi la memoria sobrevive al
reciclado del contenedor sin pisar nunca la memoria viva local.

## Comandos

- `@Kairos memory save decision "[desc]"` — guardar decision
- `@Kairos memory save patron "[trigger] → [fix]"` — guardar patron de bug
- `@Kairos memory recall "[query]"` — buscar en toda la memoria
- `@Kairos memory snapshot` — guardar sesion completa
- `@Kairos memory context [proyecto]` — cargar contexto de un proyecto
- `@Kairos memory sync` — sincronizar con el backend del proyecto (si esta configurado)

## Auto-aprendizaje

- Decision de arquitectura detectada → decisions.md
- Bug resuelto → patterns.md (causa + fix)
- Cambio en produccion → projects.md
- Persona mencionada con contexto → contacts.md
- Sesion >15 intercambios → ofrece snapshot automatico
