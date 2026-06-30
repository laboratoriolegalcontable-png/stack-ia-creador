---
name: kit-extraccion
description: >
  Maquina de clientes con 3 herramientas: Apify (listas de prospectos de cualquier red),
  Scrapingdog (alternativa economica con salida a Excel) y Browser Harness (espiar
  anuncios activos de la competencia). Claude orquesta las tres para armar una lista
  de prospectos calificados con contexto de compra. Activa con /kit-extraccion o
  /extraccion.
version: 1.0.0
---

# Kit de Extraccion — Maquina de Clientes con IA

## Cuando activar

- El usuario usa `/kit-extraccion` o `/extraccion`
- Menciona: lista de prospectos, extraer contactos, leads Google Maps, espiar competencia
- Menciona: Apify, Scrapingdog, Browser Harness, raspar datos, anuncios de competencia
- Quiere armar una base de datos de potenciales clientes
- Quiere saber que anuncios corre la competencia en Facebook/Instagram

## Paso 0 — Identificar la mision

Antes de ejecutar, preguntar al usuario:

1. **Que necesita:** lista de prospectos / espiar competencia / las dos
2. **Rubro y geografia:** ej. dentistas en Buenos Aires / agencias de viaje en LATAM
3. **Datos requeridos:** telefono / email / nombre / web / anuncios
4. **Presupuesto de herramientas:** tiene cuenta Apify? Prefiere Scrapingdog (mas economico)?
5. **Volumen:** cuantos prospectos necesita (10 / 100 / 1000+)

Si el usuario dice "las tres herramientas" o "la maquina completa", ejecutar los 4 pasos.

## Paso 1 — Extraer la lista (Apify o Scrapingdog)

### Opcion A — Apify (MCP disponible)

Usar el MCP de Apify para llamar a los actors correctos segun la fuente:

| Fuente | Actor recomendado |
|--------|------------------|
| Google Maps | `compass/google-maps-scraper` |
| LinkedIn empresas | `linkedin/company-scraper` |
| Facebook grupos | `apify/facebook-groups-scraper` |
| Instagram perfiles | `apify/instagram-scraper` |
| Paginas web (custom) | `apify/web-scraper` |

Prompt para pedirle al usuario:

```
Con Apify, necesito que extraigas todos los [RUBRO] de [CIUDAD/PAIS] de Google Maps
con su nombre, telefono, email (si aparece), pagina web y calificacion.
Dejame la lista ordenada por nombre.
```

### Opcion B — Scrapingdog (alternativa economica)

Usar la API de Scrapingdog directamente si Apify no esta disponible.

```
Con Scrapingdog, extrae los datos de contacto de [RUBRO] en [CIUDAD].
Exporta el resultado a un Excel con columnas: nombre, telefono, email, web.
Ordena por nombre.
```

**Nota:** Scrapingdog da creditos de prueba para arrancar — no es gratis para siempre.

## Paso 2 — Limpiar y organizar (Claude)

Con la lista cruda extraida, Claude la procesa:

```
Toma esta lista de [N] prospectos y:
1. Elimina duplicados (mismo nombre o mismo telefono)
2. Separa los que tienen web de los que no
3. Marca con PRIORITARIO los que tienen email disponible
4. Ordena por ciudad (si hay varias) y luego por nombre
5. Entregame la lista limpia en formato tabla
```

## Paso 3 — Espiar la competencia (Browser Harness)

Usar Browser Harness para abrir el Chrome real del usuario y revisar:

### Anuncios activos en Meta (Facebook/Instagram):

```
Con Browser Harness, abre la Biblioteca de Anuncios de Facebook
(https://www.facebook.com/ads/library).
Busca los anuncios activos de [NOMBRE O PAGINA DEL COMPETIDOR].
Resume:
- Cuantos anuncios activos tienen
- Que mensajes y ofertas usan
- Que imagenes o formatos repiten
- Desde hace cuanto corren (fecha de inicio)
Dame los patrones que mas se repiten.
```

### Web y presencia online:

```
Con Browser Harness, visita la web de [COMPETIDOR].
Extrae:
- Propuesta de valor principal (el headline)
- Servicios o productos que ofrecen
- Precios si aparecen
- Testimonios o casos de exito
- Llamados a la accion que usan
```

**Aviso:** La Biblioteca de Anuncios de Meta es publica. Revisa los terminos
de cada sitio antes de raspar en grande.

## Paso 4 — La maquina completa (orquestacion)

Cuando el usuario quiere todo junto, ejecutar en secuencia:

```
Mision: armar la lista + investigar competencia + preparar mensajes

FASE 1 — Lista cruda:
[Ejecutar Paso 1 con Apify o Scrapingdog]

FASE 2 — Limpieza:
[Ejecutar Paso 2 con Claude]

FASE 3 — Contexto de competencia:
[Ejecutar Paso 3 con Browser Harness]

FASE 4 — Preparar el acercamiento:
Toma la lista limpia de prospectos. Para los primeros 10:
- Revisame si tienen web o anuncios activos (Browser Harness)
- Con que mensaje les entraria segun lo que hace la competencia
- Dame el primer mensaje para cada uno (maximo 4 lineas, abre con su problema,
  termina con una pregunta, no con un pitch)
```

## Combinacion con otros skills

- `/lead-hunter` → para enriquecer cada lead con noticias recientes (Last 30 Days)
- `/marketing-supremo` → para armar la secuencia de seguimiento despues de tener la lista
- `/email-machine` → para escribir la secuencia completa de outreach
- `/copywriter` → para pulir los mensajes si suenan roboticos
- `/clone-competitor` → para un analisis mas profundo del stack completo del competidor

## Herramientas requeridas

| Herramienta | MCP | Como instalar |
|-------------|-----|--------------|
| Apify | `apify` en `.mcp.json` | Ya configurado. Necesita `APIFY_TOKEN` |
| Scrapingdog | REST API directa | `SCRAPINGDOG_API_KEY` como variable de entorno |
| Browser Harness | Skill local | `/browser-harness` para instalar |

## Notas de uso responsable

- Solo raspar sitios publicos o donde tengas permiso
- Usar los datos obtenidos con cabeza — no spam masivo
- Los precios y cuotas gratis de las herramientas pueden cambiar
