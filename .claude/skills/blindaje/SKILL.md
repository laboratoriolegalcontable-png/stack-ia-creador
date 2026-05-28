---
name: blindaje
description: >
  Sistema de proteccion del ecosistema: blindaje de memoria y configuracion,
  anti-loop, freno de gasto de tokens/API, deteccion de fallas y auto-reparacion
  no destructiva. Usar cuando se hable de proteger, blindar, respaldar, restaurar
  config, evitar loops, frenar gasto, recuperar memoria, o cuando algo se
  desconfiguro/desprogramo. Todo es aditivo y fail-open: nunca rompe una sesion.
version: 1.0.0
---

# Blindaje — proteccion, anti-loop y auto-reparacion

Capa de seguridad que se monta SOBRE el ecosistema existente (kairos-forge,
oraculo, skills). No reemplaza nada. Garantiza tres cosas:

1. **La memoria y la config no se pierden ni se desconfiguran.**
2. **No se malgastan tokens/API en loops.**
3. **Si algo se corrompe, se restaura solo desde el ultimo backup valido.**

## Cuando activar

- Palabras clave: blindar, proteger, respaldar, backup, restaurar, recuperar,
  integridad, anti-loop, freno, gasto de tokens, se rompio, se desconfiguro.
- Comandos sugeridos: `/blindaje status`, `/blindaje backup`, `/blindaje repair`.

## Componentes

```
.claude/skills/blindaje/
├── SKILL.md            (este archivo)
├── REFERENCE.md        (detalle tecnico, tuning, runbook)
├── install.sh          (cablea los hooks; idempotente; respalda antes de tocar)
└── scripts/
    ├── lib.sh          (rutas + helpers)
    ├── backup.sh       (snapshot append-only de config + memoria)
    ├── verify.sh       (chequeo de integridad)
    ├── repair.sh       (restauracion NO destructiva desde backup)
    └── guard.sh        (hook PreToolUse: anti-loop + freno de gasto)
```

Estado de runtime (NO versionado): `.claude/blindaje/` — backups, log,
contador del guard y el flag `EMERGENCY_BRAKE`.

## Como funciona (en SessionStart, automatico)

Cada inicio de sesion corre, en orden: `backup.sh` (snapshot) →
`repair.sh` (restaura lo ausente/corrupto) → `verify.sh` (reporta integridad).
Todos son **fail-open**: si fallan, no detienen la sesion.

Archivos protegidos: `.claude/settings.json`, `.claude/shared-memory.json`,
`.claude/CLAUDE.local.md`, `CLAUDE.md`. Mas un manifiesto de las skills
(nombre+version) e inventarios de agents/commands/hooks para detectar borrados.

## Anti-loop y freno de gasto (hook PreToolUse: guard.sh)

- **Aviso suave** (12 repeticiones identicas seguidas): no bloquea, sugiere
  cambiar de estrategia.
- **Freno duro** (30 repeticiones identicas): activa `EMERGENCY_BRAKE` y
  bloquea para no quemar tokens/API.
- **Backstop de gasto**: a las 1500 llamadas por sesion activa el freno.
- **Freno manual**: `touch .claude/blindaje/EMERGENCY_BRAKE` frena todo;
  `rm` ese archivo lo libera.
- Siempre **fail-open**: si el guard tiene cualquier error interno, deja pasar.

Tuning por variables de entorno: `BLINDAJE_LOOP_SOFT`, `BLINDAJE_LOOP_HARD`,
`BLINDAJE_MAX_CALLS`, `BLINDAJE_GUARD_OFF=1` (desactiva el guard).

## Uso manual

```bash
# Estado / integridad ahora mismo
bash .claude/skills/blindaje/scripts/verify.sh

# Forzar un snapshot
bash .claude/skills/blindaje/scripts/backup.sh

# Reparar (restaura solo lo ausente/corrupto, nunca pisa lo valido)
bash .claude/skills/blindaje/scripts/repair.sh

# (Re)instalar/cablear hooks — idempotente
bash .claude/skills/blindaje/install.sh

# Liberar el freno de emergencia
rm .claude/blindaje/EMERGENCY_BRAKE
```

## Garantias de no-rotura

- Solo agrega archivos nuevos y cablea hooks de forma **aditiva**.
- `install.sh` respalda `settings.json` (`.bak-<ts>`) y valida el JSON; si
  quedara invalido, restaura el backup automaticamente.
- `repair.sh` nunca borra: aparta lo corrupto como `.corrupt-<ts>` y restaura.
- El guard nunca bloquea por bugs propios (fail-open).

## Escalamiento a otra IA (opcional)

Si una falla persiste y excede el alcance local, el runbook (REFERENCE.md)
documenta como derivar el diagnostico a un segundo modelo (p. ej. Codex via
`/codex:rescue`) pasando `verify.sh` + el log de `blindaje.log` como contexto.
