# Plan de Implementación — Ecosistema Estudio Oro

**Versión**: 1.0  
**Fecha**: 2026-05-14  
**Branch**: `claude/setup-cli-docs-SfVmS`

---

## Estado Actual (Post-Setup de Claude Code)

### ✅ Completado en esta sesión

#### Infraestructura Global (~/.claude/)
- [x] `~/.claude/settings.json` — Configuración global con permisos, hooks y modelo por defecto
- [x] `~/.claude/hooks/protect-secrets.sh` — Hook de protección de archivos sensibles
- [x] `~/.claude/skills/security-reviewer/` — Auditor OWASP automático
- [x] `~/.claude/skills/code-reviewer/` — Revisor de calidad Node.js
- [x] `~/.claude/skills/node-expert/` — Experto Express/Node.js
- [x] `~/.claude/skills/api-designer/` — Diseñador de APIs REST
- [x] `~/.claude/skills/frontend-expert/` — Experto PWA/Vanilla JS
- [x] `~/.claude/agents/security-auditor.md` — Agente auditor (Opus, solo lectura)
- [x] `~/.claude/agents/code-explorer.md` — Agente explorador (Haiku, rápido)
- [x] `~/.claude/commands/review.md` — Comando `/review`
- [x] `~/.claude/commands/audit.md` — Comando `/audit`
- [x] `~/.claude/commands/deploy-check.md` — Comando `/deploy-check`
- [x] `~/.claude/commands/test-all.md` — Comando `/test-all`

#### Diego-Orosa
- [x] `.claude/settings.json` — Hooks ESLint + Jest reminder + protección
- [x] `.mcp.json` — Make.com + GitHub + Supabase agregados
- [x] `.claude/skills/estudio-oro-domain/` — Lógica de negocio legal/inmobiliaria
- [x] `.claude/skills/express-patterns/` — Patrones Express del proyecto
- [x] `CLAUDE_CODE_MANUAL.md` — Manual completo en español
- [x] `PRD.md` — Product Requirements Document del ecosistema
- [x] `IMPLEMENTATION_PLAN.md` — Este archivo

#### Stack-IA-Creador
- [x] `CLAUDE.md` — Documentación del proyecto PWA
- [x] `.claude/settings.json` — Hooks Prettier + protección
- [x] `.claude/skills/pwa-patterns/` — Patrones PWA del proyecto
- [x] `CLAUDE_CODE_MANUAL.md` — Manual completo en español (copia)

---

## Próximas Fases

### FASE 1: API REST Backend (Prioridad ALTA)
**Objetivo**: Tener una API funcional para el dashboard PWA

**Tareas**:
```
1. Crear src/routes/leads.routes.js con CRUD completo
2. Crear src/controllers/leads.controller.js
3. Crear src/services/leads.service.js (Firebase)
4. Crear src/middlewares/auth.middleware.js (JWT)
5. Crear src/middlewares/validate.middleware.js (Zod)
6. Crear src/middlewares/errorHandler.js
7. Crear src/config/firebase.js
8. Actualizar server.js con todas las rutas
9. Crear tests/leads.test.js
10. Documentar con OpenAPI/Swagger
```

**Cómo ejecutar con Claude Code**:
```bash
cd /home/user/Diego-Orosa
claude "Implementa la API REST completa para leads según PRD.md sección 3.1. 
Usa los patrones en .claude/skills/express-patterns/SKILL.md y 
.claude/skills/estudio-oro-domain/SKILL.md. 
Incluye tests con Jest. Protege rutas con JWT."
```

**Estimación**: 2-4 horas de Claude Code

---

### FASE 2: Dashboard PWA v1 (Prioridad ALTA)
**Objetivo**: Dashboard operativo para ver y gestionar leads

**Tareas**:
```
1. Refactorizar index.html con estructura semántica
2. Crear src/api.js (cliente HTTP para el backend)
3. Crear src/store.js (state management reactivo)
4. Crear src/components/leads-table.js
5. Crear src/components/stats-cards.js
6. Actualizar sw.js con estrategia óptima
7. Actualizar styles.css con CSS custom properties
8. Tests básicos de integración
```

**Cómo ejecutar con Claude Code**:
```bash
cd /home/user/stack-ia-creador
claude "Implementa el Dashboard PWA v1 según CLAUDE.md y PRD.md. 
Vanilla JS puro, sin frameworks. Service Worker con stale-while-revalidate.
El backend está definido en el repo diego-orosa."
```

