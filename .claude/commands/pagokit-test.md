---
description: Valida los 5 candados de seguridad de PagoKit sobre los archivos del proyecto actual.
allowed-tools: Read, Bash
---

# /pagokit-test

Corriendo validacion de los 5 candados de seguridad de PagoKit.

Ejecutar en secuencia:

1. CANDADO 1: Buscar API keys hardcodeadas en archivos .ts/.js (excluir .env, .env.example, node_modules)
2. CANDADO 2: Verificar que .env esta en .gitignore (auto-agregar si falta)
3. CANDADO 3: Verificar que los archivos de webhook llaman a verificacion de firma
4. CANDADO 4: Verificar presencia de idempotency keys UUID en archivos de pagos
5. CANDADO 5: Verificar raw body en webhooks

Ver detalle de cada verificacion en `agente-pagokit/commands/pagokit/test.md`.

Mostrar resumen al final: cuantos pasaron, cuantos fallaron, fix para cada falla.
