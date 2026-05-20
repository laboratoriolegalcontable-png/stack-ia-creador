# AUDITORIA TRIPLE — PRD — PLAN DE CORRECCION Y PROPUESTAS

> Ecosistema Diego Orosa · 2026-05-14 · Claude Code v2.1.141
> Repos: `laboratoriolegalcontable-png/Diego-Orosa` + `laboratoriolegalcontable-png/stack-ia-creador`

---

## RESUMEN EJECUTIVO

| Dimensión | Diego-Orosa (Backend) | Stack-IA-Creador (Frontend PWA) |
|---|---|---|
| Errores críticos | 3 (ya corregidos 2) | 0 |
| Errores altos | 7 (ya corregidos 4) | 2 (ya corregidos 2) |
| Errores medios | 7 | 7 |
| Errores bajos | 5 | 11 |
| Deuda técnica principal | package.json desincronizado, CORS abierto, webhooks sin firma | CLAUDE.md incorrecto, CSP faltante, agenda.json sin precache |
| Estado del proyecto | Arquitectura sólida, base incompleta | PWA funcional, lista para producción básica |

**Correcciones aplicadas en esta sesión:**
- `src/api/middleware/auth.ts` — timingSafeEqual con validación de longitud + raw body para HMAC + API key timing-safe
- `src/app.ts` — helmet, CORS restrictivo, rate limiting, raw body capture, body limit 1mb, sin PII en logs
- `package.json` — sincronizado con dependencias reales + scripts build/dev/test/lint correctos
- `.claude/settings.json` — hook ESLint ahora aplica a `*.ts` además de `*.js`
- `public/sw.js` — CACHE_NAME v2, precache incluye `agenda.json` y `apple-touch-icon.png`
- `vercel.json` — CSP, HSTS, Permissions-Policy, COOP, Referrer-Policy estricta
- `public/app.js` — `safeUrl()` para hrefs, `Promise.allSettled`, `cache:"default"`, `noreferrer`
- `CLAUDE.md` stack-ia-creador — estructura real documentada

---

## PARTE 1: AUDITORÍA TRIPLE

### 1.1 SEGURIDAD — Diego-Orosa Backend

#### CORREGIDOS

**[CRIT-001] timingSafeEqual sin validación de longitud — `auth.ts:40,82`**
- Problema: `timingSafeEqual` lanza excepción si buffers tienen diferente longitud, causando 500 en lugar de 401. Además HMAC calculado sobre `JSON.stringify(req.body)` en lugar del raw body — firmas siempre divergen con Meta.
- Solución aplicada: función `verifyMetaSignature(rawBody, secret, signature)` con validación previa de longitud y try/catch. Raw body capturado en middleware antes del parser JSON. Prefijo `sha256=` validado.

**[CRIT-002b] API key comparada con `!==` — timing attack — `auth.ts:99`**
- Solución aplicada: `crypto.timingSafeEqual` con padding a 64 chars + validación de longitud explícita.

**[ALTO-001] CORS abierto a todos los orígenes — `app.ts:10`**
- Solución aplicada: `cors({ origin: allowedOrigins, credentials: true })` leyendo `ALLOWED_ORIGINS` de env.

**[ALTO-002] Falta helmet — `app.ts`**
- Solución aplicada: `app.use(helmet())` activo con defaults seguros.

**[ALTO-003] Falta express-rate-limit — `app.ts`**
- Solución aplicada: 300 req/min para webhooks, 60 req/min para endpoints admin.

**[ALTO-006] HMAC sobre JSON.stringify en lugar de raw body**
- Solución aplicada: middleware de captura de raw body antes del JSON parser. `auth.ts` usa `req.rawBody`.

#### PENDIENTES (requieren trabajo adicional)

