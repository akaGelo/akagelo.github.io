const CACHE_NAME = 'photo-site-v1';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах

// Ресурсы для предварительного кэширования
const PRECACHE_URLS = [
  '/',
  '/favicon.svg'
];

// Устанавливаем Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активируем Service Worker и очищаем старые кэши
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Перехватываем запросы
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Агрессивное кэширование для изображений
  if (isImageRequest(event.request)) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // Кэширование других ресурсов
  if (event.request.method === 'GET') {
    event.respondWith(handleResourceRequest(event.request));
  }
});

// Проверка является ли запрос изображением
function isImageRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  
  return pathname.includes('/images/') || 
         pathname.endsWith('.jpg') || 
         pathname.endsWith('.jpeg') || 
         pathname.endsWith('.png') || 
         pathname.endsWith('.webp') || 
         pathname.endsWith('.avif') ||
         pathname.endsWith('.svg');
}

// Обработка запросов изображений (Cache First с длительным TTL)
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Сначала проверяем кэш
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Проверяем возраст кэша
      const cacheTime = await getCacheTime(request.url);
      const now = Date.now();
      
      if (cacheTime && (now - cacheTime < CACHE_DURATION)) {
        console.log('[SW] Serving from cache:', request.url);
        return cachedResponse;
      }
    }
    
    // Если нет в кэше или устарел - загружаем
    console.log('[SW] Fetching image:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // Сохраняем в кэш с временной меткой
      const responseToCache = response.clone();
      await cache.put(request, responseToCache);
      await setCacheTime(request.url, Date.now());
    }
    
    return response;
    
  } catch (error) {
    console.error('[SW] Image fetch error:', error);
    
    // Возвращаем из кэша даже если устарел
    const cache = await caches.open(CACHE_NAME);
    const fallbackResponse = await cache.match(request);
    
    if (fallbackResponse) {
      return fallbackResponse;
    }
    
    // В крайнем случае возвращаем ошибку
    return new Response('Image not available', { 
      status: 404, 
      statusText: 'Not Found' 
    });
  }
}

// Обработка других ресурсов (Network First для HTML, Cache First для статики)
async function handleResourceRequest(request) {
  const url = new URL(request.url);
  
  // HTML страницы - Network First
  if (request.headers.get('accept')?.includes('text/html')) {
    return handleNetworkFirst(request);
  }
  
  // Файлы данных (albums.js и др.) - всегда Network First для свежих данных
  if (isDataFile(request)) {
    return handleNetworkFirst(request);
  }
  
  // CSS, JS, шрифты - Cache First
  if (isStaticAsset(request)) {
    return handleCacheFirst(request);
  }
  
  // Все остальное - Network First
  return handleNetworkFirst(request);
}

function isStaticAsset(request) {
  const pathname = new URL(request.url).pathname.toLowerCase();
  return pathname.endsWith('.css') || 
         pathname.endsWith('.js') || 
         pathname.endsWith('.woff2') || 
         pathname.endsWith('.woff') ||
         pathname.includes('/_astro/');
}

function isDataFile(request) {
  const pathname = new URL(request.url).pathname.toLowerCase();
  return pathname.includes('/data/') || 
         pathname.includes('albums.js') ||
         pathname.includes('config.js');
}

async function handleCacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache first error:', error);
    return new Response('Resource not available', { status: 404 });
  }
}

async function handleNetworkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Network first error:', error);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Resource not available', { status: 404 });
  }
}

// Утилиты для работы с временем кэша
async function setCacheTime(url, time) {
  try {
    const cache = await caches.open(`${CACHE_NAME}-timestamps`);
    const response = new Response(time.toString());
    await cache.put(url, response);
  } catch (error) {
    console.error('[SW] Set cache time error:', error);
  }
}

async function getCacheTime(url) {
  try {
    const cache = await caches.open(`${CACHE_NAME}-timestamps`);
    const response = await cache.match(url);
    if (response) {
      const timeString = await response.text();
      return parseInt(timeString, 10);
    }
  } catch (error) {
    console.error('[SW] Get cache time error:', error);
  }
  return null;
} 