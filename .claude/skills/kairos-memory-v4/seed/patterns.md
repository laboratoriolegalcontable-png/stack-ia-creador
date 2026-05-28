# Kairos Memory v4 — Patterns (seed generico)

Patrones de bugs detectados y sus fixes.
Formato: [patron: nombre] TRIGGER: ... CAUSA_RAIZ: ... FIX: ... FRECUENCIA: ... PREVENCION: ...

Seed rastreado en git. Copiado a ~/.claude/memory/patterns.md solo si no existe.

---

# patron: install-destructivo
TRIGGER: re-instalar skills pisa cambios locales
CAUSA_RAIZ: instalador que sobrescribe sin respaldo
FIX: backup_if_exists antes de cada escritura → ~/.claude/.forge-backups/
PREVENCION: todo installer del ecosistema respalda antes de escribir

# patron: webhook-descalineado
TRIGGER: un bot/integracion deja de responder
CAUSA_RAIZ: el webhook quedo apuntando a un endpoint viejo
FIX: re-registrar el webhook al endpoint correcto (ver CLAUDE.md del proyecto)
PREVENCION: documentar el endpoint canonico como invariante en el CLAUDE.md privado
