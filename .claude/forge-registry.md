# Kairos Forge — Registry

Registro de skills y subagentes del ecosistema Kairos. Forge lo mantiene al crear o
mejorar skills. Aditivo: agregar filas, nunca borrar historial.

## Ecosistema Kairos (nucleo)

| Skill | Version | Rol | Proyectos | Estado |
|-------|---------|-----|-----------|--------|
| kairos-forge | 1.0.0 | Motor: crea/mejora skills y subagentes, bootstrap, audit | todos | activo |
| kairos-legendario | 3.5.0 | Cerebro orquestador EON (300 directivas, 42 submodulos) | todos | activo |
| kairos-sentinel | 1.0.0 | Monitor autonomo (Vercel/Supabase/Make/GitHub/bots) | todos | activo |
| kairos-genesis | 1.0.0 | Bootstrap de proyectos nuevos (auto-detecta stack) | todos | activo |
| kairos-memory-v4 | 4.0.0 | Memoria persistente cross-sesion (local + Supabase) | todos | activo |

## Cadena de autonomia

- SessionStart -> `hooks/memoria/al-iniciar.sh` carga contexto (projects/decisions/ultima sesion)
- PreCompact -> `hooks/memoria/antes-de-compactar.sh` marca el snapshot del dia
- Stop -> `hooks/memoria/al-terminar.sh` cierra el turno en el snapshot
- kairos-legendario orquesta; forge crea/mejora; genesis bootstrapea proyectos nuevos;
  sentinel vigila; memory-v4 recuerda.

## Auto-instalacion

```bash
bash .claude/skills/kairos-forge/install.sh   # instala forge + sentinel + genesis + memory-v4 + legendario + hooks
```

## Reglas del registry

- Toda skill creada por forge se agrega aqui con nombre, version, rol y estado.
- `@Kairos forge audit` puntua cada skill (1-10) y marca las que necesitan upgrade.
- Nunca pisar proyectos ni skills existentes: forge solo agrega o mejora de forma aditiva.