**[CRIT-002a] `/webhook/whapi` sin verificación de firma — `routes.ts:48` + `whatsapp.service.ts:95`**
- `validateWebhook()` retorna `true` sin implementación. El endpoint acepta cualquier POST.
- Acción requerida: implementar verificación con header `X-Whapi-Token` o HMAC de Whapi y configurar `WHAPI_WEBHOOK_SECRET` en env.
- Impacto: ALTO — cualquiera puede inyectar mensajes falsos al CRM.

**[CRIT-003] package.json apunta a `server.js` inexistente**
- Corregido el package.json con dependencias reales y scripts correctos.
- Acción requerida: ejecutar `npm install` para instalar las deps recién declaradas. Verificar `tsconfig.json` existe y tiene `outDir: "dist"`.

**[ALTO-007] `validateWebhook`/`formatOutgoingMessage` — stubs en whatsapp.service.ts y instagram.service.ts**
- Métodos retornan `true` y `{ body: content }` sin implementación real.
- Acción requerida: implementar con la lógica real de los proveedores.

**[CRIT-002] Webhooks sin DLQ — `webhooks.ts:11,45,78`**
- Responden 200 antes de procesar. Errores de procesamiento se pierden.
- Acción requerida: implementar dead-letter queue con Bull para reintentos.

**[ALTO-005] Credenciales por defecto hardcodeadas — `database.ts:5`, `redis.ts:11`**
- `postgresql://bot_user:bot_pass@localhost:5432/whatsapp_bot` como fallback.
- Acción requerida: fail-fast si `DATABASE_URL` o `REDIS_URL` no están definidas en producción.

**[MEDIO-001] Sin validación de schemas en routes.ts**
- Acción requerida: agregar `zod` para validar body/params en todos los endpoints admin.

**[MEDIO-007] Mass-assignment en `customerService.update(id, req.body)` — `routes.ts:72`**
- Acción requerida: whitelist explícita de campos actualizables.

**[MEDIO-006] Worker + scheduler en mismo proceso que HTTP**
- Acción requerida: separar workers en proceso dedicado (segundo Dyno/container).

---

### 1.2 SEGURIDAD — Stack-IA-Creador Frontend

#### CORREGIDOS

**[ALTO-SEC-001] Sin Content-Security-Policy — `vercel.json`**
- Solución aplicada: CSP estricta + HSTS + Permissions-Policy + COOP + Referrer-Policy strict.

**[ALTO-SEC-002] XSS potencial vía esquema `javascript:` en href — `app.js:161-162`**
- Solución aplicada: función `safeUrl()` que valida esquema antes de inyectar en href.

**[ALTO-PERF-001] `agenda.json` no precacheada — `sw.js`**
- Solución aplicada: `agenda.json` y `apple-touch-icon.png` agregados al array PRECACHE. Versión bumped a v2.

**[MEDIO] `cache:"no-store"` antagoniza al Service Worker — `app.js:23`**
- Solución aplicada: cambiado a `cache:"default"`.

**[MEDIO] `Promise.all` cae si una falla — `app.js:32`**
- Solución aplicada: `Promise.allSettled` con manejo granular por recurso.

#### PENDIENTES

**[MEDIO] CLAUDE.md describe estructura inexistente (`src/`, `script.js`, Jest)**
- Corregido en CLAUDE.md con la estructura real.
- Acción requerida: actualizar también `pwa-patterns/SKILL.md` que tiene la misma discrepancia.

**[BAJO] ARIA tabs incompleto — `index.html`**
- `role="tablist"` presente pero sin `role="tab"`, `aria-selected`, `aria-controls` en botones.
- Acción requerida: agregar roles ARIA y manejo de teclado (←/→) en `app.js`.

**[BAJO] `dataset.bound` inútil — nodos recreados por `innerHTML`**
- Acción requerida: refactorizar `attachCopyHandlers` para usar delegación de eventos en el contenedor padre.

---

### 1.3 CALIDAD DE CÓDIGO — Diego-Orosa

