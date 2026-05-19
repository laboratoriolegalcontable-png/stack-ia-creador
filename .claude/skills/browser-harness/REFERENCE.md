# Browser Harness — referencia rapida

Catalogo completo del skill. Esta documentacion es la fuente de verdad para
saber que sitios cubre, que prompts copy-paste estan listos, y como agendar.

## Catalogo total

- **17 interaction skills** upstream (wait_for_load, click_robust, scroll_until_visible, read_table, extract_pricing, fill_form, screenshot, etc) — vienen built-in, NO se editan.
- **95 domain skills** upstream para sitios pre-soportados.
- **5 domain skills LATAM nuevas** (este repo): instagram, mercadolibre, tiendanube, despegar, rappi → **24 archivos .md totales**.

## Tabla maestra de tareas LATAM listas para correr

| Sitio | Tarea | Skill file | Lista para prod |
|---|---|---|---|
| Instagram | Feed de cuenta publica | `instagram/account-feed.md` | ✅ |
| Instagram | Top reels por engagement | `instagram/top-reels.md` | ✅ |
| Instagram | Hashtag monitor | `instagram/hashtag-monitor.md` | ✅ |
| Instagram | Ads activos via FB Ads Library | `instagram/ads-active.md` | ✅ |
| Instagram | Stories destacadas | `instagram/story-highlights.md` | ✅ |
| Mercado Libre | Busqueda productos | `mercadolibre/search.md` | ✅ |
| Mercado Libre | Ofertas del dia | `mercadolibre/ofertas-dia.md` | ✅ |
| Mercado Libre | Price tracker recurrente | `mercadolibre/price-tracker.md` | ✅ |
| Mercado Libre | Listings de un seller | `mercadolibre/seller-listings.md` | ✅ |
| Mercado Libre | Vehiculos / Inmuebles | `mercadolibre/vertical-search.md` | ✅ |
| Tienda Nube | Catalogo publico | `tiendanube/public-catalog.md` | ✅ |
| Tienda Nube | Comparar precios | `tiendanube/price-comparison.md` | ✅ |
| Tienda Nube | Admin ordenes (requiere login) | `tiendanube/admin-orders.md` | ✅ |
| Tienda Nube | Descubrir tiendas | `tiendanube/discover-stores.md` | ✅ |
| Despegar | Vuelos | `despegar/flights.md` | ✅ |
| Despegar | Hoteles | `despegar/hotels.md` | ✅ |
| Despegar | Paquetes | `despegar/packages.md` | ✅ |
| Despegar | Monitor de precio | `despegar/price-monitor.md` | ✅ |
| Rappi | Restaurantes por zona | `rappi/restaurants.md` | ✅ |
| Rappi | Comparar supermercados | `rappi/supermercados.md` | ✅ |
| Rappi | Monitor competencia | `rappi/competencia-restaurante.md` | ✅ |
| Rappi | Ofertas hoy | `rappi/ofertas-hoy.md` | ✅ |

## Comandos clave

### Instalar (1 sola vez)
```bash
bash .claude/skills/browser-harness/scripts/install.sh
```

### Doctor (verificar que todo este bien)
```bash
cd ~/Developer/browser-harness && uv run browser-harness --doctor
```

### Correr un prompt one-off
```bash
cd ~/Developer/browser-harness && uv run browser-harness "PROMPT"
```

### Agendar un job recurrente
```bash
bash .claude/skills/browser-harness/scripts/schedule.sh \
  --cron "0 8 * * *" \
  --name JOB_NAME \
  --prompt-file PATH/TO/prompt.md \
  --output-channel telegram
```

### Briefing matutino completo (5 tareas en paralelo)
```bash
bash .claude/skills/browser-harness/scripts/briefing-matutino.sh
```

## Variables de entorno

| Variable | Default | Para que |
|---|---|---|
| `BH_DOMAIN_SKILLS` | `0` | Setear `1` activa las 95 domain skills upstream + 5 LATAM |
| `BH_HOME` | `~/Developer/browser-harness` | Donde vive el repo de browser-harness |
| `BH_WORKSPACE` | `~/Developer/browser-harness/agent-workspace` | Separar workspaces por proyecto |
| `TELEGRAM_BOT_TOKEN` | — | Para notificaciones via Telegram |
| `TELEGRAM_CHAT_ID` | — | Chat destino de Telegram |
| `SLACK_WEBHOOK_URL` | — | Notificaciones Slack |
| `BH_EMAIL_TO` | — | Notificaciones email (necesita `mail` instalado) |
| `BROWSER_USE_API_KEY` | — | Solo para `bux` (24/7 en VPS) o Cloud free tier |

