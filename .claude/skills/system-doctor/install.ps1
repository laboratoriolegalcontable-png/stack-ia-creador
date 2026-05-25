# System Doctor — Auto-instalador para Windows
# Uso: irm https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/install.ps1 | iex
# O localmente: PowerShell -ExecutionPolicy Bypass -File install.ps1

$ErrorActionPreference = "Continue"
$REPO_RAW = "https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main"
$CLAUDE_DIR = "$env:USERPROFILE\.claude"
$SKILLS_DIR = "$CLAUDE_DIR\skills\system-doctor"
$AGENTS_DIR = "$CLAUDE_DIR\agents"
$COMMANDS_DIR = "$CLAUDE_DIR\commands"

# Detectar si estamos dentro del repo
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$REPO_ROOT = (Resolve-Path "$SCRIPT_DIR\..\..\..\.." -ErrorAction SilentlyContinue)?.Path

function Write-OK   { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[--] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[!!] $msg" -ForegroundColor Yellow }
function Write-Err  { param($msg) Write-Host "[XX] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   SYSTEM DOCTOR — Auto-instalador        ║" -ForegroundColor Blue
Write-Host "║   Windows · Estudio Oro S.A.S.           ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# ── 1. Verificar Windows ─────────────────────────────────────────────────────
$OS = [System.Environment]::OSVersion.Platform
Write-OK "Plataforma: Windows $([System.Environment]::OSVersion.Version)"

# ── 2. Crear directorios ─────────────────────────────────────────────────────
Write-Info "Creando directorios..."
@($SKILLS_DIR, $AGENTS_DIR, $COMMANDS_DIR) | ForEach-Object {
    New-Item -ItemType Directory -Path $_ -Force | Out-Null
}
Write-OK "Directorios creados en $CLAUDE_DIR"

# ── 3. Funcion para copiar o descargar ───────────────────────────────────────
function Get-FileFromRepoOrUrl {
    param($RelPath, $Dest)
    $filename = Split-Path $Dest -Leaf
    $localSrc = if ($REPO_ROOT) { Join-Path $REPO_ROOT $RelPath } else { $null }

    if ($localSrc -and (Test-Path $localSrc)) {
        Copy-Item $localSrc $Dest -Force
        Write-OK "Copiado: $filename"
    } else {
        Write-Info "Descargando: $filename..."
        try {
            Invoke-WebRequest -Uri "$REPO_RAW/$($RelPath -replace '\\','/')" -OutFile $Dest -UseBasicParsing
            Write-OK "Descargado: $filename"
        } catch {
            Write-Warn "No se pudo obtener: $filename"
        }
    }
}

# ── 4. Instalar archivos del skill ───────────────────────────────────────────
Write-Info "Instalando archivos del System Doctor..."
Get-FileFromRepoOrUrl ".claude/skills/system-doctor/SKILL.md"     "$SKILLS_DIR\SKILL.md"
Get-FileFromRepoOrUrl ".claude/skills/system-doctor/REFERENCE.md" "$SKILLS_DIR\REFERENCE.md"

# ── 5. Instalar sub-agentes ──────────────────────────────────────────────────
Write-Info "Instalando sub-agentes..."
@("doctor-memoria","doctor-limpieza","doctor-procesos","doctor-blindaje","doctor-backup") | ForEach-Object {
    Get-FileFromRepoOrUrl ".claude/agents/$_.md" "$AGENTS_DIR\$_.md"
}

# ── 6. Instalar comando slash ────────────────────────────────────────────────
Write-Info "Instalando comando /system-doctor..."
Get-FileFromRepoOrUrl ".claude/commands/system-doctor.md" "$COMMANDS_DIR\system-doctor.md"

# ── 7. Crear script de limpieza automatica ───────────────────────────────────
Write-Info "Creando script de limpieza automatica..."
$autoClean = @'
# System Doctor — Limpieza automatica semanal (Windows)
$LOG = "$env:USERPROFILE\.claude\skills\system-doctor\auto-clean.log"
$DATE = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Add-Content $LOG "[$DATE] === Iniciando limpieza automatica ==="

# Espacio antes
$before = (Get-PSDrive C).Free / 1GB

# Limpiar temporales
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Windows\Prefetch\*" -Recurse -Force -ErrorAction SilentlyContinue

# Limpiar cache de npm
npm cache clean --force 2>$null

# Limpiar cache de pip
pip cache purge 2>$null

# winget upgrade silencioso
winget upgrade --all --silent --accept-source-agreements 2>$null

$after = (Get-PSDrive C).Free / 1GB
$freed = [Math]::Round($after - $before, 2)

Add-Content $LOG "[$DATE] Espacio liberado: ${freed} GB"
Add-Content $LOG "[$DATE] === Limpieza completada ==="

# Notificar a Kairos
if ($env:MAKE_WEBHOOK_SYSTEM_DOCTOR) {
    $hostname = $env:COMPUTERNAME
    $body = "{`"message`":`"[System Doctor Win] Limpieza completada en $hostname. Liberado: ${freed} GB`"}"
    try { Invoke-RestMethod -Uri $env:MAKE_WEBHOOK_SYSTEM_DOCTOR -Method Post -ContentType "application/json" -Body $body } catch {}
}
'@
$autoClean | Out-File -FilePath "$SKILLS_DIR\auto-clean.ps1" -Encoding UTF8
Write-OK "Script auto-clean.ps1 creado"

# ── 8. Crear LEARNINGS.md ────────────────────────────────────────────────────
$learningsPath = "$SKILLS_DIR\LEARNINGS.md"
if (-not (Test-Path $learningsPath)) {
    "# System Doctor — Aprendizajes del Sistema`n`n---`n`n## Registro de sesiones`n" | Out-File $learningsPath -Encoding UTF8
    Write-OK "LEARNINGS.md inicializado"
}

# ── 9. Instalar herramientas recomendadas ────────────────────────────────────
Write-Info "Verificando herramientas recomendadas..."

# Verificar winget
if (Get-Command winget -ErrorAction SilentlyContinue) {
    $tools = @(
        "Sysinternals.ProcessExplorer",
        "Sysinternals.Autoruns",
        "CrystalDewWorld.CrystalDiskInfo",
        "WinDirStat.WinDirStat"
    )
    foreach ($t in $tools) {
        Write-Info "Instalando: $t..."
        winget install $t --silent --accept-source-agreements --accept-package-agreements 2>$null
        Write-OK "Listo: $t"
    }
} else {
    Write-Warn "winget no disponible. Instalar herramientas manualmente."
}

# ── 10. Configurar Task Scheduler (opcional) ─────────────────────────────────
$confirm = Read-Host "Configurar limpieza automatica cada domingo a las 3am? [s/N]"
if ($confirm -match "^[sS]") {
    try {
        $action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
            -Argument "-ExecutionPolicy Bypass -NonInteractive -File `"$SKILLS_DIR\auto-clean.ps1`""
        $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "03:00"
        $settings = New-ScheduledTaskSettingsSet -RunOnlyIfNetworkAvailable:$false -StartWhenAvailable
        Register-ScheduledTask -TaskName "SystemDoctorAutoClean" `
            -Action $action -Trigger $trigger -Settings $settings `
            -RunLevel Highest -Force | Out-Null
        Write-OK "Task Scheduler configurado: domingos 3am"
    } catch {
        Write-Warn "No se pudo configurar Task Scheduler. Intentar como Administrador."
    }
} else {
    Write-Info "Programacion no configurada. Activar con: /system-doctor programar"
}

# ── 11. Resumen final ────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   System Doctor instalado correctamente  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Skill:      $SKILLS_DIR\SKILL.md" -ForegroundColor Cyan
Write-Host "  Agentes:    $AGENTS_DIR\doctor-*.md" -ForegroundColor Cyan
Write-Host "  Comando:    $COMMANDS_DIR\system-doctor.md" -ForegroundColor Cyan
Write-Host "  Auto-clean: $SKILLS_DIR\auto-clean.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Probalo con:  /system-doctor diagnostico" -ForegroundColor Yellow
Write-Host "  Emergencia:   /system-doctor emergencia" -ForegroundColor Yellow
Write-Host "  Webhook Kairos: `$env:MAKE_WEBHOOK_SYSTEM_DOCTOR = 'https://...'" -ForegroundColor Yellow
Write-Host ""

# Registrar en LEARNINGS.md
$installNote = "## $(Get-Date -Format 'yyyy-MM-dd') — INSTALACION — Windows $([System.Environment]::OSVersion.Version)`n"
$installNote += "- Sistema instalado en: $CLAUDE_DIR`n"
$installNote += "- Task Scheduler: $($confirm -match '^[sS]')`n`n"
Add-Content $learningsPath $installNote
