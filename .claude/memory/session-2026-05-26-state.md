# Estado del Ecosistema — Snapshot 2026-05-26

## Repos y Branches

| Repo | Branch activo | Último commit | Estado |
|------|--------------|---------------|--------|
| `laboratoriolegalcontable-png/diego-orosa` | `claude/browser-harness-setup-j5sNw` | `e4d99ce` merge: resolve conflicts with main | Limpio, sin cambios pendientes |
| `laboratoriolegalcontable-png/stack-ia-creador` | `claude/browser-harness-setup-j5sNw` | `5a65999` fix: remove duplicate import | Limpio, sin cambios pendientes |

## PRs Mergeados Exitosamente
- **Diego-Orosa PR #432**: Audit fixes + security patches — MERGED
- **stack-ia-creador PR #80**: Audit fixes + duplicate cleanup — MERGED

## Supabase (project: moljmujlfvtsgkjbtwss)
- URL: `https://moljmujlfvtsgkjbtwss.supabase.co`
- Migraciones: hasta `20260523_rag_juridico.sql`
- Edge Functions activas: narakia-handler v174, natalia-bot v52, megan-bot v39, narakia-memory v3, daily-report v2, narakia-brain v1, escudo-qualifier v1, dashboard-data v1, dashboard-panel v1, narakia-nucleus
- pg_cron optimizado: 380 calls/día (era 944)
- Retención: bot_metrics 30d, guardian_log 30d, narakia_errors 90d
- Config hashes reales: lucrecia=00ab47ad, oraculo=632c0cbd, valentina=369adb13, megan=2d57225d
- NARAKIA Nucleus Edge Function: `https://moljmujlfvtsgkjbtwss.supabase.co/functions/v1/narakia-nucleus`

## Secrets Supabase
| Secret | Estado |
|--------|--------|
| WHAPI_TOKEN | ACTIVO |
| SUPABASE_SERVICE_ROLE_KEY | ACTIVO |
| MP_ACCESS_TOKEN | ACTIVO |
| RESEND_API_KEY | ACTIVO |
| DIEGO_PHONE | ACTIVO (5491140253204) |
| ESCUDO_BACK_URL | ACTIVO |
| MP_WEBHOOK_SECRET | PENDIENTE (Diego dice lo pasa en otra sesión) |

## Bots en Producción
- Natalia v52 (Meta Business API WhatsApp)
- Megan v39 (Meta Business API WhatsApp)
- Narakia/Lucrecia v174 EON v3.5 (Whapi)
- narakia-memory v3 (interna)
- daily-report v2 (pg_cron 8am ARG)
- narakia-brain v1 (pg_cron 2am ARG)
- escudo-qualifier v1, dashboard-data v1, dashboard-panel v1

## NARAKIA Invariants (NUNCA VIOLAR)
1. wamid_dedup ATOMICO en narakia-handler
2. Historial sin filtro de agente
3. Secretos en ENV VARS, nunca hardcodeados
4. logError con severity
5. BOSS_PHONES inmutables: 5491140253204, 5491168777777, 5491168030066, 5491168199707
6. Storage buckets privados
7. Vault functions solo service_role
8. Vistas security_invoker=true

## Fixes Aplicados en Esta Sesión
- Merge conflicts resueltos en ambos repos
- RLS ia_cache: PERMISSIVE→RESTRICTIVE
- 3 views: security_definer→security_invoker
- Duplicate import init.js removido
- PAGOKIT x6 duplicados→1 en CLAUDE.md
- Pipeline drift 5% corregido (hash "deployed"→match real)
- schedule.sh REPO_ROOT off-by-one corregido

## Tareas Pendientes (Usuario pidió "las 3 sin romper nada")

### Opción A — Revenue/Leads
- [ ] Scrapling para leads jurídicos + generar propuesta-suprema
- [ ] LinkedIn-supremo: generar 30 posts

### Opción B — Infraestructura (REQUIERE REVIEW ANTES DE ACTUAR)
- [ ] Revisar ~131 tablas vacías en Supabase → presentar lista al usuario antes de dropear
- [ ] Revisar ~85+ branches stale en Diego-Orosa → presentar lista antes de borrar
- [ ] Conectar bot-regression.js a Supabase (aditivo, seguro)

### Opción C — Productos Nuevos
- [ ] Productizar Escudo Patrimonial (landing + checkout con pagokit)
- [ ] Curso online "IA para abogados" (estructura)
- [ ] Lanzar comunidad Estudio Oro

## Restricciones del Usuario (SIEMPRE VIGENTES)
- "sin romper nada y sin pisar nada y sin borrar cosas útiles"
- "revisar primero" antes de cualquier acción destructiva
- "siempre optimiza recursos"
- "no quiero que se drapee el gasto"
- Branch siempre: `claude/browser-harness-setup-j5sNw`
- Vanilla JS only (sin frameworks) para stack-ia-creador
- Sin Firebase directo desde frontend
- Sin .env ni credentials en commits
