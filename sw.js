/* Pokladna Garage – umožní otevřít stránku i bez internetu.
   Nahraj vedle index.html do stejného repozitáře. Data (Apps Script) se necachují. */
var CACHE = 'garage-v1'; // verze: 20261025-100516
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['./', './index.html']); }));
  self.skipWaiting();
});
// nová verze sw.js převezme řízení hned, bez zavírání aplikace
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url);
  var mine = u.origin === location.origin, font = /(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!mine && !font) return;
  // nejdřív síť (vždy nejnovější verze), bez internetu uložená kopie
  e.respondWith(caches.open(CACHE).then(function (c) {
    return fetch(r, mine ? { cache: 'no-store' } : undefined).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone());
      return res;
    }).catch(function () {
      return c.match(r, { ignoreSearch: true }).then(function (m) { return m || c.match('./index.html'); });
    });
  }));
});
