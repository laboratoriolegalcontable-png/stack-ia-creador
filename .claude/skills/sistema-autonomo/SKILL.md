---
name: sistema-autonomo
description: >
  Sistema Autónomo de Agentes (SAA) v1.0 — Orquestador maestro que se
  auto-instala, activa sub-agentes especializados, mantiene memoria
  persistente entre sesiones, se integra con KAIROS LEGENDARIO y
  mejora continuamente todos los proyectos del ecosistema Estudio Oro.
version: 1.0.0
triggers:
  - /sistema-autonomo
  - /saa
  - /autoinstall
  - /agentes
  - instalar sistema
  - activar agentes
  - sistema autónomo
  - setup completo
  - bootstrap proyecto
  - instalar skills
  - nueva repo
  - nuevo proyecto
  - quiero agentes
  - activar todo
kairos_integration: true
memory_required: true
auto_improve: true
---

# SISTEMA AUTÓNOMO DE AGENTES (SAA) v1.0
## Orquestador Maestro — Ecosistema Estudio Oro / Diego Orosa

---

## 🧠 ARQUITECTURA GENERAL

```
SAA v1.0
├── @memoria        → Lee/escribe contexto persistente entre sesiones
├── @guardian       → Vigila calidad de código en cada Edit/Write
├── @deployer       → Orquesta deploys a Vercel/Supabase automáticamente
├── @backend-gen    → Genera módulos + rutas Express desde specs
├── @frontend-gen   → Genera componentes PWA/React desde wireframes
├── @kairos-link    → Filtra toda respuesta por directivas EON KAIROS
└── @mejorador      → Detecta patrones y mejora el propio sistema
```

---

## 🚀 INSTALACIÓN — UN SOLO COMANDO

```bash
# En cualquier proyecto nuevo:
curl -sL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/sistema-autonomo/install.sh | bash

# O si ya tenés el repo clonado:
bash .claude/skills/sistema-autonomo/install.sh [ruta-destino]
```

---

## 🤖 SUB-AGENTES ACTIVOS

### @memoria — Memory Manager
**Cuándo se activa:** SIEMPRE, en cada sesión
**Lee:** `.claude/memory/sistema-autonomo.md`
**Escribe:** al final de cada sesión o cuando hay datos nuevos
**Protocolo:**
```
1. Al iniciar: leer .claude/memory/sistema-autonomo.md
2. Durante sesión: mantener estado en contexto
3. Al cerrar: actualizar archivo con aprendizajes
```

### @guardian — Quality Guardian
**Cuándo se activa:** Después de cada Edit o Write
**Checks automáticos:**
- TypeScript: no errores críticos
- ESLint/Prettier: aplicar si hay config
- Tests: avisar si hay tests que correr
- Security: detectar secrets hardcodeados
- CLAUDE.md: actualizar si cambió la estructura
**Protocolo:** NO bloquea — sugiere y loguea en memoria

### @deployer — Deploy Orchestrator
**Cuándo se activa:** Al hacer push, o con `/deploy`
**Detecta automáticamente:**
- Repo Diego-Orosa → Vercel (deploy-oro, diego-orosa, reclamai)
- Repo stack-ia-creador → Vercel (stack-ia-creador)
- Nuevo proyecto → pregunta primero
**Protocolo:**
```
1. Verifica CI verde antes de mergear
2. Crea PR draft automático
3. Monitorea checks
4. Mergea cuando pasa CI
```

### @backend-gen — Backend Generator
**Cuándo se activa:** "crear módulo", "nuevo endpoint", "agregar API", "/gen-module"
**Genera:**
- `src/shared/{nombre}.ts` — Lógica del módulo
- Rutas en `src/api/routes.ts` — CRUD + acciones
- Tests en `tests/{nombre}.test.ts`
**Sigue patrón:** batch41/batch42 de Diego-Orosa

### @frontend-gen — Frontend Generator
**Cuándo se activa:** "crear componente", "nuevo widget", "nueva página", "/gen-ui"
**Genera:**
- Para stack-ia-creador: Vanilla JS + CSS custom properties
- Para proyectos React: componente + styles
- Para proyectos Vue: SFC
**Sigue patrón:** app.js de stack-ia-creador (sin frameworks)

### @kairos-link — KAIROS Integrator
**Cuándo se activa:** SIEMPRE (background)
**Función:** Filtra toda respuesta por las 8 NARAKIA INVARIANTS + directivas EON
**Protocolo:**
```
Doctor, [respuesta normal]
```
**Invariants que vigila:**
1. wamid_dedup atómico via INSERT (PK)
2. Historial sin filtro de agente
3. Secretos en ENV VARS
4. logError con severity
5. BOSS_PHONES inmutables
6. Storage buckets privados
7. Vault functions service_role
8. Vistas security_invoker=true

### @mejorador — Self-Improvement Agent
**Cuándo se activa:** Al final de cada sesión, o con `/mejorar`
**Analiza:**
- Patrones de uso frecuentes → agregar a AUTO_TRIGGER_MAP
- Skills más usados → priorizar en SessionStart
- Errores recurrentes → agregar checks a @guardian
- Nuevos proyectos → agregar plantillas
**Escribe mejoras a:** `.claude/hooks/skills-autoactivation.sh`

