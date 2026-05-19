Usa la skill `despegar/price-monitor.md`.

Parametros del monitoreo:
- Origen: BUE (Buenos Aires)
- Destino: MAD (Madrid)
- Fecha ida: 2026-06-10
- Fecha vuelta: 2026-06-25
- Pasajeros: 2 adultos
- Clase: economica
- Currency: USD
- Target price: 700 USD (precio objetivo para alerta)
- Frequency hours: 6
- Output log: ~/.bh-runs/despegar/buemad-jun.csv
- Notify channel: telegram

Tareas:
1. Buscar el vuelo segun parametros
2. Tomar el precio mas barato de los primeros 10 resultados
3. Appendear al CSV historico
4. Si precio_min <= target_price → alerta 🚨
5. Si delta vs ayer es > 10% (subida o bajada) → alerta de movimiento
6. Devolver resumen compacto con: precio actual, vs ultima corrida, vs 7d, y URL para reservar

Si la fecha de viaje ya paso, auto-stopear el job y notificar al usuario.
