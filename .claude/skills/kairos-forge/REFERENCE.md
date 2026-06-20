# Kairos Forge — REFERENCE.md (generico)
# Templates, manifiestos y patrones para crear skills y subagentes.
# Version GENERICA para repo publico: sin IDs ni datos internos de ningun negocio.
# Los manifiestos especificos de cada proyecto viven en su CLAUDE.md privado.

---

## TEMPLATE 01 — Skill generico (base para todo)

```markdown
---
name: [nombre-en-kebab-case]
description: >
  [Una oracion que explica que hace este skill en tercera persona.
  Claude usa esta descripcion para decidir si activarlo.]
version: 1.0.0
---

# [Nombre Legible] — [Subtitulo de una linea]

## Cuando activar
- Palabras clave: [keyword1], [keyword2], [keyword3]
- Comandos: `/[nombre]`, `@Kairos [nombre]`
- Automatico: [condicion de activacion automatica si aplica]

## Que hace
[Descripcion de 2-3 oraciones.]

## Comandos disponibles
`@Kairos [nombre] [accion1]` — [descripcion]
`@Kairos [nombre] [accion2]` — [descripcion]

## Flujo de trabajo
1. [Paso 1]  2. [Paso 2]  3. [Paso 3]

## Output esperado
[Que devuelve el skill.]

## Integracion con otros skills
- [skill-relacionado]: [como interactuan]
```

---

## TEMPLATE 02 — Skill legal (generico, sin datos de cliente)

```markdown
---
name: [nombre-legal]
description: >
  Skill especializado en [rama del derecho]. Aplica legislacion vigente.
  Nunca inventa jurisprudencia. Siempre indica [VERIFICAR VIGENCIA] en normativa.
version: 1.0.0
---

# [Nombre] — [Especialidad Legal]

## Reglas criticas
- [VERIFICAR VIGENCIA] en toda normativa citada
- [FUENTE REQUERIDA] en jurisprudencia
- Nunca prometer resultados — usar "puede ayudarte" no "ganara"
- Sugerir siempre consulta con el profesional matriculado
```

---

## TEMPLATE 03 — Skill de monitoreo/automatizacion

```markdown
---
name: [nombre-monitor]
description: >
  Monitor autonomo de [sistema]. Se activa ante fallos, alertas o pedidos de status.
  Diagnostica, aplica fix cuando es posible (respaldando antes), escala cuando no.
version: 1.0.0
---

## Niveles de respuesta
| Nivel | Condicion | Accion |
|-------|-----------|--------|
| 1 | Fix conocido | Auto-aplica + notifica |
| 2 | Fix incierto | Diagnostica + consulta |
| 3 | Critico | Escala inmediatamente al owner |
```

---

## TEMPLATE 04 — Skill de creacion de contenido

```markdown
---
name: [nombre-contenido]
description: >
  Genera [tipo de contenido] para [canal/audiencia]. Tono: [definir].
  Incluye hooks, CTAs y adaptaciones por plataforma.
version: 1.0.0
---

## Formatos
| Formato | Largo | Estructura |
|---------|-------|------------|
| Reel    | 30-60s | Hook 3s + desarrollo + CTA |
| Post    | 150-300 palabras | Titulo + cuerpo + CTA |
| Email   | 200-400 palabras | Asunto + apertura + cuerpo + CTA |
```

---

## TEMPLATE 05 — Subagente especializado

```markdown
---
name: [nombre-agente]
description: >
  Subagente de [agente padre]. Especializado en [funcion].
  Opera con autonomia dentro de su dominio. Escala al padre cuando excede su alcance.
version: 1.0.0
---

## Rol y alcance
[Que puede y no puede hacer]

## Cuando escala al agente padre
- [Condicion 1]  - [Condicion 2]
```

---

## MANIFIESTOS DE PROYECTO (genericos)

> Cada proyecto define IDs/secretos en su propio CLAUDE.md privado.
> Estos manifiestos solo declaran QUE skills instalar por tipo.

### Next.js + DB + Hosting
```yaml
project_type: nextjs
skills_required:
  - vercel-react-best-practices
  - building-components
  - shadcn-ui
  - protege-tu-app
  - kairos-sentinel
  - kairos-memory-v4
  - kairos-forge
```

### Express / API
```yaml
project_type: express-api
skills_required:
  - express-patterns
  - protege-tu-app
  - security-review
  - kairos-sentinel
  - kairos-memory-v4
security:
  check_hardcoded_keys: always
  check_cors: true
```

### Landing Page
```yaml
project_type: landing
skills_required:
  - instant-landing
  - frontend-design
  - copywriter
  - vercel-deploy
  - seo-audit
  - kairos-sentinel
performance_targets:
  lighthouse_perf: 90
  lighthouse_seo: 95
```

### App Movil (React Native / Expo)
```yaml
project_type: mobile
skills_required:
  - building-components
  - protege-tu-app
  - kairos-sentinel
  - kairos-memory-v4
```

### Documentacion / Guias
```yaml
project_type: docs
skills_required:
  - kairos-memory-v4
  - copywriter
  - markitdown
format: markdown
```

### Base (todos los proyectos)
```yaml
always_install:
  - kairos-forge
  - kairos-sentinel
  - kairos-genesis
  - kairos-memory-v4
```

---

## ESQUEMA DE MEMORIA (kairos-memory-v4)

### decisions.md entry
```markdown
[YYYY-MM-DD] [proyecto] [tipo: arquitectura|seguridad|proceso|ui|negocio]
DECISION: [una oracion]
RAZON: [por que]
NO REVERTIR: [condicion]
```

### patterns.md entry
```markdown
[patron: nombre]
TRIGGER: "[situacion]"
CAUSA_RAIZ: [lo mas probable]
FIX: [accion exacta]
PREVENCION: [como evitarlo]
```

---

## COMANDOS DE FORGE QUICK-REFERENCE

```
@Kairos forge skill [nombre] "[descripcion]"   # crear skill
@Kairos forge upgrade [nombre]                  # mejorar skill
@Kairos forge audit                             # auditar todos (1-10)
@Kairos forge project [tipo]                    # bootstrap proyecto
@Kairos forge install                           # instalar ecosistema
@Kairos sentinel status                         # estado de sistemas
@Kairos memory snapshot                         # snapshot de sesion
```