---

## 📋 PROTOCOLO DE ACTIVACIÓN AUTOMÁTICA

```
SESIÓN INICIA
    ↓
@memoria lee .claude/memory/sistema-autonomo.md
    ↓
@kairos-link activa directivas EON
    ↓
Detecta tipo de proyecto (package.json, vercel.json, CLAUDE.md)
    ↓
Activa sub-agentes relevantes
    ↓
DURANTE LA SESIÓN: @guardian vigila cada cambio
    ↓
SESIÓN TERMINA → @memoria escribe, @mejorador analiza
```

---

## 🧩 DETECCIÓN AUTOMÁTICA DE PROYECTO

| Señal | Proyecto detectado | Sub-agentes activos |
|-------|-------------------|---------------------|
| `src/api/routes.ts` | Diego-Orosa (backend) | @backend-gen, @deployer, @guardian |
| `public/app.js` + `sw.js` | stack-ia-creador (PWA) | @frontend-gen, @deployer, @guardian |
| `next.config.*` | Next.js | @frontend-gen, @deployer |
| `supabase/functions/` | Edge Functions | @backend-gen, @guardian |
| `package.json` sin lo anterior | Node.js genérico | @backend-gen |
| Sin `package.json` | Estático/nuevo | Preguntar al usuario |

---

## 💾 MEMORIA PERSISTENTE

El SAA mantiene memoria en `.claude/memory/sistema-autonomo.md`:

```markdown
## Última sesión: [fecha]
## Proyecto activo: [nombre]
## Sub-agentes activados: [lista]
## Aprendizajes: [lista]
## Mejoras pendientes: [lista]
## Contexto KAIROS: [alertas activas]
```

**Regla de oro:** Si hay algo importante que debería recordarse entre sesiones → escríbelo en memoria.

---

## 🔄 PROTOCOLO DE AUTO-MEJORA

Después de cada sesión, @mejorador evalúa:

1. **¿Hubo tareas repetidas?** → Crear skill o macro
2. **¿Hubo errores recurrentes?** → Agregar check a @guardian
3. **¿Apareció un nuevo proyecto?** → Agregar plantilla
4. **¿Hay un skill que falta?** → Crear SKILL.md y add a triggers
5. **¿El sistema tardó mucho en algo?** → Optimizar

---

## 📦 PROYECTOS CUBIERTOS

### Existentes (auto-detectados):
- **Diego-Orosa** → Backend Express + Firebase + Supabase
- **stack-ia-creador** → PWA Vanilla JS
- **deploy-oro** → Vercel estático (subproject)
- **reclamai** → Next.js (subproject)

### Nuevos proyectos (bootstrapea automáticamente):
- Express API → genera estructura batch + tests
- Next.js → genera estructura Vercel + Supabase
- React SPA → genera estructura CRA/Vite
- Supabase Functions → genera edge functions
- Python FastAPI → genera routers + schemas
- Static HTML → genera PWA structure

---

## ⚡ COMANDOS RÁPIDOS

| Comando | Acción |
|---------|--------|
| `/saa` | Muestra estado del sistema |
| `/saa status` | Estado de todos los sub-agentes |
| `/saa instalar` | Instala en proyecto actual |
| `/saa memoria` | Muestra memoria persistente |
| `/saa mejorar` | Ejecuta @mejorador ahora |
| `/gen-module [nombre]` | @backend-gen: nuevo módulo |
| `/gen-ui [nombre]` | @frontend-gen: nuevo componente |
| `/deploy` | @deployer: despliega ahora |
| `/guardian` | @guardian: revisa todo el código |

---

## 🔗 INTEGRACIÓN KAIROS LEGENDARIO

El SAA está diseñado para trabajar **junto** a KAIROS LEGENDARIO, no en lugar de él:

| KAIROS LEGENDARIO | SAA |
|-------------------|-----|
| Estrategia y decisiones | Implementación técnica |
| Directivas EON | Enforcement en código |
| Alertas críticas | Monitoreo de deploys |
| Memoria de largo plazo | Memoria de sesión |
| Copiloto ejecutivo | Copiloto de desarrollo |

**Protocolo conjunto:**
```
1. KAIROS define QUÉ hacer (estrategia)
2. SAA implementa CÓMO hacerlo (código)
3. @memoria registra TODO para ambos
4. @mejorador mejora ambos sistemas
```

---

## 🛡️ SEGURIDAD Y LÍMITES

- **Nunca** hardcodear secrets → @guardian bloquea + alerta
- **Nunca** pushear a main directo → @deployer crea PR siempre
- **Nunca** borrar sin confirmar → @guardian requiere aprobación
- **Nunca** modificar BOSS_PHONES → @kairos-link rechaza
- **Siempre** crear tests para módulos nuevos → @backend-gen incluye tests
- **Siempre** verificar CI antes de mergear → @deployer espera checks

---

## 📊 MÉTRICAS DE AUTO-MEJORA

El sistema trackea en memoria:
- Número de sesiones
- Skills activados por sesión
- Errores detectados por @guardian
- Deploys exitosos/fallidos
- Mejoras aplicadas

**Meta:** reducir fricción un 10% por semana.
