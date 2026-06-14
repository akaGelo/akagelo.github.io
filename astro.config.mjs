// @ts-check
import { defineConfig } from 'astro/config';

// Чистая статика для GitHub Pages. Контент — в src/content/photos/*.yaml,
// добавляется через scripts/ingest.mjs (папка inbox/) и каталогизируется в Claude Code.
export default defineConfig({
  site: 'https://vyukov.ru',
  output: 'static',
});
