# SYSTEM DOCTOR — Reference: Comandos, Scripts y Configuraciones

---

## MAC_LIMPIEZA — Comandos de limpieza profunda macOS

### Caches de usuario (seguro, sin confirmacion)

```bash
# Limpiar cache de usuario
rm -rf ~/Library/Caches/*

# Limpiar logs de usuario
rm -rf ~/Library/Logs/*

# Limpiar cache de DNS
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Limpiar cache de fuentes
sudo atsutil databases -remove 2>/dev/null; atsutil server -shutdown; atsutil server -ping
```

### Caches del sistema (requiere sudo)

```bash
sudo rm -rf /Library/Caches/*
sudo rm -rf /System/Library/Caches/com.apple.iconservices.store
sudo find /private/var/folders -name "*.cache" -delete 2>/dev/null
sudo rm -rf /private/var/log/asl/*.asl
sudo rm -rf /Library/Logs/DiagnosticReports/*
sudo rm -rf /private/tmp/*
sudo rm -rf /private/var/tmp/*
```

### Mantenimiento periodico del OS

```bash
sudo periodic daily weekly monthly
qlmanage -r cache 2>/dev/null
```

### Xcode y herramientas dev

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
xcrun simctl delete unavailable 2>/dev/null
rm -rf ~/Library/Developer/Xcode/Archives/*
```

### Herramientas de desarrollo (npm, pip, brew)

```bash
npm cache clean --force 2>/dev/null
pip3 cache purge 2>/dev/null
brew cleanup --prune=7 2>/dev/null
brew autoremove 2>/dev/null
yarn cache clean 2>/dev/null
docker system prune -f 2>/dev/null
```

### Trash y descargas

```bash
# Vaciar papelera
osascript -e 'tell application "Finder" to empty trash'

# Listar archivos en Downloads mayores a 100MB
find ~/Downloads -size +100M -type f -ls

# Listar archivos en Downloads con mas de 30 dias sin tocar
find ~/Downloads -atime +30 -type f -ls
```

---

## WINDOWS_LIMPIEZA — Comandos PowerShell y CMD

### Disk Cleanup automatico

```powershell
# Limpiar temp del usuario
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Windows\Prefetch\*" -Recurse -Force -ErrorAction SilentlyContinue

# Limpiar cache de Windows Update
Stop-Service wuauserv -Force
Remove-Item -Path "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
Start-Service wuauserv
```

### Logs del sistema

```powershell
wevtutil el | ForEach-Object { wevtutil cl $_ }
```

### Reparacion del sistema

```powershell
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
chkdsk C: /scan
```

### Herramientas dev en Windows

```powershell
npm cache clean --force 2>$null
pip cache purge 2>$null
winget upgrade --all --silent --accept-source-agreements --accept-package-agreements
docker system prune -f 2>$null
```

### Desfragmentacion / TRIM

```powershell
$disk = Get-PhysicalDisk | Select-Object MediaType
if ($disk.MediaType -eq "SSD") {
    Optimize-Volume -DriveLetter C -ReTrim -Verbose
} else {
    Optimize-Volume -DriveLetter C -Defrag -Verbose
}
```

---

## RAM_LIBERACION — Comandos por OS

### macOS — Liberar memoria

```bash
vm_stat
sudo purge
memory_pressure
ps aux --sort=-%mem | head -16
top -l 1 -s 0 | grep PhysMem
```

### Windows — Liberar memoria

```powershell
Get-CimInstance Win32_OperatingSystem | Select-Object FreePhysicalMemory,TotalVisibleMemorySize
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 15 Name,Id,@{N='RAM(MB)';E={[Math]::Round($_.WorkingSet/1MB,1)}},CPU | Format-Table -AutoSize
```

### Umbrales de alerta para RAM

| Uso RAM | Estado | Accion |
|---------|--------|--------|
| < 70% | VERDE | Monitoreo normal |
| 70-85% | AMARILLO | Identificar top 5 procesos |
| 85-92% | NARANJA | Liberar inmediatamente, notificar |
| > 92% | ROJO | Modo emergencia, Kairos alerta |

---

## PROCESOS_PELIGROSOS — Lista de procesos a NO matar

### macOS — NUNCA matar estos

```
kernel_task, launchd, mds, mds_stores, hidd, configd,
WindowServer, loginwindow, UserEventAgent, SystemUIServer,
coreaudiod, bluetoothd, WiFiAgent, securityd, logd
```

### Windows — NUNCA matar estos

```
System, smss.exe, csrss.exe, wininit.exe, winlogon.exe,
services.exe, lsass.exe, svchost.exe (del sistema), dwm.exe,
audiodg.exe, fontdrvhost.exe
```

---

## CYBER_NEO_SCAN — Scan de seguridad

### macOS — Verificaciones de seguridad

```bash
sudo lsof -i -P | grep LISTEN
netstat -an | grep ESTABLISHED
ls -la ~/Library/LaunchAgents/
ls -la /Library/LaunchAgents/
ls -la /Library/LaunchDaemons/
find /etc -mtime -1 -type f -ls 2>/dev/null
```

### Windows — Verificaciones de seguridad

```powershell
Get-NetTCPConnection -State Listen | Select-Object LocalPort,@{N='Process';E={(Get-Process -Id $_.OwningProcess).Name}}
Get-CimInstance Win32_StartupCommand | Select-Object Name,Command,Location,User
Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled
Start-MpScan -ScanType QuickScan
```

---

## BACKUP_SCRIPTS — Scripts listos para usar

### macOS — rsync + cron

```bash
#!/bin/bash
BACKUP_SOURCE="$HOME/Documents $HOME/Desktop $HOME/Projects"
BACKUP_DEST="/Volumes/BackupDrive/backup-$(hostname)"
LOG="/tmp/system-doctor-backup.log"
DATE=$(date +%Y-%m-%d-%H%M)

for dir in $BACKUP_SOURCE; do
    if [ -d "$dir" ]; then
        rsync -avz --delete --exclude='.DS_Store' \
              --exclude='node_modules' --exclude='.git' \
              "$dir" "$BACKUP_DEST/" >> $LOG 2>&1
    fi
done

SIZE=$(du -sh "$BACKUP_DEST" 2>/dev/null | cut -f1)
echo "[$DATE] Backup completado. Tamano: $SIZE" >> $LOG

if [ -n "$KAIROS_WEBHOOK" ]; then
    curl -s -X POST "$KAIROS_WEBHOOK" -H "Content-Type: application/json" \
         -d "{\"message\":\"Backup completado. Tamano: $SIZE\"}" > /dev/null
fi
```

### Windows — robocopy + PowerShell

```powershell
$sources = @("$env:USERPROFILE\Documents", "$env:USERPROFILE\Desktop")
$dest = "D:\Backup\$(hostname)"
$log = "$env:TEMP\system-doctor-backup.log"

foreach ($src in $sources) {
    if (Test-Path $src) {
        robocopy $src "$dest\$(Split-Path $src -Leaf)" /MIR /Z /R:3 /W:10 /LOG+:$log `
                 /XD "node_modules" ".git" /XF "*.pyc" "thumbs.db" >> $null
    }
}

$size = [Math]::Round((Get-ChildItem $dest -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB, 2)
if ($env:KAIROS_WEBHOOK) {
    Invoke-RestMethod -Uri $env:KAIROS_WEBHOOK -Method Post -ContentType "application/json" `
        -Body "{`"message`":`"Backup Win completado. Tamano: ${size} GB`"}"
}
```

---

## DIAGNOSTICO_SCORES — Criterios de puntuacion 0-100

| Dimension | 100 pts | 70 pts | 40 pts | 0 pts |
|-----------|---------|--------|--------|-------|
| CPU | < 20% | < 50% | < 80% | >= 80% |
| RAM | < 50% | < 70% | < 90% | >= 90% |
| Disco | < 50% | < 70% | < 85% | >= 85% |
| Temp CPU | < 60°C | < 75°C | < 90°C | >= 90°C |
| Arranque | < 20 apps | < 40 apps | < 60 apps | >= 60 apps |
| Seguridad | Todo OK | 1-2 warnings | 3+ warnings | Amenaza activa |
| Backup | < 1 dia | < 7 dias | < 30 dias | Sin backup |

**Formula**: Score = promedio ponderado de las 7 dimensiones
- VERDE: 80-100
- AMARILLO: 50-79
- ROJO: < 50

---

## KAIROS_NOTIFICACION — Integracion con Make.com

```bash
notify_kairos() {
    local mensaje="$1" score="$2" os="$3"
    curl -s -X POST "$MAKE_WEBHOOK_SYSTEM_DOCTOR" \
         -H "Content-Type: application/json" \
         -d "{\"texto\": \"[SYSTEM DOCTOR] $mensaje\", \"score\": $score, \"os\": \"$os\", \"hostname\": \"$(hostname)\"}"
}

# Uso:
# notify_kairos "Limpieza completada. 8.3 GB liberados. Score: 87/100" 87 "macOS"
# notify_kairos "ALERTA CRITICA: RAM al 94%." 35 "Windows"
```

---

## HERRAMIENTAS_RECOMENDADAS — Auto-instalar si no estan

### macOS

```bash
brew install --quiet htop ncdu dust duf procs bottom lsd fzf fd ripgrep smartmontools 2>/dev/null
```

### Windows (winget)

```powershell
$tools = @(
    "Sysinternals.ProcessExplorer",
    "Sysinternals.Autoruns",
    "Sysinternals.RAMMap",
    "CrystalDewWorld.CrystalDiskInfo",
    "WinDirStat.WinDirStat"
)
foreach ($t in $tools) { winget install $t --silent --accept-source-agreements 2>$null }
```

---

## RUTAS_SEGURAS_LIMPIEZA — Solo borrar en estas rutas

### macOS — SEGURO borrar sin preguntar

```
~/Library/Caches/
~/Library/Logs/
~/Library/Application Support/CrashReporter/
/private/tmp/
/private/var/tmp/
~/Library/Developer/Xcode/DerivedData/
~/Library/Developer/CoreSimulator/Caches/
~/.npm/_npx/
~/.npm/_cacache/
~/.cache/pip/
~/.cache/yarn/
~/.gradle/caches/
```

### Windows — SEGURO borrar sin preguntar

```
%TEMP%\
%LOCALAPPDATA%\Temp\
C:\Windows\Temp\
C:\Windows\Prefetch\
%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache\
%APPDATA%\Mozilla\Firefox\Profiles\*.default\cache2\
%LOCALAPPDATA%\Microsoft\Windows\INetCache\
```

### NUNCA borrar (ni preguntar)

```
~/Documents/
~/Desktop/
~/Downloads/        (listar pero no borrar automaticamente)
~/.ssh/
~/.gnupg/
~/Library/Keychains/
C:\Users\[user]\Documents\
C:\Users\[user]\Desktop\
C:\Windows\System32\
```

---

## LEARNINGS_FORMAT — Registro de aprendizajes

```markdown
## [fecha] — [OS] — [Modo: LIMPIAR/MEMORIA/OPTIMIZAR/etc]

**Espacio liberado**: X GB
**RAM liberada**: X GB
**Score antes**: XX · **Score despues**: XX
**Patron nuevo detectado**: [carpeta X siempre se llena de Y]
**Mejora al proceso**: [si algo podria optimizarse]
```
