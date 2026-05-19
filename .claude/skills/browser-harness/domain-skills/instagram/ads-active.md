# Instagram — anuncios activos via Facebook Ads Library

## Cuando usar
Quiero ver los anuncios que esta corriendo una marca AHORA en Instagram.
Esto NO se hace en instagram.com — se hace en la Ads Library de Meta.

## Inputs
- `account`: nombre de la pagina de Facebook asociada a Instagram (no el @ de IG)
- `country`: codigo ISO (AR, MX, ES, US, etc) — default ALL
- `platform_filter`: instagram | facebook | both (default: instagram)

## Pasos

1. Navegar a `https://www.facebook.com/ads/library/`
2. Filtros:
   - Country: `{country}`
   - Ad category: All ads
   - Platform: `{platform_filter}`
3. Buscar `{account}` en el search bar de la libreria
4. Click en la pagina correcta
5. Para cada anuncio activo (badge "Active"):
   - Copy completo (primer parrafo)
   - Tipo: imagen, video, carrusel, collection
   - Fecha de inicio
   - Plataformas donde aparece (icons al pie)
   - URL de la creative principal
   - CTA visible (boton)
   - Si tiene multiples versiones de creative → contar cuantas

## Output

```markdown
## Anuncios activos de {account} en {country} ({platform_filter})

**Total activos:** N
**Copies distintos:** M
**Copy mas repetido (winner):** "{copy mas usado}"

### Anuncios

| ID | Tipo | Plataformas | Fecha inicio | CTA | Copy (100c) |
|---|---|---|---|---|---|

### Insights
- Hay {N} variaciones de creative del mismo copy → senal de A/B testing
- Formato dominante: ...
- Frecuencia de lanzamiento: X anuncios/semana en los ultimos 30 dias
```

## Gotchas

- Algunos anuncios NO tienen badge "Active" pero siguen corriendo —
  filtrar por "currently running" en la UI.
- Si la pagina no esta en Ads Library: significa que la cuenta nunca corrio
  ads o que esta restringida. Devolver eso, no inventar.
- Los politicos / "ads about social issues" requieren reverificacion frecuente
  — marcarlos.
