---
name: kairos-genesis
description: >
  Bootstrapeador autonomo de proyectos nuevos. Detecta el tipo de proyecto, instala
  el stack de skills correcto, genera CLAUDE.local.md personalizado, configura sentinel
  y deja el proyecto listo para trabajar con maxima productividad desde el primer mensaje.
  Se activa automaticamente al abrir una carpeta sin configuracion Claude.
version: 1.0.0
---

# Kairos Genesis — Bootstrapeador de Proyectos

## Cuando activar

- Palabras clave: "proyecto nuevo", "bootstrap", "setup inicial", "configurar proyecto"
- Palabras clave: "nuevo cliente", "nuevo repo", "iniciar proyecto", "crear estructura"
- Comandos: `/kairos-genesis`, `@Kairos genesis`, `/genesis`
- Automatico: cuando la carpeta de trabajo no tiene CLAUDE.local.md ni `.claude/`
- Automatico: cuando el usuario abre un repo de GitHub sin skills configurados
- Automatico: despues de `git clone` de un repo que no es Diego-Orosa

## Que hace en orden

### Fase 1 — Escanear (30 segundos)

Analiza la estructura del proyecto:

```bash
# Lo que genesis detecta:
- Framework: Next.js / React / Express / FastAPI / Django / static / otro
- Stack: TypeScript / JavaScript / Python / otro
- Base de datos: Supabase / PostgreSQL / MongoDB / ninguna
- Deploy: Vercel / Railway / Netlify / VPS / otro
- Integraciones: Stripe / MercadoPago / Twilio / WhatsApp / otro
- Tipo de negocio: legal / inmobiliaria / SaaS / agencia / ecommerce / otro
```

### Fase 2 — Mapear skills necesarios

Segun el tipo detectado, genesis elige el stack de skills:

| Tipo de proyecto | Skills que instala |
|-----------------|-------------------|
| Next.js / React | vercel-react-best-practices, building-components, shadcn-ui, frontend-design, vercel-deploy |
| Express / API | express-patterns, protege-tu-app, security-review, narakia-debug |
| Landing page | instant-landing, frontend-design, copywriter, vercel-deploy, seo-audit |
| App movil (React Native) | building-components, protege-tu-app, vercel-deploy |
| Supabase project | kairos-sentinel, protege-tu-app, narakia-debug |
| Make.com automation | automatizador, kairos-sentinel |
| Legal / Estudio | 01-penal-escrito, 02-inmobiliario, 04-tributario, 05-patrimonial, orosa-jarvis |
| Inmobiliaria | 02-inmobiliario, real-estate-dd, kairos-sentinel |
| Marketing / Contenido | content-machine, copywriter, viral-radar, narakia-socialmedia |
| Cualquier proyecto | kairos-forge, kairos-sentinel, kairos-memory-v4 (siempre) |

### Fase 3 — Generar CLAUDE.local.md

Genesis genera un `.claude/CLAUDE.local.md` personalizado para el proyecto con:

```markdown
# [Nombre del proyecto] — Kairos Config

## Stack detectado
[framework, lenguaje, deploy, DB]

## Skills activos en este proyecto
[lista de skills con sus triggers especificos]

## IDs de produccion
[vercel project ID, supabase project, etc.]

## Reglas de desarrollo
[branching strategy, test requirements, etc.]

## Comandos frecuentes
[los comandos mas usados en este proyecto]
```

### Fase 4 — Configurar sentinel

Genesis registra el proyecto en kairos-sentinel:
- Agrega los endpoints del proyecto al monitoreo
- Configura los canales de alerta
- Define los umbrales criticos especificos del proyecto

### Fase 5 — Confirmar y documentar

Genesis muestra:
- Resumen de lo que detecto
- Lista de skills instalados (nuevos vs ya existentes)
- Los 5 comandos mas utiles para empezar a trabajar
- Una pregunta: "hay algo especifico de este proyecto que quieras que recuerde siempre?"

## Comandos disponibles

```
@Kairos genesis scan
```
Escanea el proyecto actual y muestra el diagnostico sin instalar nada.

```
@Kairos genesis bootstrap
```
Escanea e instala todo el stack recomendado.

```
@Kairos genesis bootstrap [tipo]
```
Fuerza un tipo especifico si el auto-detect no funciona bien.
Tipos: `nextjs` | `express` | `landing` | `mobile` | `supabase` | `legal` | `marketing` | `api`

```
@Kairos genesis refresh
```
Actualiza el CLAUDE.local.md del proyecto con el estado actual.

```
@Kairos genesis add [skill]
```
Agrega un skill especifico al proyecto y lo registra en CLAUDE.local.md.

## Manifiestos de proyecto (templates completos en REFERENCE.md de forge)

### Manifiesto: Next.js + Supabase (el mas comun)

```yaml
project_type: nextjs-supabase
skills:
  - vercel-react-best-practices
  - building-components
  - shadcn-ui
  - protege-tu-app
  - kairos-sentinel
  - kairos-memory-v4
commands:
  dev: npm run dev
  build: npm run build
  deploy: vercel --prod
monitoring:
  vercel: true
  supabase: true
alerts:
  channel: whatsapp_diego
```

### Manifiesto: Estudio Oro (proyectos del Dr. Diego Orosa)

```yaml
project_type: estudio-oro
skills:
  - orosa-jarvis
  - 01-penal-escrito
  - 02-inmobiliario
  - narakia-kairos
  - kairos-forge
  - kairos-sentinel
  - kairos-memory-v4
boss_phone: 5491140253204
supabase_project: moljmujlfvtsgkjbtwss
monitoring:
  bots: [narakia-handler, natalia-bot, megan-bot]
  vercel: [deploy-oro, reclamai]
  make: [s5147949, s4562335]
```

### Manifiesto: Landing + Marketing

```yaml
project_type: landing-marketing
skills:
  - instant-landing
  - copywriter
  - seo-audit
  - vercel-deploy
  - content-machine
  - kairos-sentinel
```

## Auto-deteccion de proyectos nuevos

Genesis se activa automaticamente cuando detecta CUALQUIERA de estas condiciones:

1. `ls .claude/` falla (no existe la carpeta) → genesis bootstrap
2. `cat CLAUDE.md` falla (no existe) → genesis bootstrap minimo
3. El usuario abre un repo con `git clone` → genesis scan
4. El usuario dice "empecemos con el proyecto [nombre]" → genesis bootstrap
5. El proyecto tiene `package.json` o `requirements.txt` pero no `.claude/` → genesis bootstrap

## Proyectos conocidos (no re-scanear)

Genesis tiene registro de los proyectos del ecosistema Estudio Oro.
No re-bootstrapea proyectos ya configurados — solo hace refresh si hay cambios.

```
diego-orosa    → manifiesto estudio-oro (este repo)
reclamai       → manifiesto nextjs-supabase
deploy-oro     → manifiesto express + make
```
