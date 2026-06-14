#!/usr/bin/env node
// Применяет результаты vision-тегирования (/tmp/tags.json) к YAML-записям.
// Нормализует: регистр, синонимы, удаляет мусорные теги, дедуп.

import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("/tmp/tags.json", "utf8"));
const CONTENT = "src/content/photos";

// Синонимы → канон.
const SYN = {
  "пасмурь": "пасмурно",
  "облачность": "пасмурно",
  "помещение": "интерьер",
};
// Явный мусор (текст с плакатов и т.п.).
const JUNK = new Set(["seo", "интернет-маркетинг"]);

function norm(tags) {
  const out = [];
  for (let t of tags) {
    t = t.trim().toLowerCase();
    if (!t || JUNK.has(t)) continue;
    t = SYN[t] || t;
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

const freq = new Map();
const types = new Map();
let applied = 0;

for (const { slug, type, tags } of data) {
  const file = `${CONTENT}/${slug}.yaml`;
  if (!fs.existsSync(file)) {
    console.log("нет файла:", slug);
    continue;
  }
  const nt = norm(tags);
  let y = fs.readFileSync(file, "utf8");
  y = y.replace(/^type:.*$/m, `type: ${type}`);
  const tagsYaml = nt.length ? "tags:\n" + nt.map((t) => `  - ${t}`).join("\n") : "tags: []";
  y = y.replace(/^tags:.*$/m, tagsYaml);
  fs.writeFileSync(file, y);
  applied++;
  types.set(type, (types.get(type) ?? 0) + 1);
  for (const t of nt) freq.set(t, (freq.get(t) ?? 0) + 1);
}

console.log(`\nприменено: ${applied}`);
console.log("\nтипы:");
for (const [t, n] of [...types.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${n}  ${t}`);
console.log(`\nсловарь тегов (${freq.size} уникальных):`);
for (const [t, n] of [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
  console.log(`  ${String(n).padStart(2)}  ${t}`);
