#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# AUTO-SISTEMA — Instalador del Ecosistema Completo KAIROS
# Instala KAIROS LEGENDARIO + todos los skills operativos
# en cualquier proyecto nuevo.
#
# Uso:
#   bash .claude/skills/auto-sistema/install.sh              → instala en el directorio actual
#   bash .claude/skills/auto-sistema/install.sh /path/to/project  → instala en ruta específica
#   curl -fsSL [URL] | bash                                   → instalación remota
# ═══════════════════════════════════════════════════════════════

set -e

SISTEMA_VERSION="1.0.0"
KAIROS_VERSION="3.5.0"
ORO="\033[38;5;214m"
GRN="\033[38;5;82m"
RED="\033[38;5;196m"
BLU="\033[38;5;39m"
RST="\033[0m"
BLD="\033[1m"

# ── DESTINO ──
TARGET="${1:-.}"
TARGET="$(realpath "$TARGET" 2>/dev/null || echo "$TARGET")"

if [ "$TARGET" != "." ] && [ ! -d "$TARGET" ]; then
  mkdir -p "$TARGET"
  echo -e "${GRN}✓ Directorio creado: $TARGET${RST}"
fi

cd "$TARGET"
PROJECT_NAME="$(basename "$(pwd)")"

echo -e "${ORO}${BLD}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       AUTO-SISTEMA v${SISTEMA_VERSION} — Ecosistema KAIROS          ║"
echo "║       Destino: ${TARGET}  "
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${RST}"

# ── DETECCIÓN DE STACK ──
detect_stack() {
  if [ -f "package.json" ]; then
    if grep -q '"next"' package.json 2>/dev/null; then echo "nextjs"
    elif grep -q '"express"' package.json 2>/dev/null; then echo "express"
    elif grep -q '"react"' package.json 2>/dev/null; then echo "react"
    else echo "node"
    fi
  elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then echo "python"
  elif [ -f "Cargo.toml" ]; then echo "rust"
  elif [ -f "go.mod" ]; then echo "go"
  elif [ -f "supabase/config.toml" ]; then echo "supabase"
  elif [ -f "index.html" ]; then echo "static"
  else echo "generic"
  fi
}

STACK=$(detect_stack)
echo -e "${BLU}→ Proyecto: ${PROJECT_NAME} | Stack: ${STACK}${RST}\n"

# ═══════════════════════════════════════════════
# PASO 1 — ESTRUCTURA BASE
# ═══════════════════════════════════════════════
echo -e "${BLD}[1/6] Estructura .claude/${RST}"
mkdir -p .claude/skills/kairos-legendario
mkdir -p .claude/skills/auto-mode
mkdir -p .claude/skills/auto-sistema
mkdir -p .claude/commands
echo -e "${GRN}  ✓ Directorios creados${RST}"

# ── GIT ──
if [ ! -d ".git" ]; then
  git init -q
  echo -e "${GRN}  ✓ Git inicializado${RST}"
fi

# ═══════════════════════════════════════════════
# PASO 2 — CLAUDE.md
# ═══════════════════════════════════════════════
echo -e "\n${BLD}[2/6] CLAUDE.md${RST}"

if [ ! -f "CLAUDE.md" ]; then
  cat > CLAUDE.md << CLAUDEMD
# CLAUDE.md — ${PROJECT_NAME}
## Configurado por AUTO-SISTEMA v${SISTEMA_VERSION} — $(date +%Y-%m-%d)
## KAIROS LEGENDARIO EON v${KAIROS_VERSION} activo

---

## CONTEXTO DEL PROYECTO
- **Nombre:** ${PROJECT_NAME}
- **Stack:** ${STACK}
- **Instalado:** $(date +%Y-%m-%d)

---

## KAIROS LEGENDARIO — ACTIVACIÓN AUTOMÁTICA

