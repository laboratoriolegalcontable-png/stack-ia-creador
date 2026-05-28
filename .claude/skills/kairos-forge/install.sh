#!/usr/bin/env bash
# =============================================================================
# KAIROS FORGE — Instalador autocontenido
# Funciona de dos maneras:
#
#   1. Desde la carpeta del repo (recomendado):
#      bash ~/.claude/skills/kairos-forge/install.sh
#      bash /ruta/a/Diego-Orosa/.claude/skills/kairos-forge/install.sh
#
#   2. Descargando el script directamente con curl + token:
#      curl -H "Authorization: token TU_GITHUB_PAT" -fsSL \
#        "https://raw.githubusercontent.com/laboratoriolegalcontable-png/Diego-Orosa/claude/kairos-forge-system-aUtO9/.claude/skills/kairos-forge/install.sh" | bash
#
#   3. Si tenes el repo clonado localmente:
#      cd /ruta/al/repo && bash .claude/skills/kairos-forge/install.sh
#
# Nota: repo privado — la URL publica sin token devuelve 404. Usar opcion 1 o 3.
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SKILLS_DIR="$HOME/.claude/skills"
MEMORY_DIR="$HOME/.claude/memory"

log()   { echo -e "${GREEN}[forge]${NC} $1"; }
warn()  { echo -e "${YELLOW}[forge]${NC} $1"; }
error() { echo -e "${RED}[forge ERROR]${NC} $1" >&2; }

header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Detectar si estamos corriendo desde el repo local
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"
REPO_ROOT=""
if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/SKILL.md" ]; then
  # Subir 4 niveles: skills/kairos-forge/ -> skills/ -> .claude/ -> repo/
  REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." 2>/dev/null && pwd || echo "")"
fi

header "KAIROS FORGE — Instalador"

# =============================================================================
# Crear estructura base
# =============================================================================
log "Creando estructura de directorios..."
mkdir -p "$SKILLS_DIR/kairos-forge"
mkdir -p "$SKILLS_DIR/kairos-sentinel"
mkdir -p "$SKILLS_DIR/kairos-genesis"
mkdir -p "$SKILLS_DIR/kairos-memory-v4"
mkdir -p "$MEMORY_DIR/sessions"

# =============================================================================
# Funcion para copiar desde repo local o escribir contenido embebido
# =============================================================================
install_skill() {
  local skill_name="$1"
  local src_file=""

  if [ -n "$REPO_ROOT" ] && [ -f "$REPO_ROOT/.claude/skills/$skill_name/SKILL.md" ]; then
    # Modo repo local — copiar archivos
    cp "$REPO_ROOT/.claude/skills/$skill_name/SKILL.md" "$SKILLS_DIR/$skill_name/SKILL.md"
    log "Copiado desde repo local: $skill_name"
    return 0
  fi

  # Modo standalone — escribir contenido embebido
  case "$skill_name" in
    kairos-forge)    write_kairos_forge ;;
    kairos-sentinel) write_kairos_sentinel ;;
    kairos-genesis)  write_kairos_genesis ;;
    kairos-memory-v4) write_kairos_memory_v4 ;;
    kairos-legendario) warn "kairos-legendario: solo modo repo (no embebido)"; return 0 ;;
    *) warn "Skill desconocido: $skill_name"; return 1 ;;
  esac
  log "Instalado (standalone): $skill_name"
}

# =============================================================================
# Contenido embebido — kairos-forge
# =============================================================================
write_kairos_forge() {
cat > "$SKILLS_DIR/kairos-forge/SKILL.md" << 'FORGE_EOF'
---
name: kairos-forge
description: >
  Motor maestro de creacion, instalacion y mejora de skills y subagentes.
  Crea skills nuevas desde templates, perfecciona las existentes, detecta proyectos
  nuevos y bootstrapea el stack correcto automaticamente. Integrado con Kairos Legendario.
  Memoria persistente cross-sesion. Un solo comando instala todo el ecosistema.
version: 1.0.0
---

# Kairos Forge — Fabrica de Skills y Subagentes

## Cuando activar

- Palabras clave: forge, fabrica, crear skill, nuevo agente, subagente, bootstrap, instalar skills
- Comandos: `/kairos-forge`, `@Kairos forge`, `/forge`
- Detecta proyecto nuevo sin CLAUDE.local.md → activa genesis automaticamente
- Palabras clave de mejora: "mejorar skill", "actualizar agente", "agregar capacidad"
- Palabras clave de auditoria: "audita skills", "revisa agentes", "inventario"

## Comandos disponibles

- `@Kairos forge skill [nombre] "[desc]"` — crear skill nuevo desde template
- `@Kairos forge agent [nombre] "[rol]"` — crear subagente especializado
- `@Kairos forge project [tipo]` — bootstrap proyecto nuevo (nextjs/express/landing/legal/marketing)
- `@Kairos forge upgrade [skill]` — mejorar skill existente detectando gaps
- `@Kairos forge audit` — puntuar todos los skills (1-10) y generar reporte
- `@Kairos forge install` — instalar/actualizar todo el ecosistema
- `@Kairos forge memory save [tipo] "[desc]"` — guardar en memoria persistente

## Tipos de proyecto para bootstrap

nextjs | express | landing | mobile | supabase | make | docs | api | legal | inmobiliaria | marketing | ecommerce

## Auto-deteccion

Forge propone crear un skill cuando el usuario repite la misma tarea manual 2+ veces.
Forge mejora automaticamente skills que fallan o producen resultados vacios.
FORGE_EOF
}

