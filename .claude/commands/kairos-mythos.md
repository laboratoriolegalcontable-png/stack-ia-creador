---
description: Sistema de 3 Capas
allowed-tools: Read, Write, Edit, Bash, WebSearch, WebFetch
---

# /kairos-mythos — Sistema de 3 Capas

Activa el skill completo en `.claude/skills/kairos-mythos/SKILL.md`.

## Subcomandos

```
/kairos-mythos plan [tarea]         → Plan-Execute con lista numerada
/kairos-mythos refine [artefacto]   → Self-Refine hasta score 8/10
/kairos-mythos ralph [deploy]       → Ralph Loop para CI/deploy
/kairos-mythos palace               → MemPalace — comprimir sesion
/kairos-mythos recover [error]      → Failure Recovery por clase de error
/kairos-mythos check [tarea]        → Verification checklist

/kairos-mythos rag question="..."   → RAG semantica (requiere MYTHOS_API_KEY)
/kairos-mythos rag index            → Indexar nuevos documentos

/kairos-mythos oraculo [tarea]      → Predecir fallas antes de ejecutar
/kairos-mythos lore [hito]          → Registrar en ESTUDIO-ORO-LORE.md
/kairos-mythos epica [sprint]       → Viaje del Heroe en 6 actos → MYTHOS-LORE.md
/kairos-mythos autodocs [resultado] → 3 docs: LinkedIn + README + resumen cliente
```

## Archivos del sistema

- `.claude/skills/kairos-mythos/SKILL.md` — descripcion de capas y activacion
- `.claude/skills/kairos-mythos/REFERENCE.md` — templates completos de cada patron
- `ESTUDIO-ORO-LORE.md` — cronica viva del ecosistema
- `MYTHOS-LORE.md` — viajes del heroe tecnicos en 6 actos

## Activacion automatica (sin comando)

Los patrones de Capa 1 se activan solos:
- Plan-Execute: tarea con 3+ pasos
- Reflexion: despues de cada paso mayor
- Stuck Detection: mismo error 3 veces
- Verification: antes de declarar cualquier tarea como "done"
