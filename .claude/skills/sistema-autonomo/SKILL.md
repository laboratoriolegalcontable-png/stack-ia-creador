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

### @guardian — Quality Guardian
**Cuándo se activa:** Después de cada Edit o Write
**Protocolo:** NO bloquea — sugiere y loguea en memoria

### @deployer — Deploy Orchestrator
**Cuándo se activa:** Al hacer push, o con `/deploy`

### @backend-gen — Backend Generator
**Cuándo se activa:** "crear módulo", "nuevo endpoint", "/gen-module"

### @frontend-gen — Frontend Generator
**Cuándo se activa:** "crear componente", "nueva página", "/gen-ui"

### @kairos-link — KAIROS Integrator
**Cuándo se activa:** SIEMPRE (background)

### @mejorador — Self-Improvement Agent
**Cuándo se activa:** Al final de cada sesión, o con `/mejorar`

---

## ⚡ COMANDOS RÁPIDOS

| Comando | Acción |
|---------|--------|
| `/saa` | Muestra estado del sistema |
| `/saa status` | Estado de todos los sub-agentes |
| `/saa memoria` | Muestra memoria persistente |
| `/gen-module [nombre]` | @backend-gen: nuevo módulo |
| `/gen-ui [nombre]` | @frontend-gen: nuevo componente |
| `/deploy` | @deployer: despliega ahora |
| `/guardian` | @guardian: revisa todo el código |
