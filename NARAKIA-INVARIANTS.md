# NARAKIA INVARIANTS — BLINDAJE TOTAL
# Ultima actualizacion: 2026-05-19
# LEER ANTES DE MODIFICAR CUALQUIER EDGE FUNCTION

## REGLA MAESTRA
Si algo funciona y esta en esta lista: NO LO TOQUES.
Si un merge conflict afecta algo de esta lista: SIEMPRE mantener la version mas reciente (HEAD).

---

## [1] DEDUPLICACION WAMID — CRITICO
**Archivo:** supabase/functions/narakia-handler/index.ts
**Version minima:** v87 (Supabase version 151+)

USA: INSERT atomico en tabla `wamid_dedup` (PRIMARY KEY = wamid)
NO USAR: lectura previa de tabla `messages` para chequear duplicados

El bug original (TOCTOU): leer messages ANTES de guardar el mensaje nuevo
permite que N requests concurrentes pasen el chequeo y respondan N veces.
La solucion atomica: solo 1 INSERT puede ganar, los demas fallan con code=23505.

NUNCA revertir a: `supabase.from("messages").select("id").eq("whapi_message_id", ...)`

---

## [2] HISTORIAL SIN FILTRO DE AGENTE — CRITICO
**Archivo:** supabase/functions/narakia-handler/index.ts linea ~1097

USA: consulta directa por `user_profile_id` SIN .eq("agent", agentName)
NO USAR: routerData.history para usuarios no-boss

El bug original: el router filtraba historial por agente. Al cambiar el routing
(por keyword detection) el bot veia historial vacio y respondia como si fuera
la primera vez — "no reconoce el historial".

---

## [3] SECRETOS EN ENV VARS — OBLIGATORIO
**Archivos:** TODOS los edge functions

NUNCA hardcodear API keys, tokens ni secrets en el codigo fuente.
Usar siempre: Deno.env.get("NOMBRE_DEL_SECRET")

Funciones criticas ya corregidas:
- lucrecia-memoria v16+: ANTHROPIC_API_KEY, WHAPI_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

---

## [4] logError CON SEVERITY Y BOT — OBLIGATORIO
**Archivos:** natalia-bot (v45+), megan-bot (v36+)

SIEMPRE: logError(s, kind, payload, severity) con severity = "info"|"warning"|"error"
SIEMPRE: el campo bot en el payload debe ser el nombre del bot (BOT_NAME)
NUNCA simplificar a solo kind+payload sin severity

---

## [5] BOSS_PHONES — SOLO DIEGO PUEDE CAMBIAR
Set: 5491140253204, 5491168777777, 5491168030066, 5491168199707
Diego principal: 5491140253204 (+54 11 4025-3204)

---

## [6] STORAGE BUCKETS — PRIVADOS SIEMPRE
documentos: public=false (documentos legales de clientes)
voice-messages: public=false (audios de consultas)
NUNCA poner public=true en estos dos buckets.

---

## [7] VAULT FUNCTIONS — ACCESO RESTRINGIDO
get_secret_by_name: EXECUTE solo para service_role
get_vault_secret: EXECUTE solo para service_role
NUNCA otorgar EXECUTE a anon ni authenticated.

---

## [8] VISTAS DASHBOARD — SECURITY INVOKER
v_alertas_activas, v_crm_funnel, narakia_real_errors, v_gasboard_principal,
v_leads_calientes, v_gasboard_conversaciones: security_invoker=true
NUNCA cambiar a security_definer.

---

## HISTORIAL DE BUGS CRITICOS (para no repetir)

| Fecha | Bug | Causa | Fix |
|-------|-----|-------|-----|
| 2026-05-19 | Mensajes duplicados Whapi (2-3 respuestas por mensaje) | Race condition TOCTOU en dedup | INSERT atomico wamid_dedup |
| 2026-05-19 | Bot no reconoce historial | Router filtraba history por agente | Consulta directa por user_profile_id |
| 2026-05-19 | Secrets hardcodeados lucrecia-memoria | Codigo fuente con API keys literales | Env vars |
| 2026-05-19 | Vercel build error deploy-oro y reclamai | Import ClientWidgets duplicado en layout.tsx | Eliminar linea duplicada |
| 2026-05-19 | narakia_errors sin estructura | Sin campos severity ni bot | Migracion + logError actualizado |

---

## PROCEDIMIENTO ANTE MERGE CONFLICT EN ESTOS ARCHIVOS

1. narakia-handler/index.ts → SIEMPRE mantener HEAD (version mas nueva)
2. natalia-bot/index.ts → SIEMPRE mantener HEAD
3. megan-bot/index.ts → SIEMPRE mantener HEAD
4. lucrecia-memoria/index.ts → SIEMPRE mantener HEAD
5. reclamai/app/layout.tsx → verificar que NO haya imports duplicados

NUNCA usar --theirs en estos archivos sin verificar que la version "theirs" es mas nueva.
