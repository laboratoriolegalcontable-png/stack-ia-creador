# Meta Ads — 50 Checks
## Agente: audit-meta

### PIXEL / CAPI / PRIVACY (12 checks)

M01 · critico · Pixel de Meta no instalado o sin disparar en paginas clave
M02 · critico · Conversions API (CAPI) no desplegada — 30-40% perdida de datos
M03 · critico · EMQ (Event Match Quality) < 6.0 en eventos principales
M04 · critico · Consent Mode no configurado en mercados UE/UK
M05 · alto   · Eventos duplicados sin deduplicacion entre Pixel y CAPI
M06 · alto   · Evento Purchase sin parametros value y currency
M07 · alto   · Sin eventos de mid-funnel (ViewContent, AddToCart, InitiateCheckout)
M08 · alto   · Attribution window < 7 dias sin justificacion
M09 · medio  · Pixel sin Advanced Matching configurado (email, phone hashed)
M10 · medio  · CAPI con latencia >1 hora respecto al evento real
M11 · medio  · Sin test de eventos en Meta Events Manager en 30+ dias
M12 · medio  · AEM no configurado en campanas iOS

### ESTRUCTURA DE CAMPANAS (12 checks)

M13 · critico · Campana activa sin conversion goal configurado correctamente
M14 · critico · Budget diario <$5 por ad set — insuficiente para aprendizaje
M15 · alto   · Mas de 5 ad sets activos en una campana (fragmentacion)
M16 · alto   · Ad sets con audiencias solapadas >60% sin exclusion
M17 · alto   · Campana sin periodo de aprendizaje completado antes de cambios
M18 · alto   · Sin campana de remarketing con Custom Audience de visitantes web
M19 · alto   · Sin campana de retention con Customer List de compradores
M20 · alto   · Campana de conversion con audience >50M sin testear acotadas
M21 · medio  · Sin Lifetime Budget en campanas estacionales
M22 · medio  · CBO deshabilitado en campanas con 3+ ad sets
M23 · medio  · Ad sets pausados sin archivar (distorsionan el reporting)
M24 · medio  · Sin campana de Lookalike basada en lista de compradores (LAL 1%)

### ADVANTAGE+ (8 checks)

M25 · critico · Advantage+ Shopping no testeada en cuentas ecommerce con $5k+/mes
M26 · alto   · Advantage+ con todos los creative controls habilitados sin testing
M27 · alto   · Advantage+ sin exclusion de compradores recientes
M28 · alto   · Advantage+ Budget <$100/dia — volumen insuficiente
M29 · medio  · Advantage+ y campanas manuales sin split de budget claro
M30 · medio  · Sin Advantage+ Creative en ad sets manuales elegibles
M31 · medio  · Advantage+ sin segmento de "existing customers"
M32 · medio  · Sin comparacion sistematica Advantage+ vs campanas manuales

### CREATIVOS / ANDROMEDA (10 checks)

M33 · critico · Ad set con un solo creativo activo (sin diversidad para Andromeda)
M34 · critico · Frecuencia >3 en cold audience con CPM en alza
M35 · alto   · Sin creativos en formato Reels / vertical 9:16
M36 · alto   · Creativos con >20% de texto sobre imagen
M37 · alto   · Sin hook claro en primeros 3 segundos en videos de Feed
M38 · alto   · Creativos con mas de 60 dias sin refresh en campanas activas
M39 · medio  · Sin A/B test de concepto creativo activo
M40 · medio  · Todos los creativos del mismo formato (sin mix)
M41 · medio  · Sin Dynamic Creative Testing (DCT) en prospecting
M42 · medio  · Videos sin subtitulos (85% se consume sin sonido en Meta)

### AUDIENCIAS (8 checks)

M43 · alto   · Broad Audience sin datos de pixel suficientes (<1000 eventos/semana)
M44 · alto   · Detailed Targeting Expansion en campanas con audiencia especifica
M45 · alto   · Sin exclusion de compradores recientes en prospecting
M46 · alto   · Remarketing audiences con <1000 personas activas
M47 · medio  · Sin segmentacion por etapa del funnel (TOF/MOF/BOF)
M48 · medio  · Lookalike basado en email list sin refresh en 90+ dias
M49 · medio  · Sin Engagement Custom Audience (video viewers, page engagers)
M50 · medio  · Interests targeting sin validacion con Audience Insights