# =============================================================================
# Contenido embebido — kairos-sentinel
# =============================================================================
write_kairos_sentinel() {
cat > "$SKILLS_DIR/kairos-sentinel/SKILL.md" << 'SENTINEL_EOF'
---
name: kairos-sentinel
description: >
  Monitor autonomo de todos los sistemas del ecosistema Estudio Oro.
  Vigila Vercel, Supabase, Make.com, GitHub Actions y bots WhatsApp.
  Detecta fallos, aplica fix automatico cuando puede, escala a Diego cuando no.
version: 1.0.0
---

# Kairos Sentinel — Monitor Autonomo del Ecosistema

## Cuando activar

- Palabras clave: sentinel, monitoreo, esta caido, fallo, no responde, CI rojo
- Palabras clave: build fail, deploy error, supabase down, bot callado, status
- Comandos: `/kairos-sentinel`, `@Kairos sentinel`, `/sentinel`
- Automatico: cuando cualquier otra skill detecta un error de sistema

## Sistemas monitoreados

- Vercel: deploy-oro (prj_iiyUjfRw6GZjkzQsuLBNo0KZm6s7), reclamai (prj_MX2MohcC1b5aa4daUQsQ0xcp1Tno), diego-orosa
- Supabase moljmujlfvtsgkjbtwss: narakia-handler v90, natalia-bot v52, megan-bot v39, narakia-memory v3, daily-report v2
- Make.com team 2012148: s5147949 (WA Diego), s4562335 (reporte), s4561747 (Whapi)
- Bots: Lucrecia (Whapi), Natalia (Meta), Megan (Meta)

## Comandos

- `@Kairos sentinel status` — dashboard semaforo completo
- `@Kairos sentinel [vercel|supabase|make|bots]` — sistema especifico
- `@Kairos sentinel fix "[problema]"` — diagnostica y aplica fix automatico
- `@Kairos sentinel watch [proyecto]` — monitoreo continuo con alertas WA
- `@Kairos sentinel logs [servicio] [N]` — ultimos N logs

## Niveles de respuesta

1. Auto-fix (resuelve solo): webhook Whapi descalineado, edge function pausada, escenario Make inactivo
2. Fix + notificacion a Diego: build Vercel failing, error Supabase, bot sin responder >30min
3. Escalacion critica: data loss, security breach, todos los bots caidos
SENTINEL_EOF
}

# =============================================================================
# Contenido embebido — kairos-genesis
# =============================================================================
write_kairos_genesis() {
cat > "$SKILLS_DIR/kairos-genesis/SKILL.md" << 'GENESIS_EOF'
---
name: kairos-genesis
description: >
  Bootstrapeador autonomo de proyectos nuevos. Detecta tipo de proyecto, instala
  el stack de skills correcto, genera CLAUDE.local.md personalizado, configura sentinel.
  Se activa automaticamente al abrir carpeta sin configuracion Claude.
version: 1.0.0
---

# Kairos Genesis — Bootstrapeador de Proyectos

## Cuando activar

- Palabras clave: proyecto nuevo, bootstrap, setup inicial, configurar proyecto, nuevo repo
- Comandos: `/kairos-genesis`, `@Kairos genesis`, `/genesis`
- Automatico: carpeta sin CLAUDE.local.md ni .claude/ → genesis bootstrap
- Automatico: despues de git clone de repo sin skills

## Stacks por tipo de proyecto

| Tipo | Skills que instala |
|------|--------------------|
| nextjs / react | vercel-react-best-practices, building-components, shadcn-ui, frontend-design, vercel-deploy |
| express / api | express-patterns, protege-tu-app, security-review, narakia-debug |
| landing | instant-landing, frontend-design, copywriter, vercel-deploy, seo-audit |
| legal / estudio | 01-penal-escrito, 02-inmobiliario, 04-tributario, 05-patrimonial, orosa-jarvis |
| marketing | content-machine, copywriter, viral-radar, narakia-socialmedia |
| Todos | kairos-forge, kairos-sentinel, kairos-memory-v4 (siempre) |

## Comandos

- `@Kairos genesis scan` — escanear sin instalar
- `@Kairos genesis bootstrap [tipo]` — instalar stack completo
- `@Kairos genesis bootstrap` — auto-detectar tipo
- `@Kairos genesis refresh` — actualizar CLAUDE.local.md
- `@Kairos genesis add [skill]` — agregar skill especifico

## Que genera

1. Escanea framework, stack, DB, deploy, integraciones, tipo de negocio
2. Instala skills del stack correcto
3. Crea .claude/CLAUDE.local.md con IDs de produccion y reglas del proyecto
4. Registra el proyecto en kairos-sentinel
5. Muestra los 5 comandos mas utiles para empezar
GENESIS_EOF
}

