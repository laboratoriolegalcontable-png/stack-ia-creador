Reporte de triple matricula inmobiliaria — Diego Orosa.

Usa la skill `mercadolibre/vertical-search.md` para Argentina y Uruguay, y
para Madrid usa la skill upstream `idealista` (esta en el catalogo de
browser-harness — si no esta activa, activarla).

Busqueda 1 — Argentina (mercadolibre.com.ar / inmuebles):
- Ubicacion: Palermo, CABA
- Tipo: departamento
- Operacion: venta
- Ambientes: 2-3
- Precio max: USD 250.000
- Count: 20

Busqueda 2 — Espana (idealista.com):
- Ubicacion: Centro de Madrid (Distrito Centro)
- Tipo: piso
- Operacion: venta
- Dormitorios: 1-2
- Precio max: EUR 400.000
- Count: 20

Busqueda 3 — Uruguay (mercadolibre.com.uy):
- Ubicacion: Punta Carretas, Montevideo
- Tipo: departamento
- Operacion: venta
- Ambientes: 2-3
- Precio max: USD 250.000
- Count: 20

Para cada listado: precio, m2, USD/m2, ambientes, antiguedad, URL.

Output final: tabla comparativa unificada con USD/m2 promedio + mediana por
ciudad, top 3 oportunidades por USD/m2 mas bajo en cada ciudad, y un
parrafo de analisis (que ciudad esta mas barata, donde hay mas oferta,
donde hay caidas de precio respecto a la semana pasada).