Al entrar al proyecto, KAIROS ejecuta:
1. \`kairos-guard\` → git fetch + verificar estado de ramas
2. \`kairos-sentinel\` → check Vercel + Supabase + Make.com
3. Si hay PRs abiertos → mostrar lista + estado de CI

### Comandos rápidos
\`\`\`
/brief          → Briefing del día: KPIs + agenda + alertas
/orion          → Visión macro de los 6 negocios
/guard          → Estado git + CI + PRs
/sintesis       → Brief ejecutivo nocturno
/memoria [q]    → Buscar en contexto histórico
/eon [dominio]  → Activar submódulo EON especializado
\`\`\`

---

## REGLAS INMUTABLES
1. NUNCA pushear a \`main\` directamente
2. NUNCA hardcodear API keys en código fuente
3. SIEMPRE verificar tests antes de pushear
4. SIEMPRE actualizar memory.md al cerrar el sprint

---

## MEMORIA
Ver: \`.claude/skills/kairos-legendario/memory.md\`
CLAUDEMD
  echo -e "${GRN}  ✓ CLAUDE.md creado${RST}"
else
  if ! grep -q "KAIROS LEGENDARIO" CLAUDE.md 2>/dev/null; then
    printf '\n## KAIROS LEGENDARIO — Integrado %s\nEON v%s activo. Comandos: /brief /orion /guard /sintesis /memoria /eon\nMemoria: .claude/skills/kairos-legendario/memory.md\n' \
      "$(date +%Y-%m-%d)" "$KAIROS_VERSION" >> CLAUDE.md
    echo -e "${GRN}  ✓ CLAUDE.md actualizado con KAIROS${RST}"
  else
    echo -e "${GRN}  ✓ CLAUDE.md ya tiene KAIROS${RST}"
  fi
fi

# ═══════════════════════════════════════════════
# PASO 3 — SKILL: KAIROS-LEGENDARIO
# ═══════════════════════════════════════════════
echo -e "\n${BLD}[3/6] Skill kairos-legendario${RST}"

# Copiar SKILL.md desde el repo fuente si existe, o crear versión mínima
SOURCE_SKILL=""
for path in \
  "$(dirname "$0")/../kairos-legendario/SKILL.md" \
  "$HOME/Diego-Orosa/.claude/skills/kairos-legendario/SKILL.md" \
  "$HOME/stack-ia-creador/.claude/skills/kairos-legendario/SKILL.md"; do
  if [ -f "$path" ]; then
    SOURCE_SKILL="$path"
    break
  fi
done

if [ -n "$SOURCE_SKILL" ]; then
  cp "$SOURCE_SKILL" .claude/skills/kairos-legendario/SKILL.md
  echo -e "${GRN}  ✓ SKILL.md copiado desde: ${SOURCE_SKILL}${RST}"
else
  cat > .claude/skills/kairos-legendario/SKILL.md << SKILLMD
---
name: kairos-legendario
version: ${KAIROS_VERSION}
description: KAIROS LEGENDARIO EON v3.5 — 300 directivas + 42 submódulos + 240+ comandos
triggers:
  - /kairos
  - /eon
  - @Kairos
  - kairos legendario
  - modo boss
---

# KAIROS LEGENDARIO — EON v${KAIROS_VERSION}

Segundo cerebro del Dr. Diego Orosa. 300 directivas EON. 42 submódulos especializados.

## Comandos principales
/brief /orion /guard /sintesis /memoria /eon [dominio]
/eon-lex /eon-prop /eon-sentinel /eon-estrategia /eon-tech
/eon-mya /eon-fund /eon-forensic /eon-compliance /eon-finanzas
/eon-crisis /eon-liquidez /eon-onion /eon-ip /eon-seguros /eon-resiliencia
/eon-legado /eon-lobby /eon-hybrid /eon-paciencia

Doctor, prefijo obligatorio. Ejecutivo, sin relleno. EON-SENTINEL ACTIVO.
SKILLMD
  echo -e "${GRN}  ✓ SKILL.md mínimo creado${RST}"
fi

# Memory
if [ ! -f ".claude/skills/kairos-legendario/memory.md" ]; then
  cat > .claude/skills/kairos-legendario/memory.md << MEMMD
# KAIROS MEMORIA — ${PROJECT_NAME}
## Instalado: $(date +%Y-%m-%d) | Stack: ${STACK}

## ESTADO DEL PROYECTO
- Fase: INICIAL
- Stack: ${STACK}

## PENDIENTES
- [ ] Configurar variables de entorno
- [ ] Primera feature

## APRENDIZAJES
[Se completa durante el desarrollo]

## DECISIONES TÉCNICAS
[Se agrega durante el desarrollo]
MEMMD
  echo -e "${GRN}  ✓ memory.md creado${RST}"
fi

# ═══════════════════════════════════════════════
# PASO 4 — ENTORNO
# ═══════════════════════════════════════════════
echo -e "\n${BLD}[4/6] Archivos de entorno${RST}"

if [ ! -f ".env.example" ] && [ ! -f ".env.local.example" ]; then
  case "$STACK" in
    nextjs)
      cat > .env.local.example << ENVEX
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Otros
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
ENVEX
      ;;
    express|node)
      cat > .env.example << ENVEX
# Supabase
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

PORT=3000
ENVEX
      ;;
    supabase)
      cat > .env.example << ENVEX
# Supabase Edge Functions
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
WHAPI_TOKEN=your_whapi_token
ENVEX
      ;;
    python)
      cat > .env.example << ENVEX
ANTHROPIC_API_KEY=your_anthropic_api_key
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_KEY=your_service_role_key
ENVEX
      ;;
    *)
      echo "ANTHROPIC_API_KEY=your_anthropic_api_key" > .env.example
      ;;
  esac
  echo -e "${GRN}  ✓ .env.example creado para stack ${STACK}${RST}"
fi

# ── .gitignore ──
if [ ! -f ".gitignore" ]; then
  cat > .gitignore << GITIGN
node_modules/
.env
.env.local
.env.*.local
dist/
.next/
__pycache__/
*.pyc
.DS_Store
*.log
.vercel/
GITIGN
  echo -e "${GRN}  ✓ .gitignore creado${RST}"
fi

# ═══════════════════════════════════════════════
# PASO 5 — SDK CLAUDE (si es Node)
# ═══════════════════════════════════════════════
echo -e "\n${BLD}[5/6] Claude SDK${RST}"

if [[ "$STACK" == "nextjs" || "$STACK" == "express" || "$STACK" == "node" || "$STACK" == "react" ]]; then
  if [ -f "package.json" ] && ! grep -q '"@anthropic-ai/sdk"' package.json 2>/dev/null; then
    npm install @anthropic-ai/sdk --save --quiet 2>/dev/null \
      && echo -e "${GRN}  ✓ @anthropic-ai/sdk instalado${RST}" \
      || echo -e "${RED}  ⚠ Instalar manualmente: npm install @anthropic-ai/sdk${RST}"
  else
    echo -e "${GRN}  ✓ Claude SDK ya presente o no aplica${RST}"
  fi
else
  echo -e "${GRN}  ✓ No aplica para stack ${STACK}${RST}"
fi

# ═══════════════════════════════════════════════
# PASO 6 — COMMIT INICIAL
# ═══════════════════════════════════════════════
echo -e "\n${BLD}[6/6] Commit inicial${RST}"

git add -A 2>/dev/null
if ! git diff --staged --quiet 2>/dev/null; then
  git commit -q -m "feat: auto-sistema KAIROS v${KAIROS_VERSION} instalado en ${PROJECT_NAME}" 2>/dev/null \
    && echo -e "${GRN}  ✓ Commit creado${RST}" \
    || echo -e "${GRN}  ✓ Sin cambios para commitear${RST}"
else
  echo -e "${GRN}  ✓ Sin cambios nuevos${RST}"
fi

# ═══════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════
echo -e "\n${ORO}${BLD}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        AUTO-SISTEMA — Instalación completada ✅           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
printf "║  Proyecto: %-46s ║\n" "$PROJECT_NAME"
printf "║  Stack:    %-46s ║\n" "$STACK"
printf "║  Destino:  %-46s ║\n" "$TARGET"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  Archivos creados:                                        ║"
echo "║    ✓ CLAUDE.md                                            ║"
echo "║    ✓ .claude/skills/kairos-legendario/SKILL.md            ║"
echo "║    ✓ .claude/skills/kairos-legendario/memory.md           ║"
echo "║    ✓ .env.example                                         ║"
echo "║    ✓ .gitignore                                           ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  PRÓXIMOS PASOS:                                          ║"
echo "║  1. cp .env.example .env → rellenar valores reales        ║"
echo "║  2. /brief → briefing del día con KAIROS                  ║"
echo "║  3. /eon [dominio] → activar submódulo EON                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${RST}"
