---
description: Crea agentes en la nube de Anthropic que corren aunque cierres la laptop — agenda editorial, guiones y reportes automaticos
allowed-tools: Read, Write, Bash, WebSearch
---

# /schedule

Crea trabajos recurrentes en la nube de Anthropic. A diferencia de /loop (que corre en tu maquina local), con /schedule podes cerrar la laptop y el agente sigue trabajando.

## Uso

`/schedule [frecuencia] [tarea] [integraciones]`

Todo en lenguaje natural. Claude crea el trabajo en la nube y lo ejecuta en el horario definido.

```
/schedule every Monday at 7am, use extended thinking to generate full week editorial calendar for Estudio Oro. Save to ~/Documents/agenda-semana.md
```

```
/schedule daily at 7:30am, read today idea from ~/Documents/ideas-semana.md and write complete Reel script. Save to ~/Documents/guion-hoy.md
```

```
/schedule every Friday at 7pm, analyze this week posts and write 3 recommendations to ~/Documents/insights-semana.md
```

## Preset — Agenda semanal Estudio Oro (Ultrathink)

Copia y pega este comando para automatizar el calendario completo cada lunes:

```
/schedule every Monday at 7am, use extended thinking with high budget to generate 7-day editorial calendar for Estudio Oro (Dr. Diego Orosa, penalista + corredor inmobiliario CABA Argentina). Rotacion: Lunes Penal Instagram Reel, Martes Inmobiliario LinkedIn Post, Miercoles Tech-IA TikTok Short, Jueves Patrimonial Instagram Carrusel, Viernes Tributario LinkedIn Articulo, Sabado Penal Instagram Story, Domingo Inmobiliario TikTok Reel. Cada post: HOOK 3s + CAPTION listo para copiar + 15 hashtags + CTA WhatsApp +54 11 6877-7777. Spanish sin tildes, sin pa' usa para. Guardar en ~/Documents/agenda-semana.md
```

## Preset — Banco de ideas semanales

```
/schedule every Monday at 6am, generate 10 Reel ideas for Estudio Oro. AUDIENCIA: empresarios y profesionales CABA. GANCHO: unico penalista + corredor inmobiliario de CABA. Minimo 3 con potencial viral, 2 educativos. Spanish sin tildes. Guardar en ~/Documents/ideas-semana.md
```

## Preset — Resumen semanal por WhatsApp

```
/schedule every Sunday at 9pm, read ~/Documents/agenda-semana.md and ~/Documents/insights-semana.md, create 3-line summary and send via Make.com Oraculo scenario s4562335 to WhatsApp +54 11 6877-7777
```

## /loop vs /schedule

| | /loop | /schedule |
|---|---|---|
| Donde corre | Tu maquina | Nube Anthropic |
| Laptop cerrada | Se detiene | Sigue corriendo |
| Ideal para | Sesion activa | Automatizacion 24/7 |

## Modelos sugeridos por tarea

- **Opus 4.7 + extended thinking** — calendario semanal completo, estrategia, analisis profundo
- **Sonnet 4.6** — guiones diarios, ideas, drafts de contenido
- **Haiku 4.5** — reportes simples, notificaciones, resumen de datos

## Integraciones disponibles

- `Make.com s4562335` — reporte semanal WhatsApp
- `Make.com s4561747` — notificacion urgente WhatsApp
- `Make.com s4561777` — alerta urgente WhatsApp
- `Gmail MCP` — reporte por email
- `~/Documents/` — archivos locales (agenda-semana.md, guion-hoy.md, ideas-semana.md, insights-semana.md)

## Reglas

- Los trabajos corren en UTC — Argentina es UTC-3 (ej: 7am ARG = 10am UTC).
- No incluir API keys ni tokens en el comando — usar variables de entorno o MCPs ya configurados.
- Para ver trabajos activos: `/schedule list`
- Para cancelar un trabajo: `/schedule cancel [job-id]`
