# Runbook: bux en VPS (browser-harness 24/7)

Pegá los comandos en orden. Tiempo total: ~10 minutos.

## 0. Pre-requisitos

| Item | Cómo obtenerlo |
|---|---|
| VPS Linux con sudo (Ubuntu 22.04+ o Debian 12 recomendado) | DigitalOcean, Hetzner, Vultr — droplet más chico alcanza |
| `BROWSER_USE_API_KEY` | https://cloud.browser-use.com → Settings → API Keys |
| `TELEGRAM_BOT_TOKEN` | Hablale a `@BotFather` en Telegram → `/newbot` |
| `TELEGRAM_CHAT_ID` | Hablale a `@userinfobot` y copiá tu `Id` |

Reemplazá los placeholders entre `<...>` en los bloques de abajo.

## 1. SSH al VPS y dependencias base

```bash
ssh root@<IP-DEL-VPS>

apt update && apt upgrade -y
apt install -y curl git python3-pip python3-venv chromium-browser xvfb less
# Si chromium-browser no existe en tu distro, usá:
#   apt install -y google-chrome-stable
```

## 2. Descargar e inspeccionar el instalador de bux

**Nunca pipear directo a `sudo bash`** — bajalo, leelo, después corrélo.

```bash
curl -fsSL -o /tmp/bux-install.sh \
  https://raw.githubusercontent.com/browser-use/bux/main/install.sh

# Inspeccioná (q para salir)
less /tmp/bux-install.sh
```

## 3. Ejecutar instalador con credenciales

```bash
export BROWSER_USE_API_KEY="<TU_API_KEY>"
export TELEGRAM_BOT_TOKEN="<TU_BOT_TOKEN>"
export TELEGRAM_CHAT_ID="<TU_CHAT_ID>"

# Sin sudo primero. Si el script falla pidiendo permisos elevados,
# corré solo esa parte con sudo (no el script entero).
bash /tmp/bux-install.sh
```

## 4. Verificar que el servicio está corriendo

```bash
systemctl status bux               # debe decir "active (running)"
journalctl -u bux -n 50 --no-pager # últimos 50 logs
```

Si Telegram está bien configurado, debería llegarte un mensaje
`bux online en <hostname>` en el chat configurado.

## 5. Conectar Chrome con sesiones logueadas (una sola vez)

bux necesita un Chrome con `--remote-debugging-port` y perfil persistente.
La forma más fácil: VNC + abrir Chrome manualmente y loguearte en Instagram,
Facebook Business, MercadoLibre, etc.

```bash
# Instalar TigerVNC
apt install -y tigervnc-standalone-server tigervnc-common
vncpasswd                         # set un password
vncserver -localhost no -geometry 1280x800 :1

# Desde tu máquina:  ssh -L 5901:localhost:5901 root@<IP-VPS>
# Después abrí cualquier cliente VNC en localhost:5901
```

Dentro del VNC abrí Chromium y logueate UNA vez en cada cuenta que necesites.
Cerrá VNC cuando termines: `vncserver -kill :1`

## 6. Lanzar Chrome con remote debugging (servicio systemd)

```bash
cat > /etc/systemd/system/chrome-bh.service <<'EOF'
[Unit]
Description=Chromium remote debugging para browser-harness
After=network.target

[Service]
Type=simple
User=root
Environment=DISPLAY=:1
ExecStartPre=/usr/bin/xvfb-run -a echo "xvfb-ready"
ExecStart=/usr/bin/chromium-browser --remote-debugging-port=9222 \
  --user-data-dir=/root/.bh-chrome-profile \
  --no-sandbox --disable-gpu --headless=new
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now chrome-bh
systemctl status chrome-bh
```

## 7. Smoke test desde el VPS

```bash
# Pegá esto y debería traer el título de google.com
curl -s http://localhost:9222/json/version | head -c 500; echo
```

## 8. Mandar el primer prompt via Telegram

Desde tu Telegram, al bot `@<tu_bot>`:

```
abrime mercadolibre y traeme top 5 ofertas del dia en electro
```

bux lo orquesta, browser-harness ejecuta, te devuelve el resultado al chat.

## Troubleshooting rápido

| Síntoma | Fix |
|---|---|
| `journalctl -u bux` muestra `401 Unauthorized` | `BROWSER_USE_API_KEY` mal — re-exportá y `systemctl restart bux` |
| El bot de Telegram no responde | Verificá `TELEGRAM_BOT_TOKEN` y que hayas iniciado el chat con `/start` |
| Chrome muere cada 5s | Faltan deps: `apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxss1 libxtst6 libdrm2 libgbm1 libxcomposite1 libxrandr2 libxdamage1 libxfixes3 libpango-1.0-0 libpangocairo-1.0-0 libasound2` |
| Captcha cada 2 minutos | Loguéate manual via VNC (paso 5) y dale 24h para que el perfil "envejezca" antes de exigirle volumen |

## Apagar todo

```bash
systemctl disable --now bux chrome-bh
rm /etc/systemd/system/bux.service /etc/systemd/system/chrome-bh.service
systemctl daemon-reload
```