| Problema | Archivo | Severidad | Estado |
|---|---|---|---|
| `package.json` apunta a `server.js` inexistente; sin build TS | `package.json` | CRÍTICO | Corregido |
| Stubs `validateWebhook`/`formatOutgoingMessage` | `whatsapp.service.ts`, `instagram.service.ts` | ALTO | Pendiente |
| `payload.entry[0]` sin verificar longitud | `webhooks.ts:14,48,81` | ALTO | Pendiente |
| Código duplicado whatsapp/whapi handlers | `webhooks.ts` | BAJO | Pendiente |
| Código duplicado verifyWhatsApp/verifyInstagram | `auth.ts` | BAJO | Mejorado (helper) |
| `parseInt` sin radix | `routes.ts:60,61,85,86,125,126` | BAJO | Pendiente |
| `as any` cast en helpers | `routes.ts:56-57` | BAJO | Pendiente |
| Sin `unhandledRejection`/`uncaughtException` en `index.ts` | `index.ts` | MEDIO | Pendiente |

---

### 1.4 RENDIMIENTO — Diego-Orosa

| Problema | Severidad | Acción |
|---|---|---|
| N+1 en scheduler — enqueue uno a uno en loop | MEDIO | Usar `queue.addBulk()` |
| Race condition `findOrCreateByWhatsApp` — sin UNIQUE/ON CONFLICT | MEDIO | Agregar constraint + `ON CONFLICT DO NOTHING` |
| `findCustomerByAnyChannel` — OR query sin índices | MEDIO | Índice compuesto por canal |
| Worker + scheduler + HTTP en mismo proceso | MEDIO | Separar en proceso dedicado |
| Pool max 20 para webhooks + workers concurrentes | BAJO | Calibrar según carga real |

---

### 1.5 RENDIMIENTO — Stack-IA-Creador

| Problema | Severidad | Estado |
|---|---|---|
| `agenda.json` no precacheada → Agenda vacía offline | ALTO | Corregido |
| `cache:"no-store"` → SW no puede servir cache | MEDIO | Corregido |
| `CACHE_NAME` versionado manual | MEDIO | Bumped a v2; automatizar en CI |
| Sin `Cache-Control` para JS/CSS estáticos | BAJO | Agregar en vercel.json |
| `app.js` sin minificar | BAJO | Agregar terser al build |

---

## PARTE 2: PRD — PRODUCT REQUIREMENTS DOCUMENT

### Visión del Producto

El ecosistema Estudio Oro es una **plataforma de automatización AI-first** para la agencia digital de Diego Orosa, abogado y corredor inmobiliario matriculado. El sistema reemplaza trabajo manual repetitivo en captación de leads, atención al cliente, seguimiento, generación de contenido y gestión administrativa.

### Los Dos Sistemas

```
┌─────────────────────────────────────────────────────────────┐
│  DIEGO-OROSA REPO (Backend)                                 │
│  Express + TypeScript + PostgreSQL + Redis + Bull           │
│  ─────────────────────────────────────────────────────────  │
│  • WhatsApp CRM (Whapi + Meta Cloud API)                    │
│  • Instagram DM automation                                  │
│  • Follow-up engine con templates y scheduling              │
│  • Customer unification (profileLinker)                     │
│  • 100+ Claude skills (generación de contenido, legal, ads) │
│  • MCP: Make.com, GitHub, Supabase, Meta Ads                │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API  /api/v1/
┌────────────────────────────▼────────────────────────────────┐
│  STACK-IA-CREADOR REPO (Frontend PWA)                       │
│  Vanilla JS + Service Worker + Vercel                       │
│  ─────────────────────────────────────────────────────────  │
│  • Dashboard de prompts IA (Claude, Midjourney, etc.)       │
│  • Catálogo de herramientas/programas con links             │
│  • Agenda de publicación semanal                            │
│  • Funciona offline (PWA installable)                       │
└─────────────────────────────────────────────────────────────┘
```

