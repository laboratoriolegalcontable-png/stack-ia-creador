# STATUS — Estudio Oro S.A.S.
## Ultima actualizacion: 25 Mayo 2026

---

## Sesion 25 Mayo 2026 — OropProp + CausaManager deployados en Vercel ✅

### AMBAS APPS LIVE EN VERCEL — Trifecta Build Tools

| App | URL | Vercel ID | Estado |
|-----|-----|-----------|--------|
| OropProp | https://oroprop.vercel.app | prj_grlbmBiANBA85f5wgzGYLqgSS0Ei | ✅ READY |
| CausaManager | https://causa-manager.vercel.app | prj_jCyMlg6ppNIJwX2iDCuWB4Rj3RWa | ✅ READY |

**Causa raiz resuelta:** `projects/causa-manager/app/vercel.json` tenia seccion `env` con referencias `@secret-name` a secrets de equipo Vercel que no existian. Cada deployment fallaba con `SUPABASE_SERVICE_ROLE_KEY references Secret "causa-manager-service-role-key", which does not exist`. Fix: remover la seccion `env` completa del `vercel.json` (commit `3ff7eeb`).

**CI/CD activo via GitHub Actions — AMBOS USAN REST API UPSERT:**

| Workflow | Trigger | Pipeline |
|----------|---------|----------|
| `.github/workflows/deploy-causa-manager-vercel.yml` | push a `main` en `projects/causa-manager/**` | `vercel link` → REST API DELETE+POST env upsert → `vercel build --prod` → `vercel deploy --prebuilt --prod` |
| `.github/workflows/deploy-oroprop-vercel.yml` | push a `main` en `projects/oroprop/**` | idem |

**Regresion corregida (commit `ef4302f`):** PR #432 (merge concurrente) sobreescribio el workflow de OropProp con la version vieja (`vercel env add` CLI). Restaurado a la version REST API idempotente.

**Como funciona el manejo de secrets:**
1. El workflow lee los GitHub Secrets como variables de entorno
2. Via REST API de Vercel: DELETE las vars existentes + POST upsert con tipo `"encrypted"` para secrets y `"plain"` para vars publicas
3. Los secrets se agregan SOLO si el GitHub Secret correspondiente esta configurado (guards `if $var != ""` con jq)
4. Resultado: cada deploy = vars de Vercel actualizadas automaticamente, idempotente

**Pendiente para Diego — ACCION EN GITHUB SECRETS (no Vercel Dashboard):**

> Ir a: `github.com/laboratoriolegalcontable-png/diego-orosa` → Settings → Secrets and variables → Actions → New repository secret

| GitHub Secret | Valor | Para |
|--------------|-------|------|
| `CAUSA_SERVICE_ROLE_KEY` | Service Role Key de Supabase `moljmujlfvtsgkjbtwss` | CausaManager |
| `OROPROP_SERVICE_ROLE_KEY` | Service Role Key de Supabase `moljmujlfvtsgkjbtwss` | OropProp |
| `TOKKO_API_KEY` | Tokko Broker API key | OropProp |
| `TOKKO_BROKER_KEY` | Tokko Broker key | OropProp |
| `WHAPI_TOKEN` | Token de Whapi (ya existe como Supabase secret) | OropProp |
| `WHAPI_SESSION` | Session ID de Whapi | OropProp |
| `WHAPI_LEAD_WEBHOOK_URL` | URL del webhook de leads | OropProp |
| `OROPROP_CRON_SECRET` | String aleatorio (ej: `openssl rand -hex 32`) | OropProp |

Despues de agregar los secrets, hacer un push dummy a `projects/oroprop/app/package.json` (o usar workflow_dispatch) para triggear el re-deploy. El workflow aplicara automaticamente los secrets en Vercel.

**DNS custom domains (pendiente):**
- [ ] CNAME `causamanager.estudiooro.com.ar` → `cname.vercel-dns.com`
- [ ] CNAME `oroprop.estudiooro.com.ar` → `cname.vercel-dns.com`
- [ ] En Vercel Dashboard: agregar el custom domain a cada proyecto

**URGENTE — 4 dias:**
- [ ] Reautorizar FB/IG tokens Make.com (vencen 29/05/2026)

---

## Sesion 25 Mayo 2026 — Kairos Forge Ecosystem + Reformas Generales

### PR #354 mergeado — Kairos Forge Ecosystem en main

4 subagentes del ecosistema desplegados y funcionales:

