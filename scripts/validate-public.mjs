#!/usr/bin/env node
// validate-public.mjs - chequea que public/ tenga los archivos esperados.
// Se corre en cada build de Vercel. NO depende del skill local.
// Para regenerar prompts/programas desde el skill, correr `npm run sync` localmente
// y commitear los JSON actualizados.

import { readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public");

const required = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "sw.js",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "prompts.json",
  "programas.json",
  "agenda.json",
];

function fail(msg) {
  console.error(`[validate-public] ERROR: ${msg}`);
  process.exit(1);
}

async function main() {
  for (const f of required) {
    try {
      await stat(join(PUBLIC, f));
    } catch {
      fail(`falta archivo: public/${f}`);
    }
  }

  // Validar JSONs
  for (const j of ["prompts.json", "programas.json", "manifest.json", "agenda.json"]) {
    try {
      JSON.parse(await readFile(join(PUBLIC, j), "utf-8"));
    } catch (e) {
      fail(`public/${j} no es JSON valido: ${e.message}`);
    }
  }

  // Confirmar conteos minimos
  const prompts = JSON.parse(await readFile(join(PUBLIC, "prompts.json"), "utf-8"));
  const programas = JSON.parse(await readFile(join(PUBLIC, "programas.json"), "utf-8"));
  const agenda = JSON.parse(await readFile(join(PUBLIC, "agenda.json"), "utf-8"));

  if (!Array.isArray(prompts.prompts) || prompts.prompts.length < 1) {
    fail("prompts.json no contiene prompts");
  }
  if (!Array.isArray(programas.programas) || programas.programas.length < 1) {
    fail("programas.json no contiene programas");
  }
  if (!Array.isArray(agenda.schedule_commands) || agenda.schedule_commands.length < 1) {
    fail("agenda.json no contiene schedule_commands");
  }

  console.log(
    `[validate-public] OK: ${prompts.prompts.length} prompts, ${programas.programas.length} programas, ${agenda.schedule_commands.length} schedule_commands, ${required.length} archivos`
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
