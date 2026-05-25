# System Doctor — Setup automatico sin preguntas (Windows)
# Un comando, cero interaccion. Instala todo y programa la limpieza semanal.
#
# Desde PowerShell como Administrador:
#   irm https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/setup.ps1 | iex
#   o: PowerShell -ExecutionPolicy Bypass -File setup.ps1

$ErrorActionPreference = "Continue"
$REPO_RAW   = "https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main"
$CLAUDE_DIR  = "$env:USERPROFILE\.claude"
$SKILLS_DIR  = "$CLAUDE_DIR\skills\system-doctor"
$AGENTS_DIR  = "$CLAUDE_DIR\agents"
$COMMANDS_DIR= "$CLAUDE_DIR\commands"

$SCRIPT_DIR = if ($MyInvocation.MyCommand.Path) { Split-Path $MyInvocation.MyCommand.Path } else { "" }
$REPO_ROOT  = if ($SCRIPT_DIR) { (Resolve-Path "$SCRIPT_DIR\..\..\..\.." -EA 0)?.Path } else { "" }

function ok   { param($m) Write-Host "  [OK] $m" -ForegroundColor Green }
function info { param($m) Write-Host "  [->] $m" -ForegroundColor Cyan }
function warn { param($m) Write-Host "  [!!] $m" -ForegroundColor Yellow }

Write-Host "`nSystem Doctor — Setup automatico Windows`n" -ForegroundColor Blue

# Funcion: copiar local o descargar
function Get-SD {
    param($Rel, $Dest)
    $dir = Split-Path $Dest
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    $local = if ($REPO_ROOT) { Join-Path $REPO_ROOT $Rel } else { "" }
    if ($local -and (Test-Path $local)) {
        Copy-Item $local $Dest -Force; ok (Split-Path $Dest -Leaf)
    } else {
        try {
            Invoke-WebRequest "$REPO_RAW/$($Rel -replace '\\','/')" -OutFile $Dest -UseBasicParsing -EA Stop
            ok (Split-Path $Dest -Leaf)
        } catch { warn "No se pudo obtener $(Split-Path $Dest -Leaf)" }
    }
}

# ── Archivos del skill ─────────────────────────────────────────────────────
info "Instalando skill y sub-agentes..."
Get-SD ".claude/skills/system-doctor/SKILL.md"     "$SKILLS_DIR\SKILL.md"
Get-SD ".claude/skills/system-doctor/REFERENCE.md" "$SKILLS_DIR\REFERENCE.md"
Get-SD ".claude/skills/system-doctor/install.ps1"  "$SKILLS_DIR\install.ps1"

@("doctor-memoria","doctor-limpieza","doctor-procesos","doctor-blindaje","doctor-backup") | ForEach-Object {
    Get-SD ".claude/agents/$_.md" "$AGENTS_DIR\$_.md"
}
Get-SD ".claude/commands/system-doctor.md" "$COMMANDS_DIR\system-doctor.md"

# ── Script de limpieza semanal ─────────────────────────────────────────────
info "Creando auto-clean.ps1..."
@'
# System Doctor — Limpieza semanal automatica
$LOG  = "$env:USERPROFILE\.claude\skills\system-doctor\auto-clean.log"
$DATE = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content $LOG "[$DATE] === Limpieza automatica ==="

$before = [Math]::Round((Get-PSDrive C).Free / 1GB, 2)

Remove-Item "$env:TEMP\*"              -Recurse -Force -EA SilentlyContinue
Remove-Item "C:\Windows\Temp\*"        -Recurse -Force -EA SilentlyContinue
Remove-Item "C:\Windows\Prefetch\*"    -Recurse -Force -EA SilentlyContinue

Stop-Service wuauserv -Force -EA SilentlyContinue
Remove-Item "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force -EA SilentlyContinue
Start-Service wuauserv -EA SilentlyContinue

npm cache clean --force 2>$null
pip cache purge 2>$null
winget upgrade --all --silent --accept-source-agreements 2>$null

$after  = [Math]::Round((Get-PSDrive C).Free / 1GB, 2)
$freed  = [Math]::Round($after - $before, 2)
Add-Content $LOG "[$DATE] OK — Liberado: ${freed} GB | Libre: ${after} GB"

if ($env:MAKE_WEBHOOK_SYSTEM_DOCTOR) {
    $body = "{`"message`":`"[System Doctor Win] Limpieza semanal OK en $env:COMPUTERNAME. Liberado: ${freed} GB`"}"
    try { Invoke-RestMethod -Uri $env:MAKE_WEBHOOK_SYSTEM_DOCTOR -Method Post -ContentType "application/json" -Body $body } catch {}
}
'@ | Out-File "$SKILLS_DIR\auto-clean.ps1" -Encoding UTF8
ok "auto-clean.ps1"

# ── LEARNINGS.md ────────────────────────────────────────────────────────────
$lf = "$SKILLS_DIR\LEARNINGS.md"
if (-not (Test-Path $lf)) {
    "# System Doctor — Aprendizajes`n`n---`n`n" | Out-File $lf -Encoding UTF8
    ok "LEARNINGS.md"
}

# ── Herramientas via winget (silencioso) ────────────────────────────────────
info "Instalando herramientas recomendadas..."
if (Get-Command winget -EA SilentlyContinue) {
    @("Sysinternals.ProcessExplorer","Sysinternals.Autoruns","CrystalDewWorld.CrystalDiskInfo","WinDirStat.WinDirStat") | ForEach-Object {
        winget install $_ --silent --accept-source-agreements --accept-package-agreements 2>$null
    }
    ok "Herramientas instaladas"
} else { warn "winget no disponible" }

# ── Task Scheduler — domingos 3am (sin preguntar) ───────────────────────────
info "Configurando Task Scheduler (domingos 3am)..."
try {
    $action   = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -NonInteractive -WindowStyle Hidden -File `"$SKILLS_DIR\auto-clean.ps1`""
    $trigger  = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "03:00"
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false
    Register-ScheduledTask -TaskName "SystemDoctorAutoClean" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force | Out-Null
    ok "Task Scheduler: domingos 3am"
} catch { warn "No se pudo configurar Task Scheduler (intentar como Administrador)" }

# ── Webhook en variables de entorno del usuario ─────────────────────────────
if ($env:MAKE_WEBHOOK_SYSTEM_DOCTOR) {
    [System.Environment]::SetEnvironmentVariable("MAKE_WEBHOOK_SYSTEM_DOCTOR", $env:MAKE_WEBHOOK_SYSTEM_DOCTOR, "User")
    ok "Webhook guardado como variable de entorno de usuario"
}

# ── Registrar instalacion ───────────────────────────────────────────────────
$note = "`n## $(Get-Date -Format 'yyyy-MM-dd') — AUTO-SETUP — Windows`n- Instalacion: $CLAUDE_DIR`n- Task Scheduler: activo domingos 3am`n"
Add-Content $lf $note

Write-Host "`nSistema instalado y programado automaticamente." -ForegroundColor Green
Write-Host "Probalo ahora: /system-doctor diagnostico`n" -ForegroundColor Yellow
