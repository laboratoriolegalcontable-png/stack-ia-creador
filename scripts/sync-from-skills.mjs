#!/usr/bin/env node
// sync-from-skills.mjs
// Lee REFERENCE.md y programas.json del skill stack-ia-creador (user-level)
// y los copia/genera dentro de public/ del deploy. Loggea diferencias.
//
// Uso: node scripts/sync-from-skills.mjs

import { readFile, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const PUBLIC = join(REPO_ROOT, "public");
const SKILL_ROOT = join(homedir(), ".claude", "skills", "stack-ia-creador");

const SOURCES = {
  reference: join(SKILL_ROOT, "REFERENCE.md"),
  programas: join(SKILL_ROOT, "programas.json"),
  buildScript: join(SKILL_ROOT, "build-prompts.mjs"),
};

async function main() {
  console.log("[sync] Leyendo skill en", SKILL_ROOT);

  // Validar fuentes
  for (const [name, path] of Object.entries(SOURCES)) {
    if (!existsSync(path)) {
      console.error(`[sync] ERROR: no se encontro ${name} en ${path}`);
      process.exit(1);
    }
  }

  // 1. Correr build-prompts.mjs apuntando a public/prompts.json del deploy
  const promptsOutput = join(PUBLIC, "prompts.json");
  const result = spawnSync(
    "node",
    [SOURCES.buildScript, promptsOutput],
    { stdio: "inherit" }
  );
  if (result.status !== 0) {
    console.error("[sync] ERROR: build-prompts.mjs fallo");
    process.exit(1);
  }

  // 2. Copiar programas.json directo
  await copyFile(SOURCES.programas, join(PUBLIC, "programas.json"));
  console.log("[sync] programas.json copiado");

  // 3. Mostrar resumen
  const promptsData = JSON.parse(await readFile(promptsOutput, "utf-8"));
  const programasData = JSON.parse(await readFile(join(PUBLIC, "programas.json"), "utf-8"));
  console.log(`[sync] OK: ${promptsData.count} prompts, ${programasData.programas.length} programas`);
  console.log(`[sync] Para subir cambios: cd ${REPO_ROOT} && git add -A && git commit -m 'sync prompts' && git push`);
}

main().catch((err) => { console.error(err); process.exit(1); });
