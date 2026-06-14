#!/usr/bin/env node
// Разовый импорт отобранных фото (/tmp/rated.json) в каталог сайта.
// Сжимает мастер до 2560px (q85, mozjpeg), вырезает метаданные/GPS, ставит дату и рейтинг.
// Тип/теги проставляются отдельно vision-субагентами.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RATED = JSON.parse(fs.readFileSync("/tmp/rated.json", "utf8"));
const ASSETS = "src/assets/photos";
const CONTENT = "src/content/photos";
fs.mkdirSync(ASSETS, { recursive: true });
fs.mkdirSync(CONTENT, { recursive: true });

const taken = new Set(
  fs.readdirSync(CONTENT).filter((f) => f.endsWith(".yaml")).map((f) => f.slice(0, -5)),
);
const slugify = (name) =>
  name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
function uniqueSlug(base) {
  let s = base;
  let i = 2;
  while (!s || taken.has(s)) s = `${base || "photo"}-${i++}`;
  taken.add(s);
  return s;
}

let ok = 0;
const fails = [];
for (const item of RATED) {
  try {
    const slug = uniqueSlug(slugify(path.basename(item.path)));
    await sharp(item.path)
      .rotate()
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(path.join(ASSETS, `${slug}.jpg`));
    const yaml =
      `title: ""\nimage: ${slug}.jpg\ndate: ${item.date}\ntype: other\ntags: []\n` +
      `caption: ""\nfeatured: ${item.rating === 5}\nrating: ${item.rating}\n`;
    fs.writeFileSync(path.join(CONTENT, `${slug}.yaml`), yaml);
    ok++;
  } catch (e) {
    fails.push(`${item.path} — ${e.message}`);
  }
}

console.log(`импортировано: ${ok} из ${RATED.length}`);
if (fails.length) {
  console.log(`ошибок: ${fails.length}`);
  for (const f of fails) console.log("  - " + f);
}
