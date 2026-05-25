---
description: El Medico del Sistema — limpia, optimiza, protege y respalda Mac, PC y Windows. Integrado con Kairos, Cyber Neo y automejora. Se auto-instala y aprende de cada sesion.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Agent
---

# Comando: /system-doctor

El Medico del Sistema del ecosistema de Diego Orosa. Un comando, todos los modos.
Mac, Windows y Linux. Detecta el OS automaticamente y actua.

---

## Modos disponibles

| Comando | Que hace |
|---------|----------|
| `/system-doctor` | Menu interactivo + health check rapido |
| `/system-doctor diagnostico` | Panel de salud completo (score 0-100) |
| `/system-doctor limpiar` | Limpieza profunda del disco |
| `/system-doctor memoria` | Diagnostico y liberacion de RAM |
| `/system-doctor procesos` | Top offenders CPU + matar zombies |
| `/system-doctor blindar` | Scan de seguridad (Cyber Neo) |
| `/system-doctor backup` | Configurar backup automatico |
| `/system-doctor emergencia` | Triage rapido + liberacion inmediata |
| `/system-doctor programar` | Configurar ejecucion automatica semanal |
| `/system-doctor aprender` | Ciclo de auto-mejora + update herramientas |

---

## Uso rapido

```
/system-doctor
```
Detecta el OS, muestra el health check en 30 segundos y pregunta que hacer.

```
/system-doctor limpiar
```
Escanea rutas seguras, muestra cuanto va a liberar y ejecuta con confirmacion.

```
/system-doctor emergencia
```
Triage en 60 segundos: mata los 3 top offenders, purga RAM, libera temp.

```
/system-doctor diagnostico
```
Score 0-100 en 7 dimensiones: CPU, RAM, disco, temperatura, arranque, seguridad, backup.

---

## Modo autonomo (sin confirmaciones)

```
/system-doctor limpiar --autonomo
/system-doctor memoria --autonomo
/system-doctor procesos --autonomo
```

En modo autonomo:
- Ejecuta solo rutas 100% seguras
- No mata procesos de usuario (solo libera RAM inactiva)
- Notifica resultado a Kairos via WhatsApp al terminar
- Registra en LEARNINGS.md automaticamente

---

## Sub-agentes en paralelo

Para diagnostico completo en < 60 segundos:

```
/system-doctor diagnostico --paralelo
```

Esto ejecuta en paralelo:
- Agent(doctor-memoria) → estado de RAM
- Agent(doctor-limpieza) → estado del disco
- Agent(doctor-procesos) → estado de CPU

---

## Integracion con Kairos

El sistema notifica automaticamente a Diego via WhatsApp cuando:
- Score de salud < 70
- Se libera > 5 GB de disco
- Se detecta una amenaza de seguridad
- El backup falla o no se ejecuto en > 7 dias

Configura el webhook:
```bash
export MAKE_WEBHOOK_SYSTEM_DOCTOR="https://hook.us2.make.com/[tu-webhook]"
```

---

## Instalacion

```bash
# Mac / Linux:
curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/setup.sh | bash

# Windows (PowerShell como Administrador):
irm https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/system-doctor/setup.ps1 | iex
```

---

## Reglas de seguridad

- **Nunca borra** Documents, Desktop ni Downloads de forma automatica
- **Siempre muestra** cuanto va a liberar antes de ejecutar
- **Nunca mata** procesos del sistema (kernel_task, launchd, svchost.exe del sistema)
- **Siempre pide confirmacion** para limpiezas > 1 GB o procesos de usuario
- **Sin credenciales** en ningun script generado — todo en variables de entorno
- **Backup antes de cambios** criticos del sistema
