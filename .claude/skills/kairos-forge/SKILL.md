---
name: kairos-forge
description: >
  Motor maestro de creacion, instalacion y mejora de skills y subagentes.
  Crea skills nuevas desde templates, perfecciona las existentes, detecta proyectos
  nuevos y bootstrapea el stack correcto automaticamente. Integrado con Kairos Legendario.
  Memoria persistente cross-sesion. Un solo comando instala todo el ecosistema.
version: 1.0.0
---

# Kairos Forge — Fabrica de Skills y Subagentes

## Cuando activar

- Palabras clave: forge, fabrica, crear skill, nuevo agente, subagente, bootstrap, instalar skills
- Comandos: `/kairos-forge`, `@Kairos forge`, `/forge`
- Detecta proyecto nuevo sin CLAUDE.local.md → activa genesis automaticamente
- Detecta skill desactualizada (version vieja en SKILL.md) → propone upgrade
- Detecta skill faltante para una tarea → la crea on-the-fly
- Palabras clave de mejora: "mejorar skill", "actualizar agente", "agregar capacidad", "perfeccionar"
- Palabras clave de auditoria: "audita skills", "revisa agentes", "que skills tengo", "inventario"

## Arquitectura del sistema Forge

```
kairos-forge (este skill — el motor)
├── kairos-sentinel    → monitor autonomo de todos los sistemas
├── kairos-genesis     → bootstrap automatico de proyectos nuevos
├── kairos-memory-v4   → memoria persistente cross-sesion
└── skills generados   → cualquier skill nueva que crees con /forge skill
```

Forge puede crear cualquiera de los otros subagentes y cualquier skill nueva usando
las plantillas de REFERENCE.md. Tambien puede mejorar skills existentes.

## Comandos disponibles

### Crear

```
@Kairos forge skill [nombre] [descripcion-en-una-linea]
```
Crea una nueva skill en `~/.claude/skills/[nombre]/SKILL.md` usando la plantilla correcta.
Forge detecta automaticamente el tipo (legal, tech, marketing, ops, generico) y elige la plantilla.

```
@Kairos forge agent [nombre] [rol-en-una-linea]
```
Crea un subagente especializado. Genera SKILL.md + lo registra en CLAUDE.md como activador.

```
@Kairos forge project [tipo]
```
Detecta el tipo de proyecto y bootstrapea el stack de skills completo.
Tipos: `nextjs` | `express` | `landing` | `mobile` | `supabase` | `make` | `docs` | `api` | `legal` | `inmobiliaria`

### Mejorar

```
@Kairos forge upgrade [nombre-skill]
```
Lee el SKILL.md actual, detecta gaps, agrega capacidades faltantes, actualiza version.

```
@Kairos forge audit
```
Revisa todos los skills en `~/.claude/skills/`, puntua cada uno (1-10) y genera reporte
con skills que necesitan mejora + plan de accion priorizado.

### Memoria

```
@Kairos forge memory save [clave] [valor]
```
Guarda un aprendizaje en memoria persistente (CLAUDE.md + Supabase via narakia-memory).

```
@Kairos forge memory recall [clave]
```
Recupera un aprendizaje guardado.

```
@Kairos forge memory snapshot
```
Toma un snapshot completo de la sesion actual y lo guarda para la proxima.

### Instalar

```
@Kairos forge install
```
Instala o actualiza todo el ecosistema Forge: forge + sentinel + genesis + memory-v4.

```
@Kairos forge install [nombre-skill]
```
Instala una skill especifica del repo oficial.

## Flujo de creacion de skill

Cuando recibis `@Kairos forge skill [nombre] [descripcion]`:

1. **Detectar tipo** — analiza la descripcion y elige la plantilla de REFERENCE.md
2. **Generar SKILL.md** — completa la plantilla con el contexto especifico
3. **Generar triggers** — detecta 5-10 palabras clave de activacion automatica
4. **Escribir archivo** — `~/.claude/skills/[nombre]/SKILL.md`
5. **Registrar en CLAUDE.md** — agrega el trigger al mapa de activacion rapida
6. **Confirmar** — muestra el skill creado y como invocarlo

## Flujo de bootstrap de proyecto

Cuando recibis `@Kairos forge project [tipo]` o detectas un proyecto sin skills:

1. **Escanear** — detecta framework, stack, estructura de carpetas
2. **Mapear** — lista que skills ya existen vs cuales faltan
3. **Instalar faltantes** — crea/instala los skills necesarios
4. **Crear CLAUDE.local.md** — configura el proyecto con activaciones especificas
5. **Configurar sentinel** — activa monitoreo del nuevo proyecto
6. **Confirmar** — lista de skills instalados + comandos de inicio

## Flujo de mejora automatica

Forge mejora skills automaticamente cuando:
- Una skill falla al ejecutar (error o resultado vacio)
- El usuario dice "esto no funciono" despues de invocar una skill
- La version de la skill es antigua (detecta por fecha o version en YAML)
- Forge audit detecta score < 7

Mejora: lee el skill, identifica el gap, agrega la capacidad, incrementa version, guarda.

## Integracion con Kairos Legendario

Forge esta completamente integrado con Kairos Legendario (modo boss, Opus 4.7):

- En modo boss: forge ejecuta sin pedir confirmacion
- Forge puede crear skills directamente en el Supabase de Estudio Oro via edge function
- Forge notifica a Diego via WhatsApp (s5147949) cuando crea o mejora algo importante
- Las skills creadas por forge se registran en narakia-memory para acceso cross-canal

## Templates rapidos (ver REFERENCE.md para templates completos)

```
Legal:       forge skill [nombre] "skill para causas/contratos/patrocinio"
Tech:        forge skill [nombre] "skill para codigo/deploy/debug"
Marketing:   forge skill [nombre] "skill para contenido/ads/SEO"
Ops:         forge skill [nombre] "skill para procesos/operaciones/equipo"
Generico:    forge skill [nombre] "[descripcion libre]"
```

## Auto-deteccion de necesidades

Forge observa cada sesion y detecta automaticamente cuando se necesita una skill:

- Si el usuario hace la misma tarea manual 2+ veces → propone crear una skill para eso
- Si Claude tarda mas de 3 intercambios en resolver algo → propone crear una skill de referencia
- Si se usa un prompt largo repetidamente → propone convertirlo en skill

## Registro de skills creados

Forge mantiene un registro en `~/.claude/forge-registry.md` con:
- Nombre y version de cada skill creado
- Fecha de creacion y ultima mejora
- Score actual (del ultimo audit)
- Proyectos donde se usa
