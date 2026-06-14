# CLAUDE.md — гайд для AI-агента

Личный фотосайт Олега Вьюкова (`vyukov.ru`). Astro static → GitHub Pages. Английский, светлая тема.
Человеческий гайд — в `README.md`. Здесь — модель данных, процесс и грабли.

## Архитектура

- **Источник истины** — фототека пользователя `~/Photos` (локально, ~13 ГБ, НЕ в репо).
- **В репозитории** — сжатые мастеры 3840px (`src/assets/photos/<slug>.jpg`) + метаданные
  (`src/content/photos/<slug>.yaml`). Сборка идёт в CI (нет доступа к `~/Photos`), поэтому всё нужное
  лежит в репо. Локальные пути нигде в сайте не используются — только в скриптах импорта.
- `astro:assets` генерит адаптивные WebP: сетка ~320–960px, фуллскрин 2560 и 3840.

## Модель данных (YAML)

```yaml
title: ""                  # необязательно
image: dsc00602.jpg        # имя файла в src/assets/photos
src: "2024/DSC00602.jpg"   # путь относительно ~/Photos — провенанс для reencode
date: 2024-08-09           # из EXIF/XMP (DateTimeOriginal/CreateDate)
tags: [landscape, b&w]     # ТЕМЫ из фиксированного набора
favorite: false            # флаг фильтра ★ Favorites
rating: 5                  # из XMP-рейтинга, опционально
```
Поля `type/caption/featured` удалены (легаси) — не возвращать.

**Темы (ровно эти 8):** `street, portrait, landscape, nature, animals, architecture, travel, b&w`.
Порядок и подписи — в `THEME_ORDER`/`THEME_LABELS` в `src/pages/index.astro`.

## Как каталогизировать новые фото (роль Claude)

После `npm run import` / `npm run ingest` у новых записей `tags: []`. Нужно:
1. Посмотреть каждый новый снимок (Read по `src/assets/photos/<slug>.jpg`).
2. Назначить 1–3 темы из набора (жанр + сюжет), нижний регистр.
3. **b&w определять детектом монохромности (надёжнее глаза):**
   ```js
   const { data } = await sharp(file).resize(40,40,{fit:"inside"}).removeAlpha().raw().toBuffer({resolveWithObject:true});
   let s=0,n=0; for(let i=0;i+2<data.length;i+=3){ s+=Math.max(data[i],data[i+1],data[i+2])-Math.min(data[i],data[i+1],data[i+2]); n++; }
   const isBW = s/n < 10; // → добавить тему "b&w"
   ```
4. Вписать `tags:` в YAML, затем `npm run lqip` + `npm run build`.

При массовом тегировании (десятки фото) — гонять через Workflow с Sonnet-субагентами (по агенту на фото,
structured output), чтобы картинки не жрали основной контекст.

## Скрипты

| команда | что делает |
|---|---|
| `npm run scan` | фототека → фото с рейтингом >3 в `/tmp/rated.json` (рейтинг в XMP!) |
| `npm run import` | `/tmp/rated.json` → сжатие 3840 + YAML-заготовка с `src` (пропускает существующие) |
| `npm run ingest` | inbox/ → то же, дата из EXIF |
| `npm run reencode [px]` | переэнкод мастеров по `src` из YAML (смена разрешения), default 3840 |
| `npm run lqip` | blur-up превью → `src/lqip.json` |
| `node scripts/make-picker.mjs <папка>` | самодостаточный HTML-пикер для отбора фото из папки → `pickers/<папка>.html` (выбор → список путей `папка/файл.jpg`) |

`PHOTO_LIB` переопределяет путь к фототеке (default `~/Photos`).

## Грабли (проверено болью)

- **Workflow `args`** не доезжает массивом в скрипт — данные инлайнить прямо в скрипт.
  И `async`-тханки в `parallel(...)` ломают инструментацию — форма `() => agent(...).then(...)`.
- **`.card[hidden]`**: правило `.card{display:block}` перебивает UA `[hidden]{display:none}` (равная
  специфичность) — нужен явный `.card[hidden]{display:none}`, иначе фильтры «не фильтруют».
- **Masonry** — абсолютное позиционирование по `data-ar`; раскладку (`layout()`) дёргать и на `resize`,
  и в конце `apply()` (смена фильтра). DOM-порядок = хронологии, не ломать (от него зависят фильтр и лайтбокс).
- **Фуллскрин**: на навигации держим предыдущий резкий кадр (без блюра), ставим 2560→3840 по
  `innerWidth*DPR*0.92 > 2560`. Не возвращать blur-up в лайтбокс (мылит на листании).
- **Имена-дубли в фототеке**: разные файлы могут давать одинаковый slug — для переэнкода полагаться
  на `src` из YAML (а не на поиск по имени).

## Деплой

`.github/workflows/deploy.yml` собирает и публикует при push в `master`. Сейчас `src/assets/photos/`
в `.gitignore` (прототип фото будет заменён) — перед боевым деплоем un-ignore и закоммитить фото.
