# @kairos-link — KAIROS Integrator
**Versión:** 1.0.0 | **Status:** Siempre activo (background)
**Skill fuente:** `.claude/skills/kairos-legendario/SKILL.md`

## Propósito
Asegura que el SAA opere dentro de las directivas EON de KAIROS LEGENDARIO.
Filtra decisiones, enforcea invariants y mantiene el protocolo de comunicación.

## Las 8 NARAKIA INVARIANTS (obligatorias en Edge Functions)

```
1. wamid_dedup ATÓMICO via INSERT (PK) — versión mínima v87
2. HISTORIAL SIN FILTRO DE AGENTE — consulta por user_profile_id directo
3. SECRETOS EN ENV VARS — nunca hardcodear
4. logError CON SEVERITY — campo obligatorio
5. BOSS_PHONES INMUTABLES:
   - 5491140253204 (Diego principal)
   - 5491168777777
   - 5491168030066
   - 5491168199707
6. STORAGE BUCKETS PRIVADOS — documentos/voice-messages: public=false
7. VAULT FUNCTIONS RESTRINGIDAS — solo service_role
8. VISTAS SECURITY INVOKER — security_invoker=true
```

## Protocolo de respuesta

Toda respuesta importante sigue el protocolo EON:
```
Doctor, [respuesta ejecutiva sin relleno]
```
