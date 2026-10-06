// ============================================
// FireLand · Service Worker · v27.0.6
// Кэширует ВСЁ: лаунчер, игры, утилиты, маскот
// ============================================

const CACHE_NAME = 'fireland-v27.1.1';
const CACHE_VERSION = '27.1.1';

// Что кэшируем при установке
const PRECACHE_URLS = [
  './',
  './index.html',
  './supabase.js?v=45',
  './style.css?v=45',
  './storage.js?v=45',
  './games.js?v=45',
  './profile.js?v=45',
  './sound.js?v=45',
  './streak.js?v=45',
  './device.js?v=45',
  './leaderboard.js?v=45',
  './script.js?v=45',
  './messenger.js?v=45',
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

  // Network-first для HTML
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
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
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(response => {
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