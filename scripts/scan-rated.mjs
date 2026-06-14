#!/usr/bin/env node
// Разовый скан фототеки: собирает фото с EXIF-рейтингом > 3 (путь, рейтинг, дата).
// Результат → /tmp/rated.json для последующего импорта.

import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";

const ROOT = process.argv[2] || "/home/gelo/Photos";
const OUT = "/tmp/rated.json";

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.jpe?g$/i.test(e.name)) yield p;
  }
}

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

let scanned = 0;
const out = [];
for (const f of walk(ROOT)) {
  scanned++;
  let rating = 0;
  let date = null;
  try {
    const x = await exifr.parse(f, { xmp: true, ifd0: true, exif: true, mergeOutput: true });
    rating = x?.Rating ?? 0;
    const d = x?.DateTimeOriginal || x?.CreateDate;
    if (d instanceof Date && !isNaN(d)) date = ymd(d);
  } catch {
    /* битый/нет EXIF */
  }
  if (!date) date = ymd(fs.statSync(f).mtime);
  if (rating > 3) out.push({ path: f, rating, date, folder: path.basename(path.dirname(f)) });
}

out.sort((a, b) => b.rating - a.rating || (a.date < b.date ? 1 : -1));
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(
  `просканировано: ${scanned}; rating>3: ${out.length} (5★: ${out.filter((x) => x.rating === 5).length}, 4★: ${out.filter((x) => x.rating === 4).length}) → ${OUT}`,
);
