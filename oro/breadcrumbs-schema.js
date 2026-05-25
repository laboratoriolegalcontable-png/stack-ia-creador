/**
 * Kairos BreadcrumbList Schema — estudiooro.com
 * Auto-inyecta JSON-LD BreadcrumbList según URL actual
 * v1.0 — 2026-05-25
 */
(function() {
  'use strict';

  var MAP = {
    '/': [
      { name: 'Inicio', url: 'https://estudiooro.com/' }
    ],
    '/inmobiliaria/': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Derecho Inmobiliario', url: 'https://estudiooro.com/inmobiliaria/' }
    ],
    '/tech/': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Derecho Tech & Digital', url: 'https://estudiooro.com/tech/' }
    ],
    '/contable/': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Derecho Contable & Tributario', url: 'https://estudiooro.com/contable/' }
    ],
    '/penal/': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Derecho Penal', url: 'https://estudiooro.com/penal/' }
    ],
    '/legal/aviso-legal.html': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Aviso Legal', url: 'https://estudiooro.com/legal/aviso-legal.html' }
    ],
    '/legal/privacidad.html': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Política de Privacidad', url: 'https://estudiooro.com/legal/privacidad.html' }
    ],
    '/legal/terminos.html': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Términos y Condiciones', url: 'https://estudiooro.com/legal/terminos.html' }
    ],
    '/legal/cookies.html': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Política de Cookies', url: 'https://estudiooro.com/legal/cookies.html' }
    ],
    '/legal/arrepentimiento.html': [
      { name: 'Inicio', url: 'https://estudiooro.com/' },
      { name: 'Botón de Arrepentimiento', url: 'https://estudiooro.com/legal/arrepentimiento.html' }
    ]
  };

  function getItems() {
    var path = window.location.pathname.replace(/\/?$/, '/').replace('//', '/');
    // try exact, then trailing slash, then without
    return MAP[path] || MAP[path.replace(/\/$/, '')] || MAP[path.replace(/\/$/, '') + '/'] || MAP['/'];
  }

  function inject() {
    var items = getItems();
    if (!items || items.length < 2) return; // no breadcrumb needed for home

    var schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map(function(item, i) {
        return {
          "@type": "ListItem",
          "position": i + 1,
          "name": item.name,
          "item": item.url
        };
      })
    };

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
