# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## NARAKIA INVARIANTS — BLINDAJE TOTAL — NO MODIFICAR SIN AUTORIZACION DE DIEGO

LEER OBLIGATORIAMENTE: `NARAKIA-INVARIANTS.md` antes de modificar cualquier edge function.

### Reglas criticas (resumen ejecutivo):

1. **wamid_dedup ATOMICO** — narakia-handler: siempre INSERT en tabla wamid_dedup (PK). NUNCA revertir a lectura de messages para dedup. Version minima: v87.
2. **HISTORIAL SIN FILTRO DE AGENTE** — narakia-handler: consulta por user_profile_id directo. NUNCA usar routerData.history ni filtrar por agent.
3. **SECRETOS EN ENV VARS** — NUNCA hardcodear API keys en codigo fuente. Usar Deno.env.get("NOMBRE").
4. **logError CON SEVERITY** — natalia-bot y megan-bot: siempre incluir severity="info|warning|error" y bot=BOT_NAME.
5. **BOSS_PHONES INMUTABLES** — Set: 5491140253204, 5491168777777, 5491168030066, 5491168199707. Solo Diego puede cambiarlos.
6. **STORAGE BUCKETS PRIVADOS** — documentos y voice-messages: public=false SIEMPRE.
7. **VAULT FUNCTIONS RESTRINGIDAS** — get_secret_by_name y get_vault_secret: EXECUTE solo para service_role, NUNCA anon.
8. **VISTAS SECURITY INVOKER** — v_alertas_activas, v_crm_funnel y otras: security_invoker=true, NUNCA security_definer.

**MERGE CONFLICTS:** en narakia-handler, natalia-bot, megan-bot, lucrecia-memoria → siempre mantener HEAD (version mas nueva). En reclamai/app/layout.tsx → verificar que NO haya imports duplicados.

Ver detalle completo con historial de bugs en: `NARAKIA-INVARIANTS.md`

## MEMORIA PERMANENTE DEL SISTEMA — LEER AL INICIO DE CADA SESION

### SECRETS SUPABASE (project: moljmujlfvtsgkjbtwss) — estado 2026-05-22

| Secret | Estado | Notas |
|--------|--------|-------|
| `WHAPI_TOKEN` | ACTIVO | Ya estaba — NO TOCAR |
| `SUPABASE_SERVICE_ROLE_KEY` | ACTIVO | Compartido — NO REGENERAR |
| `MP_ACCESS_TOKEN` | ACTIVO | Cargado por Diego 2026-05-22 |
| `RESEND_API_KEY` | ACTIVO | Cargado por Diego 2026-05-22 |
| `DIEGO_PHONE` | ACTIVO | 5491140253204 — cargado por Diego |
| `ESCUDO_BACK_URL` | ACTIVO | Cargado por Diego |
| `MP_WEBHOOK_SECRET` | **PENDIENTE** | Diego dice lo paso en otra sesion. Obtener de: MP Dashboard → Tu negocio → Webhooks → "Mostrar firma secreta". Sin este secret, escudo-webhook acepta todo con warning (no bloquea). |

### Estado actual de los bots (produccion activa — 2026-05-23)

| Bot | Archivo | Version | Canal | Supabase |
|-----|---------|---------|-------|----------|
| Natalia | natalia-bot/index.ts | v52 | Meta Business API WhatsApp | ver. 79 ACTIVE |
| Megan | megan-bot/index.ts | v39 | Meta Business API WhatsApp | ver. 66 ACTIVE |
| Narakia/Lucrecia | narakia-handler/index.ts | v174 (EON v3.5: 300 dir + 42 submód + 240+ cmds) | Whapi (numero regular) | ver. 174 ACTIVE |
| narakia-memory | narakia-memory/index.ts | v3 | interna (llamada por bots) | ver. 18 ACTIVE |
| daily-report | daily-report/index.ts | v2 | pg_cron 8am ARG (job ID 21) | ver. 2 ACTIVE |
| narakia-brain | narakia-brain/index.ts | v1 | pg_cron 2am ARG (job ID 32) | ver. 1 ACTIVE — PR #336 MERGEADO |
| escudo-qualifier | escudo-qualifier/index.ts | v1 | interna | ver. 1 ACTIVE — PR #336 MERGEADO |
| dashboard-data | dashboard-data/index.ts | v1 | HTTPS | ver. 1 ACTIVE — PR #336 MERGEADO |
| dashboard-panel | dashboard-panel/index.ts | v1 | HTTPS dark mode auto-refresh 30s | ver. 1 ACTIVE — PR #336 MERGEADO |

### Escudo Patrimonial — estado 2026-05-23 (ACTIVO)

| Componente | Version | Estado |
|---|---|---|
| escudo-suscribir | v12, verify_jwt:false | ACTIVE — crea Preapprovals MP |
| escudo-webhook | v11, verify_jwt:false | ACTIVE — HMAC implementado (graceful sin MP_WEBHOOK_SECRET) |
| escudo-bienvenida | v12, verify_jwt:false | ACTIVE — onboarding WhatsApp |
| escudo-patrimonial | v17, verify_jwt:false | ACTIVE |
| Tablas DB | 018+019+020 aplicadas | escudo_plans (4 planes), escudo_subscriptions, escudo_payments |
| app-data | v17, verify_jwt:true | ACTIVE — key fija eliminada, cache 60s |

### PR #336 — MERGEADO A MAIN 2026-05-25 ✅

| Funcion | Version | Estado | Descripcion |
|---|---|---|---|
| narakia-brain | v1, verify_jwt:false | ACTIVE | Analisis nocturno 2am ARG. pg_cron job ID 32 (05:00 UTC). WhatsApp resumen ejecutivo a Diego |
| escudo-qualifier | v1, verify_jwt:false | ACTIVE | Lead scoring 0-100. Si score>=70 genera oferta Escudo. |
| dashboard-data | v1, verify_jwt:false | ACTIVE | API JSON con todos los KPIs del ecosistema |
| dashboard-panel | v1, verify_jwt:false | ACTIVE | Panel HTML dark mode auto-refresh 30s |
| narakia-handler | v173, verify_jwt:false | ACTIVE | EON 300 directivas + 4 IAs clonadas + 197 comandos |
| Migration 021 | aplicada | ACTIVE | narakia_brain_logs, lead_score/lead_stage, 6 indices, pg_cron |

**Panel dashboard:** `https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/dashboard-panel?key=<SERVICE_ROLE_KEY>`

### System Doctor — estado 2026-05-23

**Instalacion Mac/Linux (comando que funciona — repo publico):**
`curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/setup.sh | bash`

**Razon:** Diego-Orosa es repo PRIVADO — raw.githubusercontent.com da 404 sin token. stack-ia-creador es PUBLICO.
Archivos en: `laboratoriolegalcontable-png/stack-ia-creador` main branch bajo `.claude/skills/system-doctor/`

### Capacidades de los bots (estado actual)

**LO QUE YA HACEN:**
- Transcriben mensajes de voz con OpenAI Whisper
- Anti-jailbreak pre-LLM (17 patterns) + blindaje en sistema prompt
- Boss mode separado: cuando Diego escribe, responden "Doctor," directo al punto
- Dedup atomico via wamid_dedup (narakia-handler)
- Historial de conversacion (conversation_history en natalia/megan, messages en narakia)
- Handoff automatico a Diego: urgencia penal, leads calientes, citas
- Scripts para: crisis penal, estafas/crypto, honorarios, Lobo, inversiones, Escudo Patrimonial

**IMPLEMENTADO 2026-05-19:**
- Lectura de imagenes via Claude Vision (Lucrecia v46, Megan v37): descarga, analiza, describe al cliente, avisa a Diego
- Videos: extrae audio con Whisper, avisa a Diego con transcripcion
- Documentos: acusa recibo, notifica a Diego con nombre del archivo
- Respuesta por voz TTS: cliente manda audio → bot responde en audio (ElevenLabs → Meta API upload → mensaje de voz). Fallback a texto si ElevenLabs no esta configurado

**IMPLEMENTADO 2026-05-20 (sesion 1):**
- natalia-bot v48 / megan-bot v38: fix critico dispatcher — salteaban todos los mensajes Meta por sig-check sin X-Hub-Signature (bug sistémico desde siempre)
- CTWA lead capture (v47+): detecta leads de anuncios Facebook/IG (full_name + email del formulario), los guarda en user_profiles, responde con nombre, alerta a Diego inmediatamente
- meta-dispatcher arquitectura documentada: webhook Meta → meta-dispatcher → natalia-bot/megan-bot/sabueso-bot por phone_number_id
- App ID Meta confirmado: 1012373314640367 (app: "Estudio Oro API"), phone 1137854822734580 = Lucrecia (+54 9 11 5869-6090 / Sologint)

**IMPLEMENTADO 2026-05-20 (sesion 2):**
- natalia-bot v49 / megan-bot v39: quality monitor post-generacion — checkResponseQuality() detecta y loguea a narakia_errors: respuesta_muy_corta, auto_revela_ia, auto_revela_modelo, contiene_no_puedo, sin_informacion_declarada, expone_error_tecnico, nombre_incorrecto_orosa, telefono_diego_expuesto, respuesta_excesiva. Solo notifica a Diego en errores criticos (severity=error)
- daily-report v1: nueva edge function que envia a Diego (via Whapi) metricas de 24h: mensajes por bot, leads Facebook Ads, citas coordinadas, handoffs activos, errores/warnings. Trigger: POST con Authorization: Bearer SERVICE_KEY o CRON_SECRET. Para activar diariamente: configurar pg_cron o escenario Make.com a las 8am ARG
- narakia-memory v3: resúmenes progresivos de contexto — get_context() comprime mensajes viejos (>25) con Claude Haiku en bloque de ~200 palabras, mantiene últimos 20 sin comprimir. Cache en user_profiles.memory_summary, TTL 8h. Nueva accion summarize para refresh manual
- daily-report v2: acepta pg_cron sin auth (rate limit 20min interno). pg_cron job ID 21 activado: 8am ARG diario
- ELEVENLABS_API_KEY: NO configurada como edge function secret — TTS deshabilitado, fallback a texto activo

**IMPLEMENTADO 2026-05-20 (sesion 3):**
- natalia-bot v52: Meta channel juega persona Natalia (tech specialist), no Lucrecia. forced_agent: "natalia". Welcome CTWA dice "Soy Natalia".
- narakia-handler v91: fix CRITICO boss_pause — fromMe webhook de Whapi ya no silencia clientes. /pausa y /reanudar nuevos comandos admin.
- narakia-handler v88: "natalia" agregado a SONNET_AGENTS (usaba Haiku por error, ahora usa Sonnet 4.6)
- Cross-channel dedup: narakia-handler posterga respuesta si last_channel="meta" y <2h (evita Natalia+Lucrecia en mismo cliente)
- natalia-bot v50 → v51 → v52: refactorizado como thin Meta adapter delegando 100% a narakia-handler

**BUGFIX 2026-05-20 (sesion 4):**
- narakia-handler v89/v90: fix CRITICO — duplicate `const forcedAgent` (rebase artifact) crasheaba todos los POST. Removido duplicado.
- narakia-handler v90: GET ?action=setup_webhook — llama PATCH https://gate.whapi.cloud/settings para re-registrar webhook Lucrecia
- Causa raiz del silencio de Lucrecia: webhook Whapi estaba apuntando a Make.com (hook.us2.make.com/chpb6...) en vez de a narakia-handler directo. Corregido.
- INVARIANTE NUEVO: webhook Whapi SIEMPRE debe apuntar a https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/narakia-handler. Si Lucrecia deja de responder, llamar GET /narakia-handler?action=setup_webhook para re-registrar.

### Identidad y personas

- **Lucrecia** (BOT_NAME="lucrecia"): coordinadora general Estudio Oro, bilingue esp/ing
- **Megan** (BOT_NAME="megan"): especialista inversiones internacionales (Miami/ESP/URY)
- NUNCA dicen que son IA/bot. NUNCA dicen "Estudio Orosa" (siempre "Estudio Oro")
- NUNCA dan opinion juridica formal. NUNCA comparten telefono de Diego sin pedido explicito

### Supabase project_id: moljmujlfvtsgkjbtwss
### Git branch activo: claude/estudio-oro-infrastructure-aBOL2
### Boss phone Diego: 5491140253204

### Historial de decisiones permanentes (NO re-debatir)

| Fecha | Decision | Razon | NO volver a proponer |
|-------|----------|-------|----------------------|
| 2026-05-19 | wamid_dedup via INSERT atomico, no SELECT previo | TOCTOU race condition causaba 2-3 respuestas por mensaje | Revertir a lectura de messages para dedup |
| 2026-05-19 | Historial de mensajes: consulta por user_profile_id SIN filtro de agente | Filtrar por agente causaba historial vacio al cambiar routing | Usar routerData.history ni filtrar por agent name |
| 2026-05-19 | BOSS_PHONES: 5491140253204, 5491168777777, 5491168030066, 5491168199707 | Solo Diego autoriza cambios | Cambiar sin consulta explicita a Diego |
| 2026-05-19 | Bots nunca dicen "Estudio Orosa" — siempre "Estudio Oro" | Nombre de marca correcto | Usar "Orosa" como nombre del estudio |
| 2026-05-19 | Bots nunca revelan que son IA/bot — identidad de persona siempre | Confianza del cliente | Agregar disclaimers de IA |
| 2026-05-19 | Storage buckets documentos y voice-messages: public=false siempre | Documentos legales y audios son privados | Cambiar a public=true estos buckets |
| 2026-05-19 | Vault functions: EXECUTE solo para service_role | Seguridad — nunca exponer secrets a anon | Otorgar EXECUTE a anon o authenticated |
| 2026-05-19 | Boss mode: cuando Diego escribe, responden "Doctor," + directo al punto | Diego quiere respuestas ejecutivas sin bienvenida | Tratar a Diego como cliente regular |
| 2026-05-19 | Voz TTS activada solo cuando el cliente mando un audio (isAudio=true) | No forzar audio en conversaciones de texto | Enviar voz en todos los mensajes |
| 2026-05-19 | JAILBREAK_HARD pre-LLM: si detecta patron → responder "¿En qué te puedo ayudar?" sin llamar a Claude | Ahorro de tokens + seguridad ante prompt injection | Dejar que Claude maneje jailbreaks sin filtro previo |

### ALERTAS CRÍTICAS — Verificar al inicio de cada sesión

| Nivel | Alerta | Acción |
|-------|--------|--------|
| 🔴 CRÍTICO | **CCC 28.979/2020** — verificar estado post-22/04/2026 | Consultar expediente urgente |
| 🔴 CRÍTICO | **FB/IG tokens Make.com** — vencen 29/05/2026 | Reautorizar URGENTE (4 días) |
| 🟡 IMPORTANTE | **Paula bot** — sin número WhatsApp asignado | Asignar número antes de activar |
| 🟡 IMPORTANTE | **Anthropic API reclamo $30** — Conv. 215473771116507 | Seguimiento hasta resolución |
| 🟡 IMPORTANTE | **Ciudadanía española** — verificar estado del trámite | Consultar y actualizar |
| 🟡 PENDIENTE | **MP_WEBHOOK_SECRET** — no configurado | MP Dashboard → Tu negocio → Webhooks |

### Resumen Viajero — pegar al inicio de cualquier sesion nueva

