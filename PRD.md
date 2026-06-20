# PRD — Ecosistema Estudio Oro / Diego Orosa

**Versión**: 2.0  
**Fecha**: 2026-06-02  
**Autor**: Claude Code con Diego Orosa  
**Estado**: Vigente

---

## 1. Visión del Producto

### El Problema
Diego Orosa opera simultáneamente:
- **Estudio de Abogacía** — causas civiles, laborales, penales, familia
- **Inmobiliaria Oroprop** — compra, venta, alquiler, tasaciones
- **Estudio Oro IA** — consultoría y servicios de automatización con IA

El resultado: procesos manuales que consumen tiempo en gestión de leads, publicación de contenido, seguimiento de clientes, campañas publicitarias y comunicaciones.

### La Solución
Una **plataforma de automatización AI-first** donde Claude Code actúa como orquestador inteligente con memoria persistente entre sesiones, y todos los procesos se ejecutan automáticamente sin intervención manual.

### Propuesta de Valor
> "El primer estudio legal/inmobiliario de Argentina que opera con IA como co-piloto en cada proceso de negocio — desde captar un lead hasta cerrar una operación."

---

## 2. Arquitectura del Ecosistema (v2 — Junio 2026)

```
┌──────────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA ESTUDIO ORO v2                      │
│                                                                  │
│  ┌─────────────────┐    ┌───────────────────────────────────┐   │
│  │  FRONTEND PWA   │    │         BACKEND API               │   │
│  │ stack-ia-creador│◄──►│  diego-orosa (Express/TypeScript)  │   │
│  │  (Vercel)       │    │  (Railway / Node.js)               │   │
│  └─────────────────┘    └──────────────┬──────────────────  ┘   │
│                                        │                        │
│  ┌─────────────────┐    ┌──────────────▼──────────────────┐    │
│  │  AUTOMATIZACIÓN │    │        BASES DE DATOS            │    │
│  │  Make.com       │◄──►│  Firebase Firestore (operativo)  │    │
│  │  (6 escenarios  │    │  Supabase (Kairos memory + logs) │    │
│  │   activos)      │    │  (proyecto: moljmujlfvtsgkjbtwss) │    │
│  └─────────────────┘    └─────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────┐    ┌───────────────────────────────────┐   │
│  │  COMUNICACIONES │    │      ADS Y MARKETING              │   │
│  │  WhatsApp Whapi │    │  Meta Ads API                     │   │
│  │  Nodemailer     │    │  Google Ads                       │   │
│  └─────────────────┘    └───────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           CAPA KAIROS / NARAKIA (NUEVA — Mayo 2026)      │   │
│  │                                                          │   │
│  │  Kairos Legendario — orquestador autónomo principal      │   │
│  │  Narakia Nucleus  — edge function Supabase + dashboard   │   │
│  │  Kairos Forge     — fábrica de skills (genérico/public)  │   │
│  │  Bot-Memory       — sincronización de memoria a Supabase │   │
│  │  30+ skills Narakia — agentes especializados por dominio │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Productos del Ecosistema

### 3.1 Diego-Orosa (Backend + Documentación + Skills)

**Repositorio**: `laboratoriolegalcontable-png/diego-orosa`

**Responsabilidades**:
- API REST para el frontend (autenticación, leads, reportes)
- Integración con Firebase Firestore (base de datos operativa)
- Integración con Make.com (webhooks de automatización)
- Integración con WhatsApp vía Whapi.cloud
- Integración con Meta Ads (campañas publicitarias)
- Documentación del ecosistema (100+ archivos .md)
- Skills y agentes de Claude Code para los 3 negocios
- Landing estudiooro.com (Ultra) + 4 verticales

**Endpoints principales**:
```
POST /api/v1/auth/login          → Autenticación JWT
GET  /api/v1/leads               → Listar leads (paginado)
POST /api/v1/leads               → Crear nuevo lead
GET  /api/v1/leads/:id           → Obtener lead
PATCH /api/v1/leads/:id          → Actualizar lead
GET  /api/v1/analytics           → Métricas del negocio
POST /api/v1/webhooks/make       → Webhook Make.com
POST /api/v1/webhooks/whatsapp   → Webhook WhatsApp (Meta)
POST /api/v1/webhooks/whapi      → Webhook Whapi
POST /api/v1/content/generate    → Generar contenido con IA
```

**Skills de Claude Code activas** (selección):
| Skill | Función |
|-------|--------|
| `kairos-legendario` | Orquestador autónomo principal del ecosistema |
| `kairos-forge` | Fábrica de skills y agentes nuevos |
| `kairos-memory-v4` | Memoria persistente cross-sesión en Supabase |
| `kairos-sentinel` | Monitoreo y alertas del ecosistema |
| `narakia-lexia` | Asistente legal (redacción, análisis) |
| `narakia-leadhunter` | Captación automática de leads |
| `narakia-megamark` | Marketing y contenido para los 3 negocios |
| `scrapling` | Generación masiva de leads por vertical |
| `estudio-oro-domain` | Lógica de negocio legal/inmobiliaria |
| `express-patterns` | Patrones de código del proyecto |
| `orosa-jarvis` | Copiloto general para los 6 dominios |

### 3.2 Stack-IA-Creador (Frontend PWA + Skills Públicos)

**Repositorio**: `laboratoriolegalcontable-png/stack-ia-creador`

**Responsabilidades**:
- Dashboard PWA instalable (offline-first)
- Catálogo de prompts IA listos para copiar/pegar
- Herramientas externas curadas (9 programas)
- Agenda de publicación semanal
- Narakia-skills públicos (para la comunidad)
- Kairos Forge (skills instalables sin token)

**Directorio `narakia-skills/`** (público, sin credenciales):
| Skill | Función |
|-------|--------|
| `kairos-legendario` | Versión sanitizada para instalación pública |
| `agente-supremo` | Agente de propósito general |
| `auto-maestro` | Automatización de tareas repetitivas |
| `memoria-narakia` | Sistema de memoria con Supabase |
| `skill-genesis` | Crear skills nuevos desde templates |

### 3.3 Make.com (Automatización — 6 escenarios activos)

| ID | Nombre | Trigger | Acción |
|----|--------|---------|--------|
| s4562333 | Notificar lead nuevo | Webhook | WhatsApp a Diego |
| s4562335 | Reporte semanal | Cron Lun 9am | WhatsApp resumen |
| s4472022 | Email bienvenida | Webhook | Email automático |
| s4561747 | WhatsApp via Whapi | API Call | Enviar mensaje |
| s4561777 | Alerta urgente | Webhook | Notificación inmediata |
| s4740496 | Google Drive folder | API Call | Crear carpeta |

### 3.4 Proyectos Satélite (bajo gestión de Kairos)

| Proyecto | Descripción | Estado |
|---------|-------------|--------|
| `estudiooro.com` | Landing Ultra + 4 verticales (Vercel) | Activo |
| `OroGest v13` | Sistema de gestión de estudio jurídico | En desarrollo |
| `OroGest Lex v4` | CRM legal avanzado | En desarrollo |
| `OropProp` | CRM inmobiliario | Activo |
| `LexArgentum` | Instalador legal | En desarrollo |
| `Reclamai` | Plataforma de reclamos | Protegido — no tocar |

---

## 4. Usuarios y Casos de Uso

### 4.1 Usuario Principal: Diego Orosa

**Perfil**: Abogado + Corredor Inmobiliario matriculado + Fundador de Estudio Oro IA

**Casos de uso diarios**:
1. Kairos escanea el ecosistema al inicio de sesión y presenta briefing de 5 líneas
2. Recibe WhatsApp automático cuando llega un lead nuevo con score de calificación
3. Usa el dashboard PWA para revisar y gestionar leads desde el celular
4. Usa `/scrapling` para generar listas masivas de prospectos por vertical
5. Genera contenido para las 3 marcas con narakia-megamark y narakia-content-creator
6. Monitorea campañas de Meta Ads con el MCP de Meta
7. Revisa el reporte semanal automatizado los lunes a las 9am

**Problemas resueltos**:
| Antes | Ahora |
|-------|-------|
| Revisar manualmente formularios de contacto | Notificación WhatsApp inmediata con score |
| Crear contenido manual para 3 marcas | Generación con IA + programación automática |
| Actualizar CRM manualmente | Sincronización automática vía Make.com |
| Perder contexto entre sesiones de Claude | Kairos carga memoria de Supabase al inicio |
| Buscar qué tarea es prioritaria | Kairos detecta y propone la acción #1 |

---

## 5. Capa Kairos / Narakia — Detalle

### ¿Qué es Kairos?
Kairos es el **orquestador autónomo** del ecosistema. Es un Claude Code skill que:
- Al iniciarse, **lee la memoria de Supabase** (últimas sesiones, tareas, proyectos)
- **Detecta** el estado de todos los proyectos activos
- **Propone** la acción de mayor impacto sin esperar instrucciones
- **Aprende** de cada sesión y guarda patrones en `kairos_memory`
- **Delega** tareas a los 30+ agentes Narakia especializados

### Tablas Supabase (proyecto `moljmujlfvtsgkjbtwss`)
| Tabla | Contenido |
|-------|-----------|
| `kairos_memory` | Conocimiento acumulado (key-value con categorías) |
| `kairos_tasks` | Tareas activas, pendientes y completadas |
| `kairos_projects` | Estado de todos los proyectos |
| `kairos_improvements` | Log de mejoras aplicadas al sistema |
| `narakia_registry` | Catálogo de skills y agentes disponibles |

### Reglas Inviolables del Ecosistema
1. **NO TOCAR** el directorio `reclamai/` en diego-orosa bajo ninguna circunstancia
2. **NO TOCAR** `oro/index.html` en main (es el Ultra deployado en producción)
3. **NO MERGEAR** PRs viejos sin confirmación explícita de Diego
4. **NO BORRAR** archivos sin confirmación
5. **NO PUSHEAR** matrículas profesionales numéricas visibles
6. **NO INCLUIR** CUIT en HTML público
7. **Voz de firma SIEMPRE** — nunca "yo soy abogado", siempre "el estudio", "el equipo"

---

## 6. Roadmap de Funcionalidades

### Q2 2026 (Mayo - Junio)
- [x] Configuración avanzada de Claude Code CLI
- [x] Manual completo de Claude Code en español
- [x] Skills de dominio (estudio-oro-domain, express-patterns)
- [x] Setup de hooks y agentes globales
- [x] Ecosistema Kairos / Narakia (orquestador + memoria + forge)
- [x] Narakia Nucleus (edge function Supabase + panel en dashboard)
- [x] Bot-memory (sincronización de memoria cross-sesión)
- [x] Kairos Forge (fábrica de skills instalables públicamente)
- [x] 30+ skills Narakia especializados por dominio
- [x] Correcciones de seguridad: helmet, CORS restrictivo, rate limit, CSP, HSTS
- [ ] **Whapi webhook con verificación de firma** (pendiente)
- [ ] **API REST completa** (CRUD leads, analytics, content generation)
- [ ] **Dashboard PWA v2** con autenticación y datos reales del backend

### Q3 2026 (Julio - Septiembre)
- [ ] Chat WhatsApp integrado en el dashboard
- [ ] Programador de contenido con IA (generate → schedule → publish)
- [ ] Integración Google Calendar para citas legales
- [ ] Sistema de documentos con IA (contratos, escrituras)
- [ ] Lead scoring automático en webhooks
- [ ] Notificaciones Push PWA para leads de alta calificación

### Q4 2026 (Octubre - Diciembre)
- [ ] Portal de clientes (estado de causas judiciales sin login)
- [ ] Módulo UIF Compliance con alertas automáticas
- [ ] Integración PJN (Poder Judicial de la Nación) para expedientes
- [ ] Sistema de facturación automatizado (AFIP)
- [ ] Multi-tenant (replicar el ecosistema para otros estudios)

---

## 7. Métricas de Éxito

### Métricas de Negocio
| Métrica | Baseline | Target Q2 | Target Q4 |
|---------|----------|-----------|-----------|
| Leads/semana | Manual | 500+ automatizados | 500+ con scoring |
| Tiempo gestión/lead | 30 min | 5 min | < 2 min |
| Contenido/semana | 3-5 manual | 15 semi-auto | 21+ automatizados |
| Tasa de conversión | ~10% | 15% | 25% |
| Tiempo de respuesta WhatsApp | >4h | <5 min | <2 min |

### Métricas Técnicas
| Métrica | Objetivo |
|---------|---------|
| Uptime del backend | > 99.5% |
| Tiempo de respuesta API | < 500ms p95 |
| PWA LCP | < 2.5s |
| Cobertura de tests | > 70% |
| Vulnerabilidades críticas | 0 en producción |
| Sesiones Kairos con memoria cargada | 100% |
| Tareas completadas por Kairos/semana | > 10 |

---

## 8. Decisiones de Arquitectura

### ¿Por qué Vanilla JS en el frontend?
**Decisión**: Sin frameworks (React, Vue, etc.)  
**Razón**: PWA pura, carga máxima de velocidad, cualquier desarrollador puede mantenerlo.  
**Trade-off**: Menos productividad inicial, más control a largo plazo.

### ¿Por qué Firebase Firestore como base operativa?
**Decisión**: Firebase como base de datos principal  
**Razón**: Sin servidor que mantener, SDK Admin para Node.js, tiempo real nativo.  
**Trade-off**: Costos variables según uso, queries complejas más difíciles.

### ¿Por qué Supabase para Kairos?
**Decisión**: Supabase para memoria de Kairos y analytics  
**Razón**: SQL nativo, edge functions, MCP oficial disponible para Claude Code.  
**Trade-off**: Segundo servicio de base de datos, pero cada uno cubre un rol diferente.

### ¿Por qué Make.com para automatización?
**Decisión**: Make.com como orquestador de workflows no-code  
**Razón**: Diego ya lo usa y conoce, conectores nativos para WhatsApp, Google, Meta.  
**Trade-off**: Costo mensual fijo, limitaciones en lógica compleja.

---

## 9. Seguridad y Compliance

### Estado de Seguridad (post-auditoría mayo 2026)
| Control | Estado |
|---------|--------|
| Helmet (headers HTTP) | ✅ Implementado |
| CORS restrictivo | ✅ Implementado |
| Rate limiting | ✅ Implementado |
| CSP + HSTS (frontend) | ✅ Implementado |
| API key timing-safe | ✅ Implementado |
| HMAC raw body (Meta webhooks) | ✅ Implementado |
| Whapi webhook con firma | ⏳ Pendiente |
| DLQ para webhooks fallidos | ⏳ Pendiente |
| Fail-fast DATABASE_URL en producción | ⏳ Pendiente |
| Zod schemas en endpoints | ⏳ Pendiente |

### Compliance Argentina
- **Ley 25.326** (Protección de Datos Personales): Consentimiento antes de guardar datos
- **UIF**: Sistema de alertas para transacciones sospechosas (Q3 2026)
- **CPACF**: No usar IA para dar opiniones legales definitivas — siempre "a criterio del profesional"

---

*PRD v2.0 — actualizado 2026-06-02 | Ecosistema Estudio Oro*
