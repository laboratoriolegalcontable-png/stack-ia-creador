# PRD — Ecosistema Estudio Oro / Diego Orosa

**Versión**: 1.0  
**Fecha**: 2026-05-14  
**Autor**: Claude Code (claude-sonnet-4-6) con Diego Orosa  
**Estado**: Vigente

---

## 1. Visión del Producto

### Problema
Diego Orosa opera 3 negocios simultáneamente (Estudio de Abogacía, Inmobiliaria Oroprop, Estudio Oro IA) con procesos manuales que consumen tiempo: gestión de leads, publicación de contenido, seguimiento de clientes, campañas de publicidad, y comunicaciones por WhatsApp y email.

### Solución
Una **plataforma de automatización AI** que conecta todas las herramientas en un ecosistema unificado, donde Claude Code actúa como orquestador inteligente y los procesos se ejecutan automáticamente sin intervención manual.

### Propuesta de Valor
> "El primer estudio legal/inmobiliario de Argentina que opera con IA como co-piloto en cada proceso de negocio — desde captar un lead hasta cerrar una operación."

---

## 2. Arquitectura del Ecosistema

```
┌─────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA ESTUDIO ORO                    │
│                                                             │
│  ┌──────────────────┐    ┌────────────────────────────────┐ │
│  │   FRONTEND PWA   │    │       BACKEND API              │ │
│  │  stack-ia-creador│◄──►│     diego-orosa                │ │
│  │  (Vercel)        │    │     (Railway/Node.js)          │ │
│  └──────────────────┘    └──────────────┬───────────────  ┘ │
│                                         │                   │
│  ┌──────────────────┐    ┌──────────────▼───────────────┐   │
│  │   AUTOMATIZACIÓN │    │       BASES DE DATOS         │   │
│  │   Make.com       │◄──►│   Firebase Firestore         │   │
│  │   (100+ escenarios)   │   Supabase (analytics)       │   │
│  └──────────────────┘    └──────────────────────────────┘   │
│                                                             │
│  ┌──────────────────┐    ┌────────────────────────────────┐ │
│  │   COMUNICACIONES │    │       ADS Y MARKETING          │ │
│  │   WhatsApp Whapi │    │   Meta Ads API                 │ │
│  │   Nodemailer     │    │   Google Ads                   │ │
│  └──────────────────┘    └────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              CLAUDE CODE (Orquestador IA)           │    │
│  │   Skills + Agents + MCP + Hooks + Subagents         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Productos del Ecosistema

### 3.1 Diego-Orosa (Backend + Documentación)

**Repositorio**: `laboratoriolegalcontable-png/diego-orosa`

**Responsabilidades**:
- API REST para el frontend (autenticación, leads, reportes)
- Integración con Firebase (base de datos principal)
- Integración con Make.com (webhooks de automatización)
- Integración con WhatsApp (Whapi.cloud)
- Integración con Meta Ads (campañas)
- Documentación del ecosistema (100+ archivos .md)
- Skills de Claude Code para los 3 negocios

**Endpoints principales**:
```
POST /api/v1/auth/login          → Autenticación
GET  /api/v1/leads               → Listar leads (paginado)
POST /api/v1/leads               → Crear nuevo lead
GET  /api/v1/leads/:id           → Obtener lead
PATCH /api/v1/leads/:id          → Actualizar lead
GET  /api/v1/analytics           → Métricas del negocio
POST /api/v1/webhooks/make       → Webhook de Make.com
POST /api/v1/webhooks/whatsapp   → Webhook de WhatsApp
```

**Skills de Claude Code activas**:
- `scrapling` — Generación de leads automática
- `higgsfield-mcp` — Contenido visual con IA
- `orosa-jarvis` — Copiloto para los 6 dominios del negocio
- `estudio-oro-domain` — Lógica de negocio (NUEVA)
- `express-patterns` — Patrones de código del proyecto (NUEVA)
- + 100+ skills de la comunidad instaladas

### 3.2 Stack-IA-Creador (Frontend PWA)

**Repositorio**: `laboratoriolegalcontable-png/stack-ia-creador`

**Responsabilidades**:
- Dashboard para gestión de leads
- Creación y programación de contenido con IA
- Monitor de campañas de ads
- Visualización de métricas
- Acceso offline (PWA con Service Worker)

**Features principales**:
- Dashboard de KPIs en tiempo real
- CRM visual para gestión de leads
- Editor de contenido con IA integrada
- Planificador de publicaciones
- Reportes y analytics

### 3.3 Make.com (Automatización)

**Escenarios activos**:
| ID | Nombre | Trigger | Acción |
|----|--------|---------|--------|
| s4562333 | Notificar lead nuevo | Webhook | WhatsApp a Diego |
| s4562335 | Reporte semanal | Cron Lun 9am | WhatsApp resumen |
| s4472022 | Email bienvenida | Webhook | Email automático |
| s4561747 | WhatsApp via Whapi | API Call | Enviar mensaje |
| s4561777 | Alerta urgente | Webhook | Notificación inmediata |
| s4740496 | Google Drive folder | API Call | Crear carpeta |

---

## 4. Usuarios y Casos de Uso

### 4.1 Usuario Principal: Diego Orosa

**Perfil**: Abogado + Corredor Inmobiliario + Fundador de Estudio Oro IA

**Casos de uso diarios**:
1. Recibe WhatsApp cuando llega un lead nuevo (automático)
2. Revisa el dashboard de leads en el PWA
3. Usa `/scrapling` para generar listas de prospectos
4. Usa Claude Code para crear contenido de las 3 marcas
5. Monitorea campañas de Meta Ads con el MCP
6. Revisa el reporte semanal automatizado

**Pain points resueltos**:
- ❌ Antes: revisar manualmente formularios de contacto
- ✅ Ahora: notificación inmediata por WhatsApp con score del lead
- ❌ Antes: crear contenido manualmente para 3 marcas
- ✅ Ahora: generación automática con IA y programación
- ❌ Antes: actualizar CRM manualmente
- ✅ Ahora: sincronización automática vía Make.com

---

## 5. Roadmap de Funcionalidades

### Q2 2026 (Mayo - Junio) — En progreso
- [x] Configuración avanzada de Claude Code CLI
- [x] Manual completo de Claude Code en español
- [x] Skills de dominio (estudio-oro-domain, express-patterns)
- [x] Setup de hooks y agentes globales
- [ ] API REST completa para el frontend
- [ ] Dashboard PWA v1 con leads y métricas básicas

### Q3 2026 (Julio - Septiembre)
- [ ] Chat de WhatsApp integrado en el dashboard
- [ ] Programador de contenido con IA (generate → schedule → publish)
- [ ] Integración con Google Calendar para citas legales
- [ ] Sistema de documentos con IA (contratos, escrituras)
- [ ] App móvil nativa (React Native o PWA mejorada)

### Q4 2026 (Octubre - Diciembre)
- [ ] Módulo de UIF Compliance con alertas automáticas
- [ ] Portal de clientes (self-service para clientes del estudio)
- [ ] Integración con PJN (Poder Judicial de la Nación) para expedientes
- [ ] Sistema de facturación automatizado (AFIP)
- [ ] Multi-tenant (replicar el ecosistema para otros estudios)

---

## 6. Métricas de Éxito

### Métricas de Negocio
| Métrica | Baseline | Target Q2 | Target Q4 |
|---------|----------|-----------|-----------|
| Leads/mes | ~20 manuales | 50+ automatizados | 100+ |
| Tiempo gestión/lead | 30 min | 5 min | < 2 min |
| Contenido/semana | 3 posts manuales | 15 posts semi-auto | 30 posts auto |
| Tasa de conversión | ~10% | 15% | 25% |

### Métricas Técnicas
| Métrica | Objetivo |
|---------|----------|
| Uptime del backend | > 99.5% |
| Tiempo de respuesta API | < 500ms p95 |
| PWA LCP | < 2.5s |
| Cobertura de tests | > 70% |
| Vulnerabilidades críticas | 0 en producción |

---

## 7. Decisiones de Arquitectura

### ¿Por qué Vanilla JS en el frontend?
**Decisión**: Sin frameworks (React, Vue, etc.)  
**Razón**: El proyecto necesita PWA pura, carga máxima velocidad y Diego tiene preferencia por código que cualquier desarrollador junior puede mantener. No hay equipo que justifique la complejidad de un framework.  
**Trade-off**: Menos productividad inicial, más control a largo plazo.

### ¿Por qué Firebase Firestore y no PostgreSQL?
**Decisión**: Firebase como base de datos principal  
**Razón**: Sin servidor que mantener, SDK Admin para Node.js, tiempo real nativo, ya está integrado.  
**Trade-off**: Costos variables según uso, queries complejas más difíciles.

### ¿Por qué Make.com para automatización?
**Decisión**: Make.com como orquestador de workflows  
**Razón**: Diego ya lo usa y conoce, no-code accessible, conectores nativos para WhatsApp, Google, Meta.  
**Trade-off**: Costo mensual fijo, limitaciones en lógica compleja.

---

## 8. Seguridad y Compliance

### Datos Sensibles
- Datos de clientes: Firestore con reglas de seguridad estrictas
- API keys: Variables de entorno (nunca en código)
- JWT: Expiración en 1h con refresh token
- WhatsApp tokens: Solo en `.env` (no commiteados)

### Compliance Argentina
- Ley 25.326 (Protección de Datos Personales): Consentimiento antes de guardar datos
- UIF: Sistema de alertas para transacciones sospechosas (Q3 2026)
- CPACF: No usar IA para dar opiniones legales definitivas — siempre "a criterio del profesional"

---

*PRD generado el 2026-05-14 | Ecosistema Estudio Oro*
