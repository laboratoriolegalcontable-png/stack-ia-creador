#!/usr/bin/env node
// validate-skills.mjs - chequea que cada .claude/skills/<nombre>/SKILL.md
// exista, se llame exactamente SKILL.md (no <nombre>.md) y tenga frontmatter
// YAML valido con "name" y "description". Se corre en cada push/PR.

import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "..", ".claude", "skills");

const errors = [];

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

async function main() {
  let entries;
  try {
    entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  } catch {
    console.log("[validate-skills] no existe .claude/skills/, nada que validar.");
    return;
  }

  const dirs = entries.filter((e) => e.isDirectory());

  for (const dir of dirs) {
    const skillPath = join(SKILLS_DIR, dir.name);
    const skillMdPath = join(skillPath, "SKILL.md");

    const files = await readdir(skillPath);
    const wrongCase = files.find(
      (f) => f.toLowerCase() === "skill.md" && f !== "SKILL.md"
    );
    if (wrongCase) {
      errors.push(
        `${dir.name}: el archivo se llama "${wrongCase}", debe ser exactamente "SKILL.md"`
      );
      continue;
    }

    const looksLikeSkillButMisnamed =
      !files.includes("SKILL.md") && files.includes(`${dir.name}.md`);
    if (looksLikeSkillButMisnamed) {
      errors.push(
        `${dir.name}: tiene "${dir.name}.md" en vez de "SKILL.md" (no va a cargar)`
      );
      continue;
    }

    try {
      await stat(skillMdPath);
    } catch {
      errors.push(`${dir.name}: falta SKILL.md`);
      continue;
    }

    const content = await readFile(skillMdPath, "utf-8");
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      errors.push(`${dir.name}/SKILL.md: sin frontmatter YAML (--- ... ---)`);
      continue;
    }
    if (!frontmatter.name) {
      errors.push(`${dir.name}/SKILL.md: frontmatter sin campo "name"`);
    }
    if (!frontmatter.description) {
      errors.push(`${dir.name}/SKILL.md: frontmatter sin campo "description"`);
    }
  }

  if (errors.length > 0) {
    console.error(`[validate-skills] ${errors.length} problema(s):\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`[validate-skills] OK — ${dirs.length} skills validadas.`);
}

main();
