#!/usr/bin/env node
// Импорт отобранных фото (scan-rated → /tmp/rated.json) в каталог сайта:
// сжатие до 3840px, копия в src/assets/photos, YAML-заготовка с датой, src и пустыми темами.
// Уже импортированные (по слагу) пропускаются. Темы потом проставляет Claude Code.
// Фототека: PHOTO_LIB (по умолчанию ~/Photos).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const LIB = process.env.PHOTO_LIB || path.join(os.homedir(), "Photos");
const RATED = JSON.parse(fs.readFileSync("/tmp/rated.json", "utf8"));
const ASSETS = "src/assets/photos";
const CONTENT = "src/content/photos";
const MAX = 3840;
const QUALITY = 82;

fs.mkdirSync(ASSETS, { recursive: true });
fs.mkdirSync(CONTENT, { recursive: true });

const slugify = (name) =>
  name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

let added = 0;
let skipped = 0;
let bytes = 0;

for (const item of RATED) {
  const slug = slugify(path.basename(item.path)) || "photo";
  const yamlPath = `${CONTENT}/${slug}.yaml`;
  if (fs.existsSync(yamlPath)) { skipped++; continue; } // уже в каталоге

  const dest = `${ASSETS}/${slug}.jpg`;
  await sharp(item.path)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(dest);
  bytes += fs.statSync(dest).size;

  const rel = path.relative(LIB, item.path);
  const yaml =
    `title: ""\nimage: ${slug}.jpg\nsrc: "${rel}"\ndate: ${item.date}\n` +
    `tags: []\nfavorite: false\nrating: ${item.rating}\n`;
  fs.writeFileSync(yamlPath, yaml);
  added++;
}

console.log(`импортировано: ${added}, пропущено (уже есть): ${skipped}; ${(bytes / 1048576).toFixed(1)} МБ`);
if (added) console.log("дальше: попроси Claude «каталогизируй новые фото», затем npm run lqip и npm run build");
