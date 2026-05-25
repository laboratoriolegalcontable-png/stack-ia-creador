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

## Sesiones
| Fecha | Tareas | Sub-agentes | Aprendizajes |
|-------|--------|-------------|--------------|
| 2026-05-25 | Instalación SAA v1.0 | todos | Sistema instalado en ambos repos |

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

## Errores Frecuentes a Evitar
- No agregar `reclamai` a `.vercelignore` raíz
- No pushear a `main` directamente
- No importar módulo en routes.ts sin agregar las rutas

## Mejoras Pendientes
- [ ] Agregar tests automáticos para batch42 (12 módulos)
- [ ] Dashboard de estado del sistema SAA
- [ ] Integración Make.com para renovar tokens FB/IG antes del 29/05

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