```
CONTEXTO NARAKIA — Dr. Diego Orosa — Estudio Oro S.A.S. — actualizado 2026-05-25

BOTS EN PRODUCCION:
- Natalia (natalia-bot v52, Supabase ver.79): Meta Business API, agente tech/automatizacion del Estudio
- Megan (megan-bot v39, Supabase ver.66): Meta Business API, inversiones internacionales (Miami/ESP/URY)
- Narakia/Lucrecia (narakia-handler v174): Whapi, EON v3.5: 300 dir + 42 submódulos + 240+ comandos
- narakia-memory v3 (ver.18): resúmenes progresivos con Haiku, cache en user_profiles
- daily-report v2 (ver.2): metricas diarias 8am ARG via pg_cron job ID 21
- narakia-brain v1 (ver.1): analisis nocturno 2am ARG, pg_cron job ID 32 — PR #336 MERGEADO ✅
- escudo-qualifier v1 (ver.1): scoring leads 0-100, oferta Escudo si score>=70 — ACTIVO ✅
- dashboard-data v1 + dashboard-panel v1: panel KPIs dark mode auto-refresh 30s — ACTIVO ✅
- URL panel: https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/dashboard-panel?key=<SERVICE_KEY>
- Migration 021 aplicada: narakia_brain_logs, lead_score/lead_stage en user_profiles, 6 indices

SKILLS EN MAIN (stack-ia-creador — PR #72 MERGEADO ✅ 2026-05-25):
- kairos-legendario v3.5: EON 42 submódulos + /sintesis + /memoria [query] + /eon [dominio]
- auto-sistema: bootstrapea ecosistema completo en cualquier proyecto nuevo
- auto-mode: guía 3 modos Claude Code (Planeo/Automático/Omisión)
curl: curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/auto-sistema/install.sh | bash

ARQUITECTURA DE CANALES:
- Meta Business API (1137854822734580) → natalia-bot → narakia-handler (forced_agent: natalia)
- Whapi (5491168777777) → narakia-handler directo → agente segun routing (default: lucrecia)
- natalia y lucrecia son PERSONAS DISTINTAS: natalia=tech/automatizacion, lucrecia=coordinadora general

SYSTEM DOCTOR (instalacion Mac/Linux):
curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/setup.sh | bash
NOTA: Diego-Orosa es PRIVADO — siempre usar stack-ia-creador (publico) para curl sin auth.

CAPACIDADES (ya en produccion):
- Vision: Claude Vision para imagenes, Whisper para audio/video, acuse de recibo para documentos
- Anti-jailbreak: 17 patrones pre-LLM bloqueados + blindaje en sistema prompt
- Boss mode: "Doctor," + ejecutivo sin intro cuando escribe Diego (5491140253204)
- CTWA lead capture: formularios Facebook Ads → user_profiles → welcome + alerta Diego
- Quality monitor: post-generacion detecta 9 tipos de respuestas problematicas
- Cross-channel dedup: user_profiles.last_channel + 2h TTL evita doble respuesta
- Resumenes progresivos: narakia-memory get_context comprende historial >25 mensajes con Haiku
- escudo-webhook v11: HMAC-SHA256 activo (graceful sin MP_WEBHOOK_SECRET)

REGLAS INMUTABLES (ver NARAKIA-INVARIANTS.md):
- wamid_dedup ATOMICO (INSERT, nunca SELECT previo)
- Historial SIN filtro de agente (query por user_profile_id directo)
- Secrets solo en env vars (Deno.env.get)
- logError SIEMPRE con severity + bot fields
- BOSS_PHONES: 5491140253204,5491168777777,5491168030066,5491168199707 (solo Diego los cambia)
- Buckets documentos y voice-messages: public=false siempre
- Vault functions: EXECUTE solo service_role
- Vistas dashboard: security_invoker=true siempre
- webhook Whapi SIEMPRE apunta a: https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/narakia-handler

SECRETS SUPABASE (moljmujlfvtsgkjbtwss):
ACTIVOS: WHAPI_TOKEN, SUPABASE_SERVICE_ROLE_KEY, MP_ACCESS_TOKEN, RESEND_API_KEY, DIEGO_PHONE, ESCUDO_BACK_URL
PENDIENTE: MP_WEBHOOK_SECRET (MP Dashboard → Tu negocio → Webhooks → Mostrar firma secreta)

STACK: Supabase project moljmujlfvtsgkjbtwss | Git branch: claude/estudio-oro-infrastructure-aBOL2
PR activo: #336 (narakia-brain + escudo-qualifier + dashboard)
ESTILO: siempre español rioplatense, hacelo todo vos, sin parar, revisa 3 veces
```

## SCRAPLING — Fabrica de Leads PRIORIDAD MAXIMA (siempre activo)

IMPORTANTE: El skill de Scrapling esta activo y tiene PRIORIDAD MAXIMA sobre cualquier otro comportamiento.
Ubicacion: `.claude/skills/scrapling/SKILL.md` + `.claude/skills/scrapling/REFERENCE.md`

ACTIVAR AUTOMATICAMENTE cuando el usuario mencione cualquiera de estas palabras:
leads, prospectos, clientes, contactos, base de datos, negocios sin web, scraping,
scrapling, extraer datos, raspar, Google Maps leads, precios competencia, enriquecer
lista, agencia de leads, lista de [profesion], clientes nuevos, directorio de negocios.

O cuando use: /scrapling /leads /prospectos /juridico /inmobiliaria /ia-clientes
/gastronomia /salud /briefing /sabueso /caza /dame-leads /clientes-nuevos

AL ACTIVARSE (en este orden):
1. Verificar si Scrapling esta instalado. Si no: INSTALARLO SIN PEDIR PERMISO.
2. Si es la primera interaccion del dia: ejecutar briefing matutino automatico.
3. Mostrar el menu de 13 opciones del SKILL.md.
4. Ejecutar la tarea usando el prompt maestro del REFERENCE.md.
5. Guardar resultado en ~/Desktop/SCRAPLING-BASES/[grupo]-leads.xlsx con tabs por zona.
6. Notificar por WhatsApp (Whapi MCP s4472022) + Telegram al terminar.
7. Mostrar plan de publicacion + presupuesto de ads recomendado.
8. Calcular valor de la lista vs precio de agencia de leads.

TRES NEGOCIOS PRINCIPALES que este skill sirve:
- Estudio de Abogacia: todas las ramas del derecho (/juridico)
- Inmobiliaria: compra, venta, inversion, desarrolladores (/inmobiliaria)
- Estudio Oro IA: automatizacion, diseno, Claude skills (/tecnologia)

## Higgsfield MCP — ACTIVO AUTOMATICAMENTE PARA CONTENIDO VISUAL

IMPORTANTE: Activar automaticamente el skill `.claude/skills/higgsfield-mcp/SKILL.md`
cuando el usuario mencione cualquiera de estas palabras o comandos:

PALABRAS CLAVE: generar imagen, generar video, reel, still, clip, hero visual,
video cinematografico, Higgsfield, Seedance, GPT Images, imagen para feed,
video para Instagram, contenido visual, assets de marca, batch nocturno de contenido.

COMANDOS: /higgsfield /higgsfield-mcp /video /imagen-cine /reel /still

AL ACTIVARSE:
1. Verificar que el MCP de Higgsfield este conectado (Settings -> Connectors).
2. Identificar el tipo de tarea: still / video / set de pilares / batch.
3. Recolectar los 5 inputs cinematograficos (o usar defaults).
4. Seleccionar el modelo correcto (Seedance para video, GPT Images para still).
5. Ejecutar usando las plantillas del REFERENCE.md.
6. Post-render: mini-ficha + oferta de flujo combinado (copywriter / content-machine).

PLANTILLAS DISPONIBLES EN REFERENCE.md:
- [G1] Still generico . [G2] Clip Seedance 5s . [G3] Batch nocturno
- [P1] Pilar Penal . [P2] Pilar Inmobiliario . [P3] Pilar Patrimonial . [P4] Pilar Internacional

## Repository Overview

This is a documentation repository for **Diego Orosa's digital agency**. It contains guides and reference materials — no application source code, build tools, or tests.

## Structure

- `AI-SKILLS-GUIDE.md` — Guide for installing and using AI skills (antigravity-awesome-skills) with AI agents like Claude Code, Cursor, and Gemini CLI
- `CLAUDE-CONTROL-REMOTO.md` — Guide for using Computer Use to control your computer with Claude (mouse, keyboard, screen)
- `DE-IDEA-A-CODIGO.md` — Guide for the idea-to-code workflow using Haiku, Sonnet, and Opus in sequence
- `CLAUDE-MODELOS-GUIDE.md` — Guide for the 3 Claude models (Haiku, Sonnet, Opus) and when to use each one to maximize your plan
- `CLAUDE-DISPATCH.md` — Guide for assigning tasks to Claude from your phone that execute on your computer
- `COMPUTER-USE-DISPATCH.md` — Combined guide: Computer Use (Claude controls your screen) + Dispatch (control Claude from your phone)
- `.claude/skills/computer-use-dispatch/` — The Computer Use Dispatch skill (SKILL.md + REFERENCE.md) with 10 specialized agents and 30+ ready-to-use workflows
- `CLAUDE-PILOTO-AUTOMATICO.md` — Guide for YOLO Mode, Hooks, GSD and Super Powers
- `CLAUDE-SKILLS-GUIDE.md` — Guide for creating and distributing custom Claude Skills
- `HERRAMIENTAS-CLAUDE-CODE.md` — Guide to 5 free open source tools for Claude Code (Superpowers, Everything Claude Code, UI UX Pro Max, claude-mem, n8n-MCP)
- `CLAUDE-SUPERPODERES.md` — Guide for 4 superpowers (Supadata, Apify, Last 30 Days, Playwright) that extend Claude Code capabilities
- `DISENADOR-WEB-DEFINITIVO.md` — Guide for combining 4 tools (UI/UX Pro Max GO, NanoBanana, Stitch, 21st Dev) to design professional web pages with Claude
- `MARKETING-SKILLS-GUIDE.md` — Guide for 33 marketing skills (coreyhaines31/marketingskills) covering CRO, copywriting, SEO, ads, email, and strategy
- `maia-skill/` — Multi-agent investment research skill for Claude Code
  - `SKILL.md` — Skill definition that orchestrates 5 specialized research agents
  - `REFERENCE.md` — JSON schemas and detailed agent instructions
  - `install.sh` — One-command installer
  - `dashboard/` — Node.js interactive dashboard (localhost:3420)
