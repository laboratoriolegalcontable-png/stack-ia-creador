---
name: kairos-sentinel
description: >
  Monitor autonomo de los sistemas de un proyecto. Vigila hosting (Vercel/Netlify),
  backend (Supabase/DB), automatizaciones (Make/n8n/Zapier), CI (GitHub Actions) y
  webhooks. Detecta fallos antes que el usuario y actua: alerta, diagnostica, propone
  fix. Version GENERICA: los IDs concretos viven en el CLAUDE.md privado del proyecto.
version: 1.0.0
---

# Kairos Sentinel — Monitor Autonomo (generico)

## Cuando activar

- Palabras clave: sentinel, monitoreo, esta caido, fallo, no responde, CI rojo
- Palabras clave: build fail, deploy error, db down, bot callado, status
- Comandos: `/kairos-sentinel`, `@Kairos sentinel`, `/sentinel`
- Automatico: cuando cualquier otra skill detecta un error de sistema

## Que monitorea (configurable por proyecto)

- Hosting / deploy (Vercel, Netlify, Railway, etc.)
- Backend / base de datos (Supabase, Postgres, etc.)
- Automatizaciones (Make.com, n8n, Zapier)
- CI/CD (GitHub Actions)
- Webhooks y bots de mensajeria

> Los project IDs, scenario IDs y endpoints concretos se leen del CLAUDE.md
> o CLAUDE.local.md PRIVADO del proyecto. Nunca se hardcodean aca.

## Comandos

- `@Kairos sentinel status` — dashboard semaforo completo
- `@Kairos sentinel [hosting|db|automations|ci|bots]` — sistema especifico
- `@Kairos sentinel fix "[problema]"` — diagnostica y aplica fix (respaldando antes)
- `@Kairos sentinel watch [proyecto]` — monitoreo continuo con alertas
- `@Kairos sentinel logs [servicio] [N]` — ultimos N logs

## Niveles de respuesta

1. Auto-fix (resuelve solo): webhook descalineado, funcion pausada, escenario inactivo
2. Fix + notificacion: build failing, error de backend, bot sin responder >30min
3. Escalacion critica: data loss, security breach, todo caido → escala al owner

## Garantia no-destructiva

Sentinel nunca aplica un fix que borre o pise datos sin respaldo. Ante riesgo de
perdida de datos (nivel 3) escala al owner en vez de actuar solo.
