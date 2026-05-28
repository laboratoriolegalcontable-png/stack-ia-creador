# Kairos Forge — REFERENCE.md
# Templates, manifiestos y patrones para crear skills y subagentes

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

[Descripcion de 2-3 oraciones de lo que hace el skill.]

## Comandos disponibles

```
@Kairos [nombre] [accion1]
```
[Descripcion de la accion 1.]

```
@Kairos [nombre] [accion2]
```
[Descripcion de la accion 2.]

## Flujo de trabajo

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

## Output esperado

[Que devuelve el skill cuando se invoca correctamente.]

## Integracion con otros skills

- [skill-relacionado-1]: [como interactuan]
- [skill-relacionado-2]: [como interactuan]
```

---

## TEMPLATE 02 — Skill legal (Estudio Oro)

```markdown
---
name: [nombre-legal]
description: >
  Skill especializado en [rama del derecho/proceso legal].
  Aplica legislacion argentina vigente (CCCN, CPP, etc.).
  Nunca inventa jurisprudencia. Siempre indica [VERIFICAR VIGENCIA] en normativa.
version: 1.0.0
---

# [Nombre] — [Especialidad Legal]

## Cuando activar

- Palabras clave: [terminos juridicos especificos]
- Tipo de tarea: [ej: "redactar recurso", "calcular honorarios", "due diligence"]

## Marco normativo aplicable

- [Ley/Codigo 1]: [descripcion]
- [Ley/Codigo 2]: [descripcion]

## Reglas criticas

- [VERIFICAR VIGENCIA] en toda normativa citada
- [FUENTE REQUERIDA] en jurisprudencia
- Nunca prometer resultados — usar "puede ayudarte" no "ganara"
- Siempre sugerir consulta con el profesional matriculado

## Flujo

1. Identificar el tipo de acto juridico
2. Verificar requisitos formales
3. Redactar / calcular / analizar
4. Incluir advertencias de vigencia

## Output format

[Estructura del output: encabezado, cuerpo, advertencias legales]
```

---

## TEMPLATE 03 — Skill de monitoreo/automatizacion

```markdown
---
name: [nombre-monitor]
description: >
  Monitor autonomo de [sistema/proceso].
  Se activa ante fallos, alertas o pedidos de status.
  Diagnostica, aplica fix automatico cuando es posible, escala cuando no.
version: 1.0.0
---

# [Nombre] — Monitor de [Sistema]

## Cuando activar

- Palabras clave: "fallo", "error", "caido", "no responde", "status"
- Automatico: cuando otro skill detecta un error en [sistema]

## Que monitorea

[Lista de endpoints, servicios, jobs]

## Niveles de respuesta

| Nivel | Condicion | Accion |
|-------|-----------|--------|
| 1 | Fix conocido | Auto-aplica + notifica |
| 2 | Fix incierto | Diagnostica + consulta |
| 3 | Critico | Escala inmediatamente a Diego |

## Comandos

[status, fix, watch, logs]
```

---

## TEMPLATE 04 — Skill de creacion de contenido

```markdown
---
name: [nombre-contenido]
description: >
  Genera [tipo de contenido] para [canal/audiencia].
  Tono: [rioplatense/formal/casual]. Voz de marca: [Estudio Oro/Lobo/otro].
  Incluye hooks, CTAs y adaptaciones por plataforma.
version: 1.0.0
---

# [Nombre] — Contenido para [Canal]

## Cuando activar

- Palabras clave: [ej: "reel", "post", "email", "guion"]
- Canal: [Instagram / LinkedIn / WhatsApp / Email / TikTok]

## Voz de marca

[Descripcion de la voz: formal pero cercana, sin jerga juridica, etc.]

## Pilares de contenido

1. [Pilar 1]
2. [Pilar 2]
3. [Pilar 3]

## Formatos disponibles

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
  Subagente de [agente padre]. Especializado en [funcion especifica].
  Opera con autonomia total dentro de su dominio.
  Escala a [agente padre] cuando excede su alcance.
version: 1.0.0
---

# [Nombre Agente] — Subagente de [Padre]

## Rol y alcance

[Descripcion de lo que este agente puede y no puede hacer]

## Cuando escala al agente padre

- [Condicion 1]
- [Condicion 2]

## Persona y tono

[Como habla, como se presenta, como responde al Dr. Diego]

## Capacidades especificas

[Lista de lo que puede hacer que otros agentes no pueden]

## Integracion con el ecosistema

[Como se comunica con otros agentes, que tools usa]
```

---

## MANIFIESTOS DE PROYECTO

### Manifiesto: Next.js + Supabase + Vercel

```yaml
project_type: nextjs-supabase
version: 1.0.0
skills_required:
  - vercel-react-best-practices
  - building-components
  - shadcn-ui
  - protege-tu-app
  - kairos-sentinel
  - kairos-memory-v4
  - kairos-forge
skills_optional:
  - gsap
  - frontend-design
  - instant-landing
monitoring:
  vercel: true
  supabase: true
  github_actions: true