### Usuarios

| Perfil | Uso principal | Frecuencia |
|---|---|---|
| Diego (owner) | Control total, estrategia, contenido legal | Diaria |
| Agentes del equipo | CRM, respuestas WhatsApp, seguimientos | Diaria |
| Clientes (futuro) | Portal de estado de causa / cotización | Semanal |

### Funcionalidades por Módulo

#### Módulo 1: CRM Multi-Canal (Backend — parcialmente implementado)
- **Implementado**: findOrCreate por WhatsApp/Instagram, registro de interacciones, profileLinker
- **Faltante**: deduplicación por `channelMessageId`, portal de cliente, búsqueda full-text
- **KPI**: 0 duplicados de cliente; tiempo de respuesta < 5min en horas hábiles

#### Módulo 2: Follow-Up Engine (Backend — implementado)
- **Implementado**: queue Bull, scheduler cron, templates con variables
- **Faltante**: dead-letter queue, UI de gestión de follow-ups, A/B de mensajes
- **KPI**: tasa de apertura > 60% en WhatsApp

#### Módulo 3: Webhooks de Mensajería (Backend — parcialmente implementado)
- **Implementado**: handlers WhatsApp (Meta) e Instagram, auto-respuesta
- **Faltante**: verificación de firma Whapi, DLQ para mensajes fallidos, deduplicación
- **KPI**: 0 mensajes perdidos; latencia < 2s

#### Módulo 4: Dashboard IA (Frontend PWA — implementado y funcional)
- **Implementado**: tabs Skills/Prompts/Programas/Agenda, filtros, copy, offline
- **Faltante**: autenticación, sync con backend, shortcuts en manifest, ARIA tabs
- **KPI**: LCP < 2.5s, instalable en Android/iOS

#### Módulo 5: Scrapling — Fábrica de Leads (Skills — activo)
- **Implementado**: skill con 13 opciones, integración Whapi para notificar
- **Faltante**: interfaz en el dashboard PWA para disparar desde móvil
- **KPI**: 500 leads/semana por vertical (legal, inmobiliaria, tech)

#### Módulo 6: Contenido Automatizado (Skills — activo)
- **Implementado**: Higgsfield MCP, copywriter, content-machine, viral-radar
- **Faltante**: calendario de publicación integrado con Instagram Graph API
- **KPI**: 21 posts/semana con < 2h de trabajo humano

### Métricas de Éxito del Ecosistema

| Métrica | Baseline hoy | Target 90 días |
|---|---|---|
| Leads capturados/semana | manual | 500+ automatizados |
| Tiempo de respuesta WhatsApp | >4h | <5min |
| Posts publicados/semana | 3-5 manual | 21 automatizados |
| Causas judiciales gestionadas | Excel | CRM con alertas |
| Operaciones inmobiliarias | Email | Pipeline digital |

---

## PARTE 3: SOLUCIONES DETALLADAS (código)

### FIX-01 — Whapi webhook signature verification

```typescript
// src/api/middleware/auth.ts — agregar función
export function verifyWhapiWebhook(req: Request, _res: Response, next: NextFunction): void {
  const secret = process.env.WHAPI_WEBHOOK_SECRET;
  if (!secret) { next(); return; } // Si no está configurado, pasa (desarrollo)

  const signature = req.headers['x-whapi-token'] as string;
  if (!signature) {
    next(new AuthenticationError('Missing Whapi webhook token'));
    return;
  }

  const expected = crypto.createHmac('sha256', secret)
    .update((req as any).rawBody || Buffer.alloc(0))
    .digest('hex');

  const sigBuf = Buffer.from(signature.padEnd(64));
  const expBuf = Buffer.from(expected.padEnd(64));
  try {
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
      next(new AuthenticationError('Invalid Whapi signature'));
      return;
    }
  } catch {
    next(new AuthenticationError('Invalid Whapi signature'));
    return;
  }
  next();
}
```

