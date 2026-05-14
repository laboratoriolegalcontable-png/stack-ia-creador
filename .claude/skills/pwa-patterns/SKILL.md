# PWA Patterns — Patrones Progressive Web App (stack-ia-creador)

## Activación Automática
Se activa cuando el usuario menciona: PWA, Service Worker, manifest, offline, cache, Vanilla JS, HTML5, CSS3, frontend, Vercel, deploy, sw.js, responsive, accesibilidad, performance, LCP, CLS, INP, /pwa, /frontend, /deploy

## Stack del Proyecto

```
Runtime:     Vanilla HTML5 / CSS3 / JavaScript (ES2022+)
PWA:         Service Workers (sw.js) + Web App Manifest (manifest.json)  
Hosting:     Vercel
Build:       Sin bundler — archivos estáticos directos
Tests:       Jest (jest.config.js) + scripts/
Structure:   public/ (assets) + src/ (lógica) + scripts/ (automatización)
```

## Estructura del Proyecto
```
stack-ia-creador/
  index.html        → Entry point principal
  sw.js             → Service Worker
  manifest.json     → Web App Manifest
  styles.css        → Estilos globales
  script.js         → Lógica principal
  src/              → Módulos JS
  public/           → Assets estáticos (íconos, imágenes)
  scripts/          → Scripts de automatización
  vercel.json       → Configuración de Vercel
  package.json      → Dependencies y scripts npm
```

## Patrón de Service Worker (Stale-While-Revalidate)

```javascript
// sw.js — Estrategia óptima para PWA dinámica
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/public/icons/icon-192.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Solo cachear same-origin
  if (url.origin !== self.location.origin) return;

  // API calls: Network-first con fallback
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stale-while-revalidate para HTML/JS/CSS
  e.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(res => {
        caches.open(STATIC_CACHE).then(c => c.put(request, res.clone()));
        return res;
      });
      return cached || networkFetch;
    })
  );
});
```

## Manifest.json del Proyecto

```json
{
  "name": "Stack IA Creador — Plataforma de Automatización IA",
  "short_name": "IA Creador",
  "description": "Dashboard para crear contenido y automatizaciones con IA",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1a1a2e",
  "background_color": "#0f0f1a",
  "lang": "es-AR",
  "categories": ["productivity", "utilities", "business"],
  "icons": [
    { "src": "/public/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/public/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "shortcuts": [
    {
      "name": "Nuevo Contenido",
      "url": "/?tab=content",
      "icons": [{ "src": "/public/icons/shortcut-content.png", "sizes": "96x96" }]
    }
  ]
}
```

## Patrones JavaScript del Proyecto

### Módulo de API (src/api.js)
```javascript
const BASE_URL = 'https://orosa-backend.up.railway.app/api/v1';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    });
    if (!res.ok) throw Object.assign(new Error(), { status: res.status });
    return res.json();
  },
  get: (ep) => api.request(ep),
  post: (ep, body) => api.request(ep, { method: 'POST', body: JSON.stringify(body) }),
  patch: (ep, body) => api.request(ep, { method: 'PATCH', body: JSON.stringify(body) })
};

export default api;
```

### Estado Reactivo Simple (sin frameworks)
```javascript
// src/store.js
const store = (() => {
  let state = {
    user: null,
    leads: [],
    loading: false,
    currentTab: 'dashboard'
  };
  const listeners = new Set();

  return {
    get: (key) => state[key],
    getAll: () => ({ ...state }),
    set: (updates) => {
      state = { ...state, ...updates };
      listeners.forEach(fn => fn(state));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      fn(state); // Llamar inmediatamente con estado actual
      return () => listeners.delete(fn);
    }
  };
})();

export default store;
```

## Vercel Configuration
```json
// vercel.json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

## Core Web Vitals — Objetivos
- **LCP**: < 2.5s (cargar el hero/dashboard en menos de 2.5s)
- **INP**: < 200ms (respuesta a interacciones del usuario)
- **CLS**: < 0.1 (sin saltos de layout al cargar)

## Reglas del Proyecto
- Sin frameworks — Vanilla JS puro
- Sin TypeScript — JS moderno con JSDoc para tipos
- Sin bundler — imports nativos del browser (type="module")
- CSS custom properties para theming, no Tailwind
- Accesibilidad: WCAG 2.1 AA mínimo
- Mobile-first en todos los estilos
- Service Worker siempre registrado y actualizado
