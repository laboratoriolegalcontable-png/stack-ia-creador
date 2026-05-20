#!/usr/bin/env node
/**
 * audit-supply-chain.mjs
 * Auditoría de seguridad contra ataques de cadena de suministro tipo Shai Hulud.
 * Verifica: dependencias externas, hooks, CI/CD, git hooks, service worker.
 * Uso: node scripts/audit-supply-chain.mjs
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

let passed = 0;
let warnings = 0;
let failures = 0;

function ok(msg)   { console.log(`  ✓  ${msg}`); passed++; }
function warn(msg) { console.log(`  ⚠  ${msg}`); warnings++; }
function fail(msg) { console.log(`  ✗  ${msg}`); failures++; }

async function checkDependencies() {
  console.log("\n[1] Dependencias externas npm/PyPI");

  const pkgPath = join(ROOT, "package.json");
  if (!existsSync(pkgPath)) { warn("package.json no encontrado"); return; }

  const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies,
  };

  const count = Object.keys(deps).length;
  if (count === 0) {
    ok("Sin dependencias externas — superficie de ataque supply-chain = 0");
  } else {
    warn(`${count} dependencias encontradas — verificar manualmente contra https://socket.dev`);
    for (const [name, ver] of Object.entries(deps)) {
      console.log(`       • ${name}@${ver}`);
    }
  }

  // Verificar lockfile para integridad
  const lockfiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"];
  const foundLock = lockfiles.find((f) => existsSync(join(ROOT, f)));
  if (count > 0 && !foundLock) {
    fail("Hay dependencias pero NO hay lockfile — los hashes de integridad no están fijados");
  } else if (count > 0 && foundLock) {
    ok(`Lockfile presente: ${foundLock}`);
  }

  const reqTxt = join(ROOT, "requirements.txt");
  if (existsSync(reqTxt)) {
    warn("requirements.txt encontrado — verificar paquetes PyPI manualmente");
  } else {
    ok("Sin requirements.txt — no hay superficie PyPI");
  }
}

async function checkGitHooks() {
  console.log("\n[2] Git hooks (.git/hooks/)");

  const hooksDir = join(ROOT, ".git", "hooks");
  if (!existsSync(hooksDir)) { warn("Directorio .git/hooks no encontrado"); return; }

  const files = await readdir(hooksDir);
  const active = files.filter((f) => !f.endsWith(".sample"));

  if (active.length === 0) {
    ok("Sin git hooks activos (solo .sample — seguros)");
  } else {
    for (const hook of active) {
      const content = await readFile(join(hooksDir, hook), "utf-8");
      const suspicious = detectSuspicious(content);
      if (suspicious.length > 0) {
        fail(`Git hook activo SOSPECHOSO: ${hook} → ${suspicious.join(", ")}`);
      } else {
        warn(`Git hook activo: ${hook} — revisar manualmente`);
      }
    }
  }
}

async function checkCICD() {
  console.log("\n[3] Workflows CI/CD (.github/workflows/)");

  const workflowsDir = join(ROOT, ".github", "workflows");
  if (!existsSync(workflowsDir)) {
    ok("Sin directorio .github/workflows — no hay CI/CD workflows");
    return;
  }

  const files = await readdir(workflowsDir);
  if (files.length === 0) { ok("Directorio workflows vacío"); return; }

  // Shai Hulud usa discussion.yaml como mecanismo de persistencia
  const dangerous = ["discussion.yaml", "discussion.yml"];
  for (const f of files) {
    if (dangerous.includes(f.toLowerCase())) {
      fail(`CRÍTICO: workflow sospechoso encontrado: ${f} (vector de persistencia de Shai Hulud)`);
    } else {
      const content = await readFile(join(workflowsDir, f), "utf-8");
      const suspicious = detectSuspicious(content);
      if (suspicious.length > 0) {
        warn(`Workflow ${f} contiene patrones sospechosos: ${suspicious.join(", ")}`);
      } else {
        ok(`Workflow limpio: ${f}`);
      }
    }
  }
}

async function checkClaudeHooks() {
  console.log("\n[4] Claude Code hooks (.claude/hooks/)");

  const hooksDir = join(ROOT, ".claude", "hooks");
  if (!existsSync(hooksDir)) { ok("Sin directorio .claude/hooks"); return; }

  const files = await readdir(hooksDir);
  if (files.length === 0) { ok("Sin hooks de Claude Code"); return; }

  for (const f of files) {
    const content = await readFile(join(hooksDir, f), "utf-8");
    const suspicious = detectSuspicious(content);
    if (suspicious.length > 0) {
      fail(`Hook de Claude Code SOSPECHOSO: ${f} → ${suspicious.join(", ")}`);
    } else {
      ok(`Hook limpio: ${f}`);
    }
  }

  // Verificar settings.json para hooks no esperados
  const settingsPath = join(ROOT, ".claude", "settings.json");
  if (existsSync(settingsPath)) {
    const settings = JSON.parse(await readFile(settingsPath, "utf-8"));
    const hooks = settings.hooks || {};
    const allHooks = Object.values(hooks).flat();
    ok(`settings.json: ${allHooks.length} hook(s) configurado(s)`);
  }
}

async function checkServiceWorker() {
  console.log("\n[5] Service Worker");

  const swPath = join(ROOT, "public", "sw.js");
  if (!existsSync(swPath)) { ok("Sin service worker"); return; }

  const content = await readFile(swPath, "utf-8");

  // Verificar que no hace fetch a dominios externos
  const externalFetch = content.match(/fetch\(['"`]https?:\/\//g);
  if (externalFetch) {
    fail(`Service worker hace fetch a URL externa hardcoded: ${externalFetch.join(", ")}`);
  } else {
    ok("Service worker no contiene URLs externas hardcoded");
  }

  // Verificar que bloquea cross-origin
  if (content.includes("url.origin !== location.origin")) {
    ok("Service worker bloquea requests cross-origin correctamente");
  } else {
    warn("Service worker podría no estar bloqueando requests cross-origin");
  }
}

async function checkEnvSecrets() {
  console.log("\n[6] Archivos de secretos expuestos");

  const sensitivePatterns = [".env", ".env.local", ".env.production", "credentials.json", "*.pem", "*.key"];
  const files = await readdir(ROOT);

  let found = false;
  for (const f of files) {
    if (f.startsWith(".env") || f.endsWith(".pem") || f.endsWith(".key") || f === "credentials.json") {
      const gitignorePath = join(ROOT, ".gitignore");
      const gitignore = existsSync(gitignorePath) ? await readFile(gitignorePath, "utf-8") : "";
      if (!gitignore.includes(f) && !gitignore.includes(".env")) {
        fail(`Archivo sensible NO está en .gitignore: ${f}`);
      } else {
        warn(`Archivo sensible encontrado pero está en .gitignore: ${f}`);
      }
      found = true;
    }
  }
  if (!found) ok("Sin archivos de secretos expuestos en la raíz");

  // Verificar .gitignore incluye .env
  const gitignorePath = join(ROOT, ".gitignore");
  if (existsSync(gitignorePath)) {
    const gi = await readFile(gitignorePath, "utf-8");
    if (gi.includes(".env")) ok(".gitignore incluye .env");
    else warn(".gitignore no incluye .env — agregar manualmente");
  }
}

function detectSuspicious(content) {
  const patterns = [
    { re: /curl\s+.*\|.*sh/i,       label: "curl pipe shell" },
    { re: /wget\s+.*\|.*sh/i,       label: "wget pipe shell" },
    { re: /base64\s+--decode/i,     label: "base64 decode exec" },
    { re: /eval\s*\(/,              label: "eval()" },
    { re: /rm\s+-rf\s+\//,         label: "rm -rf /" },
    { re: /exfil|webhook\.site|ngrok|requestbin/i, label: "exfiltración conocida" },
    { re: /session\.network/i,      label: "Session Network (Shai Hulud C2)" },
    { re: /preinstall.*&&/,         label: "preinstall con comandos encadenados" },
    { re: /process\.env\b.*\bfetch/i, label: "env vars enviadas via fetch" },
  ];

  return patterns.filter((p) => p.re.test(content)).map((p) => p.label);
}

async function main() {
  console.log("=".repeat(60));
  console.log("  AUDITORÍA SUPPLY CHAIN — Shai Hulud / TeamPCP");
  console.log("  Proyecto:", ROOT);
  console.log("=".repeat(60));

  await checkDependencies();
  await checkGitHooks();
  await checkCICD();
  await checkClaudeHooks();
  await checkServiceWorker();
  await checkEnvSecrets();

  console.log("\n" + "=".repeat(60));
  console.log(`  RESULTADO: ${passed} OK  |  ${warnings} advertencias  |  ${failures} fallas`);
  console.log("=".repeat(60));

  if (failures > 0) {
    console.log("\n  ACCIÓN REQUERIDA: revisar las fallas antes de hacer deploy.");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("\n  Revisar advertencias. El proyecto parece seguro en lo crítico.");
  } else {
    console.log("\n  El proyecto está limpio. Sin indicadores de compromiso.");
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
