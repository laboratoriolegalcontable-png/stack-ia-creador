---
description: Auditoría y mejora del sistema de skills de Claude Code. Evalúa skills existentes, detecta gaps y genera versiones mejoradas.
allowed-tools:
  - Read
  - Write
  - Bash
---

# Comando: /skills-upgrade

## Qué hace

Realiza una auditoría completa del sistema de skills en `.claude/skills/`, detecta gaps respecto al workflow real del estudio, y genera versiones mejoradas o skills faltantes.

---

## Uso

```
/skills-upgrade
```

Opcionalmente, apuntar a un skill específico:
```
/skills-upgrade 03-redes-sociales
```

---

## Proceso de auditoría (5 fases)

### Fase 1 — Inventario
```bash
ls -la .claude/skills/
```
Leer cada skill y registrar: nombre, triggers, fases, tamaño, fecha de última modificación.

### Fase 2 — Evaluación por criterios

Para cada skill, puntuar 1-5:

| Criterio | Peso | Descripción |
|---|---|---|
| Triggers completos | 30% | ¿Captura todas las formas que el usuario pide esto? |
| Fases claras | 25% | ¿Tiene fase 1 (identificar) + fase 2 (proceso) + fase 3 (output)? |
| Output estructurado | 20% | ¿El resultado es copy-paste listo o requiere trabajo adicional? |
| Reglas explícitas | 15% | ¿Tiene sección de reglas con restricciones claras? |
| Ejemplos concretos | 10% | ¿Tiene ejemplos del contexto real del estudio? |

### Fase 3 — Detección de gaps

Comparar skills existentes contra el workflow real:
- Áreas del estudio sin skill asignado
- Skills con triggers incompletos (palabras que el usuario usa pero no están)
- Skills sin estructura de 3 fases
- Skills sin ejemplos concretos de Estudio Oro

### Fase 4 — Plan de mejora

Generar tabla priorizada:
```
| Skill | Score actual | Problema | Acción recomendada |
|---|---|---|---|
| ... | .../5 | ... | Mejorar triggers / Agregar fase 3 / Crear nuevo |
```

### Fase 5 — Implementar mejoras

Para cada skill que necesite mejora:
1. Leer el skill actual
2. Aplicar mejoras conservando lo que funciona
3. Escribir la versión mejorada
4. Confirmar con el usuario antes de sobreescribir

---

## Output esperado

```
## Auditoría Skills — [fecha]

### Resumen
- Skills evaluados: X
- Score promedio: X.X/5
- Skills OK (≥4): X
- Skills a mejorar (2-3): X
- Skills críticos (<2) o faltantes: X

### Tabla de skills
[tabla con score por criterio]

### Gaps detectados
[áreas sin skill]

### Plan de mejora priorizado
[tabla priorizada]

### Siguiente paso
¿Quieres que mejore [skill con menor score] primero?
```

---

## Reglas

- **Preguntar antes de sobreescribir**: mostrar el diff propuesto y pedir confirmación
- **Conservar lo que funciona**: no reescribir desde cero si el skill tiene partes buenas
- **Priorizar por uso real**: mejorar primero los skills que el usuario usa más frecuentemente
- **Sin API keys** en ningún skill generado
- **Formato consistente**: todos los skills deben seguir el estándar de `prompt-improver.md`
