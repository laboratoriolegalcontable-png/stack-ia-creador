# Manual Completo de Claude Code CLI
## Guía de Referencia en Español — v2.1.141

> Basado en la guía oficial de Blake Crosley (actualizada 2026-05-13).
> Versión instalada: `claude --version` → 2.1.141

---

## Índice

1. [TL;DR y Conceptos Clave](#1-tldr-y-conceptos-clave)
2. [Instalación y Autenticación](#2-instalación-y-autenticación)
3. [Modos de Interacción](#3-modos-de-interacción)
4. [Sistema de Configuración](#4-sistema-de-configuración)
5. [Selección de Modelo](#5-selección-de-modelo)
6. [Gestión de Costos y Planes](#6-gestión-de-costos-y-planes)
7. [Sistema de Permisos](#7-sistema-de-permisos)
8. [Sistema de Hooks](#8-sistema-de-hooks)
9. [MCP: Model Context Protocol](#9-mcp-model-context-protocol)
10. [Subagents y Agent Teams](#10-subagents-y-agent-teams)
11. [Extended Thinking y Modo Effort](#11-extended-thinking-y-modo-effort)
12. [Skills: Creación y Uso Avanzado](#12-skills-creación-y-uso-avanzado)
13. [Sistema de Plugins](#13-sistema-de-plugins)
14. [Memoria y Contexto (CLAUDE.md)](#14-memoria-y-contexto-claudemd)
15. [Integración con Git y CI/CD](#15-integración-con-git-y-cicd)
16. [IDE: VS Code y JetBrains](#16-ide-vs-code-y-jetbrains)
17. [Patrones Avanzados](#17-patrones-avanzados)
18. [Optimización de Rendimiento](#18-optimización-de-rendimiento)
19. [Debugging y Troubleshooting](#19-debugging-y-troubleshooting)
20. [Implementación Empresarial](#20-implementación-empresarial)
21. [Atajos de Teclado](#21-atajos-de-teclado)
22. [Mejores Prácticas y Anti-patrones](#22-mejores-prácticas-y-anti-patrones)
23. [Recetas de Workflow](#23-recetas-de-workflow)
24. [Quick Reference Card](#24-quick-reference-card)

---

## 1. TL;DR y Conceptos Clave

Claude Code es un **agente de IA para ingeniería de software** que opera desde la terminal. No es un copilot pasivo — puede ejecutar comandos, editar archivos, navegar el codebase, y completar tareas complejas de múltiples pasos de forma autónoma.

### Los 5 Sistemas Centrales

```
┌─────────────────────────────────────────────────────────┐
│                    CLAUDE CODE CLI                       │
│                                                         │
│  1. CONFIGURACIÓN  →  settings.json (jerarquía 5 niveles)│
│  2. PERMISOS       →  allow/deny por herramienta        │
│  3. HOOKS          →  22 eventos del ciclo de vida      │
│  4. MCP            →  3000+ servidores de herramientas  │
│  5. SUBAGENTS      →  hasta 10 agentes en paralelo      │
└─────────────────────────────────────────────────────────┘
```

### Diferencias Clave vs Copilots Tradicionales

| Aspecto | Copilot/Cursor | Claude Code |
|---------|---------------|-------------|
| Interfaz | IDE plugin | Terminal CLI |
| Autonomía | Sugiere cambios | Ejecuta tareas completas |
| Contexto | Archivo actual | Todo el repositorio |
| Pipelines | No | Sí (bash, CI/CD) |
| Multi-repo | No | Sí (worktrees) |
| Hooks | No | 22 eventos de ciclo de vida |
| MCP | Limitado | 3000+ servidores |

### Cuándo Usar Claude Code
- Refactoring de módulos completos
- Implementar features desde spec/PRD
- Debugging de bugs complejos
- Migraciones de base de datos
- Setup de CI/CD
- Code review sistemático
- Generación de tests

---

## 2. Instalación y Autenticación

### Requisitos del Sistema
- Node.js ≥ 18 (recomendado: v22.x LTS)
- npm ≥ 8
- Git ≥ 2.30
- Sistema operativo: macOS, Linux, WSL2 (Windows)

### Instalación
```bash
# Instalación global (recomendado)
npm install -g @anthropic-ai/claude-code

# Verificar instalación
claude --version

# Actualizar a la última versión
npm update -g @anthropic-ai/claude-code
```

### Autenticación

#### Opción 1: OAuth con Anthropic (recomendado para individuos)
```bash
claude
# → Abre browser automáticamente para login
# → Tokens se guardan en ~/.claude/
```

#### Opción 2: API Key directa
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
claude  # Usa la key del entorno
```

#### Opción 3: Amazon Bedrock
```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
claude
```

#### Opción 4: Google Vertex AI
```bash
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=mi-proyecto-gcp
claude
```

### Configuración Post-instalación
```bash
# Ver configuración actual
claude config list

# Establecer modelo por defecto
claude config set model claude-sonnet-4-6

# Ver directorio de configuración
ls ~/.claude/
```

---

## 3. Modos de Interacción

### 3.1 Modo Interactivo (REPL)
El modo principal — conversación bidireccional con el agente.

```bash
claude                          # Inicia sesión interactiva
claude --continue               # Retoma la última sesión
claude --resume <session-id>    # Retoma sesión específica
```

**Durante la sesión interactiva:**
- `Shift+Tab` → Cicla entre modos: Normal → Plan → Auto
- `Ctrl+C` → Interrumpe la tarea actual (sin salir)
- `Ctrl+D` o `/exit` → Sale de la sesión
- `/clear` → Limpia el contexto de la conversación
- `/compact` → Compacta la conversación para ahorrar tokens

### 3.2 Modo No-Interactivo (Headless)
Para automatización, scripts y CI/CD.

```bash
# Comando simple
claude -p "Explica qué hace server.js"

# Con flags de automatización
claude --print "Lista todos los endpoints de la API" --output-format json

# Sin confirmaciones (modo peligroso — usar con cuidado)
claude --dangerously-skip-permissions -p "Refactoriza src/utils/"
```

### 3.3 Modo Plan (Solo Lectura)
Claude explora el código y propone un plan sin ejecutar nada.

```bash
# Activar en sesión interactiva: Shift+Tab (2 veces)
# O desde CLI:
claude --plan "Implementar autenticación OAuth en el proyecto"
```

**Uso típico de Plan Mode:**
1. `Shift+Tab` para entrar en modo Plan
2. Describir la tarea
3. Claude propone plan con archivos a modificar
4. Revisar el plan
5. `Shift+Tab` para activar modo Auto y ejecutar

### 3.4 Modo Auto (YOLO)
Ejecuta sin pedir confirmación. Ideal para tareas repetitivas bien definidas.

```bash
# En sesión interactiva: Shift+Tab (3 veces desde Normal)
# Desde CLI:
claude --auto "Correr npm test y arreglar los tests fallando"
```

> **Advertencia**: En modo Auto, Claude ejecuta acciones sin confirmarte. Úsalo en repositorios donde tengas control total y entiendes el scope.

### 3.5 Sesiones y Continuidad
```bash
# Listar sesiones
claude sessions list

# Ver detalle de una sesión
claude sessions show <id>

# Exportar sesión
claude sessions export <id> > sesion.json

# Limpiar sesiones antiguas (por defecto: 30 días)
claude sessions clean --older-than 7d
```

---

## 4. Sistema de Configuración

### 4.1 Jerarquía de 5 Niveles (mayor prioridad primero)

```
1. Enterprise managed-settings  →  /etc/claude/settings.json
2. CLI flags                    →  --model opus, --no-tools
3. Project local (no commited)  →  ./.claude/settings.local.json
4. Project shared (commited)    →  ./.claude/settings.json
5. User global                  →  ~/.claude/settings.json
```

Cuando hay conflicto, el nivel más alto gana. Para **permisos**, los niveles más restrictivos generalmente ganan (deny > allow).

### 4.2 Archivo settings.json Completo

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  
  // Modelo por defecto
  "model": "claude-sonnet-4-6",
  
  // Firma de commits
  "includeCoAuthoredBy": true,
  
  // Días que se guardan las sesiones
  "cleanupPeriodDays": 30,
  
  // Mostrar tiempo de cada turn
  "showTurnDuration": true,
  
  // Nivel de verbose en logs
  "logLevel": "info",
  
  // Permisos
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(npm run*)",
      "Edit(src/**)",
      "Write(src/**)"
    ],
    "deny": [
      "Read(.env*)",
      "Read(*.pem)",
      "Bash(rm -rf*)",
      "Bash(sudo*)",
      "Edit(.env*)"
    ]
  },
  
  // Hooks del ciclo de vida
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...],
    "Stop": [...],
    "SessionStart": [...]
  },
  
  // Servidores MCP
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    }
  }
}
```

### 4.3 Comandos de Configuración
```bash
# Ver toda la configuración
claude config list

# Ver valor específico
claude config get model

# Establecer valor
claude config set model claude-opus-4-7
claude config set cleanupPeriodDays 14

# Resetear a default
claude config unset model

# Configuración en formato JSON
claude config list --output json
```

### 4.4 Variables de Entorno Clave
```bash
ANTHROPIC_API_KEY          # API key de Anthropic
CLAUDE_CODE_MODEL          # Override de modelo
CLAUDE_CODE_USE_BEDROCK    # Usar Amazon Bedrock
CLAUDE_CODE_USE_VERTEX     # Usar Google Vertex AI
CLAUDE_CODE_MAX_TOKENS     # Máximo de tokens por respuesta
CLAUDE_CODE_LOG_LEVEL      # debug | info | warn | error
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1  # Activar Agent Teams
```

---

## 5. Selección de Modelo

### 5.1 Modelos Disponibles (Mayo 2026)

| Modelo | ID | Input | Output | Contexto | SWE-bench |
|--------|-----|-------|--------|----------|-----------|
| Opus 4.7 | claude-opus-4-7 | $5/MTok | $25/MTok | 200K | 87.6% |
| Sonnet 4.6 | claude-sonnet-4-6 | $3/MTok | $15/MTok | 1M (beta) | ~72% |
| Haiku 4.5 | claude-haiku-4-5-20251001 | $1/MTok | $5/MTok | 200K | ~45% |

**Nota de contexto**: 1M tokens ≈ ~750,000 palabras ≈ repositorio completo de tamaño mediano.

### 5.2 Cuándo Usar Cada Modelo

**Opus 4.7 — Para tareas complejas críticas:**
- Arquitectura de sistemas complejos
- Debugging de bugs difíciles
- Refactoring de alto riesgo
- Code review final antes de producción
- Análisis de seguridad profundo

**Sonnet 4.6 — El balance ideal (recomendado para uso diario):**
- Implementar features completas
- Editar y refactorizar código
- Generación de tests
- Documentación
- La mayoría de tareas de desarrollo

**Haiku 4.5 — Para velocidad y costo:**
- Subagentes de exploración (read-only)
- Preguntas simples sobre el código
- Búsquedas y lookups
- Tareas repetitivas definidas
- Pipelines de alta frecuencia

### 5.3 Cambiar Modelo

```bash
# Para una sesión específica
claude --model claude-opus-4-7

# En sesión interactiva
/model claude-haiku-4-5-20251001

# Configurar default global
claude config set model claude-sonnet-4-6

# En settings.json
{ "model": "claude-sonnet-4-6" }
```

### 5.4 Fast Mode (Opus con salida acelerada)
```bash
# Activa Fast Mode para Opus (salida más rápida, mismo modelo)
/fast
# → Toggle: activa/desactiva
# Disponible en Opus 4.6 y 4.7
```

---

## 6. Gestión de Costos y Planes

### 6.1 Planes de Claude.ai

| Plan | Precio | Límite Claude Code |
|------|--------|-------------------|
| Free | $0/mes | Muy limitado |
| Pro | $20/mes | ~$10-15 de uso |
| Max (5x) | $100/mes | ~$50-75 de uso |
| Max (20x) | $200/mes | ~$150-200 de uso |
| API directa | Pay-per-use | Sin límite (según budget) |

### 6.2 Optimización de Costos

**Prompt Caching** (automático en Claude Code):
- **Cache corto** (5 min): 1.25x costo escritura, 0.1x lectura → 90% ahorro en lecturas
- **Cache largo** (1 hora): 2x costo escritura, 0.1x lectura → 90% ahorro en lecturas
- Claude Code usa cache automáticamente para CLAUDE.md y el contexto de conversación

**Estrategias para reducir costos:**
```bash
# 1. Usar Haiku para subagentes de exploración
# En agents/code-explorer.md → model: claude-haiku-4-5-20251001

# 2. Compactar conversaciones largas
/compact

# 3. Usar /clear entre tareas no relacionadas
/clear

# 4. Especificar scope pequeño en las prompts
# ❌ "revisa todo el proyecto"
# ✅ "revisa src/services/auth.js"

# 5. Usar modo headless para tareas repetitivas
claude -p "resume qué hace este archivo en 3 bullets" < archivo.js
```

### 6.3 Monitorear Uso
```bash
# Ver costos de la sesión actual (en UI interactiva)
/usage

# Tokens usados en el último turn
# → Aparece automáticamente si showTurnDuration: true

# Para API directa — ver en dashboard de Anthropic
# console.anthropic.com → Usage
```

---

## 7. Sistema de Permisos

### 7.1 Conceptos Fundamentales

Los permisos controlan qué acciones puede ejecutar Claude Code. Operan en 3 niveles:

```
DENY  (bloqueo total)
  ↕  Prioridad
ALLOW (permiso explícito)
  ↕  
DEFAULT (pedir confirmación)
```

### 7.2 Sintaxis de Permisos

```json
"permissions": {
  "allow": [
    "Read",                    // Leer cualquier archivo
    "Read(src/**)",            // Leer solo dentro de src/
    "Glob",                    // Buscar archivos por patrón
    "Grep",                    // Buscar dentro de archivos
    "Bash(git*)",              // Cualquier comando git
    "Bash(npm run test)",      // Exactamente este comando
    "Bash(npm run *)",         // Cualquier npm run X
    "Edit(src/**)",            // Editar dentro de src/
    "Write(*.json)",           // Crear/escribir archivos .json
    "WebFetch(https://api.github.com/**)",  // Fetch a GitHub API
    "Skill"                    // Ejecutar skills
  ],
  "deny": [
    "Read(.env*)",             // Bloquear lectura de .env
    "Read(secrets/**)",        // Bloquear directorio de secrets
    "Bash(rm -rf*)",           // Bloquear rm -rf
    "Bash(sudo*)",             // Bloquear sudo
    "Edit(.env*)",             // Bloquear edición de .env
    "Write(.env*)"             // Bloquear escritura de .env
  ]
}
```

### 7.3 Modos de Permiso

```bash
# Normal (default): pide confirmación para acciones riesgosas
claude

# Auto-approve (para CI/CD o tareas conocidas)
claude --auto-approve-everything

# Plan only (solo lectura, sin ejecutar)
claude --plan

# Para agentes específicos en agents/*.md:
permissionMode: plan       # Solo lectura
permissionMode: auto       # Sin confirmaciones
permissionMode: default    # Comportamiento normal
```

### 7.4 Sandbox (Aislamiento)

```bash
# Ejecutar en sandbox para máxima seguridad
claude --sandbox

# El sandbox:
# → Sin acceso a internet
# → Sin acceso a ~/.ssh, ~/.aws, etc.
# → Sistema de archivos temporal
# → Útil para code review de repos externos
```

### 7.5 PermissionRequest Hook
Para control granular con lógica custom:
```json
"hooks": {
  "PermissionRequest": [
    {
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "bash ~/.claude/hooks/check-bash-permission.sh"
      }]
    }
  ]
}
```

---

## 8. Sistema de Hooks

### 8.1 Los 22 Eventos de Hooks

```
CICLO DE SESIÓN:
  SessionStart      → Al iniciar una nueva sesión
  SessionEnd        → Al terminar la sesión
  Setup             → Una vez al inicializar Claude Code
  InstructionsLoaded → Cuando se carga CLAUDE.md

CICLO DE HERRAMIENTAS:
  PreToolUse        → ANTES de ejecutar cualquier herramienta
  PostToolUse       → DESPUÉS de ejecutar herramienta exitosamente
  PostToolUseFailure → DESPUÉS de ejecutar herramienta con error

CICLO DE GENERACIÓN:
  Stop              → Cuando Claude termina de responder
  StopFailure       → Cuando Stop falla o hay error
  UserPromptSubmit  → Cuando el usuario envía un mensaje

CICLO DE AGENTES:
  SubagentStart     → Al iniciar un subagente
  SubagentStop      → Al terminar un subagente
  TeammateIdle      → Cuando un agente del equipo está esperando
  TaskCompleted     → Cuando una tarea del equipo se completa

CICLO DE PERMISOS:
  PermissionRequest → Cuando se necesita confirmar un permiso
  PermissionDenied  → Cuando se deniega un permiso

CICLO DE CONTEXTO:
  PreCompact        → Antes de compactar la conversación
  PostCompact       → Después de compactar la conversación
  ConfigChange      → Cuando cambia la configuración

CICLO DE WORKTREE:
  WorktreeCreate    → Al crear un nuevo worktree
  WorktreeRemove    → Al eliminar un worktree

INTERACCIÓN:
  Notification      → Al mostrar una notificación
  Elicitation       → Cuando Claude necesita input del usuario
  ElicitationResult → Cuando el usuario responde a elicitación
```

### 8.2 Tipos de Hooks

#### command (Shell)
```json
{
  "type": "command",
  "command": "echo 'Hook ejecutado' >> ~/claude-hooks.log",
  "timeout": 30,
  "statusMessage": "Verificando..."
}
```

#### prompt (LLM)
```json
{
  "type": "prompt",
  "prompt": "Revisa que el código modificado no tenga console.log innecesarios. Responde con 'OK' o lista los problemas.",
  "model": "claude-haiku-4-5-20251001"
}
```

#### agent (Multi-turn LLM con tools)
```json
{
  "type": "agent",
  "prompt": "Ejecuta los tests del módulo modificado y reporta si pasan.",
  "tools": ["Bash(npm test*)"],
  "model": "claude-haiku-4-5-20251001"
}
```

#### http (Webhook)
```json
{
  "type": "http",
  "url": "https://mi-servidor.com/webhook/claude-code",
  "method": "POST",
  "headers": { "Authorization": "Bearer ${WEBHOOK_SECRET}" }
}
```

#### mcp_tool (Herramienta MCP directa)
```json
{
  "type": "mcp_tool",
  "server": "github",
  "tool": "create_issue",
  "input": { "title": "Tarea completada por Claude Code" }
}
```

### 8.3 Exit Codes

| Código | Significado |
|--------|-------------|
| 0 | Éxito — continuar normalmente |
| 2 | **Bloquear operación** (solo PreToolUse) |
| 1 | Warning no bloqueante |
| 3+ | Error no bloqueante (se loguea) |

### 8.4 hookSpecificOutput para PreToolUse

Para control granular desde scripts de hook:
```json
{
  "permissionDecision": "allow | deny | ask",
  "permissionDecisionReason": "Explicación para el usuario",
  "updatedInput": { "command": "comando modificado" },
  "additionalContext": "Contexto adicional para Claude"
}
```

### 8.5 Ejemplos Prácticos

**Hook de protección de secretos:**
```bash
#!/bin/bash
# PreToolUse — Bloquea acceso a archivos sensibles
FILE=$(echo "$TOOL_INPUT" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(d.get('file_path',''))
" 2>/dev/null)

if echo "$FILE" | grep -qE "\.env$|\.pem$|\.key$|secrets/"; then
  echo '{"permissionDecision":"deny","permissionDecisionReason":"Archivo sensible bloqueado"}'
  exit 2
fi
```

**Hook de linting post-edición:**
```json
{
  "PostToolUse": [{
    "matcher": "Edit|Write",
    "hooks": [{
      "type": "command",
      "command": "npx eslint --fix ${TOOL_RESULT_FILE_PATH} 2>/dev/null || true",
      "timeout": 10
    }]
  }]
}
```

**Hook de notificación al completar:**
```json
{
  "Stop": [{
    "matcher": "",
    "hooks": [{
      "type": "command",
      "command": "osascript -e 'display notification \"Claude Code terminó\" with title \"✅ Listo\"' 2>/dev/null || notify-send 'Claude Code' 'Tarea completada' 2>/dev/null || true"
    }]
  }]
}
```

---

## 9. MCP: Model Context Protocol

### 9.1 ¿Qué es MCP?

MCP (Model Context Protocol) es un protocolo estándar que permite a Claude Code conectarse con **herramientas externas, APIs y servicios**. Funciona como "enchufes" que extienden las capacidades de Claude.

```
Claude Code  ←→  MCP Client  ←→  MCP Server  ←→  Servicio externo
                               (GitHub, Slack,
                                Supabase, etc.)
```

### 9.2 Configurar un Servidor MCP

#### En settings.json (global o proyecto)
```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    },
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    },
    "servidor-local": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp-server/index.js"],
      "env": {
        "API_KEY": "${MI_API_KEY}"
      }
    }
  }
}
```

#### En .mcp.json (por proyecto, recomendado para credenciales de proyecto)
```json
{
  "mcpServers": {
    "meta-ads": {
      "type": "http",
      "url": "https://mcp.facebook.com/ads"
    }
  }
}
```

### 9.3 Servidores MCP Populares

| Servidor | Capacidades | Configuración |
|----------|-------------|---------------|
| GitHub | PRs, Issues, Code search | HTTP con OAuth |
| Supabase | Database, Auth, Storage | HTTP con token |
| Make.com | Automation, webhooks | HTTP con API key |
| Slack | Mensajes, canales | HTTP con OAuth |
| Notion | Páginas, databases | HTTP con token |
| PostgreSQL | Queries SQL directas | stdio |
| Filesystem | Acceso a archivos extendido | stdio |
| Figma | Diseños, componentes | HTTP con token |

### 9.4 Tool Search (Carga Diferida)

Para servidores con muchas herramientas (como Make.com con 100+ tools), Claude Code usa **carga diferida**:

```bash
# Las herramientas aparecen como "deferred" inicialmente
# Claude carga el schema solo cuando necesita usarlas
# Esto reduce el contexto inicial y los costos
```

En hooks o cuando necesites forzar la carga:
```json
{
  "mcpServers": {
    "mi-servidor": {
      "type": "http",
      "url": "...",
      "alwaysLoad": true  // Cargar siempre, no diferir
    }
  }
}
```

### 9.5 MCP en el Proyecto (Diego-Orosa)

El proyecto usa:
- **Meta Ads MCP** → gestión de campañas Facebook/Instagram
- **Make.com MCP** → automatización de workflows
- **GitHub MCP** → gestión de repositorios
- **Supabase MCP** → base de datos

Ver `.mcp.json` del proyecto para la configuración actual.

---

## 10. Subagents y Agent Teams

### 10.1 Subagents Básicos

Claude Code puede lanzar subagentes para tareas paralelas o especializadas.

**Tipos de Subagentes:**

```
Explore (Haiku, solo lectura)
  → Búsqueda y análisis de código
  → Respuestas a preguntas sobre el codebase
  → Sin escritura, sin builds

General-purpose (Sonnet)
  → Implementación de features
  → Debugging
  → Generación de tests

Plan (cualquier modelo)
  → Solo planificación (modo Plan)
  → No ejecuta cambios
```

**Límites:**
- Máximo 10 subagentes en paralelo
- Cada subagente tiene contexto aislado (no ve la conversación padre)
- Los subagentes pueden tener sus propios permisos más restrictivos

### 10.2 Crear un Agente Personalizado

Crear `.claude/agents/mi-agente.md`:

```markdown
---
name: mi-agente
description: Descripción breve de qué hace y cuándo usarlo
model: claude-haiku-4-5-20251001
tools:
  - Read
  - Glob
  - Grep
  - Bash
permissionMode: plan
---

# Mi Agente

## Rol
Descripción del rol y responsabilidades.

## Instrucciones
[Instrucciones detalladas para el agente]
```

**Uso en conversación:**
```
@mi-agente analiza la estructura del proyecto
```

### 10.3 Agent Teams (Experimental)

Para tareas complejas que requieren coordinación entre múltiples instancias de Claude Code.

**Activar:**
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

**Arquitectura:**
```
Orchestrator Claude
  → Crea shared task list (archivo en disco)
  → Crea mailbox para comunicación
  → Lanza agentes Worker

Worker Claude (x3, x5, x10...)
  → Toman tareas de la lista compartida
  → Se coordinan via mailbox
  → Reportan resultados al orchestrator
```

**Ejemplo de uso:**
```bash
# El orchestrator coordina múltiples workers para:
# - Worker 1: Migrar módulo de auth
# - Worker 2: Actualizar tests de auth
# - Worker 3: Actualizar documentación de auth
# → Todo en paralelo, coordinado
```

---

## 11. Extended Thinking y Modo Effort

### 11.1 Extended Thinking

Permite a Claude "pensar más" antes de responder, como un scratchpad interno para razonamiento complejo.

```bash
# Activar en sesión interactiva
/think

# Niveles de thinking:
/think low      # Pensamiento básico
/think medium   # Pensamiento moderado (default con /think)
/think high     # Máximo razonamiento (más lento, más caro)
```

**Cuándo usar Extended Thinking:**
- Algoritmos complejos
- Análisis de arquitectura
- Debugging de bugs difíciles
- Planificación de refactoring mayor
- Resolución de problemas de optimización

### 11.2 Modo Effort

Una capa de abstracción sobre Extended Thinking y selección de modelo.

```
--effort low     → Haiku + sin thinking → Máxima velocidad
--effort medium  → Sonnet + thinking básico → Balance
--effort high    → Opus + thinking máximo → Máxima calidad
--effort xhigh   → Opus 4.7 + thinking extendido → Solo para lo más crítico
```

```bash
claude --effort high "Diseña la arquitectura de un sistema de caching distribuido"
claude --effort low "¿Qué hace esta función?" < utils.js
```

---

## 12. Skills: Creación y Uso Avanzado

### 12.1 ¿Qué son las Skills?

Las Skills son módulos de instrucciones especializadas que Claude invoca **automáticamente** cuando detecta el contexto apropiado. Son distintas de los comandos slash (que el usuario invoca manualmente).

```
Comandos (/review)  → Usuario invoca manualmente
Skills              → Claude invoca automáticamente por contexto
```

### 12.2 Estructura de una Skill

```
.claude/skills/
  nombre-skill/
    SKILL.md      (obligatorio) → Instrucciones principales
    REFERENCE.md  (opcional)   → Datos de referencia, ejemplos
    install.sh    (opcional)   → Script de instalación
```

**SKILL.md mínimo:**
```markdown
# Mi Skill

## Activación Automática
Se activa cuando el usuario menciona: palabra1, palabra2, /comando

## Rol
Descripción del rol del agente.

## Instrucciones
[Instrucciones detalladas]
```

### 12.3 Instalar Skills de la Comunidad

```bash
# Desde el marketplace de skills
npx skills add anthropic/skills/security-reviewer

# Desde GitHub
git clone https://github.com/usuario/mi-skill ~/.claude/skills/mi-skill

# Manualmente — copiar carpeta a ~/.claude/skills/ o .claude/skills/
```

### 12.4 Skills Globales vs Proyecto

```
~/.claude/skills/    → Disponibles en TODOS los proyectos
./.claude/skills/    → Solo en el proyecto actual
```

### 12.5 CLAUDE.md y Skills

Referenciar skills en CLAUDE.md para activación automática:
```markdown
## Skills Activas

- `.claude/skills/scrapling/` — Generación de leads
- `.claude/skills/security-reviewer/` — Auditoría OWASP (global)
```

### 12.6 Skills Instaladas en Este Proyecto

**Globales** (`~/.claude/skills/`):
- `security-reviewer` — Auditoría OWASP Top 10
- `code-reviewer` — Calidad de código Node.js
- `node-expert` — Patrones Express y Node.js
- `api-designer` — Diseño de APIs REST
- `frontend-expert` — PWA y Vanilla JS

**Diego-Orosa** (`.claude/skills/`):
- `scrapling` — Generación de leads automatizada
- `estudio-oro-domain` — Lógica de negocio legal/inmobiliaria
- `express-patterns` — Patrones específicos del proyecto

---

## 13. Sistema de Plugins

### 13.1 ¿Qué son los Plugins?

Los plugins extienden la funcionalidad de Claude Code con capacidades adicionales. Distintos de los MCP servers (que conectan con servicios externos), los plugins modifican el comportamiento del CLI mismo.

### 13.2 Plugins Oficiales

- **@anthropic-ai/claude-code-telemetry** — Métricas y logging empresarial
- **@anthropic-ai/claude-code-sso** — Single Sign-On para empresas

### 13.3 Instalar Plugins

```bash
npm install -g @anthropic-ai/claude-code-telemetry

# Agregar a settings.json
{
  "plugins": ["@anthropic-ai/claude-code-telemetry"]
}
```

---

## 14. Memoria y Contexto (CLAUDE.md)

### 14.1 Jerarquía de CLAUDE.md

```
/etc/claude/CLAUDE.md          → Global del sistema (enterprise)
~/.claude/CLAUDE.md            → Global del usuario
./CLAUDE.md o ./.claude/CLAUDE.md  → Del proyecto (commiteado)
./CLAUDE.local.md              → Del proyecto (local, NO commiteado)
```

Todos se cargan y concatenan, con prioridad de los más específicos.

### 14.2 Estructura Recomendada de CLAUDE.md

```markdown
# CLAUDE.md — [Nombre del Proyecto]

## Descripción del Proyecto
Qué hace, para qué serve, contexto de negocio.

## Stack Tecnológico
- Runtime: Node.js v22
- Framework: Express 4.18.2
- Database: Firebase Firestore
- Auth: JWT

## Arquitectura
Diagrama o descripción de los módulos principales.

## Comandos Frecuentes
\`\`\`bash
npm run dev      # Servidor de desarrollo
npm test         # Suite de tests
npm run lint     # Linting
\`\`\`

## Convenciones del Código
- camelCase para variables y funciones
- PascalCase para clases
- UPPER_SNAKE para constantes

## Patrones Clave
Descripciones de patrones específicos del proyecto.

## Skills Activas
Lista de skills configuradas.

## Archivos Críticos
- server.js → Entry point
- src/routes/ → Definición de rutas

## Lo que NO hacer
- No commitar .env
- No modificar package-lock.json manualmente
```

### 14.3 Gestión de Memoria a Largo Plazo

```bash
# Agregar algo a la memoria permanente
/remember "La API de WhatsApp usa Whapi, endpoint: POST /messages"

# Ver lo que Claude recuerda
/memories

# Exportar memoria a CLAUDE.md
/memory export
```

---

## 15. Integración con Git y CI/CD

### 15.1 Patrones Git con Claude Code

**Feature branch + code review:**
```bash
git checkout -b feature/nueva-funcionalidad
claude "Implementa el endpoint GET /api/v1/analytics/leads con paginación"
# Claude implementa, crea tests, actualiza docs
git add -A
git commit -m "feat: agregar endpoint de analytics de leads con paginación"
```

**Debugging con git:**
```bash
# Encontrar cuándo se introdujo un bug
claude "Usa git bisect para encontrar el commit que introdujo el bug en calculateLeadScore"
```

**Commit messages inteligentes:**
```bash
# Claude genera el commit message basado en los cambios
git add -A
claude "Genera un commit message semántico para estos cambios: $(git diff --staged)"
```

### 15.2 GitHub Actions con Claude Code

```yaml
# .github/workflows/claude-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code
      
      - name: Run Claude Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          git diff origin/main...HEAD > changes.diff
          claude --print "Revisa este diff y reporta issues de seguridad y calidad" \
            --output-format json < changes.diff
```

### 15.3 Git Worktrees (Trabajo Paralelo)

```bash
# Crear worktree para trabajo aislado
claude -w  # Claude crea automáticamente un worktree temporal

# O manualmente:
git worktree add ../feature-branch feature/nueva-feature
cd ../feature-branch
claude "Implementa la nueva feature sin afectar el trabajo en main"
```

---

## 16. IDE: VS Code y JetBrains

### 16.1 VS Code Extension

```bash
# Instalar extension desde VS Code Marketplace
# Buscar: "Claude Code" by Anthropic

# O desde terminal
code --install-extension anthropics.claude-code
```

**Atajos en VS Code:**
- `Ctrl+Shift+P` → "Claude Code: Ask" → hacer pregunta en contexto del archivo
- `Ctrl+Shift+P` → "Claude Code: Open" → abrir panel de Claude Code
- Seleccionar código → Clic derecho → "Claude Code: Explain/Refactor/Fix"

### 16.2 JetBrains Plugin

Compatible con: IntelliJ IDEA, WebStorm, PyCharm, GoLand, etc.

```
Settings → Plugins → Marketplace → Buscar "Claude Code"
```

### 16.3 Uso Combinado IDE + Terminal

La forma más productiva es:
1. **Terminal**: Claude Code para tareas completas (implementar, refactorizar)
2. **IDE**: Para revisar los cambios que Claude hizo, hacer ajustes manuales
3. **Claude Code** puede ver los archivos abiertos en el IDE si están guardados

---

## 17. Patrones Avanzados

### 17.1 Pipelines Bash

```bash
# Pipeline de análisis
cat src/server.js | claude -p "¿Qué dependencias circulares hay?"

# Pipeline de transformación
claude -p "Convierte este JSON a tipos TypeScript" < api-schema.json > types.ts

# Pipeline de revisión masiva
find . -name "*.js" -newer .last-review | while read file; do
  echo "Revisando $file..."
  claude -p "Lista vulnerabilidades de seguridad en este archivo" < "$file"
done

# Pipeline de documentación
find src/ -name "*.js" | xargs -I {} claude -p "Genera JSDoc para las funciones exportadas de {}"
```

### 17.2 Modo Headless para Scripts

```bash
#!/bin/bash
# script-análisis.sh — Análisis automático diario

FECHA=$(date +%Y-%m-%d)
REPORTE="reporte-$FECHA.md"

echo "# Reporte de Análisis — $FECHA" > $REPORTE

# Análisis de seguridad
claude --print "Analiza el código nuevo en el último commit y lista issues de seguridad" \
  --output-format json >> "$REPORTE"

# Análisis de calidad
claude --print "¿Qué deuda técnica hay en src/ que debería priorizarse?" \
  >> "$REPORTE"

echo "Reporte generado: $REPORTE"
```

### 17.3 Paralelismo con Worktrees

```bash
# Trabajar en múltiples features simultáneamente
git worktree add /tmp/feature-auth feature/auth-refactor
git worktree add /tmp/feature-analytics feature/analytics-v2

# Terminal 1: Feature de auth
cd /tmp/feature-auth
claude "Implementa OAuth2 con refresh tokens"

# Terminal 2: Feature de analytics (en paralelo)
cd /tmp/feature-analytics
claude "Agrega métricas de conversion funnel al dashboard"

# Limpiar después
git worktree remove /tmp/feature-auth
git worktree remove /tmp/feature-analytics
```

### 17.4 Orquestación Multi-Repo

```bash
# Actualizar la misma función en múltiples servicios
for REPO in service-auth service-users service-payments; do
  cd ~/$REPO
  claude --auto "Actualiza el middleware de rate-limiting a la v2 según el patrón en ~/docs/rate-limit-v2.md"
  git add -A && git commit -m "chore: actualizar rate-limiting middleware a v2"
done
```

---

## 18. Optimización de Rendimiento

### 18.1 Prompt Caching

Claude Code gestiona el caché automáticamente, pero puedes optimizarlo:

```markdown
# CLAUDE.md — Optimizado para caché

## [Información estable que NO cambia frecuentemente]
Descripción del proyecto, stack, arquitectura...
## [Esto se cachea por 1 hora en interacciones largas]
```

**Tips para maximizar caché:**
- Mantener CLAUDE.md estable (no cambiar en cada sesión)
- Usar `/compact` antes de cambiar de tarea
- Las instrucciones al inicio de la conversación se cachean mejor

### 18.2 Reducir Tokens de Entrada

```bash
# En lugar de dar el archivo completo:
# ❌ Malo: cat 5000-lines-file.js | claude -p "¿Qué hace la función X?"
# ✅ Bueno: grep -A 20 "function X" archivo.js | claude -p "¿Qué hace esta función?"

# Usar Grep para contexto específico
grep -B 5 -A 30 "authenticateUser" src/middlewares/auth.js | claude -p "Revisa esta función"
```

### 18.3 Selección Óptima de Modelo por Tarea

```
Tarea                          Modelo Óptimo       Razón
─────────────────────────────────────────────────────────
Búsqueda en código             Haiku               Rápido, barato
Preguntas simples              Haiku               Suficiente
Implementar features           Sonnet              Balance
Refactoring                    Sonnet              Balance
Debugging complejo             Opus                Razonamiento
Arquitectura de sistemas       Opus + thinking     Máximo razonamiento
Auditoría de seguridad         Opus                Precisión crítica
CI/CD automático               Haiku/Sonnet        Costo-eficiente
```

### 18.4 Batching de Operaciones

```bash
# En lugar de múltiples sesiones:
# ❌ Malo: claude "agrega tipos TS a auth.js" && claude "agrega tipos TS a users.js"
# ✅ Bueno:
claude "Agrega tipos TypeScript estrictos a todos los archivos en src/services/. Empieza por auth.js, luego users.js, luego payments.js. Mantén consistencia entre archivos."
```

---

## 19. Debugging y Troubleshooting

### 19.1 Problemas Comunes y Soluciones

**Claude no lee el CLAUDE.md:**
```bash
# Verificar que existe y tiene contenido
cat CLAUDE.md
# Verificar permisos de lectura
ls -la CLAUDE.md
# Forzar recarga en sesión
/reload
```

**Hook no se ejecuta:**
```bash
# Verificar permisos del script
chmod +x ~/.claude/hooks/mi-hook.sh

# Probar el script manualmente
echo '{"tool_name":"Write","tool_input":{"file_path":"test.js"}}' | \
  TOOL_NAME=Write TOOL_INPUT='{"file_path":"test.js"}' \
  bash ~/.claude/hooks/mi-hook.sh

# Ver logs de hooks
claude config set logLevel debug
```

**MCP no conecta:**
```bash
# Verificar conectividad
curl -I https://api.servidor-mcp.com/health

# Verificar variables de entorno
echo $MI_API_KEY  # ¿Tiene valor?

# Test de MCP directo
claude --debug "Lista las herramientas disponibles del servidor MCP"
```

**Contexto muy largo — Claude olvida instrucciones:**
```bash
# Compactar conversación
/compact

# O limpiar y proveer contexto clave
/clear
# Luego: "Recuerda que estamos trabajando en [contexto breve]..."
```

**Permisos denegados inesperadamente:**
```bash
# Ver qué permisos están configurados
cat ~/.claude/settings.json | python3 -m json.tool

# Verificar jerarquía completa
cat .claude/settings.json   # proyecto
cat ~/.claude/settings.json  # global

# Agregar permiso temporalmente
/permissions add "Bash(comando específico)"
```

### 19.2 Modo Debug

```bash
# Activar debug completo
CLAUDE_CODE_LOG_LEVEL=debug claude

# Ver logs en tiempo real
tail -f ~/.claude/logs/claude-$(date +%Y%m%d).log

# Debug de una operación específica
claude --debug -p "ejecuta npm test"
```

### 19.3 Verificar Instalación

```bash
# Diagnóstico completo
claude doctor

# O manualmente:
claude --version
node --version
which claude
ls ~/.claude/
cat ~/.claude/settings.json
```

---

## 20. Implementación Empresarial

### 20.1 Enterprise Managed Settings

Para organizaciones, el administrador puede forzar configuración:

```json
// /etc/claude/settings.json (solo root puede editar)
{
  "model": "claude-sonnet-4-6",
  "permissions": {
    "deny": [
      "Read(/etc/passwd)",
      "Read(/etc/shadow)",
      "Bash(curl*)",
      "Bash(wget*)"
    ]
  },
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "http",
        "url": "https://audit.empresa.com/claude-usage",
        "method": "POST"
      }]
    }]
  }
}
```

### 20.2 SSO y Autenticación Empresarial

```bash
# Plugin de SSO
npm install -g @anthropic-ai/claude-code-sso

# Configurar en settings.json
{
  "plugins": ["@anthropic-ai/claude-code-sso"],
  "sso": {
    "provider": "okta",
    "orgSlug": "mi-empresa",
    "baseUrl": "https://mi-empresa.okta.com"
  }
}
```

### 20.3 Auditoría y Compliance

```json
// Hook para logging de auditoría
{
  "hooks": {
    "PreToolUse": [{
      "matcher": ".*",
      "hooks": [{
        "type": "http",
        "url": "https://audit.empresa.com/log",
        "method": "POST",
        "headers": { "X-Audit-Token": "${AUDIT_TOKEN}" }
      }]
    }]
  }
}
```

### 20.4 Políticas de Uso

```json
// deny por defecto, allow selectivo para máxima seguridad
{
  "permissions": {
    "defaultMode": "deny",
    "allow": [
      "Read(src/**)",
      "Read(tests/**)",
      "Edit(src/**)",
      "Bash(npm run test)",
      "Bash(npm run lint)",
      "Bash(git status)",
      "Bash(git diff*)"
    ]
  }
}
```

---

## 21. Atajos de Teclado

### 21.1 Durante Sesión Interactiva

| Atajo | Acción |
|-------|--------|
| `Enter` | Enviar mensaje |
| `Shift+Enter` | Nueva línea en mensaje |
| `Shift+Tab` | Ciclar modo: Normal → Plan → Auto |
| `Ctrl+C` | Interrumpir tarea actual (no sale) |
| `Ctrl+D` | Salir de Claude Code |
| `↑ / ↓` | Navegar historial de mensajes |
| `Ctrl+L` | Limpiar pantalla |
| `Ctrl+R` | Buscar en historial |

### 21.2 Comandos Slash Built-in

| Comando | Descripción |
|---------|-------------|
| `/help` | Mostrar ayuda |
| `/exit` o `/quit` | Salir |
| `/clear` | Limpiar contexto de la conversación |
| `/compact` | Compactar conversación (reduce tokens) |
| `/model <id>` | Cambiar modelo |
| `/think [nivel]` | Activar extended thinking |
| `/fast` | Toggle Fast Mode (Opus) |
| `/usage` | Ver uso de tokens de la sesión |
| `/permissions` | Ver/modificar permisos |
| `/reload` | Recargar CLAUDE.md y configuración |
| `/history` | Ver historial de la sesión |
| `/sessions` | Gestionar sesiones |
| `/remember <texto>` | Agregar a memoria permanente |
| `/memories` | Ver memoria permanente |
| `/plan` | Activar modo Plan |

### 21.3 Comandos Slash Personalizados (Este Proyecto)

| Comando | Descripción |
|---------|-------------|
| `/review` | Revisión completa de código |
| `/audit` | Auditoría de seguridad |
| `/deploy-check` | Verificaciones pre-deploy |
| `/test-all` | Suite completa de tests |

---

## 22. Mejores Prácticas y Anti-patrones

### 22.1 Mejores Prácticas

**Para Prompts Efectivos:**
```
✅ "Implementa el endpoint POST /api/v1/leads con validación Zod y tests unitarios"
✅ "Refactoriza src/services/auth.js para separar la lógica de JWT en su propio módulo"
✅ "Encuentra y arregla el bug donde los usuarios reciben 403 al actualizar su perfil"

❌ "Mejora el código"  (muy vago)
❌ "Revisa todo el proyecto"  (scope indefinido)
❌ "Haz X y luego Y y luego Z y también W"  (demasiadas cosas a la vez)
```

**Para CLAUDE.md Efectivo:**
- Incluir el "por qué", no solo el "qué"
- Documentar decisiones de arquitectura y sus razones
- Listar patrones que el proyecto usa consistentemente
- Indicar qué NO hacer (anti-patrones específicos del proyecto)
- Mantenerlo actualizado — Claude lo lee en cada sesión

**Para Hooks Robustos:**
- Siempre incluir `|| true` en comandos de hooks que no deben bloquear
- Usar timeouts razonables (5-30 segundos según la tarea)
- Loggear la ejecución de hooks para debugging
- Probar hooks manualmente antes de activarlos

### 22.2 Anti-patrones a Evitar

**Anti-patrón: Over-trusting en modo Auto**
```bash
# ❌ Peligroso en repos con código legacy
claude --auto "limpia todo el código antiguo"
# → Claude puede eliminar código "legacy" que en realidad es crítico

# ✅ Mejor: describir exactamente qué está "antiguo"
claude "El módulo src/legacy/old-auth.js puede eliminarse, fue reemplazado por src/services/auth.js. Verifica que no haya referencias y elimínalo si es seguro."
```

**Anti-patrón: Context overflow sin compactar**
```bash
# ❌ Después de 2h de trabajo sin /compact
# → Claude empieza a "olvidar" instrucciones de CLAUDE.md
# → Respuestas menos coherentes con el proyecto

# ✅ Compactar cada vez que se cambia de tarea principal
/compact
```

**Anti-patrón: Permisos demasiado amplios**
```json
// ❌ Evitar en producción
{ "permissions": { "allow": ["Bash(*)", "Write(*)"] } }

// ✅ Ser específico
{ "permissions": { 
  "allow": ["Bash(npm run*)", "Bash(git*)", "Write(src/**)"]
} }
```

**Anti-patrón: No usar CLAUDE.md**
```
Sin CLAUDE.md: Claude dedica parte del contexto en cada sesión
a "descubrir" la estructura del proyecto.

Con CLAUDE.md bien escrito: Claude ya sabe el contexto desde
el primer token, y trabaja más eficientemente.
```

---

## 23. Recetas de Workflow

### 23.1 Feature Development Completo

```bash
# 1. Crear branch
git checkout -b feature/analytics-dashboard

# 2. Planificar con Claude
claude --plan "Implementar dashboard de analytics con:
  - Endpoint GET /api/v1/analytics (con filtros de fecha y fuente)
  - Métricas: total leads, conversion rate, top sources
  - Tests unitarios
  - Documentación JSDoc"

# 3. Revisar el plan → Shift+Tab para ejecutar

# 4. Claude implementa (en modo Auto si confías en el plan)
# → Crea src/routes/analytics.js
# → Crea src/services/analytics.service.js
# → Crea tests/analytics.test.js
# → Actualiza CLAUDE.md

# 5. Review de seguridad
/audit

# 6. Tests
/test-all

# 7. Pre-deploy check
/deploy-check

# 8. Commit y PR
git add -A
git commit -m "feat: agregar dashboard de analytics con métricas de conversión"
```

### 23.2 Debugging Eficiente

```bash
# Bug: "Los leads del martes no aparecen en el reporte semanal"

# 1. Dar contexto específico a Claude
claude "Tengo un bug: los leads creados los martes no aparecen en el 
reporte semanal GET /api/v1/reports/weekly. 
El endpoint está en src/routes/reports.js.
Aquí está el log de error: $(cat logs/error-2026-05-13.log | grep 'weekly')"

# 2. Claude analiza → propone hipótesis → pide confirmación para fix

# 3. Validar la solución propuesta
/review  # Revisar los cambios propuestos

# 4. Agregar test de regresión
claude "Agrega un test que reproduzca el bug de los leads del martes 
para que no regrese"
```

### 23.3 Refactoring Seguro

```bash
# Refactoring de módulo grande

# 1. Modo Plan primero
/plan
"Quiero refactorizar src/services/leads.service.js que tiene 800 líneas.
Separar en: leads-crud.service.js, leads-scoring.service.js, leads-notification.service.js"

# 2. Revisar el plan detalladamente

# 3. Implementar con tests primero
claude "Antes de refactorizar, asegúrate de que los tests existentes 
cubren el comportamiento actual. Si hay cobertura insuficiente, 
agrega tests de la funcionalidad actual primero."

# 4. Ejecutar refactoring
/auto  # Shift+Tab para activar modo Auto
"Ahora ejecuta el plan de refactoring"

# 5. Verificar que todos los tests siguen pasando
/test-all
```

### 23.4 Setup de Nuevo Proyecto

```bash
cd nuevo-proyecto
npm init -y

# Claude configura el proyecto desde cero
claude "Configura un proyecto Node.js/Express con:
- Express 4.x + Helmet + CORS + rate-limit
- Estructura: routes/, controllers/, services/, middlewares/
- ESLint + Prettier configurados
- Jest para tests
- .env.example con variables documentadas
- CLAUDE.md con documentación del proyecto
- .gitignore apropiado
- README.md básico"
```

---

## 24. Quick Reference Card

### Comandos Esenciales

```bash
# Iniciar sesión
claude                         # Interactivo
claude -p "tarea específica"  # Headless/un comando
claude --continue              # Retomar última sesión

# Modelos
claude --model claude-opus-4-7     # Opus (más capaz)
claude --model claude-sonnet-4-6   # Sonnet (recomendado)
claude --model claude-haiku-4-5-20251001  # Haiku (más rápido)

# Modos
Shift+Tab  # Ciclar Normal → Plan → Auto (en sesión)
claude --plan "tarea"   # Solo planificar
claude --auto "tarea"   # Sin confirmaciones

# Configuración
claude config set model claude-sonnet-4-6
claude config list
```

### Estructura de Directorios Claude Code

```
~/.claude/
  settings.json     → Configuración global
  CLAUDE.md         → Memoria global
  skills/           → Skills globales (disponibles en todos los proyectos)
  agents/           → Agentes personalizados globales
  commands/         → Comandos slash globales (/review, /audit, etc.)
  hooks/            → Scripts de hooks
  sessions/         → Historial de sesiones
  
.claude/            (en cada proyecto)
  settings.json     → Configuración del proyecto (commiteado)
  settings.local.json → Configuración local (NO commiteado)
  skills/           → Skills del proyecto
  agents/           → Agentes del proyecto
  commands/         → Comandos del proyecto
  hooks/            → Hooks del proyecto
```

### Tabla de Modelos

```
Modelo              ID                           Precio input/output  Contexto
─────────────────────────────────────────────────────────────────────────────
Opus 4.7            claude-opus-4-7              $5/$25 /MTok        200K
Sonnet 4.6          claude-sonnet-4-6            $3/$15 /MTok        1M (beta)
Haiku 4.5           claude-haiku-4-5-20251001    $1/$5  /MTok        200K
```

### Permisos Comunes

```json
// Permitir
"Read(src/**)"         // Leer archivos en src/
"Bash(git*)"           // Comandos git
"Bash(npm run*)"       // Scripts npm
"Edit(src/**)"         // Editar en src/
"Skill"                // Ejecutar skills

// Denegar
"Read(.env*)"          // Bloquear .env
"Bash(rm -rf*)"        // Bloquear rm -rf
"Bash(sudo*)"          // Bloquear sudo
```

### Hooks Más Útiles

```json
// Linting automático post-edición
{ "PostToolUse": [{ "matcher": "Edit", "hooks": [{ "type": "command", "command": "npx eslint --fix $FILE" }] }] }

// Notificación al terminar (macOS)
{ "Stop": [{ "hooks": [{ "type": "command", "command": "osascript -e 'display notification \"Listo\" with title \"Claude Code\"'" }] }] }

// Protección de .env
{ "PreToolUse": [{ "hooks": [{ "type": "command", "command": "~/.claude/hooks/protect-secrets.sh" }] }] }
```

---

## 25. Novedades v2.1.139 – v2.1.141

Esta seccion documenta las funcionalidades incorporadas en las versiones mas recientes y como aprovecharlas en el ecosistema Diego-Orosa / Stack-IA-Creador.

### 25.1 Agent View — `claude agents`

**Novedad v2.1.139.** El comando `claude agents` abre una vista operacional de todas las sesiones de agentes activas o recientes.

```bash
claude agents          # Abre Agent View en el terminal
```

Desde Agent View se puede:
- Ver que subagentes estan en ejecucion y su estado
- Navegar entre sesiones paralelas
- Enviar mensajes a sesiones especificas con `SendMessage`
- Monitorear output en tiempo real

**Uso en Stack-IA-Creador:** Cuando se generan multiples assets PWA en paralelo o se ejecutan auditorias con subagentes, usar `claude agents` para supervisar sin interrumpir.

### 25.2 Comando `/goal`

**Novedad v2.1.139.** Define una condicion de finalizacion: Claude sigue trabajando hasta que se cumpla el objetivo especificado.

```
/goal Service Worker actualizado con estrategia cache-first, tests pasando, LCP < 2.5s verificado
```

Claude no se detiene hasta que:
1. Los tests pasen (`npm test`)
2. El build sea exitoso
3. La funcionalidad este completa segun la descripcion

### 25.3 `continueOnBlock: true` en PostToolUse

**Novedad v2.1.139.** Cuando un hook PostToolUse bloquea una operacion (exit code 2), por defecto Claude se detiene. Con `continueOnBlock: true`, Claude continua la sesion aunque el hook haya bloqueado.

```json
{
  "PostToolUse": [{
    "matcher": "Edit|Write",
    "hooks": [{
      "type": "command",
      "command": "npx prettier --write \"$FILE\" 2>/dev/null || true",
      "timeout": 15,
      "continueOnBlock": true
    }]
  }]
}
```

**Configurado en este proyecto:** Activo. Ver `.claude/settings.json`

### 25.4 Variable de Entorno `CLAUDE_PROJECT_DIR`

**Novedad v2.1.139.** Los servidores MCP stdio y los comandos de hooks pueden usar `$CLAUDE_PROJECT_DIR` para referenciar el directorio raiz del proyecto actual de forma dinamica.

```bash
# En un hook command:
command: "cd $CLAUDE_PROJECT_DIR && npx eslint --fix $FILE"
```

**Uso en Stack-IA-Creador:** Los hooks de Prettier y Jest usan `$CLAUDE_PROJECT_DIR` para garantizar que siempre ejecutan desde la raiz del proyecto.

### 25.5 `subagent_type` en Hook Input de Agentes

**Novedad v2.1.139-140.** El payload de entrada (`HOOK_INPUT`) para hooks que se ejecutan en contexto de agentes ahora incluye el campo `subagent_type`. Permite logica condicional segun el tipo de agente activo.

```bash
SUBAGENT_TYPE=$(echo $HOOK_INPUT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('subagent_type',''))" 2>/dev/null)
```

### 25.6 `args: string[]` para Command Hooks

**Novedad v2.1.139.** Los hooks de tipo `command` ahora aceptan el campo `args` (array de strings) ademas de `command` (string).

```json
{
  "type": "command",
  "command": "node",
  "args": ["$CLAUDE_PROJECT_DIR/scripts/post-edit-check.js", "--file", "$FILE"],
  "timeout": 10
}
```

### 25.7 Correcciones Importantes v2.1.140

- **ConfigChange hooks no disparaban** — Ahora funcionan correctamente
- **`disableAllHooks` sin otras configuraciones** — No deshabilitaba si no habia otros hooks. Corregido
- **Composicion `allowManagedHooksOnly` + `disableAllHooks`** — La jerarquia global -> proyecto -> local ahora se respeta
- **Variables de entorno en dialogos de permisos** — Los dialogos ahora solo muestran informacion relevante
- **`/scroll-speed` no funcionaba** — Corregido en v2.1.140

### 25.8 Resumen de Cambios en la Configuracion del Proyecto

| Archivo | Cambio |
|---------|--------|
| `~/.claude/settings.json` | `continueOnBlock: true` en PostToolUse hook |
| `Diego-Orosa/.claude/settings.json` | `continueOnBlock: true` + `$CLAUDE_PROJECT_DIR` en hooks |
| `stack-ia-creador/.claude/settings.json` | `continueOnBlock: true` + `$CLAUDE_PROJECT_DIR` en hooks |
| `IMPLEMENTATION_PLAN.md` | Seccion explicita de estrategia de auto-activacion |

---

*Manual generado el 2026-05-14 | Claude Code v2.1.141 | Ecosistema Stack-IA-Creador*
*Repositorio: laboratoriolegalcontable-png/stack-ia-creador*
*Manual generado el 2026-05-14 | Claude Code v2.1.141 | Ecosistema Diego-Orosa*
*Repositorio: laboratoriolegalcontable-png/diego-orosa*
