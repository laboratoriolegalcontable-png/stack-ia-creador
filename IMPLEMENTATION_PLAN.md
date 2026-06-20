# Plan de Implementación — Ecosistema Estudio Oro

**Versión**: 2.0  
**Fecha**: 2026-06-02  
**Branch activo**: `claude/amazing-turing-0HvxS`  
**Estado general**: Infraestructura y Kairos ✅ — Backend API y Dashboard ⏳

---

## Estado Actual al 2 de Junio de 2026

### ✅ FASE 1 — Infraestructura Claude Code (Completado — Mayo 2026)

#### Global (`~/.claude/`)
- [x] `settings.json` — permisos, hooks, modelo por defecto
- [x] `hooks/protect-secrets.sh` — bloquea acceso a `.env`, `*.pem`, `*.key`
- [x] Skills globales: security-reviewer, code-reviewer, node-expert, api-designer, frontend-expert
- [x] Agentes: security-auditor (Opus), code-explorer (Haiku)
- [x] Comandos: `/review`, `/audit`, `/deploy-check`, `/test-all`

#### Diego-Orosa
- [x] `.claude/settings.json` — ESLint hook para `*.ts` + Jest reminder
- [x] `.mcp.json` — Make.com + GitHub + Supabase
- [x] `.claude/skills/estudio-oro-domain/` — lógica de negocio
- [x] `.claude/skills/express-patterns/` — patrones Express del proyecto
- [x] `CLAUDE_CODE_MANUAL.md` — manual completo en español
- [x] Correcciones de seguridad: helmet, CORS, rate limit, raw body HMAC, API key timing-safe

#### Stack-IA-Creador
- [x] `CLAUDE.md` — documentación del proyecto PWA
- [x] `.claude/settings.json` — Prettier hook
- [x] `.claude/skills/pwa-patterns/` — patrones PWA
- [x] `vercel.json` — CSP, HSTS, Permissions-Policy, COOP
- [x] `public/sw.js` — precache completo (incluye agenda.json)
- [x] `public/app.js` — safeUrl(), Promise.allSettled, cache:default

---

### ✅ FASE 2 — Ecosistema Kairos / Narakia (Completado — Mayo 2026)

- [x] **Kairos Legendario** — orquestador autónomo con memoria Supabase
- [x] **Narakia Nucleus** — edge function Supabase + panel en el dashboard PWA
- [x] **Bot-Memory** — sincronización de memoria cross-sesión a Supabase
- [x] **Kairos Forge** — fábrica de skills instalables públicamente (sin credenciales)
- [x] **Kairos Sentinel** — monitoreo y alertas del ecosistema
- [x] **Kairos Genesis** — bootstrapping de stack para proyectos nuevos
- [x] **Kairos Memory v4** — sistema de memoria con tablas Supabase
- [x] **30+ skills Narakia** — agentes especializados por dominio:
  - narakia-lexia (legal), narakia-megamark (marketing)
  - narakia-leadhunter (leads), narakia-content-creator (contenido)
  - narakia-seo-expert (SEO), narakia-ads (publicidad)
  - narakia-valentina, narakia-lucrecia, narakia-megan, narakia-paula
  - narakia-zeus, narakia-capitalis, narakia-finxas, narakia-contabot
  - narakia-analytics, narakia-helpdesk, narakia-teamcoordinator
- [x] `narakia-skills/` en repo público (versiones sanitizadas sin credenciales)

---

### ⏳ FASE 3 — Seguridad Backend Pendiente (Sprint Actual)

**Prioridad CRÍTICA** — El backend no puede ir a producción sin estos fixes.