- `CLAUDE-COPYWRITER.md` — Guide for the Copywriter/Humanizer skill that detects 24 AI writing patterns and rewrites text to sound human
- `.claude/skills/copywriter/` — The actual Copywriter skill (SKILL.md + REFERENCE.md)
- `.claude/skills/tokenizador/` — Tokenizador skill: estima tokens, calcula costos API Claude (Haiku/Sonnet/Opus) y optimiza prompts para proyectos con la Anthropic API
- `.claude/skills/markitdown/` — MarkItDown skill: convierte PDF, Word, Excel, PowerPoint, imagenes, audio y YouTube a Markdown limpio antes de leerlos, ahorrando hasta 90% de tokens
- `CREA-AGENTES-CON-CLAUDE.md` — Guide for creating AI agents with Claude Code using Plan Mode, MCP, and /loop
- `APIS-MCPS-A2A.md` — Guide explaining APIs, MCP and A2A protocols for AI communication
- `COMIENZA-A-CONSTRUIR.md` — Community vault guide: free tools stack and business model for building client projects
- `ANTHROPIC-GITHUB.md` — Guide to Anthropic's 73+ open source repos on GitHub (SDKs, Cookbook, Quickstarts, Claude Code source, Skills, Agent SDKs)
- `ACADEMIA-CLAUDE.md` — Landing page for Anthropic's free official courses (Academia Claude)
- `CLAUDE-META-ADS.md` — Complete guide for Meta Marketing API integration with Claude Code
- `.mcp.json` — MCP server configuration for Meta Ads
- `src/utils/safety.py` — Safety guardrails and validation utilities for Meta Ads operations
- `logs/` — Audit logs for API write operations
- `VERCEL-SKILLS-GUIDE.md` — Guide for discovering and installing Vercel skills using skills.sh and find-skills
- `RUFLO-CLOUD-GUIDE.md` — Guide for Ruflo Cloud multi-agent orchestration platform (60+ agents, swarms, intelligent routing)
- `STACK-APP-MOVIL-IA.md` — Operational guide for building, monetizing and publishing a mobile AI app (Rork + Claude + Supabase + Stripe)
- `CONSTRUYE-CON-ESTRUCTURA.md` — Master prompt and guide for building products with structure using AI agents
- `ANIMACIONES-GUIDE.md` — Guide for creating videos with Remotion (setup, concepts, usage)
- `install.sh` / `install.ps1` — One-command installers (macOS/Linux and Windows)
- `scripts/bootstrap.sh` / `scripts/bootstrap.ps1` — Bootstrap scripts for project setup
- `output/agent-video-starter/` — Remotion starter project (React + TypeScript)
- `INSTANT-LANDING.md` — Express system for building a complete landing page with AI using a system prompt, 3 questions, and automated skills + build + validation
- `DE-IDEA-A-CODIGO.md` — Step-by-step workflow for turning any idea into a working project using Haiku, Sonnet, and Opus in sequence
- `CLAUDE-TOOLS-GUIDE.md` — Guide covering 5 free open source tools for Claude Code (Superpowers, Everything Claude Code, UI UX Pro Max, claude-mem, n8n-MCP)
- `MEJORA-PROMPTS-CLAUDE.md` — Guide for the prompt-improver plugin that evaluates prompt clarity before execution
- `STITCH-MCP-GUIDE.md` — Guide for configuring Google Stitch MCP to design UI interfaces with Claude
- `OBSIDIAN-CLAUDE.md` — Guide for using Obsidian as Claude's permanent memory with Markdown vaults
- `SKILL-BUILDER-META-SKILL.md` — Guide for the Skill Creator meta-skill that teaches how to create all other skills
- `SKILL-SEEKERS-OBSIDIAN.md` — Guide for using Skill Seekers, Obsidian, and obsidian-skills to build a private knowledge base for Claude
- `REPLICA-DISENOS-WEB.md` — Guide for replicating web designs using the UI UX Pro Max skill and a replication prompt
- `MENOS-CONTEXTO-CLAUDE.md` — Guide for context-mode, an open source tool that reduces Claude Code context consumption by up to 98%
- `CLON-SUPREMO-ORQUESTACION.md` — Guide for the AI Orchestration System with 28+ orchestrators, massive competition system and dynamic skill generation
- `.claude/skills/orchestration/` — The Orchestration skill (SKILL.md + REFERENCE.md) with 28+ specialized orchestrators
- `VIBE-VOICE-GUIDE.md` — Guia para transcribir audio y video gratis con Microsoft Vibe Voice + Claude (50+ idiomas, identificacion de hablantes, privacidad total, combo viral para creadores de contenido)
- `SKILL-SEEKERS-OBSIDIAN.md` — Guide for using Skill Seekers, Obsidian, and obsidian-skills to build a private knowledge base for Claude
- `.claude/skills/obsidian-vault/` — Skill Boveda: segunda cabeza con Claude y Obsidian. Comandos /wiki, /save, /autoresearch, /canvas, ingest. Guarda conversaciones, digiere archivos y conecta ideas con wikilinks automaticamente
- `MEJORA-PROMPTS-CLAUDE.md` — Guide for the prompt-improver plugin that evaluates prompt clarity before execution
- `.claude/skills/ahorra-cuenta-claude/` — Skill v2.0 que diagnostica los 5 errores basicos + 5 tecnicas avanzadas + checklist turbo para triplicar la duracion del plan
- `.claude/skills/claude-turbo/` — Arquitecto de prompts de maxima eficiencia: construye prompts con los 5 pilares, 25 picardias, Modo Supremo y REFERENCE.md con 7 plantillas listas
- `.claude/skills/claude-maestro/` — Orquestador maestro: analiza la tarea, selecciona el combo optimo de skills y tecnicas, y ejecuta el flujo completo automaticamente. Activa con `/maestro`
- `.claude/skills/workflow-diario/` — Protocolos de flujo de trabajo para 13 tipos de dia profesional (Legal, Contenido, Analisis, Codigo, Estrategia, Ventas, Admin, Mixto, Negociacion, Crisis, Pitch, Due Diligence, Onboarding). Mensajes de inicio, bloques y cierre listos para copiar. Activa con `/workflow-diario`
- `.claude/skills/claude-memory/` — Sistema de memoria persistente para Claude: 5 tipos de memoria, arquitectura CLAUDE.md recomendada, integracion con Obsidian, 5 tecnicas de memoria en sesion y plantillas listas para construir tu base de conocimiento personal
- `VIBE-VOICE-GUIDE.md` — Guia para transcribir audio y video gratis con Microsoft Vibe Voice + Claude (50+ idiomas, identificacion de hablantes, privacidad total, combo viral para creadores de contenido)
- `CLAUDE-MODELOS-SWITCH.md` — Guia para el skill switch-models que detecta automaticamente el modelo optimo para cada tarea y protege la cuota del plan
- `.claude/skills/switch-models/` — Switch Models skill (SKILL.md + REFERENCE.md): detecta mismatch tarea-modelo, saturacion de servidor y recomienda el cambio con el comando exacto
- `.claude/skills/vibe-voice/` — Skill de Vibe Voice: activa con `/vibe-voice` para guia interactiva de transcripcion segun el caso de uso (junta, ventas, legal, viral)
- `.claude/skills/multipoderes/` — Skill orquestador de los 5 superpoderes: activa con `/multipoderes` para misiones complejas que combinan Supadata, Apify, Last 30 Days, Playwright y Vibe Voice
- `.claude/skills/lead-hunter/` — Skill de caza de leads: activa con `/lead-hunter` para encontrar prospectos calificados con scraping, verificacion web e investigacion de noticias
- `.claude/skills/viral-radar/` — Skill de radar viral: activa con `/viral-radar` para detectar tendencias antes que exploten en cualquier nicho
- `.claude/skills/content-machine/` — Skill de maquina de contenido: activa con `/content-machine` para convertir 1 pieza de contenido en 10 formatos listos para publicar
- `.claude/skills/propuesta-suprema/` — Skill de propuestas ganadoras: activa con `/propuesta-suprema` para generar propuestas comerciales completas con investigacion del cliente, 3 variantes de precio y email de envio
- `.claude/skills/funnel-doctor/` — Skill de diagnostico de embudos: activa con `/funnel-doctor` para auditar landing pages, analizar ads activos y reparar donde se rompe la conversion
- `.claude/skills/script-doctor/` — Skill de guiones: activa con `/script-doctor` para diagnosticar y reescribir cualquier guion de video, podcast o pitch con patrones virales
- `.claude/skills/clone-competitor/` — Skill de clonacion de competidores: activa con `/clone-competitor` para analizar el stack completo de un competidor y generar la estrategia clon mejorada
- `.claude/skills/primer-cliente/` — Skill de adquisicion inicial: activa con `/primer-cliente` para encontrar los primeros 10 clientes en 48 horas con contacto directo, oferta irresistible y secuencia de seguimiento
- `scripts/install-vibe-voice.sh` — Script automatico de instalacion de Vibe Voice para Mac y Linux
- `scripts/install-vibe-voice.ps1` — Script automatico de instalacion de Vibe Voice para Windows (detecta ffmpeg, crea venv, instala dependencias)
- `.claude/skills/pitch-deck/` — Skill de pitch deck: activa con `/pitch-deck` para generar la estructura completa (10 slides, guion, investigacion de mercado) para inversores, clientes o demos
- `.claude/skills/negociador-supremo/` — Skill de negociacion: activa con `/negociador-supremo` para preparar, ejecutar y analizar negociaciones con BATNA, ZOPA, tacticas psicologicas y guion de apertura
- `.claude/skills/email-machine/` — Skill de emails: activa con `/email-machine` para escribir secuencias completas de cold outreach, drip, seguimiento, reactivacion y newsletter
- `.claude/skills/linkedin-supremo/` — Skill de LinkedIn: activa con `/linkedin-supremo` para auditar el perfil, escribir 30 posts listos y convertir conexiones en leads
- `.claude/skills/precio-perfecto/` — Skill de pricing: activa con `/precio-perfecto` para investigar la competencia, calcular el ROI del cliente y estructurar 3 paquetes con ancla psicologica
- `.claude/skills/reputacion-online/` — Skill de reputacion: activa con `/reputacion-online` para monitorear menciones, responder reviews negativos y gestionar crisis de reputacion
- `.claude/skills/webinar-machine/` — Skill de webinars: activa con `/webinar-machine` para generar el guion completo slide por slide, emails de registro y script del pitch de 60 minutos
- `.claude/skills/automatizador/` — Skill de automatizacion: activa con `/automatizador` para mapear procesos manuales y generar blueprints listos para Make, n8n o Zapier
- `.claude/skills/agente-autonomo/` — Skill de agentes autonomos: activa con `/agente-autonomo` para construir, configurar y lanzar agentes en la nube con Claude Managed Agents (platform.claude.com). Genera el prompt, selecciona conexiones MCP, estima el costo y entrega el checklist de lanzamiento
- `AGENTE-AUTONOMO-GUIDE.md` — Guia completa de Managed Agents: que son, cuanto cuestan, que pueden tocar, como crear la cuenta, los 5 agentes mas utiles para Estudio Oro y templates listos para copiar
- `PLAN-MAESTRO.md` — Plan completo de 6 fases para Estudio Oro S.A.S.: estabilizar, primer ingreso, automatizacion, productos digitales, expansion internacional y escala
- `STATUS.md` — Estado actual de todos los proyectos, URLs, agentes y proximos pasos. Actualizar despues de cada sprint
- `NARAKIA-SUPERPROMPT.md` — Superprompt maestro extendido del sistema NARAKIA: agentes (legal, inmobiliaria, finanzas, tecnologia), division completa de marketing (@MegaMark + 6 subagentes: SocialMediaManager, AdsSpecialist, SEOExpert, ContentCreator, EmailMarketer, AnalyticsMark), skills de ayuda (@HelpDesk, @TeamCoordinator, @OnboardingBot, @WorkflowAutomator), reuniones virtuales con @Lucrecia, memoria activa, autonomia proactiva, analisis financiero total y simulacion de caso complejo
- `narakia/prompts/marketing/` — 6 subagentes de @MegaMark con KPIs especificos: socialmedia, adsspecialist, seoexpert, contentcreator, emailmarketer, analyticsmark
- `narakia/prompts/help/` — 4 skills de ayuda: helpdesk, teamcoordinator, onboardingbot, workflowautomator
- `.claude/skills/seo-supremo/` — Skill SEO completo: activa con `/seo-supremo` para auditoria tecnica con Playwright, investigacion de keywords, analisis de competidores y plan de contenido 90 dias
- `.claude/skills/hiring-machine/` — Skill de contratacion: activa con `/hiring-machine` para redactar la oferta de trabajo, diseno del proceso de seleccion, scorecard y onboarding del primer dia
- `.claude/skills/retention-doctor/` — Skill de retencion: activa con `/retention-doctor` para diagnosticar el churn, calcular health scores, rescatar clientes en riesgo y disenar el programa de fidelizacion
- `.claude/skills/dashboard-live/` — Skill de metricas: activa con `/dashboard-live` para diseno del dashboard de KPIs, reporte semanal automatico y sistema de alertas del negocio
- `.claude/skills/lanzamiento-supremo/` — Skill de lanzamientos: activa con `/lanzamiento-supremo` para generar la estrategia de pre-lanzamiento, semana de ventas dia por dia y post-lanzamiento de 21 dias
- `.claude/skills/productizador/` — Skill de productizacion: activa con `/productizador` para convertir un servicio custom en un producto estandarizado con precio fijo, pagina de ventas y lista de espera
- `.claude/skills/caso-de-estudio/` — Skill de casos de exito: activa con `/caso-de-estudio` para transformar un resultado de cliente en contenido que genera nuevos clientes en 4 formatos (PDF, landing, LinkedIn, email)
- `.claude/skills/comunidad-builder/` — Skill de comunidades: activa con `/comunidad-builder` para disenar y lanzar una comunidad online con estructura, plan de 90 dias, engagement y monetizacion
- `.claude/skills/partnership-hunter/` — Skill de alianzas: activa con `/partnership-hunter` para encontrar socios estrategicos, redactar la propuesta de partnership y estructurar el acuerdo de referidos
- `.claude/skills/ia-para-ventas/` — Skill de ventas con IA: activa con `/ia-para-ventas` para calificar leads automaticamente, investigar prospectos, predecir cierres y analizar grabaciones de llamadas
- `.claude/skills/creador-de-cursos/` — Skill de cursos online: activa con `/creador-de-cursos` para disenar el curriculum completo, elegir plataforma y precio, y lanzar el curso con una masterclass
- `.claude/skills/modelo-de-negocio/` — Skill de estrategia: activa con `/modelo-de-negocio` para generar el Business Model Canvas, calcular unit economics (LTV/CAC) e identificar los riesgos criticos del modelo
- `.claude/skills/vibe-voice/` — Skill completo de Vibe Voice (SKILL.md + REFERENCE.md): instalacion automatica, 4 agentes de procesamiento (acta, ventas, legal, guion viral), flujos encadenados con /copywriter y /marketing-supremo, procesamiento por lotes y diagnostico de errores
- `.claude/skills/arquitecto-prompts/` — Sistema multi-agente de 9 subagentes que transforma cualquier idea en el prompt mas poderoso: 4 fases (Deconstruccion, Construccion, Generacion, Validacion), red-team adversarial, scoring 6 ejes (0-10), 3 variantes (Flash/Pro/Supremo), 50+ personas y anti-alucinacion inyectada. Activa con `/arquitecto-prompts`
- `HIGGSFIELD-MCP-GUIDE.md` — Guia completa del MCP oficial de Higgsfield: activacion, modelos (Seedance 2.0 + GPT Images 2.0), 5 inputs cinematograficos, 4 prompts por pilar de Estudio Oro, batch nocturno, flujos combinados y calendario semanal
- `.claude/skills/higgsfield-mcp/` — Skill Higgsfield MCP (SKILL.md + REFERENCE.md): activa con `/higgsfield` para generar imagen y video cinematografico desde Claude. 7 plantillas: [G1] still / [G2] clip Seedance / [G3] batch / [P1-P4] pilares Estudio Oro
- `.claude/skills/restore-blurry-photos/` — Skill de restauracion fotografica v3.0 con 12 superpoderes (Express, Pro, Batch, Forense, Retrato, Arquitectura, Auto-Detect, Comparacion, Legal Judicial, Producto, Golden Hour, Publicacion Express). Activacion automatica al detectar rutas de imagen o palabras clave. NanoBanana MCP + Google Gemini, salida 4K. Activa con `/foto-hd`, `/foto-pro`, `/foto-batch`, `/foto-forense`, `/foto-retrato`, `/foto-arq`, `/foto-compare`, `/foto-legal`, `/foto-producto`, `/foto-golden`, `/foto-social`
- `.claude/skills/orosa-jarvis/` — JARVIS: copiloto maestro del Dr. Diego Orosa para los 6 dominios de Estudio Oro S.A.S. 16 comandos especializados (/penal-escrito, /causa-status, /real-estate-dd, /honorarios-calc, /narakia-debug, /process-inbox, /estrategia-report, /uif-compliance, /lobo-brand, /marketing-campaign, /captacion-clientes, /finanzas-analisis, /redes-sociales, /tech-code, /multimedia-procesar, /weekly-connections, /generate-brief). Contexto maestro siempre activo: causa CCC 28.979/2020, IDs de produccion, normativa vigente, etica CPACF. Activa con `/orosa-jarvis`
- `.claude/skills/01-penal-escrito.md` — Skill de escritos penales: recursos, nulidades, sobreseimientos y apelaciones. Banco de jurisprudencia verificada (Rayford, Kirchner, Casal, Polak y 4 mas). Triggers: recurso, apelacion, casacion, sobreseimiento, imputado, excarcelacion
- `.claude/skills/02-inmobiliario.md` — Skill de due diligence inmobiliario: checklist registral completo (dominio, inhibiciones, deudas), semaforo de riesgo y clausulas para boleto. Triggers: due diligence, boleto, escritura, propiedad, hipoteca
- `.claude/skills/03-redes-sociales.md` — Skill de contenido para redes: Reels, LinkedIn, TikTok y ManyChat. Rotacion editorial semanal Estudio Oro + voz de Lobo Confiteria. Triggers: reel, guion, hook, instagram, linkedin, tiktok, carrusel
- `.claude/skills/04-tributario.md` — Skill tributario AFIP: Ganancias, IVA, Bienes Personales, monotributo, responsable inscripto, IIBB y fiscalizaciones. Triggers: afip, ganancias, iva, monotributo, impuesto, factura, declaracion jurada
- `.claude/skills/05-patrimonial.md` — Skill patrimonial y sucesiones: fideicomisos, donaciones, testamentos, acuerdos prenupciales y bien de familia con referencias al CCCN. Triggers: sucesion, herencia, fideicomiso, testamento, donacion
- `.claude/skills/06-schedule-agenda.md` — Skill de agenda editorial: presets /schedule listos para copiar, conversion UTC-3, tabla de decision de modelo por tarea. Triggers: /schedule, agenda semana, calendario editorial
- `.claude/skills/07-ultrathink.md` — Skill de extended thinking: cuando activar Opus 4.7, ejemplos concretos de Estudio Oro, combinacion con /schedule. Triggers: /ultrathink, piensa profundo, extended thinking, arquitectura
- `.claude/skills/08-marketing-ads.md` — Skill de Meta Ads y Google Ads: estructura de campanas, copy para servicios legales con compliance Argentina, metricas clave. Triggers: meta ads, google ads, campana publicitaria, publicidad paga
- `.claude/commands/schedule.md` — Comando /schedule: crea agentes recurrentes en la nube de Anthropic. Presets Estudio Oro, reglas UTC-3, integracion Make.com s4562335/s4561747
- `.claude/commands/ultrathink.md` — Comando /ultrathink: activa Opus 4.7 con extended thinking para analisis profundos y decisiones criticas
- `.claude/commands/skills-upgrade.md` — Comando /skills-upgrade: auditoria de 5 fases (inventario, evaluacion, gaps, plan, implementacion) para mejorar el sistema de skills

## PAGOKIT — ACTIVO AUTOMATICAMENTE

IMPORTANTE: El skill PAGOKIT se activa automaticamente cuando el usuario mencione:
pagos, checkout, metodo de pago, Stripe, Mercado Pago, MercadoPago, Wompi, Lemon Squeezy,
webhook de pagos, cobrar online, gateway de pagos, integrar pagos, suscripcion online,
refund, reembolso, portal del cliente, sistema de cobros, procesador de pagos,
instalar checkout, quiero cobrar, boton de pago, PSE, Nequi, OXXO, Boleto, Pix, Rapipago.

O cuando use: /pagokit /pagokit:start /pagokit:test /pagokit:doctor /pagokit-start /pagokit-test

AL ACTIVARSE:
1. Escanear el proyecto (framework, ORM, estructura existente)
2. Hacer las 3 preguntas de negocio (clientes, modelo de cobro, efectivo)
3. Seleccionar proveedor: Stripe / Mercado Pago / Wompi / Lemon Squeezy
4. Generar ~14 archivos usando plantillas de `.claude/skills/pagokit/REFERENCE.md`
5. Verificar los 5 candados de seguridad deterministicos

Plugin en: `agente-pagokit/` | Skill: `.claude/skills/pagokit/` | Guia: `PAGOKIT-GUIDE.md`

## OROSA-JARVIS — ACTIVO AUTOMATICAMENTE

IMPORTANTE: El skill OROSA-JARVIS esta activo y se activa automaticamente cuando el usuario mencione:
causa penal, CCC 28.979, narakia, Supabase, make.com, Lucrecia, Megan, bots WhatsApp,
honorarios, UMA, UIF, due diligence, escritura, boleto, lobo confiteria, Malabia,
Sologint, Escudo Patrimonial, estrategia, pilares de contenido, redes sociales,
expediente, PJN, CPACF, CASI, corredor inmobiliario, triple matricula.

O cuando use: /penal-escrito /causa-status /real-estate-dd /honorarios-calc
/narakia-debug /process-inbox /estrategia-report /uif-compliance /lobo-brand
/marketing-campaign /captacion-clientes /finanzas-analisis /redes-sociales
/tech-code /multimedia-procesar /weekly-connections /generate-brief /orosa-jarvis /jarvis

AL ACTIVARSE:
1. Cargar contexto maestro de identidad + causa activa + IDs de produccion
2. Ejecutar el comando solicitado usando REFERENCE.md para el prompt exacto
3. Aplicar reglas eticas: [VERIFICAR VIGENCIA] en normativa, [FUENTE REQUERIDA] en datos criticos
4. Output ejecutable sin relleno, en rioplatense

## Skills del Workflow — Estudio Oro

Los 8 skills numerados + 7 skills juridicos especializados se activan automaticamente por triggers. Estan en `.claude/skills/` con formato: YAML frontmatter + fases + reglas. Para auditarlos o mejorarlos usar `/skills-upgrade`.

### Skills numerados (contexto general Estudio Oro)

