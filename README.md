# Stack IA Creador

Dashboard PWA con 8 skills + 10 prompts copy-paste + 9 programas externos para crear contenido con IA. Spanish-first. Tool-agnostic.

## Acceso

- **Web publica:** https://stack-ia-creador.vercel.app (despues del primer deploy)
- **PWA mobile:** abrir la URL en Safari/Chrome del celu, "Agregar a pantalla de inicio"
- **Local offline:** doble-click en `~/Desktop/stack-ia-creador-local.html` (apunta al skill)
- **Atajo Desktop:** doble-click en `~/Desktop/stack-ia-creador.webloc` (abre la web publica)

## Como editar prompts

1. Editar `~/.claude/skills/stack-ia-creador/REFERENCE.md`
2. Correr sync:
   ```
   cd ~/Documents/GitHub/stack-ia-creador
   npm run sync
   ```
3. Verificar local:
   ```
   npm run dev
   ```
   Abrir http://localhost:3000
4. Subir cambios:
   ```
   git add -A
   git commit -m "sync: prompts actualizados"
   git push
   ```

Vercel redeployea automatico al push.

## Estructura

```
stack-ia-creador/
├── package.json            ← scripts: dev, sync, build
├── vercel.json             ← config de deploy con headers + cache
├── public/                 ← static (lo que sirve Vercel)
│   ├── index.html          ← entry PWA
│   ├── styles.css          ← neutro minimalista + dark mode auto
│   ├── app.js              ← logica vanilla
│   ├── manifest.json       ← PWA manifest
│   ├── sw.js               ← service worker (offline)
│   ├── icon-192.png        ← icono PWA
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── prompts.json        ← generado por sync (NO editar)
│   └── programas.json      ← generado por sync (NO editar)
├── scripts/
│   ├── sync-from-skills.mjs   ← copia desde el skill
│   └── gen-icons.mjs          ← genera iconos PNG basicos
└── README.md
```

## Setup inicial Vercel

1. Crear proyecto nuevo en https://vercel.com/new
2. Elegir "Import Git Repository" (o subir directo via CLI: `vercel`)
3. Framework preset: **Other** (o dejar None)
4. Build command: `npm run build`
5. Output directory: `public`
6. Deploy

Domain custom opcional: `stack.deia.com.ar` (configurar DNS en Vercel).

## Comandos disponibles

| Comando | Que hace |
|---|---|
| `npm run dev` | Sirve `public/` en `localhost:3000` |
| `npm run sync` | Lee REFERENCE.md del skill, regenera prompts.json + programas.json en public/ |
| `npm run build` | Alias de sync (Vercel lo invoca antes de deployar) |

## Tool-agnostic

Todos los prompts en este dashboard estan escritos sin mencionar la IA destino. Diego copia y pega en Claude, ChatGPT, Gemini, Perplexity, Mistral, lo que sea. Funcionan igual.

## Skills relacionados

Los skills viven en `/Users/dorosa/.claude/skills/stack-*/`:

- stack-ia-creador (meta orquestador)
- stack-claude-guion
- stack-imagen
- stack-video
- stack-voz
- stack-avatar
- stack-manychat
- stack-master-prompt

Auto-activos en cualquier sesion de Claude Code.

## License

MIT
