---
name: auto-mode
description: >
  Auto Mode — Dejá de aceptar cada acción de Claude.
  Los tres modos de permisos de Claude Code: Planeo, Automático y Omisión.
  Activación en app (selector), terminal (Shift+Tab), y CI (--dangerously-skip-permissions).
  Flujo recomendado: planeá primero, soltá el volante después.
version: 1.0.0
triggers:
  - /auto-mode
  - /automode
  - auto mode
  - modo automático
  - modo planeo
  - omisión de permisos
  - shift+tab
  - dangerously-skip-permissions
  - aceptar cada acción
  - cansado de aceptar
  - déjalo correr solo
  - yolo mode
  - modo yolo
---

# AUTO MODE — Dejá de aceptar cada acción de Claude

## Cuando activar

- El usuario escribe `/auto-mode` o `/automode`
- Pregunta por "modo automático", "modo planeo", "omisión de permisos"
- Dice "me canso de aceptar", "¿cómo lo dejo correr solo?", "Shift+Tab"
- Quiere configurar Claude Code para trabajar sin interrupciones
- Pregunta por `--dangerously-skip-permissions`

---

## Los tres modos — de un vistazo

| Modo | Activación App | Activación Terminal | Qué hace |
|------|----------------|---------------------|----------|
| **Planeo** | Selector esquina izquierda del chat | `Shift+Tab` (cicla) | Solo lee y propone. No edita nada. Siempre el primer paso. |
| **Automático** | Selector esquina izquierda del chat | `Shift+Tab` (cicla) | Avanza solo en acciones seguras. Pide confirmación donde puede romper algo. |
| **Omisión de permisos** | Settings → Claude Code → toggle | `--dangerously-skip-permissions` | Cero interrupciones. Ejecuta todo sin preguntar. Solo en sandbox/worktree. |

---

## Fase 1 — Diagnóstico: ¿qué modo necesitás?

Antes de cambiar de modo, respondé estas 3 preguntas:

1. **¿Ya probaste este flujo al menos una vez en manual?**
   - No → empezá con **Planeo**
   - Sí → podés ir a **Automático**

2. **¿Estás en tu repo principal con código sin backup?**
   - Sí → quedá en **Automático**, no uses Omisión
   - No / worktree / rama desechable → podés usar **Omisión**

3. **¿Qué tan seguido te interrumpe Claude en este flujo?**
   - Pocas veces → **Automático** ya resuelve el problema
   - Todo el tiempo en los mismos permisos → usá `/fewer-permission-prompts` para pre-autorizar los comunes

---

## Fase 2 — Activación paso a paso

### En la app de Claude Code

```
1. Abrí el chat de Claude Code
2. Clic en el selector de modo (esquina inferior izquierda del chat)
3. Elegí: Planeo / Automático / Omisión
   └── Omisión solo aparece si antes lo prendiste en:
       Settings → Claude Code → toggle "Omisión de permisos"
```

### En la terminal

```bash
# Ciclar modos sin salir de la sesión
Shift+Tab   →   Ask permissions → Plan mode → Auto mode → (repite)

# Iniciar Claude con todos los permisos apagados
claude --dangerously-skip-permissions
```

> ⚠️ `--dangerously-skip-permissions` = cheque en blanco. Claude borra, corre y modifica sin preguntar nada. Solo en contenedores, worktrees o CI.

---

## Fase 3 — El flujo recomendado (planeá primero)

```
PASO 1: Modo Planeo
→ Claude lee el proyecto, te arma el plan
→ Vos lo aprobás (o ajustás)
→ Sin tocar nada todavía

PASO 2: Modo Automático
→ Claude construye sobre el plan aprobado
→ Trabaja sin sacarte del flujo
→ Vos revisás git diff cada tanto

PASO 3 (opcional): Omisión de permisos
→ Solo si ya corriste el flujo con Automático varias veces
→ Solo en worktree / rama desechable / sandbox
→ Para cuando las confirmaciones restantes son siempre las mismas
```

**Nunca saltés directo a Omisión sin el plan aprobado.** El riesgo no es Claude, es el contexto incompleto.

---

## Fase 4 — Pre-autorizar los permisos comunes

Evitá el 80% de las interrupciones con un solo comando:

```
/fewer-permission-prompts
```

Analiza tu historial de sesión y agrega al `.claude/settings.json` del proyecto los comandos que Claude usa seguido (git, npm, etc.) como permisos pre-autorizados. Después del Automático, esto es lo que más tiempo ahorra.

---

## Comandos de referencia rápida

```
Shift+Tab              → cicla Planeo → Automático → Ask en terminal
/fewer-permission-prompts → pre-autoriza comandos comunes del proyecto
claude --dangerously-skip-permissions  → full automático en terminal (sandbox only)
/plan                  → forzar modo Planeo desde el chat
```

---

## 5 reglas para no romperte el repo

1. **Planeá y probá antes de automatizar** — si nunca lo corriste manual, no lo automatices
2. **Revisá git diff seguido** — Automático no te quita la responsabilidad de leer los cambios
3. **Worktrees para Omisión** — si Claude se equivoca, tirás la rama y no perdés nada
4. **Nada cerca de producción sin revisión** — estos modos aceleran la construcción, no el deploy
5. **Subí progresivamente** — Planeo → App Automático → App Omisión → Terminal `--dangerously-skip` en sandbox

---

## Señales de que estás en el modo equivocado

| Señal | Modo correcto |
|-------|--------------|
| Claude te propone algo pero no sabés si es lo que querés | Seguí en **Planeo** |
| Claude te para para confirmar siempre las mismas cosas | Subí a **Automático** o usá `/fewer-permission-prompts` |
| Automático ya está re-probado, siguen 2-3 confirmaciones aburridas en sandbox | **Omisión** (solo ahí) |
| Se rompió algo inesperado | `git restore` + volvé a **Planeo** para entender qué pasó |

---

## Integración con KAIROS

Para el flujo de desarrollo del Estudio Oro, el setup recomendado es:

```
1. /brief → KAIROS te da el plan ejecutivo del día
2. Modo Planeo → Claude Code mapea los cambios a hacer
3. Modo Automático → Claude construye mientras vos trabajas
4. /guard → KAIROS verifica el estado de los repos y CI después del build
```

El `/fewer-permission-prompts` está en el stack de herramientas de KAIROS bajo la directiva D232 (EON-TOOLS) — herramientas de IA personalizadas para maximizar la eficiencia operativa del imperio.

---

## Recursos oficiales

- Ajustes y permisos de Claude Code: `Settings → Claude Code` en la app
- Docs oficiales Anthropic sobre permisos y modos
- `/fewer-permission-prompts` — genera allowlist automático desde el historial
