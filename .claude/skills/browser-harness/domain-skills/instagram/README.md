# Instagram — domain skill seed

Skill curada a mano para Browser Harness. Cubre cuentas publicas, hashtags y
reels. NO cubre DMs ni acciones que requieran 2FA reciente — para eso usar
Computer Use con Midscene.

## Tareas soportadas

| Tarea | Archivo | Ejemplo de prompt |
|---|---|---|
| Feed de cuenta publica | `account-feed.md` | "Sacame los ultimos 20 posts de @lobo.confiteria" |
| Top reels por engagement | `top-reels.md` | "Top 10 reels de @marca por likes en los ultimos 90 dias" |
| Hashtag monitoring | `hashtag-monitor.md` | "Posts del hashtag #pasteleria en las ultimas 24h" |
| Anuncios activos (Ads Library) | `ads-active.md` | "Anuncios activos de @competidor en Argentina" |
| Stories destacadas | `story-highlights.md` | "Que tiene la cuenta @marca en historias destacadas" |

## Gotchas conocidos

- **Login wall**: Instagram tira login wall despues de 3-5 cuentas vistas sin
  sesion. Solucion: usar Chrome con tu sesion logueada, NO modo incognito.
- **Carga lazy**: el feed se carga con scroll infinito. Browser Harness hace
  scroll automatico hasta encontrar la cantidad pedida — pero si pedis >50
  posts puede tardar 2-3 minutos por la animacion.
- **Stories volatiles**: las stories normales (no destacadas) caducan en 24h —
  el agente solo puede leerlas si estan disponibles cuando corre.
- **Rate limit**: no hagas mas de 20 prompts seguidos al mismo perfil — IG
  empieza a tirar "challenge required" y te bloquea por 1h.

## Selectores criticos (al 2026)

```
Posts del feed: article[role="presentation"]
Like count:     section span[aria-label*="Me gusta"]
Comment count:  section a[href*="/comments/"]
Reel duration:  time[datetime]
Caption:        div._a9zs span
```

Estos selectores los detecta y refina Browser Harness automaticamente — solo
estan aqui para debugging si el agente falla.
