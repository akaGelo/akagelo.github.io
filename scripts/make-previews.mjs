import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ASSETS = "src/assets/photos";
const PREVIEWS = "/tmp/previews";

if (!fs.existsSync(PREVIEWS)) {
  fs.mkdirSync(PREVIEWS, { recursive: true });
}

export async function createPreview(slug) {
  const srcPath = path.join(ASSETS, `${slug}.jpg`);
  const destPath = path.join(PREVIEWS, `${slug}.jpg`);
  
  if (fs.existsSync(destPath)) return destPath;
  
  await sharp(srcPath)
    .resize(384, 384, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(destPath);
    
  return destPath;
}

// If run directly, generate previews for all photos in src/assets/photos
if (process.argv[1].endsWith("make-previews.mjs")) {
  console.log("Генерация превью 384px...");
  const files = fs.readdirSync(ASSETS).filter(f => f.endsWith(".jpg"));
  let count = 0;
  for (const f of files) {
    const slug = path.basename(f, ".jpg");
    await createPreview(slug);
    count++;
  }
  console.log(`Создано превью: ${count}`);
}