| # | Archivo | Se activa con | Uso |
|---|---|---|---|
| 01 | `01-penal-escrito.md` | recurso / apelacion / casacion / sobreseimiento / imputado | Escritos judiciales penales |
| 02 | `02-inmobiliario.md` | due diligence / boleto / escritura / propiedad / hipoteca | Due diligence inmobiliario |
| 03 | `03-redes-sociales.md` | reel / guion / instagram / linkedin / tiktok / hook | Contenido Estudio Oro + Lobo |
| 04 | `04-tributario.md` | afip / ganancias / iva / monotributo / impuesto / factura | Tributario y AFIP |
| 05 | `05-patrimonial.md` | sucesion / herencia / fideicomiso / testamento / donacion | Sucesiones y planificacion |
| 06 | `06-schedule-agenda.md` | /schedule / agenda semana / calendario editorial | Agenda automatica semanal |
| 07 | `07-ultrathink.md` | /ultrathink / piensa profundo / extended thinking | Opus razonamiento profundo |
| 08 | `08-marketing-ads.md` | meta ads / google ads / campana / publicidad paga | Campanas Meta y Google |

### Skills juridicos especializados (activacion por palabras clave)

| Skill | Comando | Se activa con | Uso |
|-------|---------|---------------|-----|
| `vencimientos-procesales/` | `/vencimientos` | vencimiento / plazo / dias habiles / prescripcion / contestar demanda / cuando vence / notificacion / cedula / cuanto tiempo tengo | Calcula plazos CPCCN, CPPF, LCT con ferias y feriados |
| `intereses-calc/` | `/intereses` | intereses / tasa activa / tasa pasiva / BNA / calcular intereses / desde el hecho / desde la mora / actualizar monto / indexar / intereses de la condena | Intereses judiciales por fuero (Samudio, CNAT Res 2/14) |
| `rag-juridico/` | `/rag` | busca jurisprudencia / buscar fallos / que dice la jurisprudencia / hay jurisprudencia sobre / busca en la base / consulta el RAG / fallos sobre / precedentes sobre | Consulta semantica al RAG Supabase juridico-search |
| `contrato-review/` | `/contrato-review` | revisa este contrato / analiza el contrato / que riesgos tiene / clausulas abusivas / que me conviene / revision de contrato / me conviene firmar esto | Auditoria express con semaforo 🔴🟡🟢⬜ |
| `dano-calc/` | `/dano-calc` | calcular danos / cuanto pedir / monto de la demanda / rubros de dano / incapacidad / lucro cesante / dano moral / cuanto vale / dano emergente / dano punitivo / cuantificar / valorar el dano | Calcula todos los rubros civiles (Marshall, CNCiv 2024-25) |
| `causa-inbox/` | `/causa-inbox` | nueva causa / ingreso de causa / nuevo cliente / expediente nuevo / intake / fichar cliente / dar de alta / cargar causa / nuevo caso / llego un expediente / registrar causa / abrir legajo | Intake completo: ficha CRM + prescripcion + legajo |
| `argus-gen/` | `/argus-gen` | genera el escrito / redacta la demanda / hace la contestacion / genera el recurso / escribe el escrito / arma la demanda / genera la apelacion / escrito judicial / demanda completa / contestar demanda | Genera escritos judiciales completos con RAG integrado |

### Comandos manuales (.claude/commands/)

| Comando | Para que sirve |
|---|---|
| `/schedule` | Crear agentes recurrentes en la nube Anthropic (siempre UTC-3) |
| `/ultrathink` | Activar Opus 4.7 con extended thinking |
| `/skills-upgrade` | Auditar y mejorar el sistema de skills (5 criterios) |
| `/narakia-debug` | Diagnosticar bots, Make.com, Supabase, webhooks caidos |
| `/process-inbox` | Procesar notas en 00-INBOX/, afilar y clasificar |
| `/oroga-brief` | Generar brief creativo: 3 conceptos, copy por plataforma, specs |

### Reglas globales de los skills

- Nunca inventar jurisprudencia, articulos o datos legales
- Nunca incluir API keys ni credenciales en ningun output
- Zona horaria: UTC-3 Argentina en todos los comandos /schedule
- Compliance legal Argentina: no prometer resultados, usar "puede ayudarte" no "ganara"
- Para actualizar un skill: editar directamente el .md o usar `/skills-upgrade`

## MAPA GLOBAL DE ACTIVACION — 150+ SKILLS ACTIVOS

REGLA: Cuando el usuario mencione cualquier palabra clave de la tabla, ACTIVAR el skill indicado SIN preguntar.
Si hay ambiguedad entre skills, activar el mas especifico primero y mencionar el alternativo.

---

### AGENTES NARAKIA — Sistema Multi-Agente Estudio Oro

Todos los agentes NARAKIA viven en `.claude/skills/narakia-*/SKILL.md`.
Activar con `@NombreAgente` o con las palabras clave de cada uno.

| Agente | Comando / Trigger | Cuando activar |
|--------|------------------|----------------|
| **Kairos** | `@Kairos` / `/narakia-kairos` / `modo boss` / `copiloto ejecutivo` / `briefing matutino` / `kairos legendario` / `dashboard interno` / `decision rapida` | Copiloto ejecutivo del Doctor — acceso total, sin filtros, responde "Doctor," |
| **Zeus** | `@Zeus` / `/narakia-zeus` / `decision estrategica` / `crecimiento del estudio` / `director ejecutivo` / `vision macro` | Director ejecutivo — decisiones de alto nivel y crecimiento |
| **Lucrecia** | `@Lucrecia` / `/narakia-lucrecia` / `coordinadora` / `asistente general` / `operaciones del estudio` | Coordinadora general Estudio Oro — WhatsApp Whapi |
| **Megan** | `@Megan` / `/narakia-megan` / `inversiones internacionales` / `Miami` / `activos en exterior` / `Uruguay` / `Espana inversiones` | Especialista inversiones internacionales |
| **Natalia** | `@Natalia` / `/narakia-natalia` / `tech specialist` / `automatizacion estudio` / `canal Meta` | Tech specialist — Meta Business API |
| **Valentina** | `@Valentina` / `/narakia-valentina` / `Valentina` | Agente Valentina del sistema NARAKIA |
| **Paula** | `@Paula` / `/narakia-paula` / `Paula` | Agente Paula del sistema NARAKIA |
| **MegaMark** | `@MegaMark` / `/narakia-megamark` / `estrategia de marketing digital` / `plan de marketing` / `campana digital completa` / `marketing 360` | Director de marketing digital — orquesta 6 subagentes |
| **SocialMedia** | `@SocialMediaManager` / `/narakia-socialmedia` / `calendario de redes` / `cronograma social` / `contenido para redes` / `programar posteos` / `social media plan` | Manager de redes sociales |
| **ContentCreator** | `@ContentCreator` / `/narakia-content-creator` / `generar copy` / `guion de contenido` / `posts para redes` / `crear contenido` / `repurposing` | Creador de contenido — copy, guiones, posts, emails |
| **AdsSpecialist** | `@AdsSpecialist` / `/narakia-ads` / `campana de ads` / `ad set` / `creatividades` / `ROI de ads` / `optimizar campana` / `presupuesto de publicidad` | Especialista en ads Meta y Google |
| **EmailMarketer** | `@EmailMarketer` / `/narakia-email-marketer` / `secuencia de emails` / `campana email` / `drip` / `automatizacion de correos` / `open rate` | Email marketer — secuencias, drip, newsletter |
| **SEOExpert** | `@SEOExpert` / `/narakia-seo-expert` / `palabras clave` / `trafico organico` / `posicionamiento` / `ranking en Google` / `keyword research` | Experto SEO — keywords, on-page, link building |
| **AnalyticsMark** | `@AnalyticsMark` / `/narakia-analytics` / `metricas de marketing` / `analytics` / `conversion rate` / `KPIs del funnel` / `medir resultados` | Analytics — metricas, conversion, dashboards |
| **ContaBot** | `@ContaBot` / `/narakia-contabot` / `asiento contable` / `libro diario` / `balance` / `estado de resultados` / `conciliacion bancaria` / `cierre contable` | Contador digital — asientos, balances, conciliacion |
| **Finxas** | `@Finxas` / `/narakia-finxas` / `flujo de caja` / `proyeccion financiera` / `analisis financiero` / `P&L` / `runway` / `unit economics` | Analista financiero — flujo de caja, proyecciones |
| **Capitalis** | `@Capitalis` / `/narakia-capitalis` / `portfolio de inversion` / `activos financieros` / `diversificar` / `renta fija` / `acciones` / `fondo de inversion` | Especialista en capital e inversiones |
| **Sologint** | `@Sologint` / `/narakia-sologint` / `inmueble` / `alquiler` / `venta de propiedad` / `tasacion` / `metro cuadrado` / `operacion inmobiliaria` | Agente inmobiliario — Sologint Malabia y proyectos |
| **OroTech** | `@OroTech` / `/narakia-orotech` / `codigo del sistema` / `edge function` / `bug en produccion` / `revisar Supabase` / `arreglar el bot` | Dev interno — code, Supabase, edge functions, bots |
| **Lexia** | `@Lexia` / `/narakia-lexia` / `documento legal` / `redactar contrato` / `clausula` / `minuta` / `revisar escrito judicial` | Asistente legal — redaccion de documentos y contratos |
| **Sabueso** | `@Sabueso` / `/narakia-sabueso` / `investigar` / `rastrear` / `encontrar informacion` / `buscar datos` / `due diligence de persona` | Investigador — research, OSINT, due diligence |
| **LeadHunter** | `@LeadHunter` / `/narakia-leadhunter` / `cazar leads` / `hunting` / `prospeccion` / `lista de contactos calificados` | Cazador de leads — scoring, enriquecimiento, prospecting |
| **GestorExpress** | `@GestorExpress` / `/narakia-gestorexpress` / `procesar expediente` / `gestionar rapido` / `tramitar` / `despachar` | Gestor rapido — procesa expedientes y tramites urgentes |
| **HelpDesk** | `@HelpDesk` / `/narakia-helpdesk` / `soporte al cliente` / `atender consulta` / `FAQ` / `responder pregunta frecuente` | Soporte — atiende consultas y FAQ del estudio |
| **TeamCoordinator** | `@TeamCoordinator` / `/narakia-teamcoordinator` / `organizar sprint` / `asignar tareas` / `coordinador de equipo` / `planning` / `seguimiento de tareas` | Coordinador — sprints, asignaciones, deadlines |

---

### DISENO WEB Y VISUAL

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `hyperframes` | `/hyperframes` | hyperframes / diseno modular / layout en frames / construir con hyperframes |
| `hyperframes-cli` | `/hyperframes-cli` | hyperframes CLI / instalar hyperframes / CLI de frames |
| `hyperframes-registry` | `/hyperframes-registry` | registry de hyperframes / registrar componente |
| `website-to-hyperframes` | `/website-to-hyperframes` | convertir sitio a hyperframes / migrar a frames / redesennar con hyperframes |
| `remotion-to-hyperframes` | `/remotion-to-hyperframes` | Remotion / animacion web / video con React / exportar animacion |
| `canvas-design` | `/canvas-design` | disenar en canvas / canvas de diseno / moodboard / explorar visual |
| `ui-ux-pro-max` | `/ui-ux-pro-max` | UI UX / interfaz de usuario / diseno de pantalla / mockup / componente visual |
| `algorithmic-art` | `/algorithmic-art` | arte algoritmico / generativo / arte con codigo / creative coding |
| `theme-factory` | `/theme-factory` | crear tema / factory de temas / CSS variables / design tokens / paleta de colores |
| `web-design-guidelines` | `/web-design-guidelines` | guia de diseno / design system / lineamientos visuales / brand guidelines |
| `graphify` | `/graphify` | grafico / chart / visualizacion de datos / dashboard visual / tabla dinamica |

---

### CODIGO Y DESARROLLO

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `express-patterns` | `/express-patterns` | patron Express / route / middleware / API route / Express.js |
| `protege-tu-app` | `/protege-tu-app` | seguridad de la app / vulnerabilidad / RLS / hardcodear / proteger endpoint |
| `construye-con-estructura` | `/construye-con-estructura` | construir con estructura / arquitectura de producto / scaffolding / boilerplate |
| `the-architect` | `/the-architect` | arquitecto / planear arquitectura / disenar sistema / arquitectura tecnica / tech design |
| `browser-harness` | `/browser-harness` | browser harness / controlar navegador / headless browser |
| `chrome-bridge-automation` | `/chrome-bridge-automation` | Chrome / automatizacion Chrome / extensiones Chrome / bridge |
| `playwright-cli` | `/playwright-cli` / `playwright` | playwright / testing browser / web testing / automatizacion web / scraping playwright |
| `all-deploy` | `/all-deploy` | deploy completo / desplegar todo / deployment full stack |
| `g-stack` | `/g-stack` | Google Apps / Google Workspace / Drive / Docs / Sheets / Gmail integrado |
| `estudio-oro-domain` | `/estudio-oro-domain` | dominio estudiooro / DNS / configurar dominio / estudiooro.com |
| `claude-api` | `/claude-api` | API de Claude / Anthropic SDK / prompt caching / integrar Claude en codigo / `import anthropic` |
| `agency-agents` | `/agency-agents` | agentes de agencia / equipo virtual de IA / multi-agente para clientes |

---

### DOCUMENTOS Y ARCHIVOS

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `pdf` | `/pdf` | PDF / generar PDF / leer PDF / convertir a PDF / extraer de PDF |
| `docx` | `/docx` | Word / documento Word / .docx / generar Word / exportar a Word |
| `xlsx` | `/xlsx` | Excel / planilla / spreadsheet / .xlsx / tabla de datos / calcular en Excel |
| `pptx` | `/pptx` | PowerPoint / presentacion / .pptx / slides / diapositivas |
| `doc-coauthoring` | `/doc-coauthoring` | coautoria / escribir en conjunto / colaborar en documento / co-redactar |
| `defuddle` | `/defuddle` | simplificar / reducir ruido / clarificar / quitarle lo innecesario / distil |

---

### MARKETING Y VENTAS AVANZADO

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `marketing-supremo` | `/marketing-supremo` | estrategia suprema de marketing / plan integral / marketing total |
| `humanizer` | `/humanizer` | humanizar texto / sonar humano / quitar frases de IA / reescribir natural |
| `claude-ads` | `/claude-ads` | ads con Claude / publicidad con IA / generar creatividades / copy de anuncio |
| `ads` | `/ads` | publicidad / campana / anuncio / ad / crear aviso |
| `content-autonomy` | `/content-autonomy` | contenido autonomo / publicar solo / sistema de contenido automatico |
| `oraculo-maestro` | `/oraculo-maestro` | oraculo / ver el panorama completo / estrategia macro / vision total del negocio |
| `arquitecto-de-ingresos` | `/arquitecto-de-ingresos` | monetizacion / generar ingresos / nuevas fuentes de ingreso / modelo de ingresos |
| `expertos-supremos` | `/expertos-supremos` | experto / consultor externo / panel de especialistas / segunda opinion |
| `lobo-confiteria` | `/lobo-confiteria` | Lobo / confiteria / Malabia / Lobo brand / identidad Lobo |

---

### SEO Y ANALYTICS

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `seo-audit` | `/seo-audit` | auditoria SEO / revisar SEO / score de SEO / problemas de SEO / technical SEO |
| `claude-seo` | `/claude-seo` | SEO con Claude / optimizar para buscadores / meta tags / estructura SEO |
| `orosa-audit` | `/orosa-audit` | auditoria del estudio / revisar todo / health check del sistema |
| `oroga-audit` | `/oroga-audit` | audit oro / revision completa del proyecto |

---

### AUTOMATIZACION Y FLUJOS

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `notificaciones-auto` | `/notificaciones-auto` | notificaciones automaticas / enviar alerta / notificar por WhatsApp / push notification |
| `comando-de-sistema` | `/comando-de-sistema` | system prompt / crear system prompt / arquitecto de prompts del sistema / definir comportamiento |
| `community-discovery` | `/community-discovery` | descubrir comunidad / buscar comunidad / comunidad de nicho / encontrar tribu |
| `json-canvas` | `/json-canvas` | canvas JSON / mapa visual en JSON / grafo de ideas / Obsidian canvas |
| `computer-use-dispatch` | `/computer-use` | controlar pantalla / computer use / automatizar desktop / controlar el mouse / manejar la PC |
| `oroga-brief` | `/oroga-brief` | brief creativo / hacer un anuncio / necesito un ad / brief de campana / quiero publicitar |
| `04-narakia-debug` | `/narakia-debug` | el bot no funciona / error en Make / Supabase 500 / webhook roto / Lucrecia no responde / debug del ecosistema |
| `05-process-inbox` | `/process-inbox` | procesa el inbox / afila las capturas / limpiar inbox / organizar notas / 00-INBOX |

