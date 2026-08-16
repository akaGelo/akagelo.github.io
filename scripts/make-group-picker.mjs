#!/usr/bin/env node
// Пикер групп Flickr: карточки со свежими фото пула, чтобы глазами отобрать, куда вступать.
// Данные тянутся с Flickr без API-ключа: название — из og:title страницы группы,
// свежесть и превью — из публичного фида пула (groups_pool.gne).
// Использование: node scripts/make-group-picker.mjs <slug|nsid> [...]
//                node scripts/make-group-picker.mjs --file slugs.txt   (по слагу на строку,
//                можно "slug 33.6K 1.1M" — второе и третье поля станут подписью)

import fs from "node:fs";

const OUT = "pickers/flickr-groups.html";
const PREVIEWS = 8;

const args = process.argv.slice(2);
if (!args.length) {
  console.error("нужны слаги групп: node scripts/make-group-picker.mjs realstreet bwsp ...");
  process.exit(1);
}

const lines = args[0] === "--file"
  ? fs.readFileSync(args[1], "utf8").split("\n").map((l) => l.trim()).filter(Boolean)
  : args;

const wanted = lines.map((l) => {
  const [slug, members, photos] = l.split(/\s+/);
  return { slug, members, photos };
});

async function fetchGroup({ slug, members, photos }) {
  const page = await fetch(`https://www.flickr.com/groups/${slug}/`);
  if (!page.ok) return { slug, error: `HTTP ${page.status}` };
  const html = await page.text();
  const nsid = (html.match(/"nsid"\s*:\s*"(\d+@N\d+)"/) || [])[1];
  const name = (html.match(/<meta property="og:title" content="([^"]+)"/) || [])[1] || slug;
  if (!nsid) return { slug, name, error: "nsid не найден" };

  const feedUrl = `https://api.flickr.com/services/feeds/groups_pool.gne?id=${nsid}&format=json&nojsoncallback=1`;
  let items = [];
  try {
    items = JSON.parse(await (await fetch(feedUrl)).text()).items || [];
  } catch {
    /* фид иногда отдаёт мусор — карточка просто будет без превью */
  }

  return {
    slug, name, members, photos,
    latest: items[0]?.published || null,
    thumbs: items.slice(0, PREVIEWS).map((i) => i.media?.m?.replace("_m.jpg", "_q.jpg")).filter(Boolean),
  };
}

const groups = [];
for (const g of wanted) {
  const r = await fetchGroup(g);
  groups.push(r);
  console.log(`${r.error ? "!" : "+"} ${r.slug}${r.error ? " — " + r.error : ""}`);
}

// свежие сверху: группа без движения в пуле бесполезна
groups.sort((a, b) => (b.latest || "").localeCompare(a.latest || ""));

const daysAgo = (iso) => iso ? Math.floor((Date.now() - Date.parse(iso)) / 86400e3) : null;

const cards = groups.map((g) => {
  const d = daysAgo(g.latest);
  const fresh = d === null ? "нет данных" : d === 0 ? "сегодня" : d === 1 ? "вчера" : `${d} дн. назад`;
  const stale = d === null || d > 30;
  const size = [g.members && `${g.members} участников`, g.photos && `${g.photos} фото`].filter(Boolean).join(" · ");
  const err = g.error ? `<div class="meta bad">не удалось прочитать: ${g.error}</div>` : "";
  return `<label class="card${stale ? " stale" : ""}" data-slug="${g.slug}">
  <input type="checkbox" value="${g.slug}">
  <div class="head">
    <b>${g.name.replace(/</g, "&lt;")}</b>
    <a href="https://www.flickr.com/groups/${g.slug}/" target="_blank" rel="noopener">открыть ↗</a>
  </div>
  <div class="meta">${size}${size ? " · " : ""}последнее фото: <span class="${stale ? "bad" : "ok"}">${fresh}</span></div>
  ${err}
  <div class="thumbs">${(g.thumbs || []).map((t) => `<img src="${t}" loading="lazy" alt="">`).join("")}</div>
</label>`;
}).join("\n");

const html = `<!doctype html><meta charset="utf-8"><title>Flickr groups picker</title>
<style>
 body{font:15px/1.45 system-ui,sans-serif;margin:0;padding:16px;background:#fafafa;color:#111}
 header{position:sticky;top:0;background:#fafafa;padding:8px 0 12px;border-bottom:1px solid #ddd;margin-bottom:16px;z-index:2}
 h1{font-size:18px;margin:0 0 8px}
 button{font:inherit;padding:6px 12px;margin-right:8px;cursor:pointer}
 #out{width:100%;height:70px;font:13px/1.4 ui-monospace,monospace;margin-top:8px}
 .grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(340px,1fr))}
 .card{display:block;background:#fff;border:1px solid #ddd;border-radius:8px;padding:10px;cursor:pointer}
 .card:has(:checked){border-color:#0a7;box-shadow:0 0 0 2px #0a74}
 .card.stale{opacity:.55}
 .head{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
 .head a{font-size:12px;color:#06c}
 .meta{font-size:12px;color:#666;margin:4px 0 8px}
 .ok{color:#0a7}.bad{color:#c33}
 .thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
 .thumbs img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:3px;background:#eee}
 input[type=checkbox]{float:right;width:18px;height:18px}
</style>
<header>
 <h1>Группы Flickr — отбор (${groups.length}) <span style="font-weight:400;font-size:13px;color:#666">блёклые = без новых фото больше месяца</span></h1>
 <button id="copy">Скопировать выбранные</button><button id="clear">Сбросить</button>
 <span id="cnt"></span>
 <textarea id="out" readonly placeholder="здесь появятся выбранные слаги"></textarea>
</header>
<div class="grid">
${cards}
</div>
<script>
const KEY = "flickr-groups-v1";
const boxes = [...document.querySelectorAll("input[type=checkbox]")];
const saved = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
const sync = () => {
  const sel = boxes.filter(b => b.checked).map(b => b.value);
  localStorage.setItem(KEY, JSON.stringify(sel));
  out.value = sel.join("\\n");
  cnt.textContent = sel.length + " выбрано";
};
boxes.forEach(b => { b.checked = saved.has(b.value); b.addEventListener("change", sync); });
copy.onclick = () => { out.select(); navigator.clipboard.writeText(out.value); };
clear.onclick = () => { boxes.forEach(b => b.checked = false); sync(); };
sync();
</script>`;

fs.mkdirSync("pickers", { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`\n${OUT} — ${groups.length} групп`);
