#!/usr/bin/env node
// Ингест фото из inbox/ в каталог сайта.
// Делает механику: EXIF-дата, копирование оригинала, YAML-заготовка.
// Осмысленные теги/тип/подпись потом проставляются в Claude Code.

import fs from "node:fs";
import path from "node:path";
import exifr from "exifr";

const ROOT = process.cwd();
const INBOX = path.join(ROOT, "inbox");
const DONE = path.join(INBOX, "_done");
const ASSETS = path.join(ROOT, "src/assets/photos");
const CONTENT = path.join(ROOT, "src/content/photos");

const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp"]);

for (const dir of [INBOX, DONE, ASSETS, CONTENT]) fs.mkdirSync(dir, { recursive: true });

const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function slugify(name) {
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base;
}

const taken = new Set(
  fs.readdirSync(CONTENT).filter((f) => f.endsWith(".yaml")).map((f) => f.slice(0, -5)),
);
function uniqueSlug(base) {
  let s = base;
  let i = 2;
  while (!s || taken.has(s)) s = `${base || "photo"}-${i++}`;
  taken.add(s);
  return s;
}

const files = fs
  .readdirSync(INBOX, { withFileTypes: true })
  .filter((e) => e.isFile() && !e.name.startsWith("."))
  .map((e) => e.name);

if (files.length === 0) {
  console.log("inbox пуст — кидай фото в ./inbox и запусти снова: npm run ingest");
  process.exit(0);
}

const added = [];
const skipped = [];
const withGps = [];

for (const name of files) {
  const ext = path.extname(name).toLowerCase();
  const src = path.join(INBOX, name);

  if (!SUPPORTED.has(ext)) {
    skipped.push(`${name} — формат ${ext || "?"} не поддержан (нужен jpg/png/webp)`);
    continue;
  }

  // Дата: EXIF DateTimeOriginal → CreateDate → mtime файла.
  let date;
  try {
    const exif = await exifr.parse(src, ["DateTimeOriginal", "CreateDate"]);
    date = exif?.DateTimeOriginal || exif?.CreateDate;
    const gps = await exifr.gps(src).catch(() => null);
    if (gps && (gps.latitude || gps.longitude)) withGps.push(name);
  } catch {
    /* нет/битый EXIF — упадём на mtime */
  }
  if (!(date instanceof Date) || isNaN(date)) date = fs.statSync(src).mtime;

  const slug = uniqueSlug(slugify(name) || ymd(date).replace(/-/g, ""));
  const outExt = ext === ".jpeg" ? ".jpg" : ext;
  const imageName = `${slug}${outExt}`;

  // Оригинал кладём как есть.
  fs.copyFileSync(src, path.join(ASSETS, imageName));

  const yaml =
    `title: ""\n` +
    `image: ${imageName}\n` +
    `date: ${ymd(date)}\n` +
    `type: other\n` +
    `tags: []\n` +
    `caption: ""\n` +
    `featured: false\n`;
  fs.writeFileSync(path.join(CONTENT, `${slug}.yaml`), yaml);

  // Переносим обработанный файл из inbox.
  let dest = path.join(DONE, name);
  if (fs.existsSync(dest)) dest = path.join(DONE, `${slug}${outExt}`);
  fs.renameSync(src, dest);

  added.push({ slug, date: ymd(date), imageName });
}

console.log(`\nДобавлено: ${added.length}`);
for (const a of added) console.log(`  + ${a.imageName}  дата=${a.date}  (нужны тип/теги/подпись)`);
if (skipped.length) {
  console.log(`\nПропущено: ${skipped.length}`);
  for (const s of skipped) console.log(`  - ${s}`);
}
if (withGps.length) {
  console.log(`\n⚠ В EXIF этих файлов есть GPS (репозиторий публичный): ${withGps.join(", ")}`);
}
if (added.length) {
  console.log(`\nДальше: скажи в Claude Code «каталогизируй новые фото» — проставлю тип/теги/подпись.`);
}
