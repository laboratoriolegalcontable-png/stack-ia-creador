# COMMUNITY PROJECT DISCOVERY — stack-ia-creador
> 2026-05-16

## Resumen

Se catalogó la bóveda completa de la comunidad tododeia (274 items) y se crearon
los datos estructurados para la PWA en `public/comunidad.json`.

## Archivo generado

**`public/comunidad.json`** — Datos estructurados de la bóveda para la PWA:
- 274 items catalogados
- 5 categorías principales
- Estado por item: instalado / nuevo / disponible
- Comandos de instalación para cada uno
- Plan de 4 semanas con comandos listos
- Estadísticas del ecosistema

## Cómo usar en la PWA

El archivo `public/comunidad.json` puede ser consumido por `app.js` para mostrar
un panel de comunidad con filtros por categoría, estado y prioridad.

```javascript
// Cargar el catálogo
const catalogo = await fetch('/comunidad.json').then(r => r.json());

// Filtrar por estado
const disponibles = catalogo.categorias
  .flatMap(c => c.items)
  .filter(i => i.estado === 'disponible');

// Top prioridad
const topPrioridad = catalogo.estadisticas.top_prioridad;
```

## Referencia cruzada

El repositorio diego-orosa tiene:
- `BOVEDA-COMUNIDAD-INDEX.md` — índice completo
- `COMMUNITY-PROJECT-DISCOVERY.md` — reporte detallado
- `.claude/skills/aprende/` — memoria persistente Reflexion
- `.claude/skills/agency-agents/` — 144 agentes especializados
- `.claude/skills/community-discovery/` — meta-skill `/comunidad`
- `.claude/skills/graphify/` — grafo de conocimiento
- `.claude/skills/mempalace/` — memoria local
