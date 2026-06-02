# CLAUDE.md

## 🌐 REGLAS PERMANENTES DEL SISTEMA

> **IDIOMA: ESPAÑOL** — Responder SIEMPRE en español. Permanente. Ver: `.claude/memory/learned_patterns/user_preferences.json`

> **AUTONOMÍA: Nivel 5** — Kairos Legendario v2.0 activo. Config: `.claude/orchestration/kairos-legendario-config.json`

> **AUTO-FORMAT**: Prettier activo en cada edit de .js/.css/.html

> **MEMORIA**: Auto-commit al finalizar sesión.

---

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
