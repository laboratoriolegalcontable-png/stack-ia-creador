# Tienda Nube — domain skill seed

Tienda Nube (Nuvemshop en Brasil) es la plataforma ecommerce mas usada por
PyMEs en Argentina. Cubre tanto el lado publico (catalogo, productos, precios)
como — opcionalmente con sesion logueada — el panel admin de tiendas propias.

## Tareas soportadas

| Tarea | Archivo | Ejemplo |
|---|---|---|
| Catalogo publico de una tienda | `public-catalog.md` | "extrae todos los productos de tienda.com.ar" |
| Comparar precios entre tiendas | `price-comparison.md` | "compara precios de SKU X en 5 tiendas" |
| Panel admin de tu tienda | `admin-orders.md` | "ordenes pendientes de envio en mi tienda" |
| Buscar tiendas por categoria | `discover-stores.md` | "tiendas de pasteleria activas en TN AR" |

## Estructura de URLs

- Tienda publica: `https://{nombre}.com.ar` o `https://{nombre}.mitiendanube.com`
- Producto: `/productos/{slug}/`
- Categoria: `/categoria/{slug}/`
- Admin: `https://www.tiendanube.com/admin/v2/...` (requiere login)

## Gotchas

- Muchas tiendas usan dominio propio — no siempre es obvio que corren TN.
  Senal: existe `/productos/` y `/categoria/` en el sitemap.
- TN no expone APIs publicas sin OAuth — todo via scraping del HTML.
- Las tiendas pueden tener custom themes — Browser Harness aprende los
  selectores la primera vez y los guarda.
- Para admin: requiere 2FA en algunas tiendas. Si falla, devolver mensaje
  claro al usuario.