**Estimación**: 3-6 horas de Claude Code

---

### FASE 3: Integración WhatsApp y Notificaciones (Prioridad MEDIA)
**Objetivo**: Notificaciones automáticas cuando llega un lead

**Tareas**:
```
1. Endpoint POST /api/v1/webhooks/whatsapp
2. Servicio de scoring automático de leads
3. Integración con Make.com escenario s4562333
4. Tests de integración para el flujo completo
5. Monitoreo de errores en notificaciones
```

**Cómo ejecutar**:
```bash
claude "Implementa el sistema de notificaciones automáticas de leads. 
Ver .claude/skills/estudio-oro-domain/SKILL.md para el scoring y 
el flujo de notificación. Usar s4562333 de Make.com."
```

---

### FASE 4: Contenido con IA (Prioridad MEDIA)
**Objetivo**: Generar y programar contenido para las 3 marcas

**Tareas**:
```
1. Integración de Claude API en el backend para generación de contenido
2. UI en el dashboard para input de brief
3. Endpoints POST /api/v1/content/generate
4. Integración con Make.com para publicación en redes
5. Historial de contenido generado
```

---

### FASE 5: Analytics y Reportes (Prioridad MEDIA)
**Objetivo**: Métricas accionables del negocio

**Tareas**:
```
1. Endpoint GET /api/v1/analytics con filtros
2. Componente de charts en el dashboard (usando Chart.js o canvas nativo)
3. Reporte semanal automatizado (Make.com s4562335 mejorado)
4. Dashboard de Meta Ads integrado
```

---

### FASE 6: Portal de Clientes (Prioridad BAJA — Q4 2026)
**Objetivo**: Self-service para clientes del estudio

**Tareas**:
```
1. Autenticación separada para clientes
2. Vista de estado de expedientes
3. Subida de documentos
4. Comunicación encriptada con el estudio
5. Integración con PJN (Poder Judicial)
```

---

## Comandos de Claude Code por Fase

### Setup rápido para nueva feature
```bash
# Siempre en el branch correcto
git checkout claude/setup-cli-docs-SfVmS  # o crear branch de feature

# Activar plan mode primero
claude --plan "Implementar [feature]"

# Después de revisar el plan, ejecutar
claude --auto "Implementar [feature] según el plan"

# Review y push
/review
/deploy-check
git add -A && git commit -m "feat: [descripción]"
git push -u origin [branch]
```

### Flujo diario de mantenimiento
```bash
# Auditoría de seguridad semanal
claude --agent security-auditor "Audita el proyecto completo"

# Check de dependencias
/audit --deps

# Revisar deuda técnica
claude "Lista la deuda técnica prioritaria en src/ con estimación de tiempo"
```

---

## Configuración de Entorno

### Variables de Entorno Necesarias (diego-orosa)
```bash
# .env (ver .env.example para la lista completa)
NODE_ENV=production
PORT=3000
JWT_SECRET=         # min 256 bits, usar: openssl rand -base64 32
JWT_REFRESH_SECRET= # diferente al JWT_SECRET

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=  # La key completa con \n escapados

# WhatsApp
WHAPI_TOKEN=
WHATSAPP_NUMERO_DIEGO=  # formato: 5491112345678

# Make.com
MAKE_API_KEY=

# Meta Ads
META_ACCESS_TOKEN=
META_APP_ID=
META_APP_SECRET=
```

### Variables de Entorno Necesarias (stack-ia-creador)
```bash
# .env (para desarrollo local con el backend local)
API_BASE_URL=http://localhost:3000
```

---

## Guía de Uso de Claude Code para el Equipo

### Para implementar una nueva feature
```
1. Leer PRD.md sección relevante
2. `claude --plan "Implementar X"` — revisar el plan
3. Shift+Tab para activar modo Auto
4. Ejecutar el plan
5. `/review` para code review
6. `/test-all` para verificar tests
7. `/deploy-check` antes de pushear
```

### Para debugging
```
1. Dar contexto específico: archivo + línea + error + log
2. `claude "El error es: [error]. Está en [archivo]:[línea]"`
3. Claude propone y ejecuta el fix
4. Verificar con `/test-all`
```

### Para auditoría de seguridad
```
/audit
# O para auditoría profunda:
@security-auditor "Audita el módulo de autenticación completo"
```

---

*Plan generado el 2026-05-14 | Claude Code v2.1.141*
