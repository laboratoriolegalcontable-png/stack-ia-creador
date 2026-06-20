# Kairos Memory v4 — Decisions (seed)

Decisiones importantes guardadas automaticamente.
Formato: [YYYY-MM-DD] [proyecto] DECISION: ... RAZON: ... NO REVERTIR: ...

Este es el SEED rastreado en git. El autostart lo copia a ~/.claude/memory/decisions.md
solo si ese archivo no existe (no-destructivo). La memoria viva se actualiza en local.

---

[2026-05-28] [ecosistema] DECISION: Forge y todo su ecosistema operan en modo no-destructivo con respaldo previo. RAZON: orden directa de Diego "nunca pises nada ni rompas nada". NO REVERTIR: cambiar install.sh a sobrescritura sin backup.
[2026-05-28] [ecosistema] DECISION: La memoria persiste via seeds en repo (kairos-memory-v4/seed/) + ~/.claude/memory local. RAZON: contenedores efimeros pierden ~/.claude al reciclarse. NO REVERTIR: depender solo de ~/.claude sin seed en repo.
