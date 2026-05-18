# Tienda Nube — admin: ordenes pendientes

## Cuando usar
Tengo MI tienda en TN y quiero ver/procesar ordenes pendientes desde Claude.
REQUIERE estar logueado en `www.tiendanube.com/admin` en tu Chrome.

## Inputs
- `status_filter`: pending | paid | shipped | cancelled | all (default: pending)
- `date_from`: ISO date (default: hace 7 dias)
- `date_to`: ISO date (default: hoy)
- `count_max`: tope de ordenes (default 50)

## Pasos

1. Verificar sesion: navegar a `https://www.tiendanube.com/admin/v2/orders`
   - Si redirige a login → ABORT con mensaje "Tenes que loguearte primero"
2. Aplicar filtros de la UI:
   - Status: `status_filter`
   - Date range: `date_from` to `date_to`
3. Para cada orden visible (hasta `count_max`):
   - Order #
   - Cliente (nombre + email)
   - Total
   - Productos (lista de SKU + cantidad)
   - Status pago + envio
   - Direccion de envio (provincia/ciudad solamente, NO direccion completa por
     privacidad)
   - Fecha de orden
   - URL de la orden en admin

## Output

```markdown
## Ordenes en tu tienda — filtro: {status_filter} ({date_from} → {date_to})

**Total ordenes:** N
**Total facturado en el periodo:** ${total}
**Ticket promedio:** ${avg}

| # | Fecha | Cliente | Total | Productos | Pago | Envio | Provincia |
|---|---|---|---|---|---|---|---|

### Accion recomendada
- {N} ordenes pagas listas para preparar envio
- {N} ordenes que llevan >48h sin procesarse → priorizar
- {N} ordenes canceladas → revisar motivos si hay patron
- Top 3 productos vendidos en el periodo: {lista}
```

## Privacidad

- NUNCA exportar direcciones completas, telefonos o DNI/CUIT a archivos
  publicos.
- Si el usuario pide "exportar a Excel", usar solo nombre + email + total +
  productos. Direccion solo en pantalla, no en archivo.

## Gotchas

- TN admin tiene 2FA opcional. Si esta activo y la sesion expiro, va a
  pedir codigo. Browser Harness no puede resolverlo automaticamente — pedir
  al usuario que lo haga.
- Algunos planes de TN no exponen ciertas vistas (ej: "Insights" requiere
  plan Avanzado). Si la URL devuelve 403, devolver mensaje claro.
- Ordenes con multiples envios (split shipping) cuentan como una sola orden
  pero tienen multiples trackings. Mostrar el primero.
