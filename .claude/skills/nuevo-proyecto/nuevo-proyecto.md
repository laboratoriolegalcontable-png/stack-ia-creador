---
name: nuevo-proyecto
version: 1.0.0
description: Crea e inicializa un proyecto nuevo con el Sistema Autónomo completo preinstalado. Un comando = proyecto listo con Kairos Supremo, memoria, skills y hooks.
autonomy_level: 5
installed: 2026-05-26
---

# 📦 Nuevo Proyecto — Auto-Bootstrap

> *Proyecto nuevo → Sistema Autónomo completo en 30 segundos.*

## Uso

```
/nuevo-proyecto [nombre] [stack]
/nuevo-proyecto mi-app nextjs
/nuevo-proyecto landing-page vanilla
/nuevo-proyecto api-backend express
/nuevo-proyecto --detect          → detecta stack del directorio actual
```

## Stacks Soportados

| Stack | Comando | Incluye |
|-------|---------|---------|
| `vanilla` | HTML + CSS + JS sin framework | Prettier, SW, manifest |
| `nextjs` | Next.js 15 | ESLint, TypeScript, Vercel |
| `express` | Express.js API | ESLint, Jest, Supabase |
| `react` | Create React App / Vite | ESLint, TypeScript |
| `custom` | Detecta automáticamente | adapta config |

## Qué Instala Automáticamente

```
proyecto-nuevo/
├── .claude/
│   ├── memory/
│   │   └── learned_patterns/
│   │       └── user_preferences.json  ← IDIOMA: ESPAÑOL + autonomía 5
│   ├── orchestration/
│   │   └── kairos-legendario-config.json
│   ├── skills/
│   │   ├── kairos-supremo/
│   │   ├── kairos-legendario/
│   │   ├── skill-auto-installer/
│   │   └── skill-memory-persistence/
│   ├── subagents/
│   │   ├── code-refinement-agent.json
│   │   └── mcp-orchestration-agent.json
│   └── settings.json                  ← hooks SessionStart + Stop
├── .git/
│   └── hooks/
│       └── pre-commit                 ← captura memoria
├── CLAUDE.md                          ← instrucciones permanentes ESPAÑOL
└── [archivos del stack elegido]
```

## Proceso de Bootstrap

```
1. git init (si no existe)
2. mkdir .claude/memory/learned_patterns/
3. Copiar user_preferences.json (IDIOMA: ESPAÑOL)
4. Copiar kairos-legendario-config.json
5. Instalar skills base (kairos-supremo, auto-installer, memory)
6. Configurar settings.json con hooks
7. Crear pre-commit hook
8. Crear CLAUDE.md con reglas permanentes
9. git add -A && git commit "🤖 init: Sistema Autónomo instalado"
10. Crear repo GitHub (si MCP disponible)
11. Push + configurar Vercel (si stack lo requiere)
```

## Ejemplo

```bash
# En cualquier directorio nuevo:
/nuevo-proyecto e-commerce nextjs

# Output:
📦 Inicializando e-commerce (Next.js)...
✅ git init
✅ CLAUDE.md — IDIOMA: ESPAÑOL + Kairos Supremo
✅ user_preferences.json — autonomía nivel 5
✅ kairos-legendario-config.json — umbrales 0.85/0.75
✅ 4 skills instaladas
✅ 2 subagentes configurados
✅ pre-commit hook activo
✅ settings.json — SessionStart + Stop hooks
✅ Primer commit — "🤖 init: Sistema Autónomo instalado"

⏱️ 12 segundos — Proyecto listo para desarrollar.
```
