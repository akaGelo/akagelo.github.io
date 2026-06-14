# vyukov.ru — фотогалерея

Статичный сайт на **Astro**. Хостинг — GitHub Pages, домен `vyukov.ru`.
Каталог построен на тегах и датах: альбомов нет, поездки и подгруппы — это просто теги.

## Как добавить фотографии

1. **Кинь снимки в папку `inbox/`** (хоть пачкой после поездки).
2. **Прогони ингест:**
   ```bash
   npm run ingest
   ```
   Скрипт сам: возьмёт **дату из EXIF** (если нет — дату файла), скопирует оригинал в
   `src/assets/photos/`, создаст YAML-заготовку в `src/content/photos/` и перенесёт
   обработанный файл в `inbox/_done/`.
3. **Каталогизируй в Claude Code** — скажи «каталогизируй новые фото». Claude посмотрит
   на каждый снимок и проставит **тип, теги и подпись** (переиспользуя существующие теги,
   без дублей). Можно и руками — это просто YAML.
4. **Опубликуй:**
   ```bash
   git add -A && git commit -m "новые фото" && git push
   ```
   GitHub Actions соберёт сайт и выкатит на Pages.

## Просмотр и сборка

```bash
npm run dev      # локальный сайт на http://localhost:4321
npm run build    # прод-сборка в dist/
```

## Что под капотом

- **Скорость:** прод-сборка — чистый HTML + картинки в WebP с адаптивным `srcset` + крошечный
  inline-JS. Никакого React/CMS в бандле.
- **Галерея:** masonry-сетка (Pinterest-стиль), фильтры по типу/году/тегам, лайтбокс.
- **Данные:** `src/content/photos/*.yaml` (по записи на фото), схема и валидация — в
  `src/content.config.ts` (Astro content collections).
- **Картинки:** оригиналы лежат в `src/assets/photos/` как есть; адаптивные WebP-варианты
  генерируются при сборке (`astro:assets` + sharp) и не содержат EXIF/GPS.

## Поля записи (YAML)

```yaml
title: ""              # короткое название (необязательно)
image: lake-morning.jpg
date: 2024-08-12        # из EXIF, ставится ингестом
type: landscape         # landscape|portrait|street|reportage|architecture|nature|travel|bw|other
tags: [Карелия 2024, озеро]
caption: ""             # подпись для лайтбокса
featured: false         # true → попадает в hero на главной
```

## Структура

```
scripts/ingest.mjs        ингест из inbox/ (EXIF-дата, копия, YAML-заготовка)
inbox/                    дропзона (в git не попадает), inbox/_done/ — обработанные
src/content.config.ts     схема коллекции photos
src/content/photos/       записи фото (YAML)
src/assets/photos/        оригиналы изображений
src/pages/index.astro     главная: hero + сетка + фильтры + лайтбокс
src/layouts/Layout.astro  каркас страницы
src/styles/global.css     темы (светлая/тёмная), токены
public/CNAME              домен vyukov.ru
.github/workflows/deploy.yml  автодеплой на Pages
```
