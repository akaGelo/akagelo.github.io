import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, mkdir, stat } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_DIR = join(__dirname, '../public/images/albums');
const OUTPUT_DIR = join(__dirname, '../public/images/optimized');

const SIZES = {
  thumbnail: 400,
  medium: 800,
  large: 1200
};

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function generatePlaceholder(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(20, 20)
    .blur(2)
    .jpeg({ quality: 20 })
    .toFile(outputPath);
}

async function processImage(inputPath, outputDir, filename, albumName) {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  
  console.log(`Обрабатываю: ${albumName}/${filename}`);
  
  // Создаем директории для разных размеров
  await ensureDir(join(outputDir, albumName));
  await ensureDir(join(outputDir, 'thumbnails', albumName));
  await ensureDir(join(outputDir, 'placeholders', albumName));
  
  // Генерируем placeholder (tiny blur)
  await generatePlaceholder(
    inputPath, 
    join(outputDir, 'placeholders', albumName, `${baseName}.jpg`)
  );
  
  // Генерируем thumbnail для сетки (квадратный)
  await sharp(inputPath)
    .resize(SIZES.thumbnail, SIZES.thumbnail, { 
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: 85 })
    .toFile(join(outputDir, 'thumbnails', albumName, `${baseName}.webp`));
  
  // Генерируем разные размеры для отзывчивости
  for (const [sizeName, width] of Object.entries(SIZES)) {
    await sharp(inputPath)
      .resize(width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 85 })
      .toFile(join(outputDir, albumName, `${baseName}_${sizeName}.webp`));
  }
  
  console.log(`✓ Готово: ${albumName}/${filename}`);
}

async function processAlbum(albumPath, albumName) {
  console.log(`\nОбрабатываю альбом: ${albumName}`);
  
  const files = await readdir(albumPath);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );
  
  for (const file of imageFiles) {
    const filePath = join(albumPath, file);
    await processImage(filePath, OUTPUT_DIR, file, albumName);
  }
}

async function main() {
  console.log('🚀 Начинаю генерацию превью...\n');
  
  await ensureDir(OUTPUT_DIR);
  
  const albums = await readdir(INPUT_DIR);
  
  for (const album of albums) {
    const albumPath = join(INPUT_DIR, album);
    const albumStat = await stat(albumPath);
    
    if (albumStat.isDirectory()) {
      await processAlbum(albumPath, album);
    }
  }
  
  console.log('\n✨ Все превью сгенерированы!');
}

main().catch(console.error); 