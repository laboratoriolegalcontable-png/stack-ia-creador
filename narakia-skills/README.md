# Sistema Autónomo Narakia — Skills Core v2.0

> El ecosistema que se auto-instala, se auto-mejora y actúa sin esperar instrucciones.

## Skills del Sistema

| Skill | Función | Cuándo usar |
|-------|---------|-------------|
| `kairos-legendario` | Orquestador supremo con memoria | Siempre que necesités el máximo poder |
| `auto-maestro` | Detecta e instala lo necesario | Proyectos nuevos, setup inicial |
| `memoria-narakia` | Memoria persistente Supabase | Leer/escribir contexto entre sesiones |
| `skill-genesis` | Crea nuevos skills | Cuando falta una capacidad |
| `agente-supremo` | Meta-orquestador de último recurso | Tareas complejas multi-dominio |

## Arquitectura

```
                    ┌──────────────────┐
                    │  KAIROS LEGENDARIO│ ← Entry point principal
                    │  (orquestador)   │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────┴──────┐   ┌───────┴──────┐   ┌──────┴──────┐
   │ AUTO MAESTRO│   │   MEMORIA    │   │   SKILL     │
   │ (instala)   │   │   NARAKIA    │   │   GENESIS   │
   └─────────────┘   │ (persiste)   │   │ (crea)      │
                     └──────────────┘   └─────────────┘
                             │
                    ┌────────┴─────────┐
                    │  AGENTE SUPREMO  │
                    │  (fallback)      │
                    └──────────────────┘
```

## Supabase Memory Backend

Proyecto: `moljmujlfvtsgkjbtwss`  
Tablas: `kairos_memory`, `kairos_tasks`, `kairos_projects`, `kairos_improvements`, `narakia_registry`

## Proyectos Cubiertos

- estudiooro.com (Ultra + 4 verticales + legales)
- OroGest v13 / Lex v4
- OropProp
- Stack IA Creador
- LexArgentum
- Reclamai
- Todos los proyectos nuevos que aparezcan

## Primer uso

1. Invocar `/kairos-legendario`
2. Se auto-instala y lee la memoria
3. Genera el briefing inicial
4. Propone la acción #1 de mayor impacto
