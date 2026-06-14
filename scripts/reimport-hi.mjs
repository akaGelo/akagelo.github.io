#!/usr/bin/env node
// Перекодирует мастеры в высокое разрешение (для 4K) ПО АВТОРИТЕТНОМУ /tmp/rated.json
// (точные пути оригиналов + тот же порядок слагов, что и при импорте) и пишет в YAML
// поле src (путь относительно фототеки). Темы/избранное/дата не трогаются.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const LIB = process.env.PHOTO_LIB || "/home/gelo/Photos";
const RATED = JSON.parse(fs.readFileSync("/tmp/rated.json", "utf8"));
const ASSETS = "src/assets/photos";
const CONTENT = "src/content/photos";
const MAX = 3840;
const QUALITY = 82;

const slugify = (name) =>
  name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const taken = new Set();
function uniqueSlug(base) {
  let s = base;
  let i = 2;
  while (!s || taken.has(s)) s = `${base || "photo"}-${i++}`;
  taken.add(s);
  return s;
}

let ok = 0;
let bytes = 0;
const miss = [];

for (const item of RATED) {
  const slug = uniqueSlug(slugify(path.basename(item.path)));
  const f = `${CONTENT}/${slug}.yaml`;
  if (!fs.existsSync(f)) { miss.push(slug); continue; }
  const dest = `${ASSETS}/${slug}.jpg`;
  await sharp(item.path)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(dest);
  bytes += fs.statSync(dest).size;

  const rel = path.relative(LIB, item.path);
  let y = fs.readFileSync(f, "utf8");
  if (/^src:/m.test(y)) y = y.replace(/^src:.*$/m, `src: "${rel}"`);
  else y = y.replace(/^(image:.*)$/m, `$1\nsrc: "${rel}"`);
  fs.writeFileSync(f, y);
  ok++;
}

console.log(`перекодировано в ${MAX}px: ${ok}; средний ${(bytes / ok / 1024).toFixed(0)} КБ; всего ${(bytes / 1048576).toFixed(1)} МБ`);
if (miss.length) console.log(`нет YAML для слагов: ${miss.join(", ")}`);
