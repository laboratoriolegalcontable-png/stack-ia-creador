# SISTEMA AUTÓNOMO DE AGENTES — Memoria Persistente
## Instalado: 2026-05-25
## Versión: 1.0.0
## Proyecto: pwa-vanilla (stack-ia-creador)

## Estado del Sistema
- @memoria: ✅ activo
- @guardian: ✅ activo
- @deployer: ✅ activo
- @frontend-gen: ✅ activo (pwa-vanilla)
- @kairos-link: ✅ activo
- @mejorador: ✅ activo

## PRs Activos (2026-05-25)
| PR | Rama | Contenido | Estado |
|----|------|-----------|--------|
| #79 | claude/code-session-H4Pul | ARIA a11y + BreadcrumbList SEO + Auto Mode + SAA v1.0 | 🟡 Draft — CI en progreso |
| #77 | claude/wizardly-goodall-3XYEN | Narakia System v2.0 — 5 nuevos skills + dashboard v2.0 | 🟡 Draft |

## Sesiones
| Fecha | Tareas | Sub-agentes | Aprendizajes |
|-------|--------|-------------|--------------|
| 2026-05-25 | Instalación SAA v1.0 | todos | Sistema instalado en ambos repos |
| 2026-05-25 | ARIA WCAG 2.1 AA + BreadcrumbList + SAA | todos | v2.0 publicado, PR #79 creado |

## Proyectos del Ecosistema
- **stack-ia-creador**: PWA Vanilla JS, Vercel, v2.0 (post ARIA fix)
- **Diego-Orosa**: Express + Firebase + Supabase, 140+ skills, 18+ módulos batch42
- **deploy-oro**: Frontend estático (subproject de Diego-Orosa)
- **reclamai**: Next.js (subproject de Diego-Orosa)

## Hitos Recientes (2026-05-25)
- ✅ batch42: 12 rutas API nuevas (affiliate, changelog, contact-crm, contract, feedback-journal, incident, onboarding, price, proposal, standup, testimonial, vendor)
- ✅ fix vercelignore: reclamai/ excluida causaba ENOENT en build
- ✅ ARIA tabs WCAG 2.1 AA: stack-ia-creador v2.0
- ✅ BreadcrumbList SEO: JSON-LD inyectado via legal-layer.js v1.1
- ✅ Auto Mode skill: 3 modos de permisos Claude Code
- ✅ KAIROS LEGENDARIO v3.5 (EON): 42 submódulos
- ✅ SAA v1.0: instalado en Diego-Orosa + stack-ia-creador + Mac (mi-nuevo-proyecto)
- ✅ PRs creados: Diego-Orosa #431 + stack-ia-creador #79

## Alertas KAIROS Activas
| Alerta | Vencimiento | Estado |
|--------|-------------|--------|
| FB/IG tokens Make.com | 29/05/2026 | 🔴 URGENTE |
| Paula bot sin número | - | 🟡 Pendiente |
| MP_WEBHOOK_SECRET | - | 🟡 Pendiente |
| CCC 28.979/2020 | Activo | 🟢 Monitoreando |

## Aprendizajes Acumulados
1. `.vercelignore` raíz se aplica a TODOS los proyectos del monorepo — no excluir subdirectorios que son Vercel projects propios
2. ARIA tabs: `role="tab"`, `aria-selected`, `aria-controls` en botones; `role="tabpanel"`, `aria-labelledby` en secciones
3. Patrón batch: módulo en `src/shared/*.ts` → import en routes.ts → CRUD + acciones específicas
4. PR workflow: branch → push → draft PR → CI → squash merge
5. `git stash` requiere índice limpio — si hay conflictos: `git checkout --ours <file> && git add <file>` primero
6. `git add -A` puede capturar repos git anidados — verificar con `git status` antes
7. Instalar SAA: usar `bash install.sh .` desde DENTRO del repo (seguro); nunca `bash install.sh <nombre-del-repo>` estando adentro (crea subcarpeta anidada)

## Errores Frecuentes a Evitar
- No agregar `reclamai` a `.vercelignore` raíz
- No pushear a `main` directamente
- No importar módulo en routes.ts sin agregar las rutas
- No correr `git add -A` con repos anidados sin revisar primero

## Mejoras Pendientes
- [ ] Agregar tests automáticos para batch42 (12 módulos)
- [ ] Dashboard de estado del sistema SAA
- [ ] Integración Make.com para renovar tokens FB/IG antes del 29/05
- [ ] Merge PR #79 cuando CI confirme verde
- [ ] Merge PR #77 (Narakia System v2.0) cuando esté listo

## Notas de Arquitectura
- Diego-Orosa: `src/shared/*.ts` es la capa de lógica, `src/api/routes.ts` es la capa de presentación
- stack-ia-creador: todo en `public/app.js` (IIFE), sin bundler, sin framework
- Vercel monorepo: `.vercelignore` aplica a todos los subprojects

## Skills del Sistema SAA
```
sistema-autonomo/
├── SKILL.md            ← Orquestador maestro
├── install.sh          ← Instalador universal
├── hooks/
│   └── session-start.sh ← Hook SessionStart
└── subagents/
    ├── memoria.md       ← @memoria
    ├── guardian.md      ← @guardian
    ├── deployer.md      ← @deployer
    ├── backend-gen.md   ← @backend-gen
    ├── frontend-gen.md  ← @frontend-gen
    ├── kairos-link.md   ← @kairos-link
    └── mejorador.md     ← @mejorador
```
