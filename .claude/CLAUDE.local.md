# KAIROS ORO — Proyecto stack-ia-creador

## Contexto del repo

PWA Dashboard en Vercel (`prj_qoGv0Lf71t69tRowJrZPtj5hAXr3`).
Frontend React con Supabase como backend. Anon key pública (misma que Diego-Orosa).

## Módulos Kairos activos

### kairos-guard
- Verificar que Vercel deployment no falle antes de push
- Hacer `npm run build` como pre-check local antes de push

### kairos-workflow
- Antes de push: ejecutar `npm run build` para validar
- Si build falla → NO pushear, corregir primero

### kairos-notify
- Alerta si build falla en Vercel
- Notificar URL del deploy cuando esté Ready

### kairos-orion
- Contexto: dashboard de gestión para clientes de Estudio Oro
- Newsletter signup activo en `public/newsletter.html`
- API backend: `https://deploy-oro.vercel.app/api/newsletter`

## Reglas de desarrollo

1. NUNCA pushear a `main` directamente
2. Ramas: `feat/*`, `fix/*`
3. Verificar siempre `npm run build` antes de PR
4. Supabase anon key es pública (intencional, RLS restringe acceso)

## URLs de producción

- Dashboard: Vercel deploy URL del proyecto
- Newsletter API: `https://deploy-oro.vercel.app/api/newsletter`
- Supabase: `https://moljmujlfvtsgkjbtwss.supabase.co`
