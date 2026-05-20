# Instagram — stories destacadas

## Cuando usar
Quiero ver que esta destacando una cuenta como "permanente" — es el lugar
donde las marcas ponen catalogo, FAQ, testimonios, ofertas vigentes.

## Inputs
- `username`: handle sin @
- `highlight_filter`: regex o lista de nombres especificos (opcional)

## Pasos

1. Navegar a `https://www.instagram.com/{username}/`
2. Localizar la fila de circulos "Stories destacadas" (entre bio y grid)
3. Para cada highlight visible:
   - Click → entra al carrusel de stories del highlight
   - Para cada story del carrusel:
     - Tipo: foto o video
     - Caption / texto superpuesto (si hay)
     - Stickers visibles (poll, link, mention, location)
     - Duracion (si es video)
   - Tab derecha para avanzar, ESC para salir
4. Volver al perfil, siguiente highlight

## Output

```markdown
## Story highlights de @{username}

**Total highlights:** N
**Total stories acumuladas:** M

### {Nombre Highlight 1}
- Cover: {url thumbnail}
- # stories: K
- Tipos: foto x?, video x?
- Stickers detectados: poll x?, link x?
- Resumen del contenido: ...

### {Nombre Highlight 2}
...
```

## Gotchas

- Los highlights se cargan a demanda — si son >20 puede tardar.
- Algunos stickers (musica, GIF animado) son dificiles de capturar — describir
  visualmente lo que se ve.
- Si la cuenta es privada y no estas siguiendola, no hay acceso. Devolver
  mensaje claro.
