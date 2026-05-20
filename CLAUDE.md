# CLAUDE.md — Stack IA Creador

## Descripción del Proyecto
**Stack IA Creador** es el dashboard frontend PWA de la plataforma de automatización e IA del ecosistema Estudio Oro / Diego Orosa. Permite crear contenido, gestionar leads, lanzar campañas y monitorear métricas desde cualquier dispositivo, funcionando offline como PWA.

**URL de producción**: Vercel (ver `vercel.json`)
**Backend**: Diego-Orosa repo (Express + Firebase)
**Organización**: `laboratoriolegalcontable-png/stack-ia-creador`

## Stack Tecnológico
- **Core**: Vanilla HTML5 / CSS3 / JavaScript ES2022+ (SIN frameworks)
- **PWA**: Service Workers + Web App Manifest
- **Hosting**: Vercel
- **Tests**: Jest
- **Módulos**: ES Modules nativos del browser (type="module")

## Estructura real del proyecto
```
public/
  index.html    → Entry point (sirve app.js, registra sw.js)
  app.js        → Toda la lógica JS (IIFE, Vanilla, ES2022)
  sw.js         → Service Worker (cache-first assets, network-first HTML)
  manifest.json → Web App Manifest (PWA installable)
  styles.css    → Estilos globales con CSS custom properties
  prompts.json  → Data de prompts
  programas.json → Data de programas/herramientas
  agenda.json   → Calendario y comandos /schedule
  icon-192.png, icon-512.png, apple-touch-icon.png → Íconos PWA
scripts/
  validate-public.mjs → Build script (verifica archivos requeridos)
  sync-from-skills.mjs → Sincroniza data desde ~/.claude/skills/
  gen-icons.mjs → Genera íconos PNG
vercel.json     → Configuración Vercel (outputDirectory: public)
package.json    → Solo scripts de tooling; CERO dependencias runtime
```

**Nota**: NO existe `src/`, `script.js` ni Jest configurado. Los tests se agregan cuando el backend esté activo.

## Comandos
```bash
npm run dev      # Servidor local con `serve public` en puerto 3000
npm run sync     # Sincroniza prompts/programas desde skills locales
npm run build    # Valida que public/ tenga todos los archivos requeridos
## Estructura
```
index.html    → Entry point
sw.js         → Service Worker (cache + offline)
manifest.json → Web App Manifest (PWA)
styles.css    → Estilos globales con CSS custom properties
script.js     → Lógica principal
src/          → Módulos JavaScript
public/       → Assets estáticos (íconos, imágenes)
scripts/      → Automatizaciones
vercel.json   → Configuración Vercel
```

## Comandos
```bash
npm run dev      # Servidor local de desarrollo
npm test         # Suite de tests con Jest
npm run build    # Build (si aplica)
```

## Skills Activas — ACTIVACION AUTOMATICA

### Global (de ~/.claude/skills/)
- **security-reviewer** → Se activa al revisar código de auth, APIs, o con `/audit`
- **code-reviewer** → Se activa con `/review` o al pedir revisión de código
- **frontend-expert** → Se activa automáticamente para temas de PWA, JS, CSS, Vercel
- **api-designer** → Se activa para diseño de endpoints y comunicación con el backend

### Del Proyecto (.claude/skills/)
- **pwa-patterns** → Se activa automáticamente para Service Worker, manifest, offline, Vercel

### Comandos Slash Disponibles
- `/review` → Revisión completa de código
- `/audit` → Auditoría de seguridad
- `/deploy-check` → Verificaciones pre-deploy a Vercel
- `/test-all` → Suite completa de tests

**IMPORTANTE**: Las skills se activan SOLAS cuando detectan el contexto apropiado. No necesitas activarlas manualmente.

## Convenciones del Código
- Vanilla JS puro — NUNCA sugerir React, Vue o frameworks
- CSS custom properties (`--color-primary`) para theming
- Mobile-first en todos los estilos
- ES Modules nativos (`import/export`), no CommonJS
- Sin TypeScript — JSDoc para tipado cuando sea necesario
- `const` por defecto, `let` cuando mute, nunca `var`
- Async/await en lugar de `.then()` chains
- Accesibilidad WCAG 2.1 AA como requisito mínimo

## Integración con Backend (Diego-Orosa)
- El backend está en `https://[backend-url]/api/v1/`
- Autenticación: JWT Bearer token en localStorage
- CORS configurado para el dominio de Vercel
- Sin llamadas directas a Firebase desde el frontend

## Lo Que NO Hacer
- NO instalar React, Vue, Angular u otros frameworks
- NO agregar TypeScript sin consultar primero
- NO hacer llamadas directas a Firebase desde el browser
- NO guardar tokens sensibles (solo JWT de sesión en localStorage)
- NO commitar `.env` ni archivos con credenciales
- NO saltear el Service Worker — la PWA debe funcionar offline

## Performance Targets
- LCP < 2.5s, INP < 200ms, CLS < 0.1
- Service Worker siempre registrado y actualizado
- Assets optimizados (WebP para imágenes, gzip para JS/CSS)
