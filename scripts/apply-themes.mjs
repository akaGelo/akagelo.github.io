#!/usr/bin/env node
// Записывает кураторские темы (/tmp/themes.json) в YAML как tags.
// Чёрно-белость определяет сам (sharp), добавляет тему 'b&w'. Помечает примеры favorite.

import fs from "node:fs";
import sharp from "sharp";

const data = JSON.parse(fs.readFileSync("/tmp/themes.json", "utf8"));
const CONTENT = "src/content/photos";
const ASSETS = "src/assets/photos";

// Пара примеров «избранного» — остальное пользователь разметит сам.
const FAVORITES = new Set(["dsc00602", "dsc09912", "dsc06660"]);

const ORDER = ["street", "portrait", "landscape", "nature", "animals", "architecture", "travel", "b&w"];

async function isBW(file) {
  const { data: buf } = await sharp(file)
    .resize(40, 40, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0, n = 0;
  for (let i = 0; i + 2 < buf.length; i += 3) {
    sum += Math.max(buf[i], buf[i + 1], buf[i + 2]) - Math.min(buf[i], buf[i + 1], buf[i + 2]);
    n++;
  }
  return sum / n < 10; // средний разброс каналов почти ноль → монохром
}

const dist = new Map();
let bw = 0;

for (const { slug, themes } of data) {
  const file = `${CONTENT}/${slug}.yaml`;
  if (!fs.existsSync(file)) {
    console.log("нет файла:", slug);
    continue;
  }
  const set = [];
  for (const t of themes) if (ORDER.includes(t) && !set.includes(t)) set.push(t);
  if (await isBW(`${ASSETS}/${slug}.jpg`)) {
    if (!set.includes("b&w")) set.push("b&w");
    bw++;
  }
  set.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  for (const t of set) dist.set(t, (dist.get(t) ?? 0) + 1);

  const fav = FAVORITES.has(slug);
  let y = fs.readFileSync(file, "utf8");
  const tagsYaml = "tags:\n" + set.map((t) => `  - ${t}`).join("\n") + "\n";
  y = y.replace(/^tags:[\s\S]*?(?=^caption:)/m, tagsYaml);
  if (/^favorite:/m.test(y)) y = y.replace(/^favorite:.*$/m, `favorite: ${fav}`);
  else y = y.replace(/^(featured:.*)$/m, `$1\nfavorite: ${fav}`);
  fs.writeFileSync(file, y);
}

console.log(`\nготово. b&w определено: ${bw}`);
console.log("распределение тем:");
for (const t of ORDER) if (dist.get(t)) console.log(`  ${String(dist.get(t)).padStart(2)}  ${t}`);
