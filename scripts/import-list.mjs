#!/usr/bin/env node
// Импорт фото по списку путей (относительно фототеки), напр. из пикера.
// Каждая строка: <папка>/<файл>.jpg. Сжатие 3840 + YAML-заготовка с src и датой из EXIF.
// Уже импортированные (по слагу) пропускаются. Темы потом проставляет Claude.
// Использование: node scripts/import-list.mjs <файл-списка>
// Фототека: PHOTO_LIB (по умолчанию ~/Photos).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import exifr from "exifr";
import sharp from "sharp";

const LIB = process.env.PHOTO_LIB || path.join(os.homedir(), "Photos");
const listFile = process.argv[2];
if (!listFile) { console.error("укажи файл списка: node scripts/import-list.mjs <файл>"); process.exit(1); }

const ASSETS = "src/assets/photos";
const CONTENT = "src/content/photos";
const MAX = 3840;
const QUALITY = 82;
fs.mkdirSync(ASSETS, { recursive: true });
fs.mkdirSync(CONTENT, { recursive: true });

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const slugify = (name) =>
  name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const field = (y, n) => (y.match(new RegExp(`^${n}:\\s*"?(.+?)"?\\s*$`, "m")) || [])[1];

const list = fs.readFileSync(listFile, "utf8").split("\n").map((s) => s.trim()).filter(Boolean);

let added = 0, skipped = 0, bytes = 0;
const missing = [], newSlugs = [];

for (const rel of list) {
  // слаг устойчив к коллизиям: тот же src → skip; занят другим файлом → суффикс
  const base = slugify(path.basename(rel)) || "photo";
  let slug = base, k = 2, dup = false;
  for (;;) {
    const p = `${CONTENT}/${slug}.yaml`;
    if (!fs.existsSync(p)) break;
    if (field(fs.readFileSync(p, "utf8"), "src") === rel) { dup = true; break; }
    slug = `${base}-${k++}`;
  }
  if (dup) { skipped++; continue; }
  const yamlPath = `${CONTENT}/${slug}.yaml`;
  const orig = path.join(LIB, rel);
  if (!fs.existsSync(orig)) { missing.push(rel); continue; }

  let date, rating;
  try {
    const x = await exifr.parse(orig, { xmp: true, ifd0: true, exif: true, mergeOutput: true });
    const dd = x?.DateTimeOriginal || x?.CreateDate;
    if (dd instanceof Date && !isNaN(dd)) date = dd;
    rating = x?.Rating;
  } catch { /* нет/битый EXIF */ }
  if (!(date instanceof Date) || isNaN(date)) date = fs.statSync(orig).mtime;

  await sharp(orig)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(`${ASSETS}/${slug}.jpg`);
  bytes += fs.statSync(`${ASSETS}/${slug}.jpg`).size;

  let yaml = `title: ""\nimage: ${slug}.jpg\nsrc: "${rel}"\ndate: ${ymd(date)}\ntags: []\nfavorite: false\n`;
  if (rating) yaml += `rating: ${rating}\n`;
  fs.writeFileSync(yamlPath, yaml);
  added++;
  newSlugs.push(slug);
}

console.log(`импортировано: ${added}, пропущено (уже есть): ${skipped}; ${(bytes / 1048576).toFixed(1)} МБ`);
if (missing.length) console.log(`нет в фототеке (${missing.length}): ${missing.join(", ")}`);
if (newSlugs.length) {
  fs.writeFileSync("/tmp/new-slugs.json", JSON.stringify(newSlugs));
  console.log(`новые слаги → /tmp/new-slugs.json (${newSlugs.length})`);
}
