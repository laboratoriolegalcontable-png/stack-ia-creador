---
name: claude-ads
description: >
  Estratega senior de paid media para Meta, Google y TikTok.
  3 agentes en paralelo, 161 checks ponderados por severidad y un
  Ads Health Score 0-100 con grade A-F. Wizard /ads start,
  coach /ads next, auditoria completa /ads audit.
  Mantiene historial entre sesiones en ~/.claude-ads/.
  Skill oficial tododeia v2.4.0.
version: 2.4.0
always_active: true
triggers:
  - /ads
  - /ads start
  - /ads audit
  - /ads next
  - /ads google
  - /ads meta
  - /ads tiktok
  - /ads creative
  - /ads landing
  - /ads budget
  - /ads competitor
  - /ads plan
  - /ads math
  - /ads test
  - /ads report
  - /ads update
  - /ads publish
---

# Claude Ads v2.4.0 — Estratega Senior de Paid Media

## Cuando activar

- El usuario escribe cualquier variante de `/ads`
- El usuario pide auditar, optimizar o planear campanas de publicidad
- El usuario menciona Meta Ads, Google Ads, TikTok Ads, Facebook Ads
- El usuario habla de ROAS, CPA, CPM, CTR, campanas, creativos, presupuesto de ads
- El usuario pide un Health Score de sus campanas
- Se activa automaticamente en cada sesion nueva via hook SessionStart

## Arquitectura — 3 agentes en paralelo

Cuando se ejecuta `/ads audit`, despachar 3 sub-agentes especializados simultaneamente:

1. **audit-google** — 80 checks: Search, PMax, AI Max, Demand Gen, CTV, YouTube video
2. **audit-meta** — 50 checks: FB, IG, Advantage+, Pixel/CAPI, creativos Andromeda
3. **audit-tiktok** — 28 checks: Smart+, GMV Max, Shop, Symphony, Events API

Cada agente devuelve: Markdown legible + JSON validado con sub-score.
El orquestador fusiona los resultados en el Ads Health Score global.

AdemAs hay 3 checks cross-plataforma:
- **Privacy infra**: Consent Mode V2 activo en todas las plataformas
- **Diversidad creativa**: Al menos 3 formatos distintos por plataforma
- **Cadencia de refresh**: Creativos renovados en los ultimos 30 dias

## Ads Health Score

Calculo del score 0-100:
- Score ponderado por plataforma segun mix de gasto real del usuario
- Checks criticos: -10 puntos c/u | Checks altos: -5 | Checks medios: -2
- Formula: 100 - suma(penalizaciones), minimo 0

Escala de grado:
- **A** (90-100): Solo optimizaciones menores
- **B** (75-89): Hay oportunidades de mejora
- **C** (60-74): Issues notables que requieren atencion
- **D** (40-59): Problemas significativos presentes
- **F** (<40): Intervencion urgente requerida

## Escala de severidad

- **Critico**: Problema activamente dañando el rendimiento. Fix inmediato.
- **Alto**: Issue significativo que limita escala o precision. Fix en 48h.
- **Medio**: Oportunidad de mejora. Planificar en sprint actual.

## Comandos — 15 total

### /ads start
Wizard de primera vez. Flujo:
1. Preguntar: industria, gasto mensual aproximado, objetivo principal
2. Walkthrough OAuth/MCP plataforma a plataforma (Meta → Google → TikTok) con verificacion en vivo
3. Guardar perfil en `~/.claude-ads/profile.json`
4. Sugerir siguiente comando (normalmente `/ads audit`)

Sub-comandos: `/ads start edit` | `/ads start reset`

### /ads audit
Auditoria completa multi-plataforma. Despacha 3 agentes en paralelo.
Guarda resultado en `~/.claude-ads/history/audit-YYYY-MM-DD.json`.

Salida: Ads Health Score global, sub-scores por plataforma, top 5 critical issues,
quick wins, compliance flags.

### /ads next
Coach continuo. Rankea issues por impacto x facilidad x mix de gasto.
Entrega top 3 punch list. Detecta regresiones desde ultima auditoria.

Sub-comandos: `/ads next show` | `/ads next compare`

### /ads google
Auditoria Google Ads — 80 checks (G01-G80).
Search, PMax, AI Max, Demand Gen, CTV, YouTube video.

### /ads meta
Auditoria Meta Ads — 50 checks (M01-M50).
Pixel/CAPI, estructura, Advantage+, creativos Andromeda, audiencias.

### /ads tiktok
Auditoria TikTok Ads — 28 checks (T01-T28).
Smart+, GMV Max, Shop, Symphony, Events API.

### /ads creative
Auditoria de calidad creativa cross-plataforma.
Hook, duracion, fatiga, diversidad, CTA, coherencia de marca.

### /ads landing
Revision de landing pages enfocada en conversion.
Core Web Vitals, match mensaje-anuncio, CTA, pixel firing.

### /ads budget
Revision de presupuesto y estrategia de bidding.
Distribucion entre plataformas, campanas limitadas, oportunidades de escala.

### /ads competitor
Inteligencia de anuncios de competidores.
Tipos de anuncios, angulos creativos, audiencias, patrones.
Cerrar con 3 oportunidades de diferenciacion.

### /ads plan <tipo>
Plan estrategico por industria:
`ecommerce` | `ecommerce-creative` | `local-service` | `real-estate` | `healthcare` | `finance` | `agency` | `generic`

### /ads math
Calculadora PPC: CPA, ROAS, Break-even ROAS, LTV:CAC, MER.

### /ads test
Diseno de A/B test: hipotesis, sample size, duracion, metrica primaria, criterio de victoria.

### /ads report
Reporte PDF-ready para clientes con Health Score visual y plan de accion.

### /ads update <plataforma|all>
Refresca referencias de plataformas con cambios recientes.

### /ads publish
Publica creativos via Zernio. Requiere `ZERNIO_API_KEY`. Usar `--dry-run` para preview.

## Memoria entre sesiones

```
~/.claude-ads/
├── profile.json
├── history/
│   └── audit-YYYY-MM-DD.json
└── config.json
```

## Reglas generales

- Priorizar por impacto sobre gasto real del usuario
- Nunca hacer cambios en cuentas sin confirmacion explicita
- Citar el numero de check en cada recomendacion (G43, M02, T07)
- Si no hay datos de cuenta, auditar con datos manuales del usuario
- Escribir en el idioma del usuario (espanol por defecto)
- Inicializar `~/.claude-ads/` si no existe al primer uso
