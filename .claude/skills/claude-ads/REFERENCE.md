# Referencia — Claude Ads v2.4.0

## Prompts listos para usar

### Primera auditoria completa

```
/ads audit

Mi gasto mensual es $[cantidad] repartido en [Meta / Google / TikTok].
Mi objetivo del trimestre es [conversiones / leads / ventas / trafico].

Quiero:
1. Ads Health Score general y grade A-F
2. Sub-scores por plataforma
3. Los 5 critical issues mas urgentes con tiempo estimado de fix
4. Quick wins que pueda implementar hoy en menos de 1 hora
5. Cualquier compliance flag que aparezca
```

### Plan estrategico por industria

```
/ads plan [ecommerce / local-service / real-estate / healthcare / finance / agency / generic]

Producto: [descripcion breve]
Mercado: [pais o region]
Presupuesto mensual: $[cantidad]
Objetivo: [leads / ventas / instalaciones / awareness]
Plataformas: [Meta / Google / TikTok / todas]
```

### Inteligencia de competencia

```
/ads competitor

Competidores: [competidor 1], [competidor 2], [competidor 3]
Industria: [industria]
Plataformas: [Meta / Google / TikTok]

Para cada uno: tipos de anuncios, angulos creativos, audiencias, patrones.
Cerrar con 3 oportunidades de diferenciacion.
```

### Calculadora

```
/ads math

Gasto mensual: $[cantidad]
Ingresos atribuidos: $[cantidad]
Ticket promedio: $[cantidad]
Margen bruto: [%]
Conversiones del mes: [numero]
```

## Configurar conexiones

### Meta Ads (5 min)
- business.facebook.com → Usuarios del sistema → token con `ads_read, ads_management`
- Variables: `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` (act_XXXXXXXXXX)

### Google Ads (1-3 dias habiles)
- Solicitar Developer Token en developers.google.com/google-ads
- Variables: `GOOGLE_DEVELOPER_TOKEN`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CUSTOMER_ID`

### TikTok Ads (1 hora)
- ads.tiktok.com → TikTok for Business API → token con `advertiser:read, campaign:read`
- Variables: `TIKTOK_ACCESS_TOKEN`, `TIKTOK_ADVERTISER_ID`

## Activacion global — todos los proyectos

Para que Claude Ads se active en CUALQUIER proyecto de Claude Code:

```bash
# Copiar a la carpeta global
cp -r .claude/skills/claude-ads ~/.claude/skills/
cp .claude/hooks/ads-start.sh ~/.claude/hooks/

# Agregar al ~/.claude/settings.json:
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/ads-start.sh",
            "timeout": 10,
            "statusMessage": "Cargando Claude Ads v2.4.0..."
          }
        ]
      }
    ]
  }
}
```

## Benchmarks por industria 2026

| Industria | CPA objetivo | ROAS minimo | CTR Search | CPM Meta |
|---|---|---|---|---|
| Ecommerce DTC | $15-45 | 3.0x | 3-5% | $8-15 |
| Servicios locales | $25-80 | 4.0x | 5-8% | $12-20 |
| SaaS B2B | $80-200 | 2.5x | 2-4% | $15-30 |
| Real Estate | $40-120 | 2.0x | 3-6% | $10-18 |
| Healthcare | $30-90 | 3.5x | 4-7% | $11-22 |
| Finanzas | $50-150 | 2.8x | 2-5% | $18-35 |