---

### MEMORIA Y CONOCIMIENTO

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `mempalace` | `/mempalace` | memoria espacial / tecnica de memoria / memorizar / palacio mental |
| `memory-palace` | `/memory-palace` | memory palace / loci / memorizar con imagenes / tecnica de loci |
| `claude-memory` | `/claude-memory` | memoria persistente / guardar en memoria / recordar entre sesiones / base de conocimiento personal |
| `obsidian-cli` | `/obsidian-cli` | obsidian CLI / vault desde terminal / obsidian command line |
| `obsidian-bases` | `/obsidian-bases` | bases de datos Obsidian / database en Obsidian / Bases plugin |
| `obsidian-markdown` | `/obsidian-markdown` | markdown en Obsidian / formato Obsidian / wikilinks / callouts |
| `obsidian-vault` | `/obsidian-vault` | boveda / segunda cabeza / wiki / guardar conversacion / /save / /wiki |
| `aprende` | `/aprende` | aprender sobre / explicame / como funciona / tutorial / ensenname |
| `claude-canales` | `/claude-canales` | canales de Claude / como usar Claude / opciones de Claude |
| `herramientas-claude-code` | `/herramientas-claude-code` | herramientas de Claude Code / extensiones / superpoderes / tools para Claude |

---

### META-SKILLS — ECOSISTEMA KAIROS (auto-instalacion, memoria, forge)

| Skill | Comando | Activar cuando el usuario diga |
|-------|---------|-------------------------------|
| `kairos-supremo` | `/kairos-supremo` | kairos legendario / modo supremo / activa todo / modo dios / copiloto total / kairos maximo / @Kairos status / briefing del dia |
| `auto-installer` | `/auto-install` | instala los skills / configura el proyecto / setup automatico / quiero todos los skills / auto install / inicializar proyecto |
| `memory-engine` | `/memoria` | guardar en memoria / recordar esto / no olvides / estado de los proyectos / memoria del proyecto / carga el contexto / que recuerdas |
| `skill-forge` | `/skill-forge` | crea un skill para / necesito un skill que / forja un skill / fabrica un skill / genera un skill / nuevo skill para |
| `project-genesis` | `/project-genesis` | nuevo proyecto / bootstrapear proyecto / crear proyecto desde cero / inicializar proyecto nuevo / arrancar nuevo proyecto |

**Activacion automatica de Kairos Supremo:**
Kairos se activa al inicio de CADA sesion en este proyecto y ejecuta:
1. `memory-engine` → cargar estado de todos los proyectos
2. `kairos-sentinela` → check silencioso Vercel + Supabase + Make.com
3. `kairos-guard` → git fetch + estado de ramas + PRs abiertos
4. Dashboard comprimido: proyectos activos / alertas criticas / leads del dia / vencimientos 72hs / orden ejecutiva recomendada

---

### TABLA MAESTRA DE ACTIVACION RAPIDA (todos los skills en una linea)

```
/deep-research       → investiga / busca informacion / research / que es
/web-reader          → lee esta URL / analiza esta pagina / extraé de este sitio
/markitdown          → lee este PDF / analiza este archivo / convierte / lee este Word
/content-research    → escribi un articulo / redacta contenido / genera un post
/viral-radar         → tendencias virales / que esta viral / contenido viral
/vibecoding-101      → creá una app / construi un sitio / arma una web
/vercel-deploy       → deploya / subi a produccion / desplegá en Vercel
/frontend-design     → disenná el frontend / interfaz / UI / componentes visuales
/shadcn-ui           → componentes shadcn / shadcn / ui components
/gsap                → animacion GSAP / scroll animation / animá con GSAP
/building-components → construi un componente / componente reutilizable
/web-artifacts       → artefacto web / widget HTML / artefacto interactivo
/instant-landing     → landing page / pagina de captura / one-pager
/clonador-de-paginas → clona esta pagina / replica este sitio / copia el diseno
/copywriter          → corregir texto / hacer sonar natural / mejorar redaccion
/humanizer           → humanizar / quitar frases IA / sonar humano
/arquitecto-prompts  → construir prompt / mejorar prompt / prompt poderoso
/orchestration       → orquestar / multi-agente / coordinar agentes / maestro
/claude-maestro      → maestro / selecciona el skill / orquestador
/claude-turbo        → turbo / prompt eficiente / 5 pilares / modo supremo
/workflow-diario     → flujo del dia / tipo de dia / protocolo de dia
/switch-models       → cambiar modelo / que modelo usar / Haiku Sonnet Opus
/tokenizador         → tokens / costo API / cuanto cuesta / optimizar tokens
/pitch-deck          → pitch / presentacion para inversores / deck / 10 slides
/negociador-supremo  → negociacion / BATNA / ZOPA / tácticas de negociacion
/email-machine       → secuencia de email / cold outreach / drip / newsletter
/linkedin-supremo    → LinkedIn / perfil LinkedIn / 30 posts / conexiones
/precio-perfecto     → precio / pricing / 3 paquetes / cuanto cobrar
/reputacion-online   → reputacion / reviews / menciones / crisis de marca
/webinar-machine     → webinar / masterclass / clase online / guion de webinar
/automatizador       → automatizar / Make.com / n8n / Zapier / blueprint
/agente-autonomo     → agente en la nube / managed agent / lanzar agente
/seo-supremo         → auditoria SEO / keywords / plan de contenido 90 dias
/hiring-machine      → contratar / oferta de trabajo / proceso de seleccion
/retention-doctor    → churn / retencion / clientes que se van / fidelizacion
/dashboard-live      → KPIs / metricas / dashboard / reporte semanal
/lanzamiento-supremo → lanzamiento / pre-lanzamiento / semana de ventas
/productizador       → productizar / servicio estandarizado / precio fijo
/caso-de-estudio     → caso de exito / transformar resultado / testimonial
/comunidad-builder   → comunidad online / lanzar comunidad / engagement
/partnership-hunter  → alianzas / socios / referidos / partnership
/ia-para-ventas      → calificar leads / investigar prospectos / predecir cierres
/creador-de-cursos   → curso online / curriculum / plataforma de cursos
/modelo-de-negocio   → Business Model Canvas / LTV CAC / unit economics
/propuesta-suprema   → propuesta comercial / 3 variantes de precio / cotizacion
/funnel-doctor       → auditar funnel / landing page / reparar conversion
/script-doctor       → guion de video / guion viral / reescribir guion
/clone-competitor    → clonar competidor / analizar stack / estrategia clon
/primer-cliente      → primeros clientes / 10 clientes / adquisicion inicial
/multipoderes        → superpoderes / mision compleja / Supadata Apify Playwright
/vibe-voice          → transcribir / audio a texto / reunion / grabacion
/computer-use        → controlar pantalla / Computer Use / automatizar desktop
/oroga-brief         → brief creativo / hacer un anuncio / brief de campana
/narakia-debug       → bot no funciona / error Make / Supabase 500 / webhook roto
/process-inbox       → procesar inbox / organizar notas / 00-INBOX / afilar
/claude-memory       → memoria persistente / recordar entre sesiones / segunda cabeza
/obsidian-vault      → boveda obsidian / guardar conversacion / /save /wiki
/lead-hunter         → cazar leads / prospectos calificados / enriquecer lista
/scrapling           → Google Maps leads / scraping / base de datos negocios
/kairos-supremo      → kairos legendario / modo supremo / activa todo / @Kairos / briefing
/auto-install        → instala skills / configura proyecto / setup automatico / inicializar
/memoria             → guardar en memoria / recordar esto / estado del proyecto / que recuerdas
/skill-forge         → crea un skill para / necesito un skill que / forja un skill nuevo
/project-genesis     → nuevo proyecto / bootstrapear / crear proyecto desde cero / genesis
```

---

### REGLA DE PRIORIDAD ENTRE SKILLS

Cuando la solicitud puede activar varios skills, usar este orden:
1. **Skills juridicos** (causa activa, urgencia procesal) — prioridad maxima
2. **Kairos** (ordenes ejecutivas del Doctor) — segunda prioridad
3. **NARAKIA agents** (@NombreAgente explicito) — tercera prioridad
4. **Skills de herramientas** (segun la tarea especifica) — cuarta prioridad
5. **Skills de negocio** (estrategia, marketing, ventas) — quinta prioridad

Nunca interrumpir para preguntar cual skill usar — elegir el mas especifico y ejecutar.

## Conventions

- Documentation is written in Spanish
- Files use Markdown format
- Content is written without special characters (no accented vowels like a, e, i, o, u or n) for broad compatibility

## Prompt Improver — ACTIVO AUTOMATICAMENTE

IMPORTANTE: Antes de ejecutar CUALQUIER instruccion del usuario, DEBES aplicar el skill de evaluacion de prompts ubicado en `.claude/skills/prompt-improver.md`. Sigue estas reglas:

1. **Evalua cada prompt** del usuario antes de ejecutar. Clasifica como CLARO o VAGO segun los criterios del skill.
2. **Si es CLARO** (tiene archivos especificos, accion concreta, contexto suficiente): ejecuta directamente sin interrumpir.
3. **Si es VAGO** (terminos genericos, sin archivos, accion ambigua): haz entre 1 y 6 preguntas inteligentes antes de proceder. No ejecutes hasta tener respuestas.
4. **Bypass**: Si el prompt empieza con `*`, ejecuta directamente sin evaluar. Los comandos `/` y `#` se ignoran.
5. **No hagas preguntas innecesarias**: Si puedes inferir la respuesta del contexto del proyecto, no preguntes.

Este comportamiento es obligatorio en TODAS las interacciones con este repositorio.

## Ahorra Cuenta Claude — ACTIVO AUTOMATICAMENTE

IMPORTANTE: Monitorea el uso del plan en TODAS las conversaciones y actua automaticamente cuando detectes cualquiera de estas senales:

### Deteccion automatica de errores

1. **Mensajes de correccion detectados**: Si el usuario manda un mensaje que contenga frases como "hazlo diferente", "asi no", "no era eso", "prueba de nuevo", "cambialo", "modifica eso" — ANTES de ejecutar, muestra este aviso de una sola linea:
   > Tip: edita el mensaje original con el lapiz y dale regenerar en vez de mandar uno nuevo. Ahorra hasta 50% de tu plan.
   Luego ejecuta normalmente.

2. **Chat largo detectado**: Si la conversacion tiene mas de 20 intercambios, al inicio del siguiente mensaje agrega automaticamente:
   > Este chat ya tiene [N] mensajes. Cuando termines esta tarea, pide un resumen y abre un chat nuevo para no quemar plan innecesariamente.

3. **Preguntas separadas detectadas**: Si el usuario manda 2 o mas mensajes cortos (menos de 15 palabras) consecutivos sobre el mismo tema, en el segundo mensaje agrega:
   > Tip: junta tus preguntas en un solo mensaje para gastar menos plan.

4. **Solicitud directa**: Si el usuario menciona que su plan se acaba rapido, usa el skill completo en `.claude/skills/ahorra-cuenta-claude/SKILL.md`.

### Reglas del monitor

- Los avisos son UNA SOLA LINEA, nunca interrumpen el flujo de trabajo
- No repitas el mismo aviso dos veces en la misma sesion
- Si el usuario ya conoce los tips, no los repitas
- Bypass: si el prompt empieza con `*`, no muestres avisos de optimizacion
## Restore Blurry Photos — ACTIVO AUTOMATICAMENTE PARA IMAGENES

IMPORTANTE: Cuando el usuario proporcione archivos de imagen o mencione fotos deterioradas, activa AUTOMATICAMENTE el skill ubicado en `.claude/skills/restore-blurry-photos/SKILL.md`. Sigue estas reglas:

1. **Detecta rutas de imagen** — si el mensaje contiene una ruta terminada en `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp` o `.tiff`, activa el skill directamente.
2. **Detecta palabras clave** — activa si el usuario dice: "foto borrosa", "mejorar foto", "restaurar imagen", "foto vieja", "foto pixelada", "foto danada", "foto en HD", "foto 4K", "subir calidad", "mejorar calidad", "restaurar".
3. **Selecciona el modo automaticamente** segun el contexto:
   - Cara o persona visible -> Modo Retrato
   - Edificio, propiedad, interior -> Modo Arquitectura
   - Documento, contrato, texto -> Modo Forense
   - Carpeta o multiples imagenes -> Batch Supremo
   - Sin contexto claro -> Express (default)
4. **NO preguntes** si debe restaurar — si detecta imagen deteriorada, ejecuta directamente.
5. **Bypass**: si el usuario solo quiere VER o LEER la imagen sin restaurar, no activar.
6. **Combo automatico**: despues de restaurar, preguntar si quiere activar `/copywriter` para el caption o `/content-machine` para generar contenido con la foto mejorada.

Este comportamiento es OBLIGATORIO cuando se detectan imagenes o solicitudes de mejora fotografica.

## MarkItDown — ACTIVO AUTOMATICAMENTE PARA ARCHIVOS

IMPORTANTE: Antes de leer o analizar CUALQUIER archivo de tipo PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), imagen (.png, .jpg), audio (.mp3, .wav) o link de YouTube, DEBES usar el skill MarkItDown ubicado en `.claude/skills/markitdown/SKILL.md`. Sigue estas reglas:

1. **Detecta automaticamente** cuando el usuario proporciona un archivo pesado o link de YouTube.
2. **Verifica si MarkItDown esta instalado** con: `python -m markitdown --version`
3. **Instalalo si no esta** con: `pip install markitdown[all]`
4. **Convierte el archivo** con: `python -m markitdown /ruta/al/archivo`
5. **Usa el Markdown resultante** para responder — NUNCA leas el archivo binario directamente.
6. **Archivos de texto plano** (.txt, .md, .py, .js, codigo fuente): leelos directamente con Read, NO uses MarkItDown.

Este comportamiento ahorra hasta 90% de tokens en archivos pesados y es OBLIGATORIO en todas las sesiones de este repositorio.

## Auto Mode — ACTIVO AUTOMATICAMENTE

IMPORTANTE: Activar el skill `.claude/skills/auto-mode/SKILL.md` cuando el usuario mencione cualquiera de estas palabras o comandos:

PALABRAS CLAVE: auto mode, modo automatico, modo planeo, omision de permisos, shift+tab,
dangerously-skip-permissions, aceptar cada accion, cansado de aceptar, dejalo correr solo,
yolo mode, modo yolo, permisos claude, modos claude code, plan mode, skip permissions.

COMANDOS: /auto-mode /automode /plan-mode /yolo

AL ACTIVARSE (en este orden):
1. Mostrar la tabla de los 3 modos (Planeo / Automatico / Omision) con su activacion.
2. Diagnosticar en cual modo deberia estar el usuario segun su situacion actual.
3. Dar los pasos exactos de activacion (app o terminal segun contexto).
4. Recordar el flujo obligatorio: planeá primero → automatico → omision solo en sandbox.
5. Ofrecer correr `/fewer-permission-prompts` para pre-autorizar los permisos comunes del repo.

REGLAS:
- Si el usuario ya esta en Auto Mode y pregunta sobre Omision → advertir sobre sandboxes primero
- Si el usuario dice "se rompio algo" → ir directo a `git status` + `git restore` + volver a Planeo
- El skill de Auto Mode es COMPLEMENTARIO con KAIROS: /brief → Planeo → Automatico → /guard

---
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## NARAKIA INVARIANTS — BLINDAJE TOTAL — NO MODIFICAR SIN AUTORIZACION DE DIEGO

LEER OBLIGATORIAMENTE: `NARAKIA-INVARIANTS.md` antes de modificar cualquier edge function.

### Reglas criticas (resumen ejecutivo):

