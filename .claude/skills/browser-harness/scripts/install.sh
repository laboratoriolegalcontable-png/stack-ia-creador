#!/usr/bin/env bash
# Browser Harness — autonomous installer
# Idempotent. Safe to re-run. Detects OS. Does not ask questions.

set -euo pipefail

BH_REPO="https://github.com/browser-use/browser-harness"
BH_HOME="${BH_HOME:-$HOME/Developer/browser-harness}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEED_DIR="$SKILL_DIR/domain-skills"

log() { printf "\033[1;36m[bh-install]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[bh-install]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[bh-install]\033[0m %s\n" "$*" >&2; }

detect_os() {
  case "$(uname -s)" in
    Darwin) echo "mac" ;;
    Linux) grep -qi microsoft /proc/version 2>/dev/null && echo "wsl" || echo "linux" ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}

ensure_uv() {
  if command -v uv >/dev/null 2>&1; then
    log "uv ya esta instalado ($(uv --version))"
    return
  fi
  log "Instalando uv..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
}

ensure_git() {
  command -v git >/dev/null 2>&1 || { err "git no esta instalado. Instalalo y volve a correr."; exit 1; }
}

clone_or_update() {
  if [ -d "$BH_HOME/.git" ]; then
    log "Repo ya existe en $BH_HOME — actualizando..."
    git -C "$BH_HOME" pull --ff-only origin main 2>/dev/null || warn "No se pudo hacer pull (sin conexion?). Sigo con la version local."
  else
    log "Clonando $BH_REPO -> $BH_HOME"
    mkdir -p "$(dirname "$BH_HOME")"
    git clone --depth 1 "$BH_REPO" "$BH_HOME"
  fi
}

install_deps() {
  log "Instalando dependencias Python con uv sync..."
  (cd "$BH_HOME" && uv sync) || warn "uv sync fallo. Verifica el pyproject.toml del repo upstream."
  log "Instalando Playwright Chromium..."
  (cd "$BH_HOME" && uv run playwright install chromium) || warn "playwright install fallo. Probablemente necesites root para apt-get install deps."
}

copy_seed_skills() {
  local target="$BH_HOME/agent-workspace/domain-skills"
  mkdir -p "$target"
  log "Copiando 5 seed skills LATAM a $target ..."
  for sitio in instagram mercadolibre tiendanube despegar rappi; do
    if [ -d "$SEED_DIR/$sitio" ]; then
      mkdir -p "$target/$sitio"
      # Only copy if upstream doesnt already have it (do not overwrite agent-generated)
      for f in "$SEED_DIR/$sitio"/*.md; do
        [ -f "$f" ] || continue
        local name
        name=$(basename "$f")
        if [ ! -f "$target/$sitio/$name" ]; then
          cp "$f" "$target/$sitio/$name"
          log "  + $sitio/$name (seed)"
        else
          log "  = $sitio/$name (ya existe, agent-generated wins)"
        fi
      done
    fi
  done
}

register_global_claude_md() {
  local claude_md="$HOME/.claude/CLAUDE.md"
  mkdir -p "$HOME/.claude"
  touch "$claude_md"
  if grep -q "BROWSER_HARNESS_SKILL_ACTIVE" "$claude_md" 2>/dev/null; then
    log "CLAUDE.md global ya tiene el bloque de browser-harness"
    return
  fi
  log "Agregando bloque a $claude_md ..."
  cat >> "$claude_md" <<'EOF'

<!-- BROWSER_HARNESS_SKILL_ACTIVE -->
## Browser Harness — siempre disponible

Si el usuario pide cualquier tarea que requiera navegar la web (abrir Chrome,
sacar precios, monitorear competencia, scrap de feeds, lead hunting), invocas
el skill `browser-harness` sin preguntar. Tenes 95+ sitios del catalogo
upstream + 5 LATAM (instagram, mercadolibre, tiendanube, despegar, rappi).

Variable de entorno requerida en cada shell donde corras browser-harness:
```bash
export BH_DOMAIN_SKILLS=1
```

Para autonomia 24/7, usa `bux` en VPS — ver skill SKILL.md.
<!-- END_BROWSER_HARNESS_SKILL_ACTIVE -->
EOF
}

inject_shell_env() {
  for rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
    [ -f "$rc" ] || continue
    if ! grep -q "BH_DOMAIN_SKILLS" "$rc"; then
      log "Agregando BH_DOMAIN_SKILLS=1 a $rc"
      echo '' >> "$rc"
      echo '# browser-harness — domain skills activas' >> "$rc"
      echo 'export BH_DOMAIN_SKILLS=1' >> "$rc"
      echo 'export BH_HOME="$HOME/Developer/browser-harness"' >> "$rc"
    fi
  done
}

print_chrome_instructions() {
  local os="$1"
  echo ""
  log "============================================"
  log " ULTIMO PASO: abri Chrome con remote debug"
  log "============================================"
  echo ""
  case "$os" in
    mac)
      cat <<'EOF'
Cerra Chrome COMPLETAMENTE (Cmd+Q) y volve a abrirlo asi:

  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --remote-debugging-port=9222

Si querer un perfil separado para no romper tu Chrome principal:

  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --remote-debugging-port=9222 \
    --user-data-dir=$HOME/.bh-chrome-profile
EOF
      ;;
    linux|wsl)
      cat <<'EOF'
Cerra Chrome y abrilo asi:

  google-chrome --remote-debugging-port=9222

O con perfil separado:

  google-chrome --remote-debugging-port=9222 \
    --user-data-dir=$HOME/.bh-chrome-profile
EOF
      ;;
    windows)
      cat <<'EOF'
En PowerShell:

  & "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    --remote-debugging-port=9222
EOF
      ;;
  esac
  echo ""
  log "Despues verifica con: cd \$BH_HOME && uv run browser-harness --doctor"
  echo ""
}

main() {
  local os
  os=$(detect_os)
  log "OS detectado: $os"

  ensure_git
  ensure_uv
  clone_or_update
  install_deps
  copy_seed_skills
  register_global_claude_md
  inject_shell_env
  print_chrome_instructions "$os"

  log "Instalacion completa."
}

main "$@"
