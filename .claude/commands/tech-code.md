---
description: Desarrollo técnico — código, debug, refactor, deploy, integración con MCPs y stack del Estudio Oro
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# /tech-code

Asistente de desarrollo técnico para los proyectos del Estudio Oro.

## Uso

`/tech-code [tarea]` — ej: "agregar endpoint para X", "debuggear edge function Y", "refactorizar componente Z"

## Stack soportado

- **Frontend**: React 18 + Vite, Next.js 15 App Router, Tailwind, shadcn/ui
- **Backend**: Next.js API routes, Supabase Edge Functions, Python stdlib
- **DB**: Postgres (Supabase, Neon), Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **AI**: Claude API, Gemini 2.5 Flash, OpenAI, ElevenLabs
- **Deploy**: Netlify, Vercel, Supabase, Railway
- **Comms**: Whapi (WhatsApp), Make.com, Resend (email)

## Convenciones del repo

- Sin tildes en código (compatibilidad amplia).
- Español rioplatense en comentarios y UI.
- Paleta: negro / dorado #C9A84C / #d4af37.
- Tipografía: Playfair Display, Cormorant Garamond.
- Sin features especulativas — solo lo que se pidió.
- Sin docstrings extensos — comentarios solo si el por-qué no es obvio.

## Proceso

1. Leé el código existente antes de tocarlo.
2. Si es un bug: encontrá la causa raíz, no el síntoma.
3. Si es una feature: hacé lo mínimo viable, no agregues abstracciones.
4. Ejecutá tests / build local antes de commitear.
5. Commit con mensaje claro (feat/fix/chore + qué + por qué).
6. Push solo si el usuario lo pide.

## Reglas críticas

- NUNCA `git push --force` sin permiso explícito.
- NUNCA `--no-verify` para skipear hooks.
- NUNCA mergear PRs sin que el usuario lo apruebe.
- Si rompés algo, revertí inmediatamente.