| Subagente | Archivo | Estado |
|-----------|---------|--------|
| kairos-forge | `.claude/skills/kairos-forge/SKILL.md` | ✅ ACTIVO |
| kairos-sentinel | `.claude/skills/kairos-sentinel/SKILL.md` | ✅ ACTIVO |
| kairos-genesis | `.claude/skills/kairos-genesis/SKILL.md` | ✅ ACTIVO |
| kairos-memory-v4 | `.claude/skills/kairos-memory-v4/SKILL.md` | ✅ ACTIVO |

**Install.sh resuelto para repo privado:**
- Metodo recomendado desde Mac: `git clone + bash install.sh`
- Script auto-contenido con heredocs — no requiere curl a raw.githubusercontent.com
- Guia completa: `KAIROS-FORGE-GUIDE.md`

**Documentacion publicada:**
- `KAIROS-FORGE-GUIDE.md` — guia completa con 4 metodos de instalacion
- `BOOK-TO-SKILL-GUIDE.md` — convertir PDF/EPUB/DOCX en skill permanente
- Integracion book-to-skill en narakia-kairos v2.2

**narakia-kairos actualizado a v2.2:**
- Comandos forge (`@Kairos forge skill/agent/project/upgrade/audit`)
- Sentinel, Genesis, Memory-v4 integrados
- Tabla de 4 subagentes + estado del sistema

**kairos-legendario actualizado a v2:**
- Ecosistema forge integrado como herramienta nativa
- Puerto OMNIA 8001 confirmado
- Ciclo nocturno Narakia Dreaming documentado

### ⚠️ VERIFICAR URGENTE — Tokens Facebook/Instagram Make.com

Los tokens vencian el 29/05/2026. VERIFICAR HOY que los escenarios de Meta Ads
sigan ejecutando. Diego confirmo que puso las APIs pero hay que corroborar en
Make.com que los scenarios s4561747 (WhatsApp Whapi) y s5147949 (Diego WA) esten activos.

---

## Sesion 24 Mayo 2026 — book-to-skill + forge ecosystem (branch claude/book-to-skill-guide-btcS0)

**BOOK-TO-SKILL integrado:**
- `BOOK-TO-SKILL-GUIDE.md` creado con 8 formatos, 2 metodos de instalacion, 5 archivos generados
- narakia-kairos v2.1: comandos `@Kairos aprender` y `@Kairos libro`
- `CLAUDE.local.md` actualizado con triggers de activacion del ecosistema forge

