# Kairos Forge — Registry

Registro vivo de todos los skills y subagentes del ecosistema Forge.
Forge actualiza este archivo cada vez que crea, mejora o audita un skill.

## Reglas del registry

- NUNCA se borra una fila — solo se agregan o se actualiza la columna de estado/version.
- Todo cambio de un skill existente respalda el archivo previo en `~/.claude/.forge-backups/`.
- `auto` = instalado por el autostart hook · `manual` = creado con `@Kairos forge skill`.

## Ecosistema base (siempre instalado)

| Skill | Version | Instalado | Proyectos | Score |
|-------|---------|-----------|-----------|-------|
| kairos-forge | 1.1.0 | auto | todos | 10 |
| kairos-sentinel | 1.0.0 | auto | todos | 9 |
| kairos-genesis | 1.0.0 | auto | todos | 9 |
| kairos-memory-v4 | 4.0.0 | auto | todos | 9 |

## Integraciones activas

| Integracion | Estado | Detalle |
|-------------|--------|---------|
| kairos-legendario (EON v3.5) | ACTIVO | Forge ejecuta sin confirmacion en modo boss · ver INTEGRATION.md |
| Memoria persistente | ACTIVO | Seeds en kairos-memory-v4/seed/ → ~/.claude/memory (no-destructivo) |
| MCP enhancement | ACTIVO | Forge documenta y mejora cualquier MCP nuevo · ver INTEGRATION.md |
| Genesis bootstrap | ACTIVO | Proyecto nuevo sin CLAUDE.local.md → stack correcto automatico |

## Skills creados por Forge (se completa automaticamente)

| Skill | Version | Creado | Tipo | Proyectos |
|-------|---------|--------|------|-----------|
| _(vacio — Forge agrega filas aca al crear skills nuevos)_ | | | | |

## Historial de auditorias

| Fecha | Skills auditados | Promedio | Mejorados |
|-------|------------------|----------|-----------|
| _(Forge registra cada `@Kairos forge audit` aca)_ | | | |
