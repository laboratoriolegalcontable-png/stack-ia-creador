---
description: Genera escritos penales (querellas, denuncias, recursos, alegatos) con normativa CPPN/CPP PBA/CPPF citada
allowed-tools: Read, Write, Edit, Bash, WebSearch
---

# /penal-escrito

Genera escritos penales para el Estudio Oro (Dr. Diego Orosa, CPACF T145 F433, CASI TLV F206, Federal T137 F358).

## Uso

`/penal-escrito [tipo] [hechos]`

Tipos soportados: querella, denuncia, recurso-apelacion, recurso-casacion, alegato-final, oposicion-prision-preventiva, eximicion-prision, habeas-corpus, sobreseimiento, libertad-asistida.

## Proceso

1. Pedí los datos faltantes: jurisdicción (federal/CABA/PBA), expediente (si lo hay), nombre del cliente, hechos puntuales, fecha del hecho, normativa aplicable.
2. Estructurá el escrito con: encabezado, hechos, derecho aplicable (con cita marcada `[VERIFICAR VIGENCIA]`), prueba ofrecida, petitorio.
3. Citá CPPN (Ley 23.984), CPP PBA (Ley 11.922), CPPF (Ley 27.063) o Código Penal según corresponda.
4. Incluí siempre la fórmula de cierre: "Será Justicia." + firma del Dr. Diego Orosa con matrícula correspondiente a la jurisdicción.
5. Devolvé el escrito en formato Word-friendly listo para imprimir.

## Reglas

- NUNCA inventes números de expediente, jurisprudencia o artículos.
- Si citás un fallo, marcalo `[VERIFICAR]`.
- Tono procesal formal, en tercera persona ("V.S.", "esta parte").
- Respetá el modelo institucional del Estudio Oro S.A.S.
