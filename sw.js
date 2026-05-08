const CACHE_NAME = 'sdr-v1-cinematic';
// Updated assets to match your PWA manifest
const assets = [
  './',
  './index.html',
  './Soul Dust.png',
  './elephant 19.jpg' // Ensuring your signature background is offline-ready
];

// 1. Installation: Lock in the core files
self.addEventListener('install', e => {
  self.skipWaiting(); // Forces the new version to take over immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SDR Engine: Precaching Core Assets');
      return cache.addAll(assets);
    })
  );
});

// 2. Activation: Clean up old versions so the portal stays "Top of the World"
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. Fetch Strategy: "Cache First, then Network"
// This makes the app load in under 1 second
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request).then(networkResponse => {
        // Don't cache large WAV files or royalty CSVs to save phone space
        if (e.request.url.includes('.wav') || e.request.url.includes('.csv')) {
          return networkResponse;
        }
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
