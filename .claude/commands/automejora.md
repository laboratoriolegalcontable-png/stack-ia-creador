---
description: Motor de auto-generacion y auto-mejora para skills, agentes, PRDs, auditorias y revisiones triples. Crea, evalua, corrige y registra componentes del ecosistema Claude.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Agent
---

# Comando: /automejora

Motor de auto-generacion y evolucion continua del ecosistema Claude de Diego Orosa.
Genera, audita, mejora y registra skills, agentes, PRDs y planes de forma autonoma.

---

## Modos de operacion

| Comando | Modo | Que hace |
|---------|------|---------|
| `/automejora` | Menu interactivo | Muestra todos los modos disponibles |
| `/automejora nuevo skill` | GENERAR_SKILL | Entrevista (3 preguntas) + genera + registra |
| `/automejora nuevo agente` | GENERAR_AGENTE | Entrevista (4 preguntas) + genera + registra |
| `/automejora nuevo PRD` | GENERAR_PRD | Entrevista (5 preguntas) + genera PRD completo |
| `/automejora auditoria` | AUDITAR | Escanea + score + plan de accion |
| `/automejora inventario` | INVENTARIAR | Tabla completa + gaps detectados |
| `/automejora mejora [nombre]` | MEJORAR | Diagnostica + diff + aplica con confirmacion |
| `/automejora revision [nombre]` | REVISAR_TRIPLE | 3 revisores en paralelo + sintesis |
| `/automejora programa` | EJECUTAR_PY | Corre `automejora.py` con el subcomando elegido |

---

## Uso rapido

```
/automejora
```
Muestra el menu y espera seleccion.

```
/automejora nuevo skill
```
Inicia la entrevista de 3 preguntas y genera el skill completo.

```
/automejora auditoria
```
Escanea todos los skills y agentes, puntua cada uno (0-100) y genera plan de mejora.

```
/automejora revision copywriter
```
Lanza 3 revisores en paralelo sobre el skill "copywriter" y entrega el reporte consolidado.

```
/automejora programa inventario
```
Ejecuta `~/.claude/skills/automejora/automejora.py inventario` en la terminal.

---

## Proceso segun modo

### GENERAR_SKILL — 4 fases
1. Entrevista: 3 preguntas (que hace, cuando se activa, output esperado)
2. Generar con SKILL_TEMPLATE de REFERENCE.md
3. Auto-revision con SKILL_CHECKLIST (7 criterios, 0-100)
4. Guardar en `~/.claude/skills/[nombre]/SKILL.md` + actualizar REGISTRY.md

### GENERAR_AGENTE — 3 fases
1. Entrevista: 4 preguntas (rol, tareas, limitaciones, dependencias)
2. Generar con AGENT_TEMPLATE de REFERENCE.md
3. Guardar en `~/.claude/agents/[nombre].md` + actualizar REGISTRY.md

### GENERAR_PRD — 3 fases
1. Entrevista: 5 preguntas (nombre, problema, usuario, alcance, metricas)
2. Generar PRD completo con PRD_TEMPLATE (8 secciones)
3. Guardar en `/[NOMBRE-PRODUCTO]-PRD.md`

### AUDITAR — 2 pasos
1. Escanear `~/.claude/skills/` y `~/.claude/agents/`
2. Score por objeto → VERDE (80+) / AMARILLO (50-79) / ROJO (<50) + plan priorizado

### REVISAR_TRIPLE — paralelo
Lanzar 3 agentes simultaneos:
- **Revisor A**: Calidad (logica, ambiguedad, casos borde)
- **Revisor B**: Completitud (use cases faltantes, inputs no manejados)
- **Revisor C**: Seguridad (credentials, NARAKIA-INVARIANTS, jailbreak)
Sintetizar en reporte final con score y recomendacion.

### EJECUTAR_PY — directo
```bash
python3 ~/.claude/skills/automejora/automejora.py [subcomando]
# subcomandos: inventario | auditoria | gaps | registro | stats | revision | nuevo | mejorar
```

---

## Reglas

- **Nunca sobreescribir sin mostrar diff y confirmar** (excepto flag --forzar)
- **Siempre actualizar REGISTRY.md** despues de crear o modificar cualquier objeto
- **Sin acentos** en archivos del repo (convenciones del proyecto)
- **Sin API keys ni credentials** en ningun output generado
- **Revision triple obligatoria** para objetos que afectan sistemas en produccion
- **Versionar** — cada SKILL.md tiene version: X.Y.Z en el frontmatter
- **Registrar aprendizaje** en `LEARNINGS.md` al final de cada tarea exitosa
- **Maximo 3 preguntas** por entrevista — el resto se infiere del contexto

---

## Templates y checklists

Todos los templates, checklists y prompts de revision estan en:
```
~/.claude/skills/automejora/REFERENCE.md
```

El programa Python con funciones de inventario, scoring y auditoria masiva esta en:
```
~/.claude/skills/automejora/automejora.py
```