branching:
  main: protegido
  feature: feat/*
  fix: fix/*
  ci: ci/*
alerts:
  on_build_fail: whatsapp_diego
  on_deploy_success: silent
commands:
  dev: npm run dev
  build: npm run build
  test: npm test
  deploy: vercel --prod
```

### Manifiesto: Express.js API

```yaml
project_type: express-api
version: 1.0.0
skills_required:
  - express-patterns
  - protege-tu-app
  - security-review
  - narakia-debug
  - kairos-sentinel
  - kairos-memory-v4
monitoring:
  vercel: true
  logs: true
security:
  check_hardcoded_keys: always
  check_rls: na
  check_cors: true
```

### Manifiesto: Landing Page

```yaml
project_type: landing
version: 1.0.0
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
  fcp: "< 1.5s"
```

### Manifiesto: Estudio Oro (todos los proyectos del Dr. Orosa)

```yaml
project_type: estudio-oro
version: 1.0.0
skills_required:
  - orosa-jarvis
  - narakia-kairos
  - kairos-forge
  - kairos-sentinel
  - kairos-memory-v4
  - kairos-genesis
skills_legal:
  - 01-penal-escrito
  - 02-inmobiliario
  - 04-tributario
  - 05-patrimonial
skills_marketing:
  - narakia-megamark
  - content-machine
  - copywriter
boss:
  phone: 5491140253204
  mode: direct
  prefix: "Doctor,"
supabase: moljmujlfvtsgkjbtwss
invariants_file: NARAKIA-INVARIANTS.md
```

### Manifiesto: Make.com Automation

```yaml
project_type: make-automation
version: 1.0.0
skills_required:
  - automatizador
  - kairos-sentinel
  - narakia-debug
  - kairos-memory-v4
team_id: 2012148
scenarios_criticos:
  - id: s5147949
    name: "WhatsApp Diego personal"
  - id: s4562335
    name: "Reporte semanal"
  - id: s4561747
    name: "Whapi general"
```

### Manifiesto: Marketing / Contenido

```yaml
project_type: marketing-content
version: 1.0.0
skills_required:
  - content-machine
  - copywriter
  - viral-radar
  - narakia-socialmedia
  - seo-supremo
  - kairos-memory-v4
channels:
  - instagram
  - linkedin
  - tiktok
  - email
  - whatsapp
brand_voice: estudio-oro
pillars:
  - legal-educativo
  - inversiones-internacionales
  - lobo-confiteria
  - tecnologia-legal
```

### Manifiesto: App Movil (React Native / Expo)

```yaml
project_type: mobile
version: 1.0.0
skills_required:
  - building-components
  - protege-tu-app
  - kairos-sentinel
  - kairos-memory-v4
platform: expo
payment_provider: mercadopago
backend: supabase
```

### Manifiesto: Documentacion / Guias

```yaml
project_type: docs
version: 1.0.0
skills_required:
  - kairos-memory-v4
  - book-to-skill
  - copywriter
  - markitdown
format: markdown
language: es-AR
no_accents: true
```

---

## PATRONES DE AUTO-ACTIVACION

Estos patrones son para actualizar el mapa de activacion en CLAUDE.md
cuando se crea un nuevo skill:

```markdown
## PATRON DE ACTIVACION STANDARD

**`/[nombre-skill]`** → Se activa cuando: [keyword1], [keyword2], [keyword3], [comando slash]
```

### Patrones de activacion por tipo

**Legal:**
```
→ Se activa cuando: [proceso juridico], [tipo de escrito], [materia legal]
```

**Tech/Deploy:**
```
→ Se activa cuando: deploy, build, error en [sistema], CI/CD, [framework]
```

**Monitor:**
```
→ Se activa cuando: fallo, caido, no responde, status de [sistema], error critico
```

**Contenido:**
```
→ Se activa cuando: [tipo de contenido], guion, copy, [canal], redacta
```

**Ops/Proceso:**
```
→ Se activa cuando: [nombre del proceso], como hago [tarea], paso a paso para [accion]
```

---

## ESQUEMA DE MEMORIA (kairos-memory-v4)

### decisions.md entry

```markdown
[YYYY-MM-DD] [proyecto: nombre] [tipo: arquitectura|seguridad|proceso|ui|negocio]
DECISION: [descripcion clara en una oracion]
RAZON: [por que se tomo esta decision]
IMPACTO: [que sistemas o comportamientos afecta]
NO REVERTIR: [condicion bajo la cual no debe revertirse]
```

### patterns.md entry

```markdown
[patron: nombre-descriptivo]
TRIGGER: "[frase o situacion que activa el patron]"
CAUSA_RAIZ: [lo mas probable]
FIX: [accion exacta a tomar]
FRECUENCIA: [N veces] (fechas)
PREVENCION: [como evitar que ocurra de nuevo]
```

### session snapshot entry

```markdown
# [YYYY-MM-DD] — Sesion N

## Contexto de entrada
- Proyecto: [nombre]
- Objetivo: [que se queria lograr]

## Completado
- [ ] [tarea 1] → [resultado]
- [ ] [tarea 2] → [resultado]

## Decisiones criticas
- [decision]: [razon]

## Pendientes
- [item 1] (prioridad: alta/media/baja)

## Para la proxima sesion
[contexto que Claude necesita recordar]
```

---

## COMANDOS DE FORGE QUICK-REFERENCE

```bash
# Crear skill nuevo
@Kairos forge skill [nombre] "[descripcion]"

# Mejorar skill existente
@Kairos forge upgrade [nombre]

# Auditar todos los skills
@Kairos forge audit

# Bootstrap proyecto nuevo
@Kairos forge project [tipo]

# Guardar en memoria
@Kairos forge memory save decision "[descripcion]"

# Instalar todo el ecosistema
@Kairos forge install

# Status de todos los sistemas
@Kairos sentinel status

# Snapshot de sesion
@Kairos memory snapshot
```
