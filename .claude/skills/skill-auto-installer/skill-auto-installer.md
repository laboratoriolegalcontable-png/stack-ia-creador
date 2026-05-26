---
name: skill-auto-installer
version: 1.0.0
description: Auto-registro y descubrimiento de skills faltantes. Mapea MCPs como skills.
installed: 2026-05-26
projects: [stack-ia-creador, Diego-Orosa, generic]
---

# 🔧 Skill Auto-Installer

Detecta y registra skills faltantes automáticamente.

## MCPs → Skills
- GitHub → `github-automation`
- Supabase → `supabase-operations`
- Vercel → `vercel-deploy`
- Netlify → `netlify-deploy`
- Figma → `figma-design`
- Slack → `slack-notifications`
- ClickUp → `clickup-tasks`
- Notion → `notion-docs`
- Make → `make-automation`

## Auto-Instalación
Al detectar MCP nuevo o skill faltante:
1. Crear `.claude/skills/[nombre]/[nombre].md`
2. Registrar en `memory/skill_evolution/skill_updates.json`
3. Commit: `🔧 skill: add [nombre]`

## Kairos
- Umbral: 0.70 | Reversible: SÍ | Auto-commit: SÍ
