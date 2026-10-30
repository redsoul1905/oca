/* OCARA — Last Flame Standing service worker
   Amac: telefonda "Ana Ekrana Ekle" ile acilan oyun internet olmadan da calissin.
   Sürüm degistirdigimizde CACHE adini artirin (oca-v2 gibi). */
const CACHE = 'oca-v58';
const CORE = ['./', './index.html', './oca3d.html', './lib/three.min.js', './manifest.webmanifest',
              './apple-touch-icon.png', './icon-192.png', './icon-512.png',
              './icon-maskable-512.png', './favicon.svg', './favicon.png',
              './og-image.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // skor / POST isteklerine dokunma
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // harbi alan adlarini gec
  if (req.mode === 'navigate') {                     // oyun sayfasina her zaman agdan girmeyi dene
    e.respondWith(
      fetch(req)
        .then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res;
    }).catch(() => r))
  );
});
