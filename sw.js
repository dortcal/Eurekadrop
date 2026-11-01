/* ==========================================================
   EUREKA DROP · sw.js — Service Worker (juego sin conexión)
   Precarga todos los archivos en la primera visita. Después
   sirve desde la caché y actualiza en segundo plano.
   Si cambias archivos, sube el número de VERSION.
   ========================================================== */
const VERSION = 'eureka-drop-v1.2.1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'css/style.css', 'css/menu.css', 'css/game.css',
  'js/util.js', 'js/storage.js', 'js/icons.js', 'js/audio.js', 'js/questions.js', 'js/challenges.js',
  'js/art.js', 'js/level-gen.js', 'js/mechanics.js', 'js/minigames.js', 'js/controls.js', 'js/phrases.js',
  'js/story.js', 'js/scoring.js', 'js/progression.js', 'js/game-engine.js', 'js/stats.js', 'js/diploma.js',
  'js/ui.js', 'js/memory.js', 'js/main.js',
  'data/matematicas.json', 'data/lengua.json', 'data/conocimiento-medio.json', 'data/ingles.json',
  'data/educacion-fisica.json', 'data/bundle.js',
  'data/matematicas-cursos.json', 'data/lengua-cursos.json', 'data/conocimiento-medio-cursos.json', 'data/ingles-cursos.json',
  'data/educacion-fisica-cursos.json',
  'assets/icons/icon.svg', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (cached) { e.waitUntil(network); return cached; }
      const res = await network;
      if (res) return res;
      if (req.mode === 'navigate') return cache.match('index.html');
      return new Response('', { status: 504, statusText: 'Sin conexión' });
    })
  );
});
