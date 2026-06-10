---
description: Procesamiento multimedia — transcripción de audio/video, restauración de fotos, generación de imágenes
allowed-tools: Read, Write, Bash
---

# /multimedia-procesar

Procesamiento de archivos multimedia (audio, video, imagen, PDF).

## Uso

`/multimedia-procesar [tipo] [archivo]`

Tipos:
- `transcribir` — audio/video a texto (Vibe Voice / Whisper)
- `acta-reunion` — audio de reunión a acta estructurada
- `viral-script` — video viral a guion replicable
- `restaurar-foto` — foto vieja/borrosa a HD (NanoBanana)
- `generar-imagen` — prompt a imagen (NanoBanana / Midjourney)
- `descripcion-vision` — imagen a descripción (Gemini Vision)
- `markitdown` — PDF/Word/Excel a Markdown limpio

## Pipelines pre-configurados

### Audio de reunión → Acta + tareas
1. Transcribir con Vibe Voice (identificación de hablantes)
2. Resumen ejecutivo en 5 bullets
3. Tareas asignadas con responsable + fecha
4. Decisiones tomadas
5. Pendientes para próxima reunión

### Foto deteriorada → HD legal
1. Detectar tipo (documento, persona, paisaje)
2. Restaurar con NanoBanana modo apropiado (forense / retrato / arquitectura)
3. Output 4K, marca de agua si es para uso judicial
4. Reporte de cambios aplicados (para chain of custody)

### PDF / Word / Excel → Markdown
1. Verificar tipo de archivo
2. Convertir con MarkItDown
3. Si es contrato / escritura: aplicar modo legal (extrae cláusulas)
4. Si es factura: aplicar modo factura (extrae datos AFIP)
5. Output: archivo .md + JSON con datos estructurados

## Reglas

- Privacidad: procesar local cuando se pueda (Vibe Voice).
- NanoBanana: archivos quedan en R2 del Estudio, no en servidor de terceros.
- Si el archivo es legal sensible, no subir a servicios cloud sin consentimiento.
