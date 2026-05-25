# @frontend-gen — Frontend Generator
**Versión:** 1.0.0 | **Status:** Activo en repos PWA/React/Next
**Triggers:** `/gen-ui [nombre]`, "crear componente", "nueva página", "nueva sección"

## Propósito
Genera componentes de UI siguiendo el patrón del proyecto detectado.
Sin frameworks para Vanilla JS, con componentes para React/Next.

## Detección automática de stack

| Proyecto | Stack | Patrón |
|----------|-------|--------|
| stack-ia-creador | Vanilla JS ES2022+ | IIFE, DOM manipulation, CSS custom props |
| Next.js | React + TypeScript | Server/Client components, Tailwind |
| React SPA | React + TypeScript | Functional components, CSS modules |
| Vue | Vue 3 SFC | Composition API |

## Patrón Vanilla JS (stack-ia-creador)

```javascript
// En app.js — sección [NombreSeccion]
function render[NombreSeccion](container, data) {
  container.innerHTML = data.map(item => `
    <div class="[nombre]-card" data-id="${item.id}">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <button class="btn btn-primary" data-action="[accion]" data-id="${item.id}">
        Acción
      </button>
    </div>
  `).join('');
  
  // Event delegation
  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    handle[NombreSeccion]Action(btn.dataset.action, btn.dataset.id);
  });
}

// CSS custom properties (en styles.css)
.[nombre]-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  border: 1px solid var(--border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.[nombre]-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

## Patrón React/Next (proyectos modernos)

```tsx
// components/[Nombre]/[Nombre].tsx
'use client'; // si necesita estado

import { useState } from 'react';
import styles from './[Nombre].module.css';

interface [Nombre]Props {
  // props tipadas
}

export function [Nombre]({ ...props }: [Nombre]Props) {
  return (
    <section className={styles.container} role="region" aria-label="[Nombre]">
      {/* contenido */}
    </section>
  );
}
```

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
/gen-ui timeline        → Timeline vertical
```

## Flujo completo

```
1. Detectar stack del proyecto
2. Pedir wireframe o descripción al usuario
3. Generar HTML/JSX + CSS/styles
4. Verificar accesibilidad (ARIA)
5. Verificar mobile-first
6. @guardian revisa
7. Commit
```