# =============================================================================
# Contenido embebido — kairos-memory-v4
# =============================================================================
write_kairos_memory_v4() {
cat > "$SKILLS_DIR/kairos-memory-v4/SKILL.md" << 'MEMORY_EOF'
---
name: kairos-memory-v4
description: >
  Memoria persistente de doble capa para Claude Code.
  Capa 1 local: ~/.claude/memory/ (decisions, patterns, projects, sessions).
  Capa 2 servidor: Supabase narakia-memory v3 (sync cross-canal, accesible desde WhatsApp).
  Aprende automaticamente de cada sesion. Recuerda decisiones, bugs y contexto de proyectos.
version: 4.0.0
---

# Kairos Memory v4 — Memoria Persistente Cross-Sesion

## Cuando activar

- Palabras clave: recuerda que, guarda esto, para la proxima sesion, no olvides
- Palabras clave: que recuerdas, snapshot, memoria, guardar contexto, persistir
- Comandos: `/kairos-memory-v4`, `@Kairos memory`, `/memory`
- Automatico: sesion >15 intercambios → ofrece snapshot
- Automatico: decision de arquitectura detectada → guarda en decisions.md

## Estructura local

```
~/.claude/memory/
├── decisions.md   ← decisiones importantes (permanente)
├── patterns.md    ← bugs + fixes detectados automaticamente
├── projects.md    ← estado actualizado de cada proyecto
├── contacts.md    ← personas clave, roles, telefonos
└── sessions/      ← snapshot por sesion (fecha.md)
```

## Comandos

- `@Kairos memory save decision "[desc]"` — guardar decision
- `@Kairos memory save patron "[trigger] → [fix]"` — guardar patron de bug
- `@Kairos memory recall "[query]"` — buscar en toda la memoria
- `@Kairos memory snapshot` — guardar sesion completa
- `@Kairos memory context [proyecto]` — cargar contexto de un proyecto
- `@Kairos memory sync` — sincronizar con Supabase narakia-memory

## Auto-aprendizaje

- Decision de arquitectura detectada → decisions.md
- Bug resuelto → patterns.md (causa + fix)
- Cambio en produccion → projects.md
- Persona mencionada con contexto → contacts.md
- Sesion >15 intercambios → ofrece snapshot automatico

## Prioridad de persistencia

1. CLAUDE.md — invariantes criticos del proyecto (mas permanente)
2. ~/.claude/memory/decisions.md — decisiones importantes
3. Supabase user_profiles.memory_summary — cross-canal (8h TTL)
4. ~/.claude/memory/sessions/[fecha].md — snapshots de sesion (30 dias)
MEMORY_EOF
}

# =============================================================================
# Instalar todos los skills
# =============================================================================

echo ""
for skill in kairos-forge kairos-sentinel kairos-genesis kairos-memory-v4 kairos-legendario; do
  install_skill "$skill"
done

# Copiar hooks de memoria al repo si existen (memoria persistente autonoma)
if [ -n "$REPO_ROOT" ] && [ -d "$REPO_ROOT/.claude/hooks/memoria" ]; then
  log "Hooks de memoria presentes en .claude/hooks/memoria (al-iniciar / antes-de-compactar / al-terminar)"
fi

# Copiar REFERENCE.md de forge si existe en repo local
if [ -n "$REPO_ROOT" ] && [ -f "$REPO_ROOT/.claude/skills/kairos-forge/REFERENCE.md" ]; then
  cp "$REPO_ROOT/.claude/skills/kairos-forge/REFERENCE.md" "$SKILLS_DIR/kairos-forge/REFERENCE.md"
  log "Copiado REFERENCE.md"
