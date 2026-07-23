#!/usr/bin/env node
// Применяет результат vision-тегирования к YAML (tags), добавляет b&w детектом.
// Использование: node scripts/apply-themes.mjs <result.json>
// Файл — либо массив [{slug,themes}], либо объект воркфлоу {result:[...]}.

import fs from "node:fs";
import sharp from "sharp";

const file = process.argv[2];
if (!file) { console.error("укажи файл результата"); process.exit(1); }
const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
const data = Array.isArray(parsed) ? parsed : parsed.result;

const CONTENT = "src/content/photos";
const ASSETS = "src/assets/photos";
const ORDER = ["street", "portrait", "landscape", "animals", "architecture", "night", "b&w"];

async function isBW(f) {
  const { data: b } = await sharp(f).resize(40, 40, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let s = 0, n = 0;
  for (let i = 0; i + 2 < b.length; i += 3) { s += Math.max(b[i], b[i + 1], b[i + 2]) - Math.min(b[i], b[i + 1], b[i + 2]); n++; }
  return s / n < 10;
}

let applied = 0, bw = 0;
const dist = new Map();
for (const r of data) {
  const f = `${CONTENT}/${r.slug}.yaml`;
  if (!fs.existsSync(f)) { console.log("нет файла:", r.slug); continue; }
  const set = [...new Set((r.themes || []).filter((t) => ORDER.includes(t)))];
  if (await isBW(`${ASSETS}/${r.slug}.jpg`)) { if (!set.includes("b&w")) set.push("b&w"); bw++; }
  set.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  for (const t of set) dist.set(t, (dist.get(t) || 0) + 1);
  let y = fs.readFileSync(f, "utf8");
  // заменяем весь блок tags (пустой или с тегами) до строки favorite:
  y = y.replace(/^tags:[\s\S]*?(?=^favorite:)/m, "tags:\n" + set.map((t) => "  - " + t).join("\n") + "\n");
  fs.writeFileSync(f, y);
  applied++;
}

console.log(`применено: ${applied}, b&w: ${bw}`);
for (const t of ORDER) if (dist.get(t)) console.log(`  ${String(dist.get(t)).padStart(3)}  ${t}`);
