# Blindaje — REFERENCE (detalle tecnico y runbook)

## Modelo de amenazas que cubre

| Riesgo | Mitigacion |
|---|---|
| Config sobrescrita o borrada (settings.json, memoria) | snapshot en cada SessionStart + repair restaura desde backup |
| JSON corrupto por edicion fallida | verify detecta; repair aparta `.corrupt-<ts>` y restaura copia valida |
| Borrado masivo de skills | verify alerta si el conteo cae por debajo de `DROP_RATIO` (def 0.6) del último backup — repo-agnóstico |
| Loop de tool calls que quema tokens | guard avisa (soft) y frena (hard) |
| Gasto descontrolado en sesion larga | backstop por nro de llamadas (`BLINDAJE_MAX_CALLS`) |
| Freno manual ante emergencia | flag `EMERGENCY_BRAKE` |
| El propio blindaje fallando | todo fail-open: nunca detiene la sesion |

## Variables de entorno

| Variable | Default | Efecto |
|---|---|---|
| `BLINDAJE_LOOP_SOFT` | 12 | repeticiones para aviso suave |
| `BLINDAJE_LOOP_HARD` | 30 | repeticiones para freno duro |
| `BLINDAJE_MAX_CALLS` | 1500 | llamadas/sesion antes del backstop |
| `BLINDAJE_SKILLS_DROP_RATIO` | 0.6 | alarma si skills < ratio*conteo del último backup |
| `BLINDAJE_SKILLS_MIN` | 0 | piso absoluto opcional (0 = off) |
| `BLINDAJE_BACKUPS_KEEP` | 20 | backups a retener |
| `BLINDAJE_GUARD_OFF` | (vacio) | `=1` desactiva el guard |

Para fijarlas de forma persistente, exportarlas en el entorno de la sesion
o agregarlas al `env` de la config (no incluido aqui para no tocar settings).

## Estructura de un backup

```
.claude/blindaje/backups/<UTC-timestamp>/
├── .claude/settings.json
├── .claude/shared-memory.json
├── .claude/CLAUDE.local.md
├── CLAUDE.md
├── skills-manifest.tsv     (nombre<TAB>version por skill)
├── agents.txt
├── commands.txt
└── hooks.txt
```

## Protocolo del hook PreToolUse (guard.sh)

1. Si `BLINDAJE_GUARD_OFF` -> exit 0.
2. Si existe `EMERGENCY_BRAKE` -> deny (exit 2) con instruccion de reset.
3. Hashea `tool_name`+`tool_input` (sha1[:12]); si no se puede -> exit 0.
4. Append al historial `guard-calls.tsv` (cap 200 lineas).
5. Si llamadas >= `MAX_CALLS` -> activa freno y deny.
6. Cuenta repeticiones identicas consecutivas al final:
   - `>= HARD` -> activa freno y deny.
   - `>= SOFT` -> warn (no bloquea).
7. Si no -> exit 0.

Formato de bloqueo emitido (compatible con Claude Code):
```json
{"hookSpecificOutput":{"hookEventName":"PreToolUse",
  "permissionDecision":"deny","permissionDecisionReason":"[blindaje] ..."}}
```
Ademas exit 2 (bloqueo robusto en versiones que lo soporten). Si la version
no reconoce el formato, el peor caso es **fail-open** (deja pasar), nunca
congela el flujo por error del guard.

## Runbook: "algo se rompio / se desconfiguro"

```bash
# 1. Diagnostico
bash .claude/skills/blindaje/scripts/verify.sh
cat .claude/blindaje/blindaje.log | tail -n 30

# 2. Reparacion automatica (no destructiva)
bash .claude/skills/blindaje/scripts/repair.sh
git diff .claude/settings.json   # revisar antes de commitear

# 3. Si verify sigue con problemas y no hay backup valido:
ls -1 .claude/blindaje/backups/   # backups disponibles
#    elegir uno y copiar el archivo puntual a mano

# 4. Re-cablear hooks si se perdieron
bash .claude/skills/blindaje/install.sh
```

## Runbook: "se disparo el freno"

```bash
# Ver por que (loop o backstop)
tail -n 10 .claude/blindaje/blindaje.log
# Si fue loop real: cambiar de estrategia antes de liberar.
rm .claude/blindaje/EMERGENCY_BRAKE
# (opcional) limpiar el contador
: > .claude/blindaje/guard-calls.tsv
```

## Escalamiento a otra IA

Cuando una falla excede el alcance local (p. ej. build roto que verify no
puede explicar):

1. Generar contexto: salida de `verify.sh` + `tail -n 50 blindaje.log` + el
   `git diff` relevante.
2. Derivar a un segundo modelo como abogado del diablo / rescate:
   - Con Codex instalado: `/codex:rescue` pegando ese contexto.
   - O abrir un sub-agente dedicado con el diagnostico como prompt.
3. Aplicar el fix propuesto SIEMPRE de forma aditiva y revisando `git diff`.

El blindaje no llama solo a otra IA (eso requeriria credenciales/redes que no
se asumen aqui); deja el contexto listo para que la derivacion sea un paso.

## Portar a otro repo / proyecto nuevo

```bash
# Copiar la skill (aditivo) y cablear
cp -r .claude/skills/blindaje /ruta/otro-repo/.claude/skills/
cd /ruta/otro-repo && bash .claude/skills/blindaje/install.sh
```
`install.sh` es idempotente y respeta los hooks que ya existan en ese repo.
