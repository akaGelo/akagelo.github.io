# Фотогалерея

Сайт для демонстрации фотографий, организованных по альбомам.

## Как запустить локально

```bash
npm install
npm run dev
```

Сайт будет доступен по адресу `http://localhost:4321`

## Как добавить фотографии

### Структура папок
```
public/images/
├── albums/
│   ├── nature/        # Альбом "Природа"
│   ├── street/        # Альбом "Уличная фотография"  
│   └── portraits/     # Альбом "Портреты"
└── author.jpg         # Ваше фото для страницы "Обо мне"
```

### Добавление нового альбома

1. Создайте папку в `public/images/albums/[название-альбома]/`
2. Добавьте фотографии в эту папку
3. Отредактируйте файлы:
   - `src/pages/index.astro` - добавьте альбом в массив `albums`
   - `src/pages/albums/[album].astro` - добавьте альбом в функцию `getStaticPaths()`

### Редактирование информации о себе

Отредактируйте объект `photographer` в файле `src/pages/about.astro`

## Деплой на GitHub Pages

1. Измените в `astro.config.mjs`:
   - `site: 'https://ваш-username.github.io'`
   - `base: '/photo-site'` (или название вашего репозитория)

2. Загрузите код в репозиторий на GitHub

3. В настройках репозитория включите GitHub Pages:
   - Settings → Pages → Source: GitHub Actions

4. Сайт будет автоматически собираться и обновляться при каждом push

## Команды

- `npm run dev` - запуск сервера разработки
- `npm run build` - сборка для продакшена  
- `npm run preview` - предварительный просмотр собранного сайта

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