```typescript
// src/api/routes.ts — agregar middleware en ruta whapi
import { verifyWhapiWebhook } from './middleware/auth';
router.post('/webhook/whapi', verifyWhapiWebhook, handleWhapiWebhook);
```

### FIX-02 — Fail-fast para variables críticas

```typescript
// src/config/database.ts — reemplazar fallback
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
}
const connectionString = DATABASE_URL || 'postgresql://bot_user:bot_pass@localhost:5432/whatsapp_bot';
```

### FIX-03 — Deduplicación de clientes (race condition)

```sql
-- src/database/migrations/005_customer_unique_channels.sql
ALTER TABLE customers ADD CONSTRAINT uq_whatsapp_id UNIQUE (whatsapp_id);
ALTER TABLE customers ADD CONSTRAINT uq_instagram_id UNIQUE (instagram_id);
```

```typescript
// customer.service.ts — ON CONFLICT DO UPDATE
const result = await db.query(`
  INSERT INTO customers (whatsapp_id, name, created_at)
  VALUES ($1, $2, NOW())
  ON CONFLICT (whatsapp_id) DO UPDATE
    SET name = COALESCE(EXCLUDED.name, customers.name),
        last_contact_at = NOW()
  RETURNING *
`, [whatsappId, name]);
```

### FIX-04 — Scheduler con addBulk

```typescript
// scheduler.ts — reemplazar loop secuencial
const pendingFollowUps = await followUpService.getPending();
if (pendingFollowUps.length === 0) return;

const jobs = pendingFollowUps.map(f => ({
  name: 'followup',
  data: { followUpId: f.id, customerId: f.customerId, channel: f.channel },
  opts: { attempts: 3, backoff: { type: 'exponential', delay: 60000 } }
}));
await queueService.queue.addBulk(jobs);
```

### FIX-05 — ARIA tabs en Stack-IA-Creador

```javascript
// app.js — reemplazar renderTabs con ARIA completo
function renderTabs(activeTab) {
  const tablist = document.getElementById("tabs");
  tablist.setAttribute("role", "tablist");
  tablist.innerHTML = TABS.map((t) => `
    <button
      role="tab"
      id="tab-${t}"
      aria-selected="${t === activeTab}"
      aria-controls="panel-${t}"
      class="tab-btn ${t === activeTab ? "active" : ""}"
      data-tab="${t}"
    >${escapeHtml(t.charAt(0).toUpperCase() + t.slice(1))}</button>
  `).join("");
  // Manejo de teclado ←/→
  tablist.addEventListener("keydown", (e) => {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const idx = tabs.indexOf(document.activeElement);
    if (e.key === "ArrowRight") tabs[(idx + 1) % tabs.length].focus();
    if (e.key === "ArrowLeft") tabs[(idx - 1 + tabs.length) % tabs.length].focus();
  });
}
```

### FIX-06 — unhandledRejection en index.ts

```typescript
// src/index.ts — agregar al inicio
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});
```

---

## PARTE 4: PLAN DE IMPLEMENTACION PRIORIZADO

### Sprint 1 — Seguridad crítica (1-2 días) ✅ Iniciado

| Tarea | Archivo | Estado |
|---|---|---|
| Fix timingSafeEqual + raw body HMAC | `auth.ts` | ✅ Hecho |
| Helmet + CORS restrictivo + rate limit | `app.ts` | ✅ Hecho |
| API key timing-safe | `auth.ts` | ✅ Hecho |
| package.json con deps reales | `package.json` | ✅ Hecho |
| ESLint hook aplica a `*.ts` | `.claude/settings.json` | ✅ Hecho |
| CSP + HSTS + Permissions-Policy | `vercel.json` | ✅ Hecho |
| SW precache agenda.json | `sw.js` | ✅ Hecho |
| safeUrl + Promise.allSettled | `app.js` | ✅ Hecho |
| Whapi webhook signature | `routes.ts`, `auth.ts` | ⏳ Pendiente |
| Fail-fast vars críticas en producción | `database.ts`, `redis.ts` | ⏳ Pendiente |

