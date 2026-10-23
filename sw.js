// ============================================
// FireLand · Service Worker · v27.3.0
// Кэширует ВСЁ: лаунчер, игры, утилиты, маскот
// ============================================

const CACHE_NAME = 'fireland-v27.9.3';
const CACHE_VERSION = '27.9.3';

// Что кэшируем при установке
const PRECACHE_URLS = [
  './',
  './index.html',
  './supabase.js?v=75',
  './style.css?v=75',
  './storage.js?v=75',
  './games.js?v=75',
  './profile.js?v=75',
  './sound.js?v=75',
  './streak.js?v=75',
  './device.js?v=75',
  './leaderboard.js?v=75',
  './script.js?v=75',
  './neiro.js?v=75',
  './messenger.js?v=75',
  './manifest.json',
  './fireek.mp4'
];

// ============================================
// INSTALL — кэшируем всё
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Install v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Не удалось закэшировать:', url, err);
          })
        )
      );
      console.log('[SW] Precache:', results.filter(r => r.status === 'fulfilled').length, '/', PRECACHE_URLS.length);
      return self.skipWaiting();
    })
  );
});

// ============================================
// ACTIVATE — удаляем старые кэши
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v' + CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Удаляю старый кэш:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================
// FETCH — отдаём из кэша, если офлайн
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (request.method !== 'GET') return;

  // ✅ НЕ кэшируем range-запросы (видео/аудио 206)
  if (request.headers.has('range')) return;

  // Network-first для HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // ✅ Проверяем, что 200 и НЕ partial
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first для всего остального
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        fetch(request).then(response => {
          // ✅ Только 200, не 206
          if (response.ok && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(response => {
        // ✅ Только 200, не 206
        if (response.ok && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// ============================================
// MESSAGE
// ============================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('[SW] Загружено v' + CACHE_VERSION);