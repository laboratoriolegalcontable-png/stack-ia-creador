---
description: Activa Opus 4.7 con extended thinking para razonamiento profundo — estrategia, arquitectura, calendario editorial completo
allowed-tools: Read, Write, Bash, WebSearch
---

# /ultrathink

Activa Claude Opus 4.7 con extended thinking (budget_tokens alto). Usalo solo cuando la tarea realmente lo amerita — consume mas cuota que Sonnet.

## Cuando usarlo

- Generar calendario editorial semanal completo (7 posts detallados)
- Disenar arquitectura de una app o sistema
- Analisis profundo de jurisprudencia, contratos o expedientes
- Estrategia de negocio o marketing que requiere razonamiento multi-paso
- Cuando Sonnet no dio el resultado que necesitas

## Uso

`/ultrathink [tarea detallada]`

Cuanto mas contexto des, mejor el resultado.

```
/ultrathink genera el calendario editorial completo de Estudio Oro para esta semana. Alternando: Penal > Inmobiliario > Tech-IA > Patrimonial > Tributario. 7 posts completos con hook, caption, hashtags y CTA WhatsApp.
```

```
/ultrathink analiza este contrato de compraventa y detecta todas las clausulas de riesgo para el comprador. Prioriza por nivel de impacto economico.
```

```
/ultrathink disena la arquitectura completa de OroGest v2: schema de base de datos, flujo de autenticacion y endpoints de API REST.
```

## Escalado de modelos

| Tarea | Modelo correcto |
|---|---|
| Preguntas rapidas, brainstorming | Haiku 4.5 |
| Codigo, docs, analisis, contenido | Sonnet 4.6 (70% del uso) |
| Estrategia, arquitectura, calendario completo | **Opus 4.7 — /ultrathink** |

## Combinacion con /schedule

Para automatizar el calendario con ultrathink cada lunes:

```
/schedule every Monday at 7am, use extended thinking with high budget to generate full week editorial calendar for Estudio Oro. Save to ~/Documents/agenda-semana.md
```

## Reglas

- No usar /ultrathink para tareas simples — Sonnet alcanza y consume menos cuota.
- La cuota Pro se resetea cada 5 horas — Opus consume ~5x mas que Haiku.
- Cuando termines, volver a Sonnet o Haiku para tareas normales.