### Sprint 2 — Estabilidad y datos (3-5 días)

| Prioridad | Tarea | Impacto |
|---|---|---|
| P1 | `npm install` con las deps correctas y verificar build TS | El backend no arranca |
| P1 | Migración 005 — UNIQUE constraints clientes | Elimina duplicados |
| P1 | DLQ para webhooks fallidos | Cero mensajes perdidos |
| P2 | Zod schemas en todos los endpoints admin | Seguridad de tipos |
| P2 | `payload.entry[0]` — verificar longitud antes de acceder | Crash prevention |
| P2 | addBulk en scheduler | Performance N+1 |
| P3 | unhandledRejection/uncaughtException | Estabilidad proceso |
| P3 | Whitelist campos en customerService.update | Mass-assignment |

### Sprint 3 — PWA + Dashboard (5-10 días)

| Prioridad | Tarea | Impacto |
|---|---|---|
| P1 | Autenticación en PWA (JWT cookie HttpOnly cuando esté el backend) | Seguridad |
| P1 | ARIA tabs + manejo de teclado en `app.js` | Accesibilidad WCAG |
| P2 | Cache-Control para JS/CSS en vercel.json | Performance |
| P2 | Minificación de app.js con terser | Performance móvil |
| P2 | `shortcuts[]` y `screenshots[]` en manifest.json | PWA install UX |
| P3 | Delegación de eventos en lugar de `dataset.bound` | Calidad de código |
| P3 | Mover estilos inline a clases CSS | Mantenibilidad |

### Sprint 4 — Funcionalidades nuevas (10-30 días)

Ver PARTE 5 — Propuestas Nuevas.

---

## PARTE 5: PROPUESTAS NUEVAS

### PROPUESTA-01 — Portal de seguimiento de causas judiciales (para clientes)

**Qué**: Una vista adicional en Stack-IA-Creador donde los clientes puedan ver el estado de su causa (número de expediente, última novedad, próxima audiencia, documentos pendientes) sin tener que llamar.
**Por qué**: Reduce llamadas de seguimiento en ~70%. Diferenciador vs. estudios tradicionales.
**Cómo**: Tab "Mi Causa" en la PWA → GET /api/v1/causes/:token (token único por cliente, sin login) → datos desde Supabase.
**Esfuerzo**: 3-5 días.

### PROPUESTA-02 — Lead scoring automático en WhatsApp

**Qué**: Clasificar automáticamente cada lead nuevo (WhatsApp/Instagram) según su intención: ALTA (menciona urgencia, presupuesto, fecha), MEDIA (consulta general), BAJA (solo info).
**Por qué**: El equipo responde primero a los leads ALTA y no pierde oportunidades calientes.
**Cómo**: Añadir llamada a Claude API en `webhooks.ts` después de crear el cliente — prompt de clasificación con el primer mensaje → guardar `lead_score` en `customers` table.
**Esfuerzo**: 1-2 días.

```typescript
// Ejemplo de integración en handleWhapiWebhook
const score = await claudeClassifyLead(message.content);
await customerService.updateScore(customer.id, score);
```

### PROPUESTA-03 — Calendario editorial integrado en PWA

**Qué**: Tab "Publicar hoy" en la PWA que muestra qué publicar según el día (ya existe `agenda.json`), con botón "Generar con IA" que llama al backend → Claude genera el copy → aparece listo para copiar/publicar.
**Por qué**: Elimina el paso de abrir Claude Code para generar contenido; flujo desde el celular.
**Cómo**: Endpoint `POST /api/v1/content/generate` con parámetros `{tipo, pilar, plataforma}` → Claude API → respuesta al frontend.
**Esfuerzo**: 2-3 días.

