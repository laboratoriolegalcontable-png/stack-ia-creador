# Kairos Legendario ↔ Kairos Forge — Puente

Como EON v3.5 (kairos-legendario) usa la fabrica de skills (kairos-forge) y el
resto del ecosistema (sentinel, genesis, memory-v4). Archivo aditivo: NO modifica
el SKILL.md de kairos-legendario, solo lo extiende.

---

## Que aporta Forge a EON

| Necesidad de EON | Skill del ecosistema Forge |
|------------------|----------------------------|
| Crear un skill/submodulo nuevo on-the-fly | `kairos-forge skill [nombre] "[desc]"` |
| Mejorar un submodulo EON existente | `kairos-forge upgrade [skill]` |
| Auditar todos los skills del ecosistema | `kairos-forge audit` |
| Bootstrapear un proyecto nuevo del Doctor | `kairos-genesis bootstrap [tipo]` |
| Vigilar Vercel/Supabase/Make/bots | `kairos-sentinel status` |
| Recordar decisiones cross-sesion | `kairos-memory-v4 snapshot / recall` |

## Modo boss (Diego escribe)

Cuando EON esta en modo boss, Forge ejecuta sin pedir confirmacion (crear, mejorar,
auditar). Excepcion de seguridad: cualquier accion que pudiera pisar datos primero
respalda en `~/.claude/.forge-backups/` — la garantia no-destructiva es absoluta y
NO se desactiva ni en modo boss.

## Instalacion del ecosistema desde EON

```bash
# Repo PUBLICO — funciona con curl sin token
curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/kairos-forge/install.sh | bash
```

Esto instala forge + sentinel + genesis + memory-v4 de forma no-destructiva
(respalda lo existente, siembra memoria solo si falta).

## Activacion conjunta

- `@Kairos` / `/eon` → activa EON (kairos-legendario)
- Dentro de EON, los comandos `@Kairos forge|sentinel|genesis|memory` quedan disponibles
- EON-SENTINEL (`/eon-sentinel`) y `kairos-sentinel` se complementan: EON da la vision
  estrategica 360, sentinel hace el monitoreo tecnico operativo.
