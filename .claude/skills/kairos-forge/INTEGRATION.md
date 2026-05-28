# Kairos Forge — Integracion y Garantias

Como Forge se conecta con el resto del ecosistema, mejora todo lo que aparece
(skills, subagentes, MCP) y por que NUNCA rompe nada.

---

## 1. Garantia NO-DESTRUCTIVA (regla de Diego)

> "Nunca pises ningun proyecto ni nada y no rompas nada."

Forge cumple esto SIEMPRE:

1. **Respaldo antes de escribir** — `install.sh` respalda cualquier archivo que
   fuera a sobrescribir en `~/.claude/.forge-backups/<timestamp>/`. Todo es
   recuperable. Nada se pierde.
2. **Solo aditivo en memoria** — los seeds de `kairos-memory-v4/seed/` se copian
   a `~/.claude/memory/` SOLO si el destino no existe. La memoria viva nunca se pisa.
3. **Registry append-only** — `forge-registry.md` nunca borra filas.
4. **Idempotente** — correr el autostart 100 veces deja el mismo resultado.
5. **Falla suave** — el autostart usa `set +e`: si algo falla, la sesion sigue
   normal, no se rompe el flujo de trabajo.

---

## 2. Integracion con Kairos Legendario (EON v3.5)

`kairos-legendario` vive en el repo PUBLICO `stack-ia-creador` (300 directivas EON,
42 submodulos, modo boss). Forge se acopla asi:

| Situacion | Comportamiento de Forge |
|-----------|-------------------------|
| Modo boss activo (Diego escribe) | Forge ejecuta crear/mejorar/auditar SIN pedir confirmacion |
| `@Kairos` / `/eon` activo | Forge queda disponible como motor de fabrica de skills del EON |
| EON-SENTINEL detecta fallo de sistema | Delega a `kairos-sentinel` para diagnostico + fix |
| EON pide un skill que no existe | Forge lo crea on-the-fly desde REFERENCE.md |

Bridge documentado tambien en: `stack-ia-creador/.claude/skills/kairos-legendario/FORGE-BRIDGE.md`

---

## 3. Mejora de TODO lo que aparece (skills, agentes, MCP)

La peticion fue: "agrega mejoras y habilidades a todo ... y a todo lo que se genere mcp".

Forge observa y mejora de forma aditiva:

### Skills y subagentes
- `@Kairos forge audit` puntua todos los skills (1-10) y propone mejoras.
- Skill con score < 7 → Forge agrega las capacidades faltantes (respaldando primero).
- Skill que falla 2 veces → Forge lo marca para upgrade automatico.

### MCP (Model Context Protocol)
Cuando aparece un MCP nuevo (Supabase, Figma, GitHub, Notion, Slack, Vercel, etc.):
1. Forge detecta el server y sus tools disponibles.
2. Propone (no impone) un skill-wrapper que documenta los comandos mas utiles
   de ese MCP para el negocio de Estudio Oro.
3. Registra el MCP en `forge-registry.md` bajo "Integraciones activas".
4. NUNCA modifica la config del MCP ni `.mcp.json` sin autorizacion explicita.

---

## 4. Proyectos nuevos genericos

"para proyecto nuevos que aparezcan genericos."

Al abrir una carpeta sin `CLAUDE.local.md`:
1. `kairos-genesis` escanea el stack (framework, DB, deploy).
2. Instala el stack de skills correcto (nextjs / express / landing / legal / marketing / etc.).
3. Genera `CLAUDE.local.md` y registra el proyecto en `kairos-sentinel`.
4. Siempre instala el ecosistema base (forge + sentinel + memory-v4) primero.

Para instalar en cualquier maquina o proyecto nuevo (repo publico, sin token):

```bash
curl -fsSL https://raw.githubusercontent.com/laboratoriolegalcontable-png/stack-ia-creador/main/.claude/skills/kairos-forge/install.sh | bash
```

---

## 5. Activacion del arranque automatico (requiere OK de Diego)

El hook `kairos-forge-autostart.sh` hace que el ecosistema se auto-instale en cada
sesion. Para activarlo hay que registrarlo en `.claude/settings.json` (SessionStart)
y darle permiso de ejecucion. Esto NO se activa solo por seguridad — Claude pide
confirmacion antes de tocar la config del harness.

Pasos (cuando Diego lo autorice):

```bash
chmod +x .claude/hooks/kairos-forge-autostart.sh
# y agregar el hook a SessionStart en .claude/settings.json
```