### PROPUESTA-04 — Notificaciones Push en PWA

**Qué**: Cuando llega un lead ALTA calificación en WhatsApp, la PWA (instalada en el celular) dispara una notificación push nativa.
**Por qué**: Diego se entera en 30 segundos en lugar de revisar el teléfono.
**Cómo**: Web Push API + VAPID keys en Vercel → el backend llama `webpush.sendNotification()` cuando `lead_score === 'ALTA'`.
**Esfuerzo**: 2-3 días.

### PROPUESTA-05 — tsconfig.json + CI pipeline

**Qué**: Agregar `tsconfig.json` para compilar TS a `dist/`, un script `npm run build` que compile, y un GitHub Actions workflow que corra `npm run lint && npm run test && npm run build` en cada PR.
**Por qué**: Actualmente el backend TypeScript no se puede compilar ni arrancar con la config actual.
**Esfuerzo**: 1 día.

```json
// tsconfig.json sugerido
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### PROPUESTA-06 — Skill `orosa-audit` en Claude Code

**Qué**: Un skill específico que corre automáticamente cuando Diego pide "revisar" o "auditar" y ejecuta: lint → tests → security scan → reporte compacto.
**Por qué**: Reduce la fricción de correr manualmente 4 comandos.
**Cómo**: `.claude/skills/orosa-audit/SKILL.md` con secuencia: `npm run lint`, `npm test`, revisa deps con `npm audit`, verifica `.env.example` tiene todas las vars.
**Esfuerzo**: 2 horas.

### PROPUESTA-07 — Separar workers en proceso dedicado

**Qué**: Extraer el worker Bull y el scheduler cron a `src/worker-process.ts` y correr como proceso separado (segundo container en Docker Compose o segundo Dyno en Heroku/Railway).
**Por qué**: El event loop del servidor HTTP no se bloquea bajo carga de follow-ups. Escalado independiente.
**Cómo**:
```typescript
// src/worker-process.ts
import './shared/logger';
import { bootstrapWorker } from './followup/worker';
import { bootstrapScheduler } from './followup/scheduler';
bootstrapWorker();
bootstrapScheduler();
```
```yaml
# docker-compose.yml — agregar servicio
worker:
  build: .
  command: node dist/worker-process.js
  env_file: .env
  depends_on: [postgres, redis]
```
**Esfuerzo**: 1 día.

---

## APENDICE: ESTADO DE ARCHIVOS MODIFICADOS EN ESTA SESION

| Archivo | Cambio | Impacto |
|---|---|---|
| `Diego-Orosa/src/api/middleware/auth.ts` | timingSafeEqual seguro, raw body HMAC, API key timing-safe | Seguridad CRÍTICA |
| `Diego-Orosa/src/app.ts` | helmet, CORS, rate limit, raw body middleware, menos PII en logs | Seguridad ALTA |
| `Diego-Orosa/package.json` | deps reales (pg, redis, bull, etc.), scripts correctos, engines | Funcionalidad CRÍTICA |
| `Diego-Orosa/.claude/settings.json` | ESLint hook para `*.ts` además de `*.js` | DX |
| `stack-ia-creador/public/sw.js` | CACHE_NAME v2, agenda.json y apple-touch-icon.png en precache | Offline ALTO |
| `stack-ia-creador/vercel.json` | CSP, HSTS, Permissions-Policy, COOP, Referrer-Policy | Seguridad ALTA |
| `stack-ia-creador/public/app.js` | safeUrl(), Promise.allSettled, cache:default, noreferrer | Seguridad MEDIO |
| `stack-ia-creador/CLAUDE.md` | Estructura real del proyecto documentada | DX |

---

*Auditoría generada el 2026-05-14 | Claude Code v2.1.141 | Ecosistema Diego Orosa*
*Branch: `claude/setup-cli-docs-SfVmS` → PRs #202 (Diego-Orosa) y #7 (stack-ia-creador)*
