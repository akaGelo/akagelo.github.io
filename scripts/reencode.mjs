#!/usr/bin/env node
// Перекодирует мастеры из фототеки в нужное разрешение, читая поле `src` каждого YAML.
// Меняет только картинки в src/assets/photos (YAML не трогает). Без зависимости от /tmp.
// Использование: node scripts/reencode.mjs [maxPx]   (по умолчанию 3840)
// Фототека задаётся PHOTO_LIB (по умолчанию ~/Photos).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const LIB = process.env.PHOTO_LIB || path.join(os.homedir(), "Photos");
const CONTENT = "src/content/photos";
const ASSETS = "src/assets/photos";
const MAX = Number(process.argv[2]) || 3840;
const QUALITY = 82;

const field = (y, name) => (y.match(new RegExp(`^${name}:\\s*"?(.+?)"?\\s*$`, "m")) || [])[1];

let ok = 0;
let bytes = 0;
const miss = [];

for (const f of fs.readdirSync(CONTENT).filter((x) => x.endsWith(".yaml"))) {
  const y = fs.readFileSync(`${CONTENT}/${f}`, "utf8");
  const src = field(y, "src");
  const image = field(y, "image");
  if (!src || !image) { miss.push(`${f} (нет src/image)`); continue; }
  const orig = path.join(LIB, src);
  if (!fs.existsSync(orig)) { miss.push(`${f} (нет файла ${src})`); continue; }
  const dest = `${ASSETS}/${image}`;
  await sharp(orig)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(dest);
  bytes += fs.statSync(dest).size;
  ok++;
}

console.log(`перекодировано в ${MAX}px: ${ok}; всего ${(bytes / 1048576).toFixed(1)} МБ`);
if (miss.length) console.log(`пропущено (${miss.length}): ${miss.join(", ")}`);
console.log("дальше: npm run lqip (обновить blur-up) и npm run build");
