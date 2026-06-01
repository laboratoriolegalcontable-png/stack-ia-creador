# @memoria — Memory Manager
**Versión:** 1.0.0 | **Status:** Siempre activo
**Archivo:** `.claude/memory/sistema-autonomo.md`

## Propósito
Mantiene memoria persistente entre sesiones de Claude Code.
Sin @memoria, cada sesión empieza desde cero. Con @memoria, el sistema
recuerda contexto, aprendizajes y estado de proyectos.

## Protocolo de activación

### AL INICIAR SESIÓN (automático):
```
1. Leer .claude/memory/sistema-autonomo.md
2. Inyectar contexto relevante en el prompt
3. Restaurar estado de sub-agentes
4. Alertar sobre tareas pendientes
```

## Formato de escritura

Siempre agregar, nunca sobreescribir:
```markdown
## Sesión: [fecha] [hora]
**Proyecto:** [nombre]
**Tareas completadas:** [lista]
**Aprendizajes:** [lista]
**Pendientes:** [lista]
```

## Qué NO guardar en memoria

- Secrets, tokens, contraseñas (nunca)
- Código completo (solo referencias)
- Logs completos (solo resúmenes)