## Jobs pre-armados para Diego Orosa

Estos jobs se pueden activar inmediatamente despues del install. Los prompt
files estan en `.claude/skills/browser-harness/prompts/`.

| Job | Frecuencia | Que hace |
|---|---|---|
| `briefing-matutino` | L-V 6:30 AM ART | 5 tareas paralelo: lobo IG + Rappi + boletin oficial + Zonaprop + GitHub PRs |
| `lobo-radar-rappi` | Diario 10 AM | Estado de 8 competidores de Lobo en Rappi |
| `lobo-canasta-super` | Lunes 9 AM | Comparar precios canasta pasteleria en 5 supers |
| `triple-matricula` | Jueves 9 AM | USD/m2 promedio Palermo / Madrid / Punta del Este |
| `ads-competencia` | Cada 6h | Anuncios activos de 8 competidores en FB Ads Library |
| `narakia-prs` | Cada 30 min L-V 9-18 | Status PRs en repos de Estudio Oro |
| `vuelo-buemad-jun` | Cada 6h | Precio BUE→MAD junio, alertar si < USD 700 |

Para activarlos todos en una corrida:

```bash
bash .claude/skills/browser-harness/scripts/setup-jobs-diego.sh
```

## Modo VPS 24/7 — bux

Si queres autonomia real (sin que tu Mac este prendida), seguir las
instrucciones de [bux](https://github.com/browser-use/bux):

```bash
# En tu VPS de DigitalOcean / Hetzner / Linode ($5/mes)
curl -fsSL https://raw.githubusercontent.com/browser-use/bux/main/install.sh \
  | sudo BROWSER_USE_API_KEY=$BROWSER_USE_API_KEY bash

# Loguear via VNC en tus sitios criticos UNA vez
# Controlar todo desde Telegram desde el celu
```

## Skills upstream completas

Lista de los 95 sitios del catalogo upstream (`BH_DOMAIN_SKILLS=1` requerido):

amazon, linkedin, facebook-groups, facebook-pages, facebook-ads-library,
youtube, x (twitter), tiktok, reddit, gmail, shopify-admin, github,
substack, ebay, etsy, walmart, zillow, salesforce, sec-edgar, perplexity,
claude-ai, notion, airtable, stripe-dashboard, paypal, wikipedia, imdb,
indeed, glassdoor, upwork, twitch, quora, gitlab, bamboohr, mailchimp,
calendly, discord, vercel, aws-console, azure-portal, redfin, realtor,
craigslist, ziprecruiter, monster, simplyhired, dice, angellist, producthunt,
hackernews, medium, dev-to, hashnode, behance, dribbble, pinterest, flickr,
500px, soundcloud, spotify-artist, last-fm, bandcamp, vimeo, dailymotion,
patreon, kickstarter, indiegogo, gofundme, eventbrite, meetup, ticketmaster,
stubhub, vrbo, airbnb-host, booking, expedia, hotels, kayak, skyscanner,
trip-advisor, opentable, yelp, grubhub, doordash, ubereats, postmates,
instacart, freshdirect, peapod, target, bestbuy, lowes, homedepot, costco,
samsclub, bjs.

## Trade-offs vs alternativas

| Tool | Cuando usar |
|---|---|
| **Browser Harness** | Tareas REPETIBLES — el agente aprende cada sitio y la 2da corrida es instantanea |
| **Computer Use / Chrome Bridge** | Tareas UNA SOLA VEZ, complejas, basadas en vision — no merece la pena aprender |
| **Scrapling** | Lead hunting con google maps + classification — mas batch oriented |
| **Playwright directo** | Cuando ya sabes exactamente que selectores usar y queres maxima velocidad |
| **Agent Browser (Vercel)** | Optimizar tokens cuando navegas con LLM como conductor en cada step |

## Links

- Repo: https://github.com/browser-use/browser-harness
- Sitio: https://browser-harness.com
- bux (sibling 24/7): https://github.com/browser-use/bux
- Cloud free tier: https://browser-use.com (3 browsers + proxies + CAPTCHA solver, sin tarjeta)
- Licencia: MIT
