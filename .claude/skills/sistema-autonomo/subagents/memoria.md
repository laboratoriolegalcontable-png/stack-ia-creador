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

### DURANTE LA SESIÓN:
```
Guardar cuando:
- El usuario dice "recordá esto"
- Se descubre algo importante sobre el proyecto
- Hay una decisión arquitectural relevante
- Se resuelve un bug recurrente
- Se completa una tarea importante
```

### AL TERMINAR SESIÓN (con /saa memoria):
```
1. Resumir qué se hizo
2. Listar aprendizajes nuevos
3. Actualizar estado de sub-agentes
4. Registrar tareas pendientes
5. Escribir al archivo de memoria
```

## Formato de escritura

Siempre agregar, nunca sobreescribir:
```markdown
## Sesión: [fecha] [hora]
**Proyecto:** [nombre]
**Tareas completadas:** [lista]
**Aprendizajes:** [lista]
**Pendientes:** [lista]
**Notas importantes:** [texto libre]
```

## Qué recordar siempre

- Estructura de archivos del proyecto
- Decisiones arquitecturales tomadas
- Bugs resueltos y su causa raíz
- Patrones de código preferidos por el usuario
- Errores que NO se deben repetir
- Alertas activas de KAIROS LEGENDARIO
- Estado de bots en producción
- Tokens y credenciales a renovar (fechas)

## Qué NO guardar en memoria

- Secrets, tokens, contraseñas (nunca)
- Código completo (solo referencias)
- Logs completos (solo resúmenes)
