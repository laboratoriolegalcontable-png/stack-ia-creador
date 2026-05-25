---
name: auto-sistema
description: >
  Instalador del ecosistema completo KAIROS en cualquier proyecto nuevo.
  Un comando bootstrapea CLAUDE.md, SKILL.md, memory.md, .env.example,
  .gitignore, Claude SDK, y commit inicial — listo para trabajar.
version: 1.0.0
triggers:
  - /auto-sistema
  - forge install
  - instalar ecosistema
  - bootstrapear proyecto
  - setup inicial kairos
  - nuevo proyecto con kairos
---

# AUTO-SISTEMA — Bootstrapeador de Ecosistema KAIROS

## Qué hace

Un solo comando instala el ecosistema completo KAIROS en cualquier proyecto:

```bash
# Instalar en el directorio actual
bash .claude/skills/auto-sistema/install.sh

# Instalar en una ruta específica
bash .claude/skills/auto-sistema/install.sh /ruta/al/proyecto

# KAIROS solo (con --target)
bash .claude/skills/kairos-legendario/install.sh --target /ruta/al/proyecto
```

## Lo que instala (6 pasos)

| Paso | Qué hace |
|------|----------|
| 1 | Crea estructura `.claude/skills/` + detección automática de stack |
| 2 | `CLAUDE.md` con contexto, reglas y activación automática de KAIROS |
| 3 | `kairos-legendario/SKILL.md` + `memory.md` (copia desde repo fuente si existe) |
| 4 | `.env.example` adaptado al stack detectado + `.gitignore` |
| 5 | Instala `@anthropic-ai/sdk` si es Node.js/Next.js |
| 6 | Commit inicial |

## Stacks soportados

- `nextjs` — Next.js / Vercel
- `express` — Express.js / Node.js API
- `react` — React SPA
- `node` — Node.js genérico
- `supabase` — Edge Functions
- `python` — FastAPI, Django, scripts
- `static` — HTML/CSS puro
- `generic` — cualquier otro

## Diferencia con kairos-legendario/install.sh

| | auto-sistema | kairos-legendario |
|--|--|--|
| Scope | Ecosistema completo | Solo skill KAIROS |
| Target | `install.sh /ruta` | `install.sh --target /ruta` |
| SDK | Instala @anthropic-ai/sdk | No instala deps |
| Uso | Proyecto nuevo desde cero | Agregar KAIROS a proyecto existente |
