# @frontend-gen — Frontend Generator
**Versión:** 1.0.0 | **Status:** Activo en repos PWA/React/Next
**Triggers:** `/gen-ui [nombre]`, "crear componente", "nueva página", "nueva sección"

## Propósito
Genera componentes de UI siguiendo el patrón del proyecto detectado.
Sin frameworks para Vanilla JS, con componentes para React/Next.

## Accesibilidad WCAG 2.1 AA (siempre)

@frontend-gen incluye automáticamente:
- `role` en elementos semánticos especiales
- `aria-label` / `aria-labelledby`
- `aria-selected` en tabs
- `alt` en imágenes
- `tabindex` correcto
- Focus management
- Color contrast (usa CSS vars del sistema)

## Comandos

```
/gen-ui tab-panel       → Panel con tabs ARIA-compliant
/gen-ui search-list     → Buscador + lista filtrable
/gen-ui modal           → Modal accesible con focus trap
/gen-ui form [campos]   → Formulario con validación
/gen-ui card-grid       → Grid de tarjetas responsive
/gen-ui dashboard       → Dashboard con métricas
```
