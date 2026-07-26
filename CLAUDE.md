# CLAUDE.md

## 🌐 REGLAS PERMANENTES DEL SISTEMA

> **IDIOMA: ESPAÑOL** — Responder SIEMPRE en español. Permanente. Ver: `.claude/memory/learned_patterns/user_preferences.json`

> **AUTONOMÍA: Nivel 5** — Kairos Legendario v2.0 activo. Config: `.claude/orchestration/kairos-legendario-config.json`

> **AUTO-FORMAT**: Prettier activo en cada edit de .js/.css/.html

> **MEMORIA**: Auto-commit al finalizar sesión.

---

## Notas operativas (2026-07-21)

**MCP servers "harness" y "claude-code-ultimate-guide" removidos de `.mcp.json`.**
Apuntaban a rutas locales (`/home/user/mcp-server/build/index.js` y
`/home/user/claude-code-ultimate-guide/mcp-server/dist/index.js`) que no existen en
entornos remotos/efímeros — solo funcionaban si esos repos estaban clonados en tu
máquina local. `harness` además tenía `HARNESS_API_KEY` sin valor configurado. Si los
necesitás en tu compu local, volvé a agregarlos a `.mcp.json` con las rutas reales de
esa máquina (no hardcodear rutas absolutas de un entorno específico en el repo).

**Colisión de triggers entre skills (auditorías).** Hay ~37 skills cuya `description`
menciona "audit"/"auditoría" (SEO, base de datos, seguridad de código, sobre-ingeniería,
sistema). Si el pedido es ambiguo ("auditá esto"), Claude puede disparar la skill
equivocada. Al pedir una auditoría, especificar el dominio: "auditoría de seguridad"
(`cyber-neo`), "auditoría de base de datos" (`db-audit`), "auditoría SEO" (`audit`/
`seo-orchestrator`), "auditoría de sobre-ingeniería" (`ponytail-audit`), "chequeo
production-ready de DB" (`db-checklist`).

Todas las sub-skills de `claude-db` usan prefijo `db-*` (db-audit, db-fix, db-score,
db-design, db-start, db-checklist, db-explain, db-migrate, db-next, db-seed,
db-introspect, db-stack-detect, db-orchestrator + las ~22 db-* de auditoría
especializada) para evitar choques con nombres genericos de otras skills.

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## NARAKIA INVARIANTS — BLINDAJE TOTAL — NO MODIFICAR SIN AUTORIZACION DE DIEGO

LEER OBLIGATORIAMENTE: `NARAKIA-INVARIANTS.md` antes de modificar cualquier edge function.

### Reglas criticas (resumen ejecutivo):

1. **wamid_dedup ATOMICO** — narakia-handler: siempre INSERT en tabla wamid_dedup (PK). NUNCA revertir a lectura de messages para dedup. Version minima: v87.
2. **HISTORIAL SIN FILTRO DE AGENTE** — narakia-handler: consulta por user_profile_id directo. NUNCA usar routerData.history ni filtrar por agent.
3. **SECRETOS EN ENV VARS** — NUNCA hardcodear API keys en codigo fuente. Usar Deno.env.get("NOMBRE").
4. **logError CON SEVERITY** — natalia-bot y megan-bot: siempre incluir severity="info|warning|error" y bot=BOT_NAME.
5. **BOSS_PHONES INMUTABLES** — Set: 5491140253204, 5491168777777, 5491158696090, 5491168199707. Solo Diego puede cambiarlos. La env var BOSS_PHONES de Supabase manda sobre el fallback del codigo: ante un cambio, actualizar el secret + verificar el codigo DESPLEGADO (el repo puede estar atras del deploy).
6. **STORAGE BUCKETS PRIVADOS** — documentos y voice-messages: public=false SIEMPRE.
7. **VAULT FUNCTIONS RESTRINGIDAS** — get_secret_by_name y get_vault_secret: EXECUTE solo para service_role, NUNCA anon.
8. **VISTAS SECURITY INVOKER** — v_alertas_activas, v_crm_funnel y otras: security_invoker=true, NUNCA security_definer.

**MERGE CONFLICTS:** en narakia-handler, natalia-bot, megan-bot, lucrecia-memoria → siempre mantener HEAD (version mas nueva). En reclamai/app/layout.tsx → verificar que NO haya imports duplicados.

Ver detalle completo con historial de bugs en: `NARAKIA-INVARIANTS.md`