1. **wamid_dedup ATOMICO** — narakia-handler: siempre INSERT en tabla wamid_dedup (PK). NUNCA revertir a lectura de messages para dedup. Version minima: v87.
2. **HISTORIAL SIN FILTRO DE AGENTE** — narakia-handler: consulta por user_profile_id directo. NUNCA usar routerData.history ni filtrar por agent.
3. **SECRETOS EN ENV VARS** — NUNCA hardcodear API keys en codigo fuente. Usar Deno.env.get("NOMBRE").
4. **logError CON SEVERITY** — natalia-bot y megan-bot: siempre incluir severity="info|warning|error" y bot=BOT_NAME.
5. **BOSS_PHONES INMUTABLES** — Set: 5491140253204, 5491168777777, 5491168030066, 5491168199707. Solo Diego puede cambiarlos.
6. **STORAGE BUCKETS PRIVADOS** — documentos y voice-messages: public=false SIEMPRE.
7. **VAULT FUNCTIONS RESTRINGIDAS** — get_secret_by_name y get_vault_secret: EXECUTE solo para service_role, NUNCA anon.
8. **VISTAS SECURITY INVOKER** — v_alertas_activas, v_crm_funnel y otras: security_invoker=true, NUNCA security_definer.

**MERGE CONFLICTS:** en narakia-handler, natalia-bot, megan-bot, lucrecia-memoria → siempre mantener HEAD (version mas nueva). En reclamai/app/layout.tsx → verificar que NO haya imports duplicados.

Ver detalle completo con historial de bugs en: `NARAKIA-INVARIANTS.md`

## MEMORIA PERMANENTE DEL SISTEMA — LEER AL INICIO DE CADA SESION

### Estado actual de los bots (produccion activa — 2026-05-20)

| Bot | Archivo | Version | Canal | Supabase |
|-----|---------|---------|-------|----------|
| Natalia | natalia-bot/index.ts | v52 | Meta Business API WhatsApp | ver. 76 ACTIVE |
| Megan | megan-bot/index.ts | v39 | Meta Business API WhatsApp | ver. 63 ACTIVE |
| Narakia/Lucrecia | narakia-handler/index.ts | v90 | Whapi (numero regular) | ver. 156 ACTIVE |
| narakia-memory | narakia-memory/index.ts | v3 | interna (llamada por bots) | ver. 18 ACTIVE |
| daily-report | daily-report/index.ts | v2 | pg_cron 8am ARG (job ID 21) | ver. 2 ACTIVE |

### Capacidades de los bots (estado actual)

**LO QUE YA HACEN:**
- Transcriben mensajes de voz con OpenAI Whisper
- Anti-jailbreak pre-LLM (17 patterns) + blindaje en sistema prompt
- Boss mode separado: cuando Diego escribe, responden "Doctor," directo al punto
- Dedup atomico via wamid_dedup (narakia-handler)
- Historial de conversacion (conversation_history en natalia/megan, messages en narakia)
- Handoff automatico a Diego: urgencia penal, leads calientes, citas
- Scripts para: crisis penal, estafas/crypto, honorarios, Lobo, inversiones, Escudo Patrimonial

**IMPLEMENTADO 2026-05-19:**
- Lectura de imagenes via Claude Vision (Lucrecia v46, Megan v37): descarga, analiza, describe al cliente, avisa a Diego
- Videos: extrae audio con Whisper, avisa a Diego con transcripcion
- Documentos: acusa recibo, notifica a Diego con nombre del archivo
- Respuesta por voz TTS: cliente manda audio → bot responde en audio (ElevenLabs → Meta API upload → mensaje de voz). Fallback a texto si ElevenLabs no esta configurado

**IMPLEMENTADO 2026-05-20 (sesion 1):**
- natalia-bot v48 / megan-bot v38: fix critico dispatcher — salteaban todos los mensajes Meta por sig-check sin X-Hub-Signature (bug sistémico desde siempre)
- CTWA lead capture (v47+): detecta leads de anuncios Facebook/IG (full_name + email del formulario), los guarda en user_profiles, responde con nombre, alerta a Diego inmediatamente
- meta-dispatcher arquitectura documentada: webhook Meta → meta-dispatcher → natalia-bot/megan-bot/sabueso-bot por phone_number_id
- App ID Meta confirmado: 1012373314640367 (app: "Estudio Oro API"), phone 1137854822734580 = Lucrecia (+54 9 11 5869-6090 / Sologint)

**IMPLEMENTADO 2026-05-20 (sesion 2):**
- natalia-bot v49 / megan-bot v39: quality monitor post-generacion — checkResponseQuality() detecta y loguea a narakia_errors: respuesta_muy_corta, auto_revela_ia, auto_revela_modelo, contiene_no_puedo, sin_informacion_declarada, expone_error_tecnico, nombre_incorrecto_orosa, telefono_diego_expuesto, respuesta_excesiva. Solo notifica a Diego en errores criticos (severity=error)
- daily-report v1: nueva edge function que envia a Diego (via Whapi) metricas de 24h: mensajes por bot, leads Facebook Ads, citas coordinadas, handoffs activos, errores/warnings. Trigger: POST con Authorization: Bearer SERVICE_KEY o CRON_SECRET. Para activar diariamente: configurar pg_cron o escenario Make.com a las 8am ARG
- narakia-memory v3: resúmenes progresivos de contexto — get_context() comprime mensajes viejos (>25) con Claude Haiku en bloque de ~200 palabras, mantiene últimos 20 sin comprimir. Cache en user_profiles.memory_summary, TTL 8h. Nueva accion summarize para refresh manual
- daily-report v2: acepta pg_cron sin auth (rate limit 20min interno). pg_cron job ID 21 activado: 8am ARG diario
- ELEVENLABS_API_KEY: NO configurada como edge function secret — TTS deshabilitado, fallback a texto activo

**IMPLEMENTADO 2026-05-20 (sesion 3):**
- natalia-bot v52: Meta channel juega persona Natalia (tech specialist), no Lucrecia. forced_agent: "natalia". Welcome CTWA dice "Soy Natalia".
- narakia-handler v88: "natalia" agregado a SONNET_AGENTS (usaba Haiku por error, ahora usa Sonnet 4.6)
- Cross-channel dedup: narakia-handler posterga respuesta si last_channel="meta" y <2h (evita Natalia+Lucrecia en mismo cliente)
- natalia-bot v50 → v51 → v52: refactorizado como thin Meta adapter delegando 100% a narakia-handler

**BUGFIX 2026-05-20 (sesion 4):**
- narakia-handler v89/v90: fix CRITICO — duplicate `const forcedAgent` (rebase artifact) crasheaba todos los POST. Removido duplicado.
- narakia-handler v90: GET ?action=setup_webhook — llama PATCH https://gate.whapi.cloud/settings para re-registrar webhook Lucrecia
- Causa raiz del silencio de Lucrecia: webhook Whapi estaba apuntando a Make.com (hook.us2.make.com/chpb6...) en vez de a narakia-handler directo. Corregido.
- INVARIANTE NUEVO: webhook Whapi SIEMPRE debe apuntar a https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/narakia-handler. Si Lucrecia deja de responder, llamar GET /narakia-handler?action=setup_webhook para re-registrar.

### Identidad y personas

- **Lucrecia** (BOT_NAME="lucrecia"): coordinadora general Estudio Oro, bilingue esp/ing
- **Megan** (BOT_NAME="megan"): especialista inversiones internacionales (Miami/ESP/URY)
- NUNCA dicen que son IA/bot. NUNCA dicen "Estudio Orosa" (siempre "Estudio Oro")
- NUNCA dan opinion juridica formal. NUNCA comparten telefono de Diego sin pedido explicito

### Supabase project_id: moljmujlfvtsgkjbtwss
### Git branch activo: claude/estudio-oro-infrastructure-aBOL2
### Boss phone Diego: 5491140253204

### Historial de decisiones permanentes (NO re-debatir)

| Fecha | Decision | Razon | NO volver a proponer |
|-------|----------|-------|----------------------|
| 2026-05-19 | wamid_dedup via INSERT atomico, no SELECT previo | TOCTOU race condition causaba 2-3 respuestas por mensaje | Revertir a lectura de messages para dedup |
| 2026-05-19 | Historial de mensajes: consulta por user_profile_id SIN filtro de agente | Filtrar por agente causaba historial vacio al cambiar routing | Usar routerData.history ni filtrar por agent name |
| 2026-05-19 | BOSS_PHONES: 5491140253204, 5491168777777, 5491168030066, 5491168199707 | Solo Diego autoriza cambios | Cambiar sin consulta explicita a Diego |
| 2026-05-19 | Bots nunca dicen "Estudio Orosa" — siempre "Estudio Oro" | Nombre de marca correcto | Usar "Orosa" como nombre del estudio |
| 2026-05-19 | Bots nunca revelan que son IA/bot — identidad de persona siempre | Confianza del cliente | Agregar disclaimers de IA |
| 2026-05-19 | Storage buckets documentos y voice-messages: public=false siempre | Documentos legales y audios son privados | Cambiar a public=true estos buckets |
| 2026-05-19 | Vault functions: EXECUTE solo para service_role | Seguridad — nunca exponer secrets a anon | Otorgar EXECUTE a anon o authenticated |
| 2026-05-19 | Boss mode: cuando Diego escribe, responden "Doctor," + directo al punto | Diego quiere respuestas ejecutivas sin bienvenida | Tratar a Diego como cliente regular |
| 2026-05-19 | Voz TTS activada solo cuando el cliente mando un audio (isAudio=true) | No forzar audio en conversaciones de texto | Enviar voz en todos los mensajes |
| 2026-05-19 | JAILBREAK_HARD pre-LLM: si detecta patron → responder "¿En qué te puedo ayudar?" sin llamar a Claude | Ahorro de tokens + seguridad ante prompt injection | Dejar que Claude maneje jailbreaks sin filtro previo |

### Resumen Viajero — pegar al inicio de cualquier sesion nueva

```
CONTEXTO NARAKIA — Dr. Diego Orosa — Estudio Oro S.A.S.

BOTS EN PRODUCCION:
- Natalia (natalia-bot v52, Supabase ver.76): Meta Business API, agente tech/automatizacion del Estudio
- Megan (megan-bot v39, Supabase ver.63): Meta Business API, inversiones internacionales (Miami/ESP/URY)
- Narakia/Lucrecia (narakia-handler v88, Supabase ver.154): Whapi numero regular, coordinadora general
- narakia-memory v3 (ver.18): resúmenes progresivos con Haiku, cache en user_profiles
- daily-report v2 (ver.2): metricas diarias 8am ARG via pg_cron job ID 21

ARQUITECTURA DE CANALES:
- Meta Business API (1137854822734580) → natalia-bot → narakia-handler (forced_agent: natalia)
- Whapi (5491168777777) → narakia-handler directo → agente segun routing (default: lucrecia)
- natalia y lucrecia son PERSONAS DISTINTAS: natalia=tech/automatizacion, lucrecia=coordinadora general

CAPACIDADES (ya implementado):
- Vision: Claude Vision para imagenes, Whisper para audio/video, acuse de recibo para documentos
- Voz TTS: ElevenLabs → Meta upload → mensaje de voz (ELEVENLABS_API_KEY pendiente de configurar)
- Anti-jailbreak: 17 patrones pre-LLM bloqueados + blindaje en sistema prompt
- Boss mode: "Doctor," + ejecutivo sin intro cuando escribe Diego (5491140253204)
- CTWA lead capture: formularios Facebook Ads → user_profiles → welcome + alerta Diego
- Quality monitor: post-generacion detecta 9 tipos de respuestas problematicas
- Cross-channel dedup: user_profiles.last_channel + 2h TTL evita doble respuesta
- Resúmenes progresivos: narakia-memory get_context comprende historial >25 mensajes con Haiku

REGLAS INMUTABLES (ver NARAKIA-INVARIANTS.md):
- wamid_dedup ATOMICO (INSERT, nunca SELECT previo)
- Historial SIN filtro de agente (query por user_profile_id directo)
- Secrets solo en env vars (Deno.env.get)
- logError SIEMPRE con severity + bot fields
- BOSS_PHONES: 5491140253204,5491168777777,5491168030066,5491168199707 (solo Diego los cambia)
- Buckets documentos y voice-messages: public=false siempre
- Vault functions: EXECUTE solo service_role
- Vistas dashboard: security_invoker=true siempre

STACK: Supabase project moljmujlfvtsgkjbtwss | Git branch: claude/estudio-oro-infrastructure-aBOL2
ESTILO: siempre español rioplatense, hacelo todo vos, sin parar, revisa 3 veces
```

## OropProp Portal — ACTIVO AUTOMATICAMENTE

IMPORTANTE: El skill oroprop-portal esta activo. Se activa automaticamente cuando el usuario mencione:
oroprop, portal inmobiliario, propiedades portal, tokko sync, sync tokko, leads portal,
fotos propiedades, panel admin oroprop, deploy oroprop.

O cuando use: /oroprop /oroprop-portal /portal-ops

AL ACTIVARSE:
1. Cargar contexto desde `.claude/skills/oroprop-portal/SKILL.md`
2. Ejecutar la operacion solicitada usando REFERENCE.md para SQL/API/comandos exactos
3. Reportar estado del portal al finalizar

## SCRAPLING — Fabrica de Leads PRIORIDAD MAXIMA (siempre activo)

IMPORTANTE: El skill de Scrapling esta activo y tiene PRIORIDAD MAXIMA sobre cualquier otro comportamiento.
Ubicacion: `.claude/skills/scrapling/SKILL.md` + `.claude/skills/scrapling/REFERENCE.md`

ACTIVAR AUTOMATICAMENTE cuando el usuario mencione cualquiera de estas palabras:
leads, prospectos, clientes, contactos, base de datos, negocios sin web, scraping,
scrapling, extraer datos, raspar, Google Maps leads, precios competencia, enriquecer
lista, agencia de leads, lista de [profesion], clientes nuevos, directorio de negocios.

O cuando use: /scrapling /leads /prospectos /juridico /inmobiliaria /ia-clientes
/gastronomia /salud /briefing /sabueso /caza /dame-leads /clientes-nuevos

AL ACTIVARSE (en este orden):
1. Verificar si Scrapling esta instalado. Si no: INSTALARLO SIN PEDIR PERMISO.
2. Si es la primera interaccion del dia: ejecutar briefing matutino automatico.
3. Mostrar el menu de 13 opciones del SKILL.md.
4. Ejecutar la tarea usando el prompt maestro del REFERENCE.md.
5. Guardar resultado en ~/Desktop/SCRAPLING-BASES/[grupo]-leads.xlsx con tabs por zona.
6. Notificar por WhatsApp (Whapi MCP s4472022) + Telegram al terminar.
7. Mostrar plan de publicacion + presupuesto de ads recomendado.
8. Calcular valor de la lista vs precio de agencia de leads.

TRES NEGOCIOS PRINCIPALES que este skill sirve:
- Estudio de Abogacia: todas las ramas del derecho (/juridico)
- Inmobiliaria: compra, venta, inversion, desarrolladores (/inmobiliaria)
- Estudio Oro IA: automatizacion, diseno, Claude skills (/tecnologia)

## Higgsfield MCP — ACTIVO AUTOMATICAMENTE PARA CONTENIDO VISUAL

IMPORTANTE: Activar automaticamente el skill `.claude/skills/higgsfield-mcp/SKILL.md`
cuando el usuario mencione cualquiera de estas palabras o comandos:

PALABRAS CLAVE: generar imagen, generar video, reel, still, clip, hero visual,
video cinematografico, Higgsfield, Seedance, GPT Images, imagen para feed,
video para Instagram, contenido visual, assets de marca, batch nocturno de contenido.

COMANDOS: /higgsfield /higgsfield-mcp /video /imagen-cine /reel /still

AL ACTIVARSE:
1. Verificar que el MCP de Higgsfield este conectado (Settings -> Connectors).
2. Identificar el tipo de tarea: still / video / set de pilares / batch.
3. Recolectar los 5 inputs cinematograficos (o usar defaults).
4. Seleccionar el modelo correcto (Seedance para video, GPT Images para still).
5. Ejecutar usando las plantillas del REFERENCE.md.
6. Post-render: mini-ficha + oferta de flujo combinado (copywriter / content-machine).

PLANTILLAS DISPONIBLES EN REFERENCE.md:
- [G1] Still generico . [G2] Clip Seedance 5s . [G3] Batch nocturno
- [P1] Pilar Penal . [P2] Pilar Inmobiliario . [P3] Pilar Patrimonial . [P4] Pilar Internacional

## Repository Overview

This is a documentation repository for **Diego Orosa's digital agency**. It contains guides and reference materials — no application source code, build tools, or tests.

## Structure