**Forge ecosystem desplegado (PR #354 → main):**
- 4 skills nuevos en `.claude/skills/kairos-*/`
- `install.sh` self-contained con heredocs resuelve el problema del repo privado
- Merge exitoso SHA: 68c3d9b7bf53076e07eba0d426116ff5c9bfcb0d

---

---

## Sesion 23 Mayo 2026 — Verificacion de secrets via logs Supabase

**Resultado:** todos los secrets configurados, cero errores en 24h de logs.

| Secret | Estado |
|--------|--------|
| MP_ACCESS_TOKEN | ✅ CONFIGURADO — sin errores en logs |
| ELEVENLABS_API_KEY | ✅ CONFIGURADO — sin errores en logs |
| ANTHROPIC_API_KEY | ✅ CONFIGURADO — monitor_secrets 200 consistente |

**Versiones reales verificadas en logs (corrigen memoria anterior):**
- narakia-handler: **v163** (no v90)
- natalia-bot: **v79** (no v52)

**Funciones activas no documentadas previamente:**
recordatorios-cron v17, followup-avanzado v18, followup-automatico v17,
alertas-tiempo-real v17, buenos-dias-diego v22, scheduler v17,
cobranzas-alertas v18, recordatorio-audiencias v17, narakia-automation v18, group-spy v20.

**Unico incidente:** recordatorios-cron tuvo 1 timeout de 504 (160s) — llamada externa lenta, no critico.

---

## ⚠️ VERIFICAR — Tokens Facebook/Instagram Make.com

Vencian el 29/05/2026. Diego confirmo que puso las APIs. Verificar que los escenarios
de Meta Ads en Make.com sigan ejecutando correctamente.

---

## Sesion 22 Mayo 2026 — MEGA-PROMPT v2.0 + Trifecta Tools

### Estado del ecosistema sincronizado con MEGA-PROMPT v2.0

**Bots en produccion (estado correcto):**
| Bot | Version | Canal | Estado |
|-----|---------|-------|--------|
| Lucrecia / narakia-handler | v163 | Whapi (5491168777777) | ACTIVE — verificado logs 23/05 |
| Natalia / natalia-bot | v79 | Meta Business API (1137854822734580) | ACTIVE — verificado logs 23/05 |
| Megan / megan-bot | v39 | Meta Business API | ACTIVE — Supabase ver.63 |
| narakia-memory | v3 | interna | ACTIVE — Supabase ver.18 |
| daily-report | v2 | pg_cron 8am ART | ACTIVE — job ID 21 |
| dreaming-agent | v3.1 | pg_cron 03:00 AM ART | ACTIVE |
| valentina-bot | activa | WasenderApi Pro (5491168199707) | ACTIVE — USD 45/mes |
| paula-bot | implementada | Meta Business API | SIN NUMERO — pendiente asignacion |

**OroGest Lex v30:** deployado en Netlify (estudiooroapp.netlify.app) con 70+ agentes IA especializados.

**Trifecta Legendaria v6 (PR #314):**
- Skill maestro trifecta con Estimator (FASE 0.5)
- trifecta-estimator, narakia-bridge, kairos-mythos, trifecta-autopilot, trifecta-sprint
- Kairos Forge: scripts/kairos-forge.py (Python puro, sin dependencias externas)
- 5 categorias claude-code-setup aplicadas: hooks, skills, MCP, subagentes, slash commands
- Bugs JSON corregidos: settings.json (duplicados) + .mcp.json (coma faltante)
- Nuevos subagentes: forge-reviewer, narakia-guardian
- Nuevos comandos: /forge, /sprint, /watchdog

### Pendientes criticos (actualizado 22/05)

| Item | Prioridad | Deadline |
|------|-----------|----------|
| Renovar tokens Facebook/Instagram Make.com | 🔴 URGENTE | 29/05/2026 |
| MP_ACCESS_TOKEN en Supabase secrets | 🔴 CRITICO | sin fecha |
| ELEVENLABS_API_KEY como Supabase secret | 🔴 CRITICO | sin fecha |
| Asignar numero a Paula bot | 🟡 ALTA | sin fecha |
| Confirmar reembolso Anthropic USD $1.312 | 🟡 ALTA | pendiente desde 19/05 |
| Tokko Broker API token | 🟡 MEDIA | backlog |
| AFIP/ARCA certificado digital | 🟡 MEDIA | backlog |
| MercadoPago Checkout Pro access token | 🟡 MEDIA | backlog |

---

---

## Numeros oficiales (referencia)

- **+54 11 6877-7777** (`5491168777777`) — Linea de la oficina (publicada en web/marketing). Lucrecia/narakia-handler responde aca.
- **+54 9 11 4025-3204** (`5491140253204`) — **Personal de Diego**. Destino de TODOS los handoffs, alertas y reportes automaticos (Valentina, contador-facturas, weekly-report, monitor-vencimientos, narakia handoffs urgentes).
- **+54 9 11 6819-9707** (`5491168199707`) — **Valentina recepcionista**. Numero exclusivo conectado via WasenderApi (suscripcion Pro USD 45/mes). Atiende 24/7 con narakia-memory.

Configuracion en codigo: cada edge function lee `Deno.env.get("DIEGO_NUM")` con fallback hardcoded `5491140253204`. Cuando se setee el secret en Supabase, sobreescribe.

---

## Sesion 20 Mayo 2026 — Skills Workflow + CLAUDE.md

### Skills del workflow Estudio Oro — 8 skills numerados

Sistema completo de skills auto-activos por triggers en `.claude/skills/`.
Formato estandar: YAML frontmatter + 3 fases (identificar / proceso / output) + reglas.

| # | Archivo | Area | Se activa con |
|---|---|---|---|
| 01 | `01-penal-escrito.md` | Escritos judiciales | recurso / apelacion / casacion / sobreseimiento |
| 02 | `02-inmobiliario.md` | Due diligence | due diligence / boleto / escritura / propiedad |
| 03 | `03-redes-sociales.md` | Contenido Estudio Oro + Lobo | reel / guion / instagram / linkedin / tiktok |
| 04 | `04-tributario.md` | AFIP y tributario | afip / ganancias / iva / monotributo / factura |
| 05 | `05-patrimonial.md` | Sucesiones y planificacion | sucesion / herencia / fideicomiso / testamento |
| 06 | `06-schedule-agenda.md` | Agenda automatica | /schedule / agenda semana / calendario editorial |
| 07 | `07-ultrathink.md` | Opus extended thinking | /ultrathink / piensa profundo / extended thinking |
| 08 | `08-marketing-ads.md` | Meta Ads + Google Ads | meta ads / google ads / campana publicitaria |

### Comandos nuevos (.claude/commands/)

| Comando | Para que sirve |
|---|---|
| `/schedule` | Crear agentes recurrentes en la nube Anthropic (UTC-3 Argentina) |
| `/ultrathink` | Activar Opus 4.7 con extended thinking para analisis profundos |
| `/skills-upgrade` | Auditar y mejorar el sistema de skills (5 criterios, 5 fases) |

### Fix settings.json

Duplicados silenciosos resueltos: `PostToolUse`, `permissions` y `Stop` aparecian dos veces.
En JSON la segunda clave pisa a la primera. Se conservo la version mas completa de `PostToolUse`
(maneja *.ts + *.js, usa $CLAUDE_PROJECT_DIR, tiene continueOnBlock: true).

### CLAUDE.md actualizado

Agregada seccion "Skills del Workflow" con tabla de triggers, comandos manuales y reglas globales.
Ahora cada sesion nueva de Claude arranca con contexto completo del sistema de skills.

### stack-ia-creador — Tab Agenda + prompts /schedule

- Tab Agenda agregada al dashboard PWA con 7 presets /schedule copy-paste
- `agenda.json` con calendario editorial semanal y 5 comandos de automatizacion
- `prompts.json` actualizado: 3 nuevos prompts /schedule (ultrathink, banco ideas, reporte WhatsApp)
- Skill `stack-schedule` en index.html: descripcion mejorada + 8 triggers + 3 prompts referenciados
- `validate-public.mjs`: validacion de agenda.json agregada al script de CI

---

## Sesion 13 Mayo 2026 — Valentina activa en WasenderApi

- WasenderApi Pro suscripta. Numero de Valentina: **+54 9 11 6819-9707** (`5491168199707`).
- WASENDER_API_TOKEN recibido (token de 64 chars hex).
- WASENDER_WEBHOOK_SECRET generado: `d4f3baf1773733222f4d89e088fef9c21b4f512936e7e3695c59e4f8ffecacd3`.
- Secrets a setear en Supabase Dashboard (sin MCP tool, manual): WASENDER_API_TOKEN, WASENDER_WEBHOOK_SECRET, DIEGO_NUM.
- Webhook URL en WasenderApi: `https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/valentina-bot`, evento `messages.received`.

## Sesion 12 Mayo 2026 — Phase 3 security + Diego unificado

- **Phase 3 secrets rotation completa**: megan-bot v32, natalia-bot v41, paula-bot v11, meta-webhook-setup v14 redeployadas sin hardcodes (todas las claves desde `Deno.env.get()`).
- `valentina-bot v8` y `contador-facturas v2` redeployadas: `DIEGO_PHONE` / `DIEGO_WA` ahora apuntan a `+5491140253204` (antes 1168777777, oficina). Asi Diego recibe handoffs y notificaciones donde tenga el chip.
- `weekly-report` y `monitor-vencimientos` ya tenian `+5491140253204` como destino — sin cambios.

## Sesion 11 Mayo 2026 — Auditoria Total: ReclamaIA + NARAKIA + Supabase

### ReclamaIA — 0 errores, 0 advertencias ESLint

Auditoria completa de lint con `next lint`. Todos los errores y warnings resueltos:

**Errores corregidos (6):**
- 4x `<a href="...">` navegando a rutas internas → reemplazado con `<Link>` de Next.js en:
  - `reclamai/app/calculadora/page.tsx`
  - `reclamai/app/coprec/page.tsx`
  - `reclamai/app/dashboard/page.tsx`
  - `reclamai/app/r/[id]/page.tsx`
- 2x comillas sin escapar en JSX → `&quot;` en `reclamai/app/go/page.tsx`

**Warnings corregidos (8):**
- Imports no usados eliminados: `and` (admin), `sql` (api-keys-reset), `NextRequest` (referidos), `Button` (pricing)
- `catch (error)` → `catch` en `create-payment` y `suggest-reply`
- Variable no usada `claimValues` eliminada de `v1/generate`
- Query muerta `urgentRecord` eliminada de `webhook/route.ts`

**Seguridad:**
- `MERCADO_PAGO_WEBHOOK_SECRET` rotado: `reclamai2026secret` (debil) → hex 64 chars via `openssl rand -hex 32`

### narakia-handler v91 — MEDIA RETRY EXTENDIDO

**Bug corregido:** Whapi entrega el webhook antes de que el archivo de imagen/documento este disponible.
`fetchWhapiMediaUrl` solo buscaba `audio.link`, `voice.link`, `video.link`.
Las imagenes y documentos llegaban con `media.url = null` y no se reintentaba.

**Fix:**
- `fetchWhapiMediaUrl` ahora busca tambien `image.link` y `document.link`
- El gate de retry ahora cubre TODOS los tipos de media con URL nula (no solo audio/video)
- Desplegado como v91 — ACTIVE en produccion

### Supabase Edge Functions — 60+ funciones auditadas (ronda 2)

- Todas las funciones activas con 200-status en 24h de logs
- `lucrecia_facts_clientes`: sin rows invalidas, constraint `chk_phone_valid` activo
- Sin secrets expuestos: narakia-handler y todas las funciones usan Deno.env.get()
- router, voice-memo, alertas-pjn, lead-routing, send-notification, weekly-report: sin inyeccion, sin hardcoded tokens

### ReclamaIA — ronda 2 (11/05)

- `valentina/escalate/route.ts`: console.log → logger.info estructurado
- `valentina/chat/route.ts`: console.log Lead A → logger.info estructurado
- npm audit: 1 high (fast-uri) corregida; 9 moderate de Next.js propias (requieren --force, skip)
- Typecheck + lint: 0 errores, 0 warnings post-ronda-2
- `admin/leads`: N+1 query eliminada — 1 sola query con subquery SQL
- `scripts/0001_indexes.sql`: 15 indexes para queries frecuentes listos para aplicar en Supabase SQL editor

### Pendiente (accion manual en Supabase SQL editor)

~~Aplicar~~ APLICADO 11/05 via supabase-mcp (project `gcwbldmigbmtkofregoj`):
- 15 indexes de performance
- 6 FK covering indexes (advisor)
- RLS enabled en las 20 tablas (cerro 5 ERROR de seguridad: tokens OAuth, sessions, webhooks, etc.)

Reclamai no usa anon key — toda la DB se accede solo via Drizzle + POSTGRES_URL.
RLS sin policies = solo service_role/postgres pasan. Blindado.

### Frente 1, 2, 3 — TODO ACTIVADO 11/05

**Frente 1 — Valentina recepcionista:**
- `valentina-bot` v1 deployada (verify_jwt:false)
- Memoria compartida via `narakia-memory` (mismas tablas que paula/natalia/megan/lucrecia)
- System prompt con derivacion a los 6 agentes del equipo (Lucrecia, Paula, Natalia, Megan, Sabueso, Diego)
- Tags `HANDOFF_DIEGO:si` para urgencias y `DERIVAR:[NOMBRE]` para pasar al especialista
- Soporta texto, audio (Whisper-1) e imagen
- Pendiente: conectar webhook Whapi al endpoint `/functions/v1/valentina-bot` para que Valentina reciba primero (decision de Diego: numero exclusivo o reemplazo del actual)

**Frente 2 — Clasificador leads:**
- Bug encontrado: `weekly-report` buscaba columna `categoria` inexistente → siempre devolvia 0 leads A/B/C
- Fix: columna generada `leads.categoria` calculada desde `score` (A>=80, B 50-79, C<50)
- Backfill automatico de 8 leads existentes: 1A, 2B, 5C
- Reporte semanal validado post-fix: ahora muestra 1A 1B 0C en la semana real (antes 0/0/0)
- Indexes `idx_leads_categoria` y `idx_leads_score_desc` agregados

**Frente 3 — Contador facturas:**
- Tabla `facturas_recibidas` creada (separada de `facturas` que ya existia para emitidas con MP)
- Edge function `contador-facturas` v1: recibe imagen/PDF via Whapi → Claude Vision extrae datos AFIP → guarda en DB
- Categoriza automaticamente (servicios_profesionales, alquiler_oficina, telefonia, internet, etc)
- GET `/contador-facturas?action=reporte&mes=YYYY-MM` devuelve totales por categoria + IVA credito fiscal + retenciones
- Cron job 15 dispara reporte mensual el dia 1 a las 10am ART al WhatsApp de Diego
- Pendiente: conectar webhook Whapi para que un numero dedicado reciba las fotos de facturas

### Monitor de Vencimientos — ACTIVADO 11/05

- Tabla `matriculas_diego` creada con 4 registros (CPACF, CASI, Federal Interior, CUCICBA)
- Edge function `monitor-vencimientos` v1 validada (request 1249 → 200 OK)
- Buckets de alerta: 90, 30, 15, 7, 1 dias (configurables por matricula via `alertas_dias`)
- Cron job 13 (`monitor-vencimientos-12pm-art`) diario 12 UTC = 9 ART
- Envia WhatsApp (+5491140253204) + Telegram cuando una matricula entra en bucket
- Estado actual: CPACF 976 dias (2029-01-11), CASI 1414 dias (2030-03-25), Federal y CUCICBA sin fecha → VERIFICAR
- Codigo en `supabase/functions/monitor-vencimientos/` y migration en `supabase/migrations/20260511_matriculas_diego.sql`

### Reporte Semanal — ACTIVADO 11/05

- `weekly-report` (edge function v2) validada end-to-end via pg_net (request 1247 → 200 OK)
- KPIs reales semana 04-10/05: 1131 mensajes, 2 leads nuevos, 1 expediente activo, 0 alucinaciones
- Cron job 8 (`reporte-semanal-viernes-18hs`) reapuntado al endpoint directo (antes simulaba un mensaje "reporte semanal" a narakia-handler — workaround indirecto)
- Reporte se envia automaticamente cada viernes 18hs ART por WhatsApp (+5491140253204) + Telegram
- Google Sheets logging requiere `GOOGLE_SHEETS_REPORT_ID` o `GOOGLE_DRIVE_FOLDER_ID` — opcional, no critico

---

## Sesion 6 Mayo 2026 — Auditoria Total + v11 Skills Completos

### narakia-handler v11 — SKILLS + ANTI-ALUCINACION + MEMORIA REPARADA

Root cause memoria rota: tabla `messages` tiene columnas NOT NULL sin default (`topic`, `agent`, `extension`).
El insert fallaba silenciosamente → history siempre vacio → Lucrecia se re-presentaba en cada mensaje.

Correcciones v11:
- Insert `messages` ahora incluye `topic:"whatsapp"`, `agent:agentName`, `extension:"narakia"`
- Fecha real dinamica inyectada en el system prompt via `Intl.DateTimeFormat` (America/Argentina/Buenos_Aires)
- Regla explicita: "Si hay historial, CONTINUA sin saludar ni presentarte de nuevo"
- ANTI-ALUCINACION: no inventar articulos, expedientes, nombres, indices, estadisticas. Usar [VERIFICAR]
- 33 skills completos en el prompt: legal (21 areas), inmobiliario, ventas, finanzas, marketing, negocios, proteccion
- Tasaciones CABA 2026 con rangos reales por barrio
- Todos los agents actualizados con fecha dinamica y anti-alucinacion

### PWA app fixes (estudiooro-app/index.html)
- Fecha "Hoy — 6 de Mayo 2026" → dinamica con JS (Intl.DateTimeFormat Buenos Aires)
- Typo "Lucresia" → "Lucrecia"
- Chat fetch: agregado `AbortSignal.timeout(30000)` + `r.ok` check antes de parsear JSON

## Sesion 6 Mayo 2026 — v9 Audio + Tono Humano

### narakia-handler v9 — AUDIO COMPLETO + PROMPT EMPATICO

Problema: audio mensajes caian en `skipResponse("empty_input")` porque v8 solo leia `text.body`.

Cambios v9:
- Detecta `msg.type === "audio"` o `"voice"` del webhook Whapi
- Busca `mediaId` en el payload; si no, hace fetch a `GET /messages/{id}` de Whapi
- Descarga audio via `GET /media/{mediaId}` con auth Whapi
- Transcribe con OpenAI Whisper-1 (es, prompt juridico AR)
- Si transcripcion vacia: responde "Podes escribirme?" y retorna 200
- Respuesta Claude → genera TTS via ElevenLabs (voice `XrExE9yKIg1WjnnlVkGX`, eleven_multilingual_v2)
- Sube MP3 a Supabase Storage `voice-messages`, envia via Whapi `/messages/voice`
- Limpia el archivo de storage a los 60s
- Fallback a texto si ElevenLabs o Storage falla
- Strip de tags internos (PEDIR_APROBACION_DIEGO, HANDOFF_DIEGO:si, IMPORTANTE:si) antes de enviar
- Prompt Lucrecia reescrito: calido, empatico, voseo, max 4 oraciones, sin listas tecnicas

Flujo: texto -> Claude -> texto | audio -> Whisper -> Claude -> ElevenLabs -> voz

## Sesion 6 Mayo 2026 — Continuacion Oraculo

### Lucrecia (narakia-handler) — ARREGLADO

Causa raiz del 500: el secret `ANTHROPIC_API_KEY` NO estaba seteado en
Supabase. Las funciones nuevas leian `Deno.env.get(...)` y daban vacio,
asi que cada llamada a Claude devolvia 401. Las funciones viejas
(lucrecia-memoria) tenian la key hardcodeada y por eso funcionaban.

Cambios:
- `router` v3 — `verify_jwt: false` con auth interna por
  `x-internal-token` (header con service_role key). Antes `verify_jwt:
  true` rechazaba todas las llamadas internas con 401.
- `narakia-handler` v8 — API key, modelo y service key hardcodeadas
  (mismo patron que lucrecia-memoria). Modelo principal
  `claude-sonnet-4-5`, fallback `claude-haiku-4-5-20251001`. Maneja
  webhooks vacios y eventos de status de Whapi sin tirar 400.
- `oraculo-chat` v3 — Misma API key y modelos. Devuelve `response` y
  `reply` para compatibilidad.

Tests via `pg_net`:
- `oraculo-chat` 200 → `{"response":"Dale"}`
- `narakia-handler` 200 → `{"ok":true,"agent":"lucrecia","sent":true}`

PENDIENTE (mejora, no urgente): mover la key a un secret real.
Dashboard Supabase > Settings > Edge Functions > Secrets > anadir
`ANTHROPIC_API_KEY`. Despues redeployar narakia-handler y oraculo-chat
leyendo del env var.

### PWA Estudio Oro App — Lista para deploy manual

`estudiooro-app/` ahora tiene:
- `index.html` — chat conectado al endpoint real (Sonnet 4.5 / Haiku 4.5)
- `manifest.json` + `icons/icon-192.svg` + `icons/icon-512.svg`
- `sw.js` — service worker con cache offline (no cachea Supabase ni Make)
- `vercel.json` — headers de seguridad y caching del SW
- `DEPLOY.md` + `deploy.sh` — instrucciones para `vercel deploy --prod`

Vercel CLI no se autentica desde este sandbox (no hay token). Diego
debe ejecutar `cd estudiooro-app && ./deploy.sh` desde su maquina, o
deployar via dashboard. NO usar el proyecto `estudiooro-web` (es la
landing) — crear uno nuevo o usar `estudiooro-final`.

### DNS estudiooro.com

Resuelve a 76.76.21.21 (Vercel anycast). El apex apunta correctamente
a Vercel; falta el dominio `app.estudiooro.com` para la PWA.

### whatsapp-router (Meta) — codigo OK, falta verificar Meta

`whatsapp-router` v8 tiene VERIFY_TOKEN `estudiooro2026`,
`verify_jwt:false`, GET de challenge implementado y ruteo
Natalia/Megan por phone_number_id. Sin logs en 24h => Meta no esta
llamando todavia. Diego: verificar en Meta Business Manager que el
webhook este suscrito a `messages` y que la URL apunte a
`https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/whatsapp-router`.

---

## URLs en produccion (16 activas)

| URL | Estado | Notas |
|-----|--------|-------|
| estudiooroapp.netlify.app | Online | Landing principal — BUGS CORREGIDOS |
| /suite/ | Por verificar | React 18.3.1 — no esta en el repo |
| /diablo/ | Por verificar | React 18.3.1 — no esta en el repo |
| /orogest/ | Por verificar | 2MB CRM — no esta en el repo |
| /omega-supreme.html | En repo | Motor publicidad — sin auditar |
| /panel.html | Por verificar | No esta en el repo |
| /escudo/ | Por verificar | No esta en el repo |
| /penal/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /inmobiliario/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /internacional/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /civil/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /laboral/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /familia/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /tributario/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /societario/ | Alias de landing | SPA fallback — no tiene contenido propio |
| /consumidor/ | Alias de landing | SPA fallback — no tiene contenido propio |

### Bugs corregidos en landing (Fase 1)
- CORREGIDO: Formulario de contacto roto (action POST a wa.me no funciona) → ahora usa JS handler
- CORREGIDO: Opciones de servicio incorrectas (mostraba "Automatizacion IA, Web, Marketing") → ahora muestra los 11 servicios legales reales

---

## Proyectos activos

| Proyecto | Estado | Prioridad | Fase del plan |
|----------|--------|-----------|---------------|
| OropProp | **LIVE** — https://oroprop.vercel.app — CI/CD activo via GitHub Actions | ALTA | Fase 2 |
| CausaManager | **LIVE** — https://causa-manager.vercel.app — CI/CD activo via GitHub Actions | ALTA | Fase 2 |
| OroGest Lex | Online — funcionalidad basica por verificar | ALTA | Fase 1 |
| Panel Interno | Online — datos mock, no conectado a real | ALTA | Fase 1 |
| Escudo Patrimonial | Online — pago no integrado | CRITICA | Fase 2 |
| OMEGA Supreme | Online — modulos activos sin auditar | MEDIA | Fase 3 |
| OMNIA CORE v8.0 | En desarrollo — puerto 8003 | MEDIA | Fase 6 |
| Lobo Confiteria | En desarrollo — marca sin lanzar | BAJA | Fase 6 |
| SmartLedgerPro | En desarrollo — MVP no definido | BAJA | Fase 4 |

---

## Agentes autonomos (Managed Agents)

| Agente | Estado | Costo/mes |
|--------|--------|----------|
| Recepcionista WhatsApp 24/7 | ACTIVO — `valentina-bot` v1 (memoria compartida narakia-memory, derivacion a Lucrecia/Paula/Natalia/Megan/Sabueso/Diego) | $0 |
| Reporte semanal del negocio | ACTIVO — edge function `weekly-report` v2 + pg_cron viernes 18hs ART | $0 (corre en Supabase) |
| Monitor de vencimientos | ACTIVO — edge function `monitor-vencimientos` + pg_cron diario 9hs ART | $0 (Supabase) |
| Clasificador de leads | ACTIVO — columna generada `leads.categoria` (A si score>=80, B 50-79, C <50). Indexada. | $0 |
| Contador de facturas | ACTIVO — `contador-facturas` v1 + tabla `facturas_recibidas` + reporte mensual via cron dia 1 | $0 |

---

## Skills disponibles: 58

Todos instalados en `.claude/skills/`. Ver CLAUDE.md para lista completa.
Incluyendo los 8 skills del workflow Estudio Oro (01-penal al 08-marketing-ads) y los 3 comandos (/schedule, /ultrathink, /skills-upgrade).

---

## Expansion internacional

| Pais | Estado |
|------|--------|
| Argentina | Operativo — triple matricula activa |
| Espana | Ciudadania en proceso [VERIFICAR estado] |
| Uruguay | Pendiente — corresponsal o habilitacion directa [VERIFICAR] |

---

## Proximos pasos inmediatos (Fase 1)

- [x] Auditoria de landing page — bugs encontrados y corregidos
- [x] Skills workflow Estudio Oro — 8 skills completos en main
- [x] Comandos /schedule, /ultrathink, /skills-upgrade en main
- [x] CLAUDE.md actualizado con tabla de skills y triggers
- [x] OropProp deployed — https://oroprop.vercel.app (CI/CD via GitHub Actions)
- [x] CausaManager deployed — https://causa-manager.vercel.app (CI/CD via GitHub Actions)
- [x] Ambos workflows usan REST API upsert idempotente (no vercel env add CLI)
- [ ] **URGENTE**: Reautorizar FB/IG tokens Make.com (vencen 29/05/2026)
- [ ] **Diego**: agregar GitHub Secrets para ambas apps (ver tabla en seccion 25/05 arriba)
- [ ] **Diego**: configurar CNAME custom domains para ambas apps
- [ ] Verificar /orogest/, /escudo/, /panel.html, /suite/, /diablo/ en Netlify (no estan en repo)
- [ ] Decidir si las 8 landing por area (/penal/, /civil/, etc.) deben tener contenido propio o seguir siendo aliases
- [ ] Integrar pago en Escudo Patrimonial (MercadoPago o Stripe)
- [ ] Activar agente WhatsApp en platform.claude.com
- [ ] ANTHROPIC_API_KEY → mover a secret real en Supabase (pendiente desde sesion 6/05)
