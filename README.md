# vyukov.ru — photo gallery

Статичный фотосайт на **Astro**. Хостинг — GitHub Pages, домен `vyukov.ru`.
Каталог — по **темам**, **годам** и **избранному** (без альбомов). Сайт и теги на английском.

## Стек и идеи

- Astro (output: static) + sharp/`astro:assets` — адаптивные WebP на сборке.
- Светлая тема, самохостед-шрифты (`Fraunces` + `Hanken Grotesk`, `public/fonts/`).
- Masonry «новые сверху» (JS, кратчайшая колонка), фильтры комбинируются, кнопка **All** сбрасывает.
- Лайтбокс: стрелки/←→/свайп, листание внутри активного фильтра, прогрессивная загрузка
  2560→3840 (DPR-aware), blur-up в ленте, крутилка загрузки.

## Как добавить фотографии

Оригиналы держи в своей фототеке (`~/Photos`) — в репозиторий они не идут. В репо попадает
только сжатый мастер (3840px) в `src/assets/photos/`.

**Вариант А — пачкой по рейтингу (Lightroom):**
```bash
npm run scan        # ищет в фототеке фото с рейтингом > 3 → /tmp/rated.json
npm run import      # сжимает в 3840, кладёт в репо, создаёт YAML-заготовки (с src)
```
**Вариант Б — вручную через inbox:**
```bash
# кинуть файлы в ./inbox
npm run ingest      # EXIF-дата, сжатие 3840, YAML-заготовки
```
Затем:
```bash
# в Claude Code: «каталогизируй новые фото» — проставит темы (Claude смотрит снимки)
npm run lqip        # обновить blur-up превью
npm run dev         # посмотреть локально
```

## Редактирование

Каждое фото — это `src/assets/photos/<slug>.jpg` + `src/content/photos/<slug>.yaml`:
```yaml
title: ""                  # необязательно
image: dsc00602.jpg
src: "2024/DSC00602.jpg"   # путь в фототеке (провенанс для переэнкода)
date: 2024-08-09
tags: [landscape, travel]  # темы
favorite: false            # ★ в фильтре «Favorites»
rating: 5                  # из EXIF/XMP, опционально
```
- **Удалить фото:** удалить оба файла (`.jpg` и `.yaml`).
- **В избранное:** `favorite: true`.
- **Сменить разрешение мастеров:** `npm run reencode [px]` (берёт оригиналы по `src`), затем `npm run lqip`.

**Темы** (8 кураторских): `street, portrait, landscape, nature, animals, architecture, travel, b&w`.

## Сборка и деплой

```bash
npm run build       # прод-сборка в dist/
```
GitHub Actions (`.github/workflows/deploy.yml`) собирает и публикует на Pages при push в `master`.

> ⚠️ Сейчас `src/assets/photos/` в `.gitignore` (прототипный набор фото будет заменён).
> Перед боевым деплоем раскомментировать строку в `.gitignore` и закоммитить финальные фото —
> CI собирает сайт из них.

Подробности для AI-агента и нюансы — в `CLAUDE.md`.