- `AI-SKILLS-GUIDE.md` — Guide for installing and using AI skills (antigravity-awesome-skills) with AI agents like Claude Code, Cursor, and Gemini CLI
- `CLAUDE-CONTROL-REMOTO.md` — Guide for using Computer Use to control your computer with Claude (mouse, keyboard, screen)
- `DE-IDEA-A-CODIGO.md` — Guide for the idea-to-code workflow using Haiku, Sonnet, and Opus in sequence
- `CLAUDE-MODELOS-GUIDE.md` — Guide for the 3 Claude models (Haiku, Sonnet, Opus) and when to use each one to maximize your plan
- `CLAUDE-DISPATCH.md` — Guide for assigning tasks to Claude from your phone that execute on your computer
- `COMPUTER-USE-DISPATCH.md` — Combined guide: Computer Use (Claude controls your screen) + Dispatch (control Claude from your phone)
- `.claude/skills/computer-use-dispatch/` — The Computer Use Dispatch skill (SKILL.md + REFERENCE.md) with 10 specialized agents and 30+ ready-to-use workflows
- `CLAUDE-PILOTO-AUTOMATICO.md` — Guide for YOLO Mode, Hooks, GSD and Super Powers
- `CLAUDE-SKILLS-GUIDE.md` — Guide for creating and distributing custom Claude Skills
- `HERRAMIENTAS-CLAUDE-CODE.md` — Guide to 5 free open source tools for Claude Code (Superpowers, Everything Claude Code, UI UX Pro Max, claude-mem, n8n-MCP)
- `CLAUDE-SUPERPODERES.md` — Guide for 4 superpowers (Supadata, Apify, Last 30 Days, Playwright) that extend Claude Code capabilities
- `DISENADOR-WEB-DEFINITIVO.md` — Guide for combining 4 tools (UI/UX Pro Max GO, NanoBanana, Stitch, 21st Dev) to design professional web pages with Claude
- `MARKETING-SKILLS-GUIDE.md` — Guide for 33 marketing skills (coreyhaines31/marketingskills) covering CRO, copywriting, SEO, ads, email, and strategy
- `maia-skill/` — Multi-agent investment research skill for Claude Code
  - `SKILL.md` — Skill definition that orchestrates 5 specialized research agents
  - `REFERENCE.md` — JSON schemas and detailed agent instructions
  - `install.sh` — One-command installer
  - `dashboard/` — Node.js interactive dashboard (localhost:3420)
- `CLAUDE-COPYWRITER.md` — Guide for the Copywriter/Humanizer skill that detects 24 AI writing patterns and rewrites text to sound human
- `.claude/skills/copywriter/` — The actual Copywriter skill (SKILL.md + REFERENCE.md)
- `.claude/skills/tokenizador/` — Tokenizador skill: estima tokens, calcula costos API Claude (Haiku/Sonnet/Opus) y optimiza prompts para proyectos con la Anthropic API
- `.claude/skills/markitdown/` — MarkItDown skill: convierte PDF, Word, Excel, PowerPoint, imagenes, audio y YouTube a Markdown limpio antes de leerlos, ahorrando hasta 90% de tokens
- `CREA-AGENTES-CON-CLAUDE.md` — Guide for creating AI agents with Claude Code using Plan Mode, MCP, and /loop
- `APIS-MCPS-A2A.md` — Guide explaining APIs, MCP and A2A protocols for AI communication
- `COMIENZA-A-CONSTRUIR.md` — Community vault guide: free tools stack and business model for building client projects
- `ANTHROPIC-GITHUB.md` — Guide to Anthropic's 73+ open source repos on GitHub (SDKs, Cookbook, Quickstarts, Claude Code source, Skills, Agent SDKs)
- `ACADEMIA-CLAUDE.md` — Landing page for Anthropic's free official courses (Academia Claude)
- `CLAUDE-META-ADS.md` — Complete guide for Meta Marketing API integration with Claude Code
- `.mcp.json` — MCP server configuration for Meta Ads
- `src/utils/safety.py` — Safety guardrails and validation utilities for Meta Ads operations
- `logs/` — Audit logs for API write operations
- `VERCEL-SKILLS-GUIDE.md` — Guide for discovering and installing Vercel skills using skills.sh and find-skills
- `RUFLO-CLOUD-GUIDE.md` — Guide for Ruflo Cloud multi-agent orchestration platform (60+ agents, swarms, intelligent routing)
- `STACK-APP-MOVIL-IA.md` — Operational guide for building, monetizing and publishing a mobile AI app (Rork + Claude + Supabase + Stripe)
- `CONSTRUYE-CON-ESTRUCTURA.md` — Master prompt and guide for building products with structure using AI agents
- `ANIMACIONES-GUIDE.md` — Guide for creating videos with Remotion (setup, concepts, usage)
- `install.sh` / `install.ps1` — One-command installers (macOS/Linux and Windows)
- `scripts/bootstrap.sh` / `scripts/bootstrap.ps1` — Bootstrap scripts for project setup
- `output/agent-video-starter/` — Remotion starter project (React + TypeScript)
- `INSTANT-LANDING.md` — Express system for building a complete landing page with AI using a system prompt, 3 questions, and automated skills + build + validation
- `DE-IDEA-A-CODIGO.md` — Step-by-step workflow for turning any idea into a working project using Haiku, Sonnet, and Opus in sequence
- `CLAUDE-TOOLS-GUIDE.md` — Guide covering 5 free open source tools for Claude Code (Superpowers, Everything Claude Code, UI UX Pro Max, claude-mem, n8n-MCP)
- `MEJORA-PROMPTS-CLAUDE.md` — Guide for the prompt-improver plugin that evaluates prompt clarity before execution
- `STITCH-MCP-GUIDE.md` — Guide for configuring Google Stitch MCP to design UI interfaces with Claude
- `OBSIDIAN-CLAUDE.md` — Guide for using Obsidian as Claude's permanent memory with Markdown vaults
- `SKILL-BUILDER-META-SKILL.md` — Guide for the Skill Creator meta-skill that teaches how to create all other skills
- `SKILL-SEEKERS-OBSIDIAN.md` — Guide for using Skill Seekers, Obsidian, and obsidian-skills to build a private knowledge base for Claude
- `REPLICA-DISENOS-WEB.md` — Guide for replicating web designs using the UI UX Pro Max skill and a replication prompt
- `MENOS-CONTEXTO-CLAUDE.md` — Guide for context-mode, an open source tool that reduces Claude Code context consumption by up to 98%
- `CLON-SUPREMO-ORQUESTACION.md` — Guide for the AI Orchestration System with 28+ orchestrators, massive competition system and dynamic skill generation
- `.claude/skills/orchestration/` — The Orchestration skill (SKILL.md + REFERENCE.md) with 28+ specialized orchestrators
- `VIBE-VOICE-GUIDE.md` — Guia para transcribir audio y video gratis con Microsoft Vibe Voice + Claude (50+ idiomas, identificacion de hablantes, privacidad total, combo viral para creadores de contenido)
- `SKILL-SEEKERS-OBSIDIAN.md` — Guide for using Skill Seekers, Obsidian, and obsidian-skills to build a private knowledge base for Claude
- `.claude/skills/obsidian-vault/` — Skill Boveda: segunda cabeza con Claude y Obsidian. Comandos /wiki, /save, /autoresearch, /canvas, ingest. Guarda conversaciones, digiere archivos y conecta ideas con wikilinks automaticamente
- `MEJORA-PROMPTS-CLAUDE.md` — Guide for the prompt-improver plugin that evaluates prompt clarity before execution
- `.claude/skills/ahorra-cuenta-claude/` — Skill v2.0 que diagnostica los 5 errores basicos + 5 tecnicas avanzadas + checklist turbo para triplicar la duracion del plan
- `.claude/skills/claude-turbo/` — Arquitecto de prompts de maxima eficiencia: construye prompts con los 5 pilares, 25 picardias, Modo Supremo y REFERENCE.md con 7 plantillas listas
- `.claude/skills/claude-maestro/` — Orquestador maestro: analiza la tarea, selecciona el combo optimo de skills y tecnicas, y ejecuta el flujo completo automaticamente. Activa con `/maestro`
- `.claude/skills/workflow-diario/` — Protocolos de flujo de trabajo para 13 tipos de dia profesional (Legal, Contenido, Analisis, Codigo, Estrategia, Ventas, Admin, Mixto, Negociacion, Crisis, Pitch, Due Diligence, Onboarding). Mensajes de inicio, bloques y cierre listos para copiar. Activa con `/workflow-diario`
- `.claude/skills/claude-memory/` — Sistema de memoria persistente para Claude: 5 tipos de memoria, arquitectura CLAUDE.md recomendada, integracion con Obsidian, 5 tecnicas de memoria en sesion y plantillas listas para construir tu base de conocimiento personal
- `VIBE-VOICE-GUIDE.md` — Guia para transcribir audio y video gratis con Microsoft Vibe Voice + Claude (50+ idiomas, identificacion de hablantes, privacidad total, combo viral para creadores de contenido)
- `CLAUDE-MODELOS-SWITCH.md` — Guia para el skill switch-models que detecta automaticamente el modelo optimo para cada tarea y protege la cuota del plan
- `.claude/skills/switch-models/` — Switch Models skill (SKILL.md + REFERENCE.md): detecta mismatch tarea-modelo, saturacion de servidor y recomienda el cambio con el comando exacto
- `.claude/skills/vibe-voice/` — Skill de Vibe Voice: activa con `/vibe-voice` para guia interactiva de transcripcion segun el caso de uso (junta, ventas, legal, viral)
- `.claude/skills/multipoderes/` — Skill orquestador de los 5 superpoderes: activa con `/multipoderes` para misiones complejas que combinan Supadata, Apify, Last 30 Days, Playwright y Vibe Voice
- `.claude/skills/lead-hunter/` — Skill de caza de leads: activa con `/lead-hunter` para encontrar prospectos calificados con scraping, verificacion web e investigacion de noticias
- `.claude/skills/viral-radar/` — Skill de radar viral: activa con `/viral-radar` para detectar tendencias antes que exploten en cualquier nicho
- `.claude/skills/content-machine/` — Skill de maquina de contenido: activa con `/content-machine` para convertir 1 pieza de contenido en 10 formatos listos para publicar
- `.claude/skills/propuesta-suprema/` — Skill de propuestas ganadoras: activa con `/propuesta-suprema` para generar propuestas comerciales completas con investigacion del cliente, 3 variantes de precio y email de envio
- `.claude/skills/funnel-doctor/` — Skill de diagnostico de embudos: activa con `/funnel-doctor` para auditar landing pages, analizar ads activos y reparar donde se rompe la conversion
- `.claude/skills/script-doctor/` — Skill de guiones: activa con `/script-doctor` para diagnosticar y reescribir cualquier guion de video, podcast o pitch con patrones virales
- `.claude/skills/clone-competitor/` — Skill de clonacion de competidores: activa con `/clone-competitor` para analizar el stack completo de un competidor y generar la estrategia clon mejorada
- `.claude/skills/primer-cliente/` — Skill de adquisicion inicial: activa con `/primer-cliente` para encontrar los primeros 10 clientes en 48 horas con contacto directo, oferta irresistible y secuencia de seguimiento
- `scripts/install-vibe-voice.sh` — Script automatico de instalacion de Vibe Voice para Mac y Linux
- `scripts/install-vibe-voice.ps1` — Script automatico de instalacion de Vibe Voice para Windows (detecta ffmpeg, crea venv, instala dependencias)
- `.claude/skills/pitch-deck/` — Skill de pitch deck: activa con `/pitch-deck` para generar la estructura completa (10 slides, guion, investigacion de mercado) para inversores, clientes o demos
- `.claude/skills/negociador-supremo/` — Skill de negociacion: activa con `/negociador-supremo` para preparar, ejecutar y analizar negociaciones con BATNA, ZOPA, tacticas psicologicas y guion de apertura
- `.claude/skills/email-machine/` — Skill de emails: activa con `/email-machine` para escribir secuencias completas de cold outreach, drip, seguimiento, reactivacion y newsletter
- `.claude/skills/linkedin-supremo/` — Skill de LinkedIn: activa con `/linkedin-supremo` para auditar el perfil, escribir 30 posts listos y convertir conexiones en leads
- `.claude/skills/precio-perfecto/` — Skill de pricing: activa con `/precio-perfecto` para investigar la competencia, calcular el ROI del cliente y estructurar 3 paquetes con ancla psicologica
- `.claude/skills/reputacion-online/` — Skill de reputacion: activa con `/reputacion-online` para monitorear menciones, responder reviews negativos y gestionar crisis de reputacion
- `.claude/skills/webinar-machine/` — Skill de webinars: activa con `/webinar-machine` para generar el guion completo slide por slide, emails de registro y script del pitch de 60 minutos
- `.claude/skills/automatizador/` — Skill de automatizacion: activa con `/automatizador` para mapear procesos manuales y generar blueprints listos para Make, n8n o Zapier
- `.claude/skills/agente-autonomo/` — Skill de agentes autonomos: activa con `/agente-autonomo` para construir, configurar y lanzar agentes en la nube con Claude Managed Agents (platform.claude.com). Genera el prompt, selecciona conexiones MCP, estima el costo y entrega el checklist de lanzamiento
- `AGENTE-AUTONOMO-GUIDE.md` — Guia completa de Managed Agents: que son, cuanto cuestan, que pueden tocar, como crear la cuenta, los 5 agentes mas utiles para Estudio Oro y templates listos para copiar
- `PLAN-MAESTRO.md` — Plan completo de 6 fases para Estudio Oro S.A.S.: estabilizar, primer ingreso, automatizacion, productos digitales, expansion internacional y escala
- `STATUS.md` — Estado actual de todos los proyectos, URLs, agentes y proximos pasos. Actualizar despues de cada sprint
- `NARAKIA-SUPERPROMPT.md` — Superprompt maestro extendido del sistema NARAKIA: agentes (legal, inmobiliaria, finanzas, tecnologia), division completa de marketing (@MegaMark + 6 subagentes: SocialMediaManager, AdsSpecialist, SEOExpert, ContentCreator, EmailMarketer, AnalyticsMark), skills de ayuda (@HelpDesk, @TeamCoordinator, @OnboardingBot, @WorkflowAutomator), reuniones virtuales con @Lucrecia, memoria activa, autonomia proactiva, analisis financiero total y simulacion de caso complejo
- `narakia/prompts/marketing/` — 6 subagentes de @MegaMark con KPIs especificos: socialmedia, adsspecialist, seoexpert, contentcreator, emailmarketer, analyticsmark
- `narakia/prompts/help/` — 4 skills de ayuda: helpdesk, teamcoordinator, onboardingbot, workflowautomator
- `.claude/skills/seo-supremo/` — Skill SEO completo: activa con `/seo-supremo` para auditoria tecnica con Playwright, investigacion de keywords, analisis de competidores y plan de contenido 90 dias
- `.claude/skills/hiring-machine/` — Skill de contratacion: activa con `/hiring-machine` para redactar la oferta de trabajo, diseno del proceso de seleccion, scorecard y onboarding del primer dia
- `.claude/skills/retention-doctor/` — Skill de retencion: activa con `/retention-doctor` para diagnosticar el churn, calcular health scores, rescatar clientes en riesgo y disenar el programa de fidelizacion
- `.claude/skills/dashboard-live/` — Skill de metricas: activa con `/dashboard-live` para diseno del dashboard de KPIs, reporte semanal automatico y sistema de alertas del negocio
- `.claude/skills/lanzamiento-supremo/` — Skill de lanzamientos: activa con `/lanzamiento-supremo` para generar la estrategia de pre-lanzamiento, semana de ventas dia por dia y post-lanzamiento de 21 dias
- `.claude/skills/productizador/` — Skill de productizacion: activa con `/productizador` para convertir un servicio custom en un producto estandarizado con precio fijo, pagina de ventas y lista de espera
- `.claude/skills/caso-de-estudio/` — Skill de casos de exito: activa con `/caso-de-estudio` para transformar un resultado de cliente en contenido que genera nuevos clientes en 4 formatos (PDF, landing, LinkedIn, email)
- `.claude/skills/comunidad-builder/` — Skill de comunidades: activa con `/comunidad-builder` para disenar y lanzar una comunidad online con estructura, plan de 90 dias, engagement y monetizacion
- `.claude/skills/partnership-hunter/` — Skill de alianzas: activa con `/partnership-hunter` para encontrar socios estrategicos, redactar la propuesta de partnership y estructurar el acuerdo de referidos
- `.claude/skills/ia-para-ventas/` — Skill de ventas con IA: activa con `/ia-para-ventas` para calificar leads automaticamente, investigar prospectos, predecir cierres y analizar grabaciones de llamadas
- `.claude/skills/creador-de-cursos/` — Skill de cursos online: activa con `/creador-de-cursos` para disenar el curriculum completo, elegir plataforma y precio, y lanzar el curso con una masterclass
- `.claude/skills/modelo-de-negocio/` — Skill de estrategia: activa con `/modelo-de-negocio` para generar el Business Model Canvas, calcular unit economics (LTV/CAC) e identificar los riesgos criticos del modelo
- `.claude/skills/vibe-voice/` — Skill completo de Vibe Voice (SKILL.md + REFERENCE.md): instalacion automatica, 4 agentes de procesamiento (acta, ventas, legal, guion viral), flujos encadenados con /copywriter y /marketing-supremo, procesamiento por lotes y diagnostico de errores
- `.claude/skills/arquitecto-prompts/` — Sistema multi-agente de 9 subagentes que transforma cualquier idea en el prompt mas poderoso: 4 fases (Deconstruccion, Construccion, Generacion, Validacion), red-team adversarial, scoring 6 ejes (0-10), 3 variantes (Flash/Pro/Supremo), 50+ personas y anti-alucinacion inyectada. Activa con `/arquitecto-prompts`
- `HIGGSFIELD-MCP-GUIDE.md` — Guia completa del MCP oficial de Higgsfield: activacion, modelos (Seedance 2.0 + GPT Images 2.0), 5 inputs cinematograficos, 4 prompts por pilar de Estudio Oro, batch nocturno, flujos combinados y calendario semanal
- `.claude/skills/higgsfield-mcp/` — Skill Higgsfield MCP (SKILL.md + REFERENCE.md): activa con `/higgsfield` para generar imagen y video cinematografico desde Claude. 7 plantillas: [G1] still / [G2] clip Seedance / [G3] batch / [P1-P4] pilares Estudio Oro
- `.claude/skills/restore-blurry-photos/` — Skill de restauracion fotografica v3.0 con 12 superpoderes (Express, Pro, Batch, Forense, Retrato, Arquitectura, Auto-Detect, Comparacion, Legal Judicial, Producto, Golden Hour, Publicacion Express). Activacion automatica al detectar rutas de imagen o palabras clave. NanoBanana MCP + Google Gemini, salida 4K. Activa con `/foto-hd`, `/foto-pro`, `/foto-batch`, `/foto-forense`, `/foto-retrato`, `/foto-arq`, `/foto-compare`, `/foto-legal`, `/foto-producto`, `/foto-golden`, `/foto-social`
- `.claude/skills/orosa-jarvis/` — JARVIS: copiloto maestro del Dr. Diego Orosa para los 6 dominios de Estudio Oro S.A.S. 16 comandos especializados (/penal-escrito, /causa-status, /real-estate-dd, /honorarios-calc, /narakia-debug, /process-inbox, /estrategia-report, /uif-compliance, /lobo-brand, /marketing-campaign, /captacion-clientes, /finanzas-analisis, /redes-sociales, /tech-code, /multimedia-procesar, /weekly-connections, /generate-brief). Contexto maestro siempre activo: causa CCC 28.979/2020, IDs de produccion, normativa vigente, etica CPACF. Activa con `/orosa-jarvis`
- `.claude/skills/01-penal-escrito.md` — Skill de escritos penales: recursos, nulidades, sobreseimientos y apelaciones. Banco de jurisprudencia verificada (Rayford, Kirchner, Casal, Polak y 4 mas). Triggers: recurso, apelacion, casacion, sobreseimiento, imputado, excarcelacion
- `.claude/skills/02-inmobiliario.md` — Skill de due diligence inmobiliario: checklist registral completo (dominio, inhibiciones, deudas), semaforo de riesgo y clausulas para boleto. Triggers: due diligence, boleto, escritura, propiedad, hipoteca
- `.claude/skills/03-redes-sociales.md` — Skill de contenido para redes: Reels, LinkedIn, TikTok y ManyChat. Rotacion editorial semanal Estudio Oro + voz de Lobo Confiteria. Triggers: reel, guion, hook, instagram, linkedin, tiktok, carrusel
- `.claude/skills/04-tributario.md` — Skill tributario AFIP: Ganancias, IVA, Bienes Personales, monotributo, responsable inscripto, IIBB y fiscalizaciones. Triggers: afip, ganancias, iva, monotributo, impuesto, factura, declaracion jurada
- `.claude/skills/05-patrimonial.md` — Skill patrimonial y sucesiones: fideicomisos, donaciones, testamentos, acuerdos prenupciales y bien de familia con referencias al CCCN. Triggers: sucesion, herencia, fideicomiso, testamento, donacion
- `.claude/skills/06-schedule-agenda.md` — Skill de agenda editorial: presets /schedule listos para copiar, conversion UTC-3, tabla de decision de modelo por tarea. Triggers: /schedule, agenda semana, calendario editorial
- `.claude/skills/07-ultrathink.md` — Skill de extended thinking: cuando activar Opus 4.7, ejemplos concretos de Estudio Oro, combinacion con /schedule. Triggers: /ultrathink, piensa profundo, extended thinking, arquitectura
- `.claude/skills/08-marketing-ads.md` — Skill de Meta Ads y Google Ads: estructura de campanas, copy para servicios legales con compliance Argentina, metricas clave. Triggers: meta ads, google ads, campana publicitaria, publicidad paga
- `.claude/commands/schedule.md` — Comando /schedule: crea agentes recurrentes en la nube de Anthropic. Presets Estudio Oro, reglas UTC-3, integracion Make.com s4562335/s4561747
- `.claude/commands/ultrathink.md` — Comando /ultrathink: activa Opus 4.7 con extended thinking para analisis profundos y decisiones criticas
- `.claude/commands/skills-upgrade.md` — Comando /skills-upgrade: auditoria de 5 fases (inventario, evaluacion, gaps, plan, implementacion) para mejorar el sistema de skills

