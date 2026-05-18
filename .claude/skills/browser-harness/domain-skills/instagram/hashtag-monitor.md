# Instagram — hashtag monitor

## Cuando usar
Trackear que se postea en un hashtag (competencia, tendencia, evento en vivo).

## Inputs
- `hashtag`: sin `#` (ej: `pasteleria`)
- `window_hours`: ultimas N horas (default 24)
- `min_likes`: filtrar posts con menos de N likes (default 50)

## Pasos

1. Navegar a `https://www.instagram.com/explore/tags/{hashtag}/`
2. La pagina muestra dos secciones: "Top posts" y "Recent posts"
3. Scrollear "Recent posts" hasta encontrar uno con timestamp >= ahora - window_hours
4. Para cada post visible en la ventana:
   - Click → extraer caption, likes, comments, fecha, username, URL
   - Filtrar los que pasan `min_likes`
5. Detectar accounts repetidas — si una cuenta aparece >3 veces, marcarla como spam/bot

## Output

```markdown
## Hashtag #{hashtag} — ultimas {window_hours}h ({min_likes}+ likes)

**Total posts encontrados:** N
**Accounts unicas:** M
**Top 3 accounts (por # de posts):** @x, @y, @z

| Fecha | Cuenta | Caption (80c) | Likes | Comments | URL |
|---|---|---|---|---|---|

### Patrones detectados
- Hora pico de posteo: ...
- Formato dominante: reels / carrusel / foto unica
- Sentiment general: positivo / neutral / negativo / mixto
```

## Gotchas

- Hashtags muy grandes (#love, #foodporn): IG limita a ~9 recent posts
  visibles sin scroll constante. No prometer cobertura total.
- Hashtags chicos (<1000 posts totales): la seccion "Top posts" puede estar vacia.
- IG a veces restringe hashtags (CSAM, drogas, etc) — devolver mensaje y NO
  insistir.
