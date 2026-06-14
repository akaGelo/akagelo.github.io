#!/usr/bin/env node
// Генерирует самодостаточный HTML-пикер для отбора фото из папки фототеки.
// Миниатюры встроены как base64 → открывается двойным кликом, без сервера.
// Использование: node scripts/make-picker.mjs <папка>     (например: old, 2024)
// Фототека: PHOTO_LIB (по умолчанию ~/Photos).

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const LIB = process.env.PHOTO_LIB || path.join(os.homedir(), "Photos");
const folder = process.argv[2];
if (!folder) { console.error("укажи папку: node scripts/make-picker.mjs <папка>"); process.exit(1); }

const dir = path.join(LIB, folder);
if (!fs.existsSync(dir)) { console.error("нет папки:", dir); process.exit(1); }

fs.mkdirSync("pickers", { recursive: true });
const files = fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).sort();
console.log(`${folder}: ${files.length} фото, генерирую миниатюры…`);

const data = [];
let i = 0;
for (const f of files) {
  const buf = await sharp(path.join(dir, f))
    .rotate()
    .resize({ width: 360, height: 360, fit: "inside" })
    .webp({ quality: 46 })
    .toBuffer();
  data.push({ n: f, t: `data:image/webp;base64,${buf.toString("base64")}` });
  if (++i % 50 === 0) console.log(`  ${i}/${files.length}`);
}

const DIR = `file://${dir}/`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Picker — ${folder}</title>
<style>
:root{--bg:#101012;--fg:#ececec;--mut:#8a8a90;--sel:#e6b13a}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.4 system-ui,-apple-system,sans-serif}
header{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:13px 20px;background:rgba(16,16,18,.93);backdrop-filter:blur(8px);border-bottom:1px solid #222}
h1{margin:0;font-size:17px;font-weight:600}h1 .sub{color:var(--mut);font-weight:400;font-size:13px;margin-left:8px}
.actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
#count{color:var(--mut);margin-right:4px;font-variant-numeric:tabular-nums}
button{font:inherit;cursor:pointer;border:1px solid #333;background:#1b1b1e;color:var(--fg);padding:7px 12px;border-radius:8px}
button:hover{border-color:#666}button.primary{background:var(--sel);color:#101012;border-color:var(--sel);font-weight:600}
#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;padding:16px 20px 90px}
.tile{position:relative;border-radius:10px;overflow:hidden;cursor:pointer;background:#000;aspect-ratio:1;border:2px solid transparent}
.tile img{width:100%;height:100%;object-fit:cover;display:block;opacity:.9;transition:opacity .15s}
.tile:hover img{opacity:1}.tile.sel{border-color:var(--sel)}
.tile .chk{position:absolute;top:7px;left:7px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.5);border:1.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:13px;opacity:0;transition:.15s}
.tile.sel .chk{opacity:1;background:var(--sel);border-color:var(--sel);color:#101012}
.tile .nm{position:absolute;left:0;right:0;bottom:0;padding:16px 8px 5px;font-size:11px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.8));opacity:0;transition:.15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tile:hover .nm{opacity:1}
.tile .open{position:absolute;top:6px;right:6px;width:24px;height:24px;border-radius:6px;background:rgba(0,0,0,.55);color:#fff;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:13px;opacity:0}
.tile:hover .open{opacity:1}.tile .open:hover{background:rgba(0,0,0,.85)}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--sel);color:#101012;padding:10px 16px;border-radius:8px;font-weight:600;opacity:0;transition:.2s;pointer-events:none}
.toast.show{opacity:1}
.hint{color:var(--mut);font-size:12px;padding:0 20px 8px}
</style></head><body>
<header>
  <h1>${folder}<span class="sub">${files.length} photos</span></h1>
  <div class="actions">
    <span id="count">0 selected</span>
    <button id="all">Select all</button>
    <button id="none">Clear</button>
    <button id="copy" class="primary">Copy selected</button>
    <button id="dl">Download .txt</button>
  </div>
</header>
<div class="hint">Клик по фото — выбрать/снять · «↗» — открыть оригинал · выбор сохраняется в браузере</div>
<main id="grid"></main>
<div class="toast" id="toast"></div>
<script>
var DATA=${JSON.stringify(data)};
var FOLDER=${JSON.stringify(folder)};
var DIR=${JSON.stringify(DIR)};
var KEY="picker:"+FOLDER;
var sel=new Set(JSON.parse(localStorage.getItem(KEY)||"[]"));
var grid=document.getElementById("grid");
function updateCount(){document.getElementById("count").textContent=sel.size+" / "+DATA.length+" selected"}
function save(){localStorage.setItem(KEY,JSON.stringify(Array.from(sel)))}
function render(){
  var h="";
  for(var i=0;i<DATA.length;i++){var d=DATA[i];
    h+='<div class="tile'+(sel.has(d.n)?" sel":"")+'" data-n="'+d.n+'">'
      +'<img loading="lazy" src="'+d.t+'">'
      +'<span class="chk">✓</span>'
      +'<a class="open" href="'+DIR+encodeURIComponent(d.n)+'" target="_blank" rel="noopener" title="open original">↗</a>'
      +'<span class="nm">'+d.n+'</span></div>';
  }
  grid.innerHTML=h;updateCount();
}
grid.addEventListener("click",function(e){
  if(e.target.closest(".open"))return;
  var tile=e.target.closest(".tile");if(!tile)return;
  var n=tile.getAttribute("data-n");
  if(sel.has(n)){sel.delete(n);tile.classList.remove("sel")}else{sel.add(n);tile.classList.add("sel")}
  save();updateCount();
});
document.getElementById("all").onclick=function(){DATA.forEach(function(d){sel.add(d.n)});save();render()};
document.getElementById("none").onclick=function(){sel.clear();save();render()};
function selectedList(){return DATA.filter(function(d){return sel.has(d.n)}).map(function(d){return FOLDER+"/"+d.n}).join("\\n")}
function toast(m){var t=document.getElementById("toast");t.textContent=m;t.classList.add("show");setTimeout(function(){t.classList.remove("show")},1600)}
document.getElementById("copy").onclick=function(){
  var txt=selectedList();if(!txt){toast("ничего не выбрано");return}
  navigator.clipboard.writeText(txt).then(function(){toast(sel.size+" путей скопировано")},function(){toast("не вышло скопировать")});
};
document.getElementById("dl").onclick=function(){
  var blob=new Blob([selectedList()],{type:"text/plain"});var a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=FOLDER+"-selected.txt";a.click();
};
render();
</script></body></html>`;

const out = `pickers/${folder}.html`;
fs.writeFileSync(out, html);
console.log(`готово: ${out}  (${(fs.statSync(out).size / 1048576).toFixed(1)} МБ)`);
console.log(`открой: file://${path.resolve(out)}`);
