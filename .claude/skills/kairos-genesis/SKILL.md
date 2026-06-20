---
name: kairos-genesis
description: >
  Bootstrapeador autonomo de proyectos nuevos. Detecta tipo de proyecto, instala
  el stack de skills correcto, genera CLAUDE.local.md personalizado, configura sentinel.
  Se activa automaticamente al abrir carpeta sin configuracion Claude. No-destructivo:
  nunca pisa un CLAUDE.local.md ni skills existentes sin respaldo.
version: 1.0.0
---

# Kairos Genesis — Bootstrapeador de Proyectos

## Cuando activar

- Palabras clave: proyecto nuevo, bootstrap, setup inicial, configurar proyecto, nuevo repo
- Comandos: `/kairos-genesis`, `@Kairos genesis`, `/genesis`
- Automatico: carpeta sin CLAUDE.local.md ni .claude/ → genesis bootstrap
- Automatico: despues de git clone de repo sin skills

## Stacks por tipo de proyecto

| Tipo | Skills que instala |
|------|--------------------|
| nextjs / react | vercel-react-best-practices, building-components, shadcn-ui, frontend-design, vercel-deploy |
| express / api | express-patterns, protege-tu-app, security-review, narakia-debug |
| landing | instant-landing, frontend-design, copywriter, vercel-deploy, seo-audit |
| legal / estudio | 01-penal-escrito, 02-inmobiliario, 04-tributario, 05-patrimonial, orosa-jarvis |
| marketing | content-machine, copywriter, viral-radar, narakia-socialmedia |
| Todos | kairos-forge, kairos-sentinel, kairos-memory-v4 (siempre) |

## Comandos

- `@Kairos genesis scan` — escanear sin instalar
- `@Kairos genesis bootstrap [tipo]` — instalar stack completo
- `@Kairos genesis bootstrap` — auto-detectar tipo
- `@Kairos genesis refresh` — actualizar CLAUDE.local.md (respaldando antes)
- `@Kairos genesis add [skill]` — agregar skill especifico

## Que genera

1. Escanea framework, stack, DB, deploy, integraciones, tipo de negocio
2. Instala skills del stack correcto (sin pisar los ya presentes)
3. Crea .claude/CLAUDE.local.md SOLO si no existe (si existe, respalda y propone merge)
4. Registra el proyecto en kairos-sentinel
5. Muestra los 5 comandos mas utiles para empezar

## Instalacion en cualquier proyecto (repo publico, sin token)

```bash
curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/kairos-forge/install.sh | bash
```