## PAGOKIT — ACTIVO AUTOMATICAMENTE

IMPORTANTE: El skill PAGOKIT se activa automaticamente cuando el usuario mencione:
pagos, checkout, metodo de pago, Stripe, Mercado Pago, MercadoPago, Wompi, Lemon Squeezy,
webhook de pagos, cobrar online, gateway de pagos, integrar pagos, suscripcion online,
refund, reembolso, portal del cliente, sistema de cobros, procesador de pagos,
instalar checkout, quiero cobrar, boton de pago, PSE, Nequi, OXXO, Boleto, Pix, Rapipago.

O cuando use: /pagokit /pagokit:start /pagokit:test /pagokit:doctor /pagokit-start /pagokit-test

AL ACTIVARSE:
1. Escanear el proyecto (framework, ORM, estructura existente)
2. Hacer las 3 preguntas de negocio (clientes, modelo de cobro, efectivo)
3. Seleccionar proveedor: Stripe / Mercado Pago / Wompi / Lemon Squeezy
4. Generar ~14 archivos usando plantillas de `.claude/skills/pagokit/REFERENCE.md`
5. Verificar los 5 candados de seguridad deterministicos

Plugin en: `agente-pagokit/` | Skill: `.claude/skills/pagokit/` | Guia: `PAGOKIT-GUIDE.md`

## OROSA-JARVIS — ACTIVO AUTOMATICAMENTE

IMPORTANTE: El skill OROSA-JARVIS esta activo y se activa automaticamente cuando el usuario mencione:
causa penal, CCC 28.979, narakia, Supabase, make.com, Lucrecia, Megan, bots WhatsApp,
honorarios, UMA, UIF, due diligence, escritura, boleto, lobo confiteria, Malabia,
Sologint, Escudo Patrimonial, estrategia, pilares de contenido, redes sociales,
expediente, PJN, CPACF, CASI, corredor inmobiliario, triple matricula.

O cuando use: /penal-escrito /causa-status /real-estate-dd /honorarios-calc
/narakia-debug /process-inbox /estrategia-report /uif-compliance /lobo-brand
/marketing-campaign /captacion-clientes /finanzas-analisis /redes-sociales
/tech-code /multimedia-procesar /weekly-connections /generate-brief /orosa-jarvis /jarvis

AL ACTIVARSE:
1. Cargar contexto maestro de identidad + causa activa + IDs de produccion
2. Ejecutar el comando solicitado usando REFERENCE.md para el prompt exacto
3. Aplicar reglas eticas: [VERIFICAR VIGENCIA] en normativa, [FUENTE REQUERIDA] en datos criticos
4. Output ejecutable sin relleno, en rioplatense

## Skills del Workflow — Estudio Oro

Los 8 skills numerados se activan automaticamente por triggers. Estan en `.claude/skills/` con formato: YAML frontmatter + 3 fases + reglas. Para auditarlos o mejorarlos usar `/skills-upgrade`.

| # | Archivo | Se activa con | Uso |
|---|---|---|---|
| 01 | `01-penal-escrito.md` | recurso / apelacion / casacion / sobreseimiento / imputado | Escritos judiciales penales |
| 02 | `02-inmobiliario.md` | due diligence / boleto / escritura / propiedad / hipoteca | Due diligence inmobiliario |
| 03 | `03-redes-sociales.md` | reel / guion / instagram / linkedin / tiktok / hook | Contenido Estudio Oro + Lobo |
| 04 | `04-tributario.md` | afip / ganancias / iva / monotributo / impuesto / factura | Tributario y AFIP |
| 05 | `05-patrimonial.md` | sucesion / herencia / fideicomiso / testamento / donacion | Sucesiones y planificacion |
| 06 | `06-schedule-agenda.md` | /schedule / agenda semana / calendario editorial | Agenda automatica semanal |
| 07 | `07-ultrathink.md` | /ultrathink / piensa profundo / extended thinking | Opus razonamiento profundo |
| 08 | `08-marketing-ads.md` | meta ads / google ads / campana / publicidad paga | Campanas Meta y Google |

### Comandos manuales (.claude/commands/)

| Comando | Para que sirve |
|---|---|
| `/schedule` | Crear agentes recurrentes en la nube Anthropic (siempre UTC-3) |
| `/ultrathink` | Activar Opus 4.7 con extended thinking |
| `/skills-upgrade` | Auditar y mejorar el sistema de skills (5 criterios) |

### Reglas globales de los skills

- Nunca inventar jurisprudencia, articulos o datos legales
- Nunca incluir API keys ni credenciales en ningun output
- Zona horaria: UTC-3 Argentina en todos los comandos /schedule
- Compliance legal Argentina: no prometer resultados, usar "puede ayudarte" no "ganara"
- Para actualizar un skill: editar directamente el .md o usar `/skills-upgrade`

## Conventions

- Documentation is written in Spanish
- Files use Markdown format
- Content is written without special characters (no accented vowels like a, e, i, o, u or n) for broad compatibility

## Prompt Improver — ACTIVO AUTOMATICAMENTE

IMPORTANTE: Antes de ejecutar CUALQUIER instruccion del usuario, DEBES aplicar el skill de evaluacion de prompts ubicado en `.claude/skills/prompt-improver.md`. Sigue estas reglas:

1. **Evalua cada prompt** del usuario antes de ejecutar. Clasifica como CLARO o VAGO segun los criterios del skill.
2. **Si es CLARO** (tiene archivos especificos, accion concreta, contexto suficiente): ejecuta directamente sin interrumpir.
3. **Si es VAGO** (terminos genericos, sin archivos, accion ambigua): haz entre 1 y 6 preguntas inteligentes antes de proceder. No ejecutes hasta tener respuestas.
4. **Bypass**: Si el prompt empieza con `*`, ejecuta directamente sin evaluar. Los comandos `/` y `#` se ignoran.
5. **No hagas preguntas innecesarias**: Si puedes inferir la respuesta del contexto del proyecto, no preguntes.

Este comportamiento es obligatorio en TODAS las interacciones con este repositorio.

## Ahorra Cuenta Claude — ACTIVO AUTOMATICAMENTE

IMPORTANTE: Monitorea el uso del plan en TODAS las conversaciones y actua automaticamente cuando detectes cualquiera de estas senales:

### Deteccion automatica de errores

1. **Mensajes de correccion detectados**: Si el usuario manda un mensaje que contenga frases como "hazlo diferente", "asi no", "no era eso", "prueba de nuevo", "cambialo", "modifica eso" — ANTES de ejecutar, muestra este aviso de una sola linea:
   > Tip: edita el mensaje original con el lapiz y dale regenerar en vez de mandar uno nuevo. Ahorra hasta 50% de tu plan.
   Luego ejecuta normalmente.

2. **Chat largo detectado**: Si la conversacion tiene mas de 20 intercambios, al inicio del siguiente mensaje agrega automaticamente:
   > Este chat ya tiene [N] mensajes. Cuando termines esta tarea, pide un resumen y abre un chat nuevo para no quemar plan innecesariamente.

3. **Preguntas separadas detectadas**: Si el usuario manda 2 o mas mensajes cortos (menos de 15 palabras) consecutivos sobre el mismo tema, en el segundo mensaje agrega:
   > Tip: junta tus preguntas en un solo mensaje para gastar menos plan.

4. **Solicitud directa**: Si el usuario menciona que su plan se acaba rapido, usa el skill completo en `.claude/skills/ahorra-cuenta-claude/SKILL.md`.

### Reglas del monitor

- Los avisos son UNA SOLA LINEA, nunca interrumpen el flujo de trabajo
- No repitas el mismo aviso dos veces en la misma sesion
- Si el usuario ya conoce los tips, no los repitas
- Bypass: si el prompt empieza con `*`, no muestres avisos de optimizacion
## Restore Blurry Photos — ACTIVO AUTOMATICAMENTE PARA IMAGENES

IMPORTANTE: Cuando el usuario proporcione archivos de imagen o mencione fotos deterioradas, activa AUTOMATICAMENTE el skill ubicado en `.claude/skills/restore-blurry-photos/SKILL.md`. Sigue estas reglas:

1. **Detecta rutas de imagen** — si el mensaje contiene una ruta terminada en `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp` o `.tiff`, activa el skill directamente.
2. **Detecta palabras clave** — activa si el usuario dice: "foto borrosa", "mejorar foto", "restaurar imagen", "foto vieja", "foto pixelada", "foto danada", "foto en HD", "foto 4K", "subir calidad", "mejorar calidad", "restaurar".
3. **Selecciona el modo automaticamente** segun el contexto:
   - Cara o persona visible -> Modo Retrato
   - Edificio, propiedad, interior -> Modo Arquitectura
   - Documento, contrato, texto -> Modo Forense
   - Carpeta o multiples imagenes -> Batch Supremo
   - Sin contexto claro -> Express (default)
4. **NO preguntes** si debe restaurar — si detecta imagen deteriorada, ejecuta directamente.
5. **Bypass**: si el usuario solo quiere VER o LEER la imagen sin restaurar, no activar.
6. **Combo automatico**: despues de restaurar, preguntar si quiere activar `/copywriter` para el caption o `/content-machine` para generar contenido con la foto mejorada.

Este comportamiento es OBLIGATORIO cuando se detectan imagenes o solicitudes de mejora fotografica.

## MarkItDown — ACTIVO AUTOMATICAMENTE PARA ARCHIVOS

IMPORTANTE: Antes de leer o analizar CUALQUIER archivo de tipo PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), imagen (.png, .jpg), audio (.mp3, .wav) o link de YouTube, DEBES usar el skill MarkItDown ubicado en `.claude/skills/markitdown/SKILL.md`. Sigue estas reglas:

1. **Detecta automaticamente** cuando el usuario proporciona un archivo pesado o link de YouTube.
2. **Verifica si MarkItDown esta instalado** con: `python -m markitdown --version`
3. **Instalalo si no esta** con: `pip install markitdown[all]`
4. **Convierte el archivo** con: `python -m markitdown /ruta/al/archivo`
5. **Usa el Markdown resultante** para responder — NUNCA leas el archivo binario directamente.
6. **Archivos de texto plano** (.txt, .md, .py, .js, codigo fuente): leelos directamente con Read, NO uses MarkItDown.

Este comportamiento ahorra hasta 90% de tokens en archivos pesados y es OBLIGATORIO en todas las sesiones de este repositorio.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
