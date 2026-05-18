# Instagram — feed de cuenta publica

## Cuando usar
El usuario quiere los ultimos N posts de una cuenta especifica (publica).

## Inputs
- `username`: handle sin @ (ej: `lobo.confiteria`)
- `count`: cantidad de posts a extraer (default: 20, max recomendado: 50)

## Pasos

1. Navegar a `https://www.instagram.com/{username}/`
2. Esperar a que cargue la grilla (`article` visible)
3. Para cada post de la grilla, hacer click y extraer:
   - URL del post (`window.location.href` cuando esta abierto)
   - Caption (primer span dentro del modal)
   - Fecha (atributo `datetime` del `<time>`)
   - Likes (parsear el numero del aria-label)
   - Comentarios (parsear el numero del link a `/comments/`)
   - Tipo (post / reel / carrusel — detectar por la estructura del modal)
   - URL de la primera imagen/thumbnail
4. Cerrar el modal y pasar al siguiente
5. Repetir hasta `count` posts o hasta que se acabe el feed
6. Si scroll-infinito necesario: scroll al final de la grilla y esperar 2s

## Output esperado

Tabla Markdown ordenada por fecha descendente:

```markdown
| # | Fecha | Tipo | Caption (primeros 80c) | Likes | Comments | URL |
|---|---|---|---|---|---|---|
```

## Anti-captcha

Si despues de 10-15 posts aparece challenge wall:
- Salir del modal
- Esperar 30 segundos
- Volver a la grilla
- Continuar desde el ultimo post extraido

## Senales de exito

- Cuenta de filas en la tabla >= `count` solicitado
- Sin filas con campos vacios
- URLs validas (`https://www.instagram.com/p/...`)