| Tarea | Archivo | Impacto |
|-------|---------|--------|
| Verificación firma Whapi en webhook | `src/api/routes.ts`, `src/api/middleware/auth.ts` | ALTO seguridad |
| Fail-fast `DATABASE_URL`/`REDIS_URL` en producción | `src/config/database.ts`, `src/config/redis.ts` | ALTO estabilidad |
| `tsconfig.json` para compilar TypeScript | raíz del repo | CRÍTICO — sin esto no arranca |
| DLQ (dead-letter queue) para webhooks fallidos | `src/api/webhooks.ts` | ALTO confiabilidad |
| Zod schemas en todos los endpoints admin | `src/api/routes.ts` | MEDIO seguridad |
| `payload.entry[0]` — verificar longitud antes de acceder | `src/api/webhooks.ts` | MEDIO estabilidad |
| Whitelist campos en `customerService.update()` | `src/services/customer.service.ts` | MEDIO seguridad |
| `unhandledRejection` / `uncaughtException` | `src/index.ts` | MEDIO estabilidad |

**Cómo ejecutar con Claude Code**:
```bash
cd /home/user/diego-orosa
claude "Implementa los fixes de seguridad pendientes del AUDITORIA-PRD-PLAN.md:
1. verifyWhapiWebhook() con X-Whapi-Token HMAC
2. Fail-fast para DATABASE_URL y REDIS_URL
3. tsconfig.json con outDir=dist, strict=true
4. unhandledRejection + uncaughtException en index.ts
Sigue los patrones en .claude/skills/express-patterns/SKILL.md"
```

---

### ⏳ FASE 4 — API REST Backend Completa

**Objetivo**: API funcional con todos los endpoints del PRD.md

| Tarea | Archivo a crear |
|-------|---------------|
| CRUD de leads completo | `src/routes/leads.routes.ts` + `src/controllers/leads.controller.ts` + `src/services/leads.service.ts` |
| Auth middleware JWT | `src/middlewares/auth.middleware.ts` |
| Validación con Zod | `src/middlewares/validate.middleware.ts` |
| Error handler global | `src/middlewares/errorHandler.ts` |
| Endpoint de analytics | `src/routes/analytics.routes.ts` |
| Endpoint de content/generate | `src/routes/content.routes.ts` (llama a Claude API) |
| Tests con Jest | `tests/leads.test.ts`, `tests/webhooks.test.ts` |
| Migración UNIQUE constraints | `migrations/005_customer_unique_channels.sql` |
| Configuración Firebase | `src/config/firebase.ts` |

**Estimación**: 4-6 horas de Claude Code

**Cómo ejecutar**:
```bash
cd /home/user/diego-orosa
claude "Implementa la API REST completa de leads según PRD.md sección 3.1.
Usa .claude/skills/express-patterns/SKILL.md y
.claude/skills/estudio-oro-domain/SKILL.md.
Incluye tests con Jest. Protege rutas con JWT.
Fail-fast si DATABASE_URL no está definida."
```

---

### ⏳ FASE 5 — Dashboard PWA v2 con Datos Reales

**Objetivo**: Dashboard conectado al backend con autenticación

| Tarea | Archivo |
|-------|--------|
| Cliente HTTP para el backend | `public/src/api.js` |
| State management reactivo | `public/src/store.js` |
| Componente tabla de leads | `public/src/components/leads-table.js` |
| Componente tarjetas de stats | `public/src/components/stats-cards.js` |
| Login con JWT cookie HttpOnly | `public/src/auth.js` |
| ARIA tabs + navegación por teclado | `public/app.js` |
| Shortcuts en manifest.json | `public/manifest.json` |
| Cache-Control para JS/CSS | `vercel.json` |

**Estimación**: 4-8 horas de Claude Code

**Cómo ejecutar**:
```bash
cd /home/user/stack-ia-creador
claude "Implementa el Dashboard PWA v2 según PRD.md sección 3.2.
Vanilla JS puro, sin frameworks. Service Worker con stale-while-revalidate.
Conecta al backend en diego-orosa. Incluye autenticación JWT.
Sigue .claude/skills/pwa-patterns/SKILL.md para los patrones."
```

---

### ⏳ FASE 6 — Contenido Automatizado + Calendar Editorial