fi

# =============================================================================
# Inicializar archivos de memoria
# =============================================================================
init_file() {
  local path="$1"
  local content="$2"
  if [ ! -f "$path" ]; then
    echo "$content" > "$path"
    log "Inicializado: $path"
  fi
}

init_file "$MEMORY_DIR/decisions.md" "# Kairos Memory v4 — Decisions
Decisiones importantes guardadas automaticamente.
Formato: [YYYY-MM-DD] [proyecto] DECISION: ... RAZON: ...
---
"

init_file "$MEMORY_DIR/patterns.md" "# Kairos Memory v4 — Patterns
Patrones de bugs detectados y sus fixes.
Formato: [patron: nombre] TRIGGER: ... CAUSA_RAIZ: ... FIX: ...
---
# patron: webhook-whapi-descalineado
TRIGGER: Lucrecia no responde
CAUSA_RAIZ: webhook Whapi apuntando a Make.com en vez de narakia-handler
FIX: GET /functions/v1/narakia-handler?action=setup_webhook
FRECUENCIA: 3 veces (2026-05-19, 2026-05-20 x2)
"

init_file "$MEMORY_DIR/projects.md" "# Kairos Memory v4 — Projects

## diego-orosa
SUPABASE: moljmujlfvtsgkjbtwss
BOTS: narakia-handler v90, natalia-bot v52, megan-bot v39
VERCEL: deploy-oro (prj_iiyUjfRw6GZjkzQsuLBNo0KZm6s7)
ESTADO: PRODUCTION ACTIVE

## reclamai
VERCEL: prj_MX2MohcC1b5aa4daUQsQ0xcp1Tno
PENDIENTE: MP_ACCESS_TOKEN en Supabase edge functions
ESTADO: READY
"

init_file "$MEMORY_DIR/contacts.md" "# Kairos Memory v4 — Contacts

[Diego Orosa] boss_phone=5491140253204 rol=director prefix=Doctor,
[Lucrecia] canal=Whapi phone=5491168777777 persona=coordinadora-general
[Natalia] canal=Meta phone=1137854822734580 persona=tech-specialist
[Megan] canal=Meta persona=inversiones-internacionales
"

# forge-registry
REGISTRY="$HOME/.claude/forge-registry.md"
if [ ! -f "$REGISTRY" ]; then
  cat > "$REGISTRY" << 'REG_EOF'
# Kairos Forge Registry

| Skill | Version | Instalado | Proyectos |
|-------|---------|-----------|-----------|
| kairos-forge | 1.0.0 | auto | todos |
| kairos-sentinel | 1.0.0 | auto | todos |
| kairos-genesis | 1.0.0 | auto | todos |
| kairos-memory-v4 | 4.0.0 | auto | todos |
REG_EOF
  log "forge-registry.md creado"
fi

# sentinel-log
SENTINEL_LOG="$HOME/.claude/sentinel-log.md"
if [ ! -f "$SENTINEL_LOG" ]; then
  echo "# Kairos Sentinel — Log de Incidentes
Formato: [fecha] [sistema] [severidad] [descripcion] [resolucion]
---
" > "$SENTINEL_LOG"
  log "sentinel-log.md creado"
fi

# =============================================================================
# Resumen final
# =============================================================================
header "Instalacion completada"
echo "  Skills instalados:"
echo "    kairos-forge     → @Kairos forge skill/upgrade/audit/project"
echo "    kairos-sentinel  → @Kairos sentinel status/fix/watch"
echo "    kairos-genesis   → @Kairos genesis bootstrap/scan"
echo "    kairos-memory-v4 → @Kairos memory snapshot/recall/sync"
echo ""
echo "  Memoria en: $MEMORY_DIR"
echo "  Registry:   $HOME/.claude/forge-registry.md"
echo ""
echo -e "${GREEN}Comandos de inicio rapido:${NC}"
echo ""
echo "  @Kairos forge skill [nombre] \"[desc]\"  → crear skill nuevo"
echo "  @Kairos sentinel status                 → estado de todos los sistemas"
echo "  @Kairos genesis bootstrap [tipo]        → setup proyecto nuevo"
echo "  @Kairos memory snapshot                 → guardar sesion actual"
echo ""
echo -e "${BLUE}Para instalar en otra maquina:${NC}"
echo "  git clone https://github.com/laboratoriolegalcontable-png/Diego-Orosa.git /tmp/kairos"
echo "  bash /tmp/kairos/.claude/skills/kairos-forge/install.sh"
echo ""
echo -e "${GREEN}Kairos Forge listo.${NC}"