**Objetivo**: Generar y programar contenido para las 3 marcas desde el celular

| Tarea | Descripción |
|-------|------------|
| Endpoint `POST /api/v1/content/generate` | Recibe `{tipo, pilar, plataforma}` → Claude API → copy listo |
| Tab "Publicar Hoy" en PWA | Muestra agenda del día con botón "Generar con IA" |
| Integración Make.com para publicación | Envía el contenido generado a Instagram/Facebook |
| Historial de contenido generado | Tabla `content_history` en Firebase |

**Estimación**: 3-5 días

---

### ⏳ FASE 7 — Funcionalidades Nuevas (Q3-Q4 2026)

| Feature | Impacto | Esfuerzo |
|---------|---------|----------|
| Lead scoring automático en WhatsApp | ALTO — responder primero al lead caliente | 1-2 días |
| Notificaciones Push PWA para leads ALTA | ALTO — Diego se entera en 30 segundos | 2-3 días |
| Portal de causas judiciales para clientes | ALTO — diferenciador vs estudio tradicional | 3-5 días |
| Separar worker Bull en proceso dedicado | MEDIO — performance bajo carga | 1 día |
| Módulo UIF Compliance | ALTO — obligatorio legal | Q4 2026 |

---

## Comandos Útiles de Claude Code

### Flujo diario de trabajo
```bash
# Al iniciar una sesión
# Kairos carga automáticamente el contexto de Supabase
# Revisar estado del ecosistema:
claude "Kairos, briefing del ecosistema"

# Auditoría de seguridad semanal
claude --agent security-auditor "Audita el proyecto completo"

# Check de dependencias
/audit --deps
```

### Para implementar una nueva feature
```bash
# 1. Activar plan mode
claude --plan "Implementar [feature]"

# 2. Revisar el plan, aprobar
# 3. Ejecutar
claude --auto "Implementar [feature] según el plan"

# 4. Review y verificación
/review
/deploy-check
git add -A && git commit -m "feat: [descripción]"
git push -u origin [branch]
```

### Variables de entorno necesarias (diego-orosa)
```bash
# Infraestructura
NODE_ENV=production
PORT=3000
JWT_SECRET=           # openssl rand -base64 32
JWT_REFRESH_SECRET=   # diferente al JWT_SECRET

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY= # con \n escapados

# WhatsApp
WHAPI_TOKEN=
WHAPI_WEBHOOK_SECRET= # para verificar firma
WHATSAPP_NUMERO_DIEGO=

# Meta
META_APP_SECRET=      # para verificar firma webhooks
META_ACCESS_TOKEN=

# Make.com
MAKE_API_KEY=

# CORS
ALLOWED_ORIGINS=https://stack-ia-creador.vercel.app,https://estudiooro.com
```

---

## Reglas del Ecosistema (No Negociables)

1. **NO TOCAR** `reclamai/` en diego-orosa
2. **NO TOCAR** `oro/index.html` en main (producción)
3. **NO MERGEAR** PRs viejos sin confirmación de Diego
4. **NO BORRAR** archivos sin confirmación
5. **NO HARDCODEAR** credenciales — siempre variables de entorno
6. **NO USAR** `git add -A` sin revisar qué archivos incluye
7. **NO PUSHEAR** a main directamente — siempre via PR
8. **RESPALDAR** antes de sobreescribir cualquier archivo importante

---

## Links del Ecosistema

| Servicio | URL / ID |
|---------|----------|
| Dashboard PWA | https://stack-ia-creador.vercel.app |
| Landing estudiooro.com | https://estudiooro.com |
| Supabase (Kairos) | proyecto `moljmujlfvtsgkjbtwss` |
| Make.com | 6 escenarios activos (ver PRD sección 3.3) |
| Vercel (estudiooro) | `prj_ZHOBJhlaKAYq6xQdQJtSXOAtBrwW` |

---

*Plan v2.0 — actualizado 2026-06-02 | Ecosistema Estudio Oro*
