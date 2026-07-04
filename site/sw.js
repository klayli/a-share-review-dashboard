const CACHE_NAME = 'a-share-review-v45-20260705';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg', '/api/portfolio.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function isMainDocument(url) {
  const path = new URL(url).pathname;
  return path === '/' || path === '/index.html' || path === '/preview.html';
}

function isApiPortfolio(url) {
  return new URL(url).pathname === '/api/portfolio.json';
}

function isStaticAsset(url) {
  const urlObj = new URL(url);
  if (urlObj.origin !== self.location.origin) return false;
  const path = urlObj.pathname;
  if (isMainDocument(url)) return false;
  if (isApiPortfolio(url)) return false;
  if (path.startsWith('/api/')) return false;
  return /\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot|ico|webp|json)$/i.test(path);
}

function isExternalRequest(url) {
  return new URL(url).origin !== self.location.origin;
}

function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), timeout);
    fetch(request).then(
      response => {
        clearTimeout(timer);
        resolve(response);
      },
      err => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function updateCache(request, response) {
  if (response && response.status === 200) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  if (isExternalRequest(url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isMainDocument(url)) {
    event.respondWith(
      fetchWithTimeout(event.request, 2000)
        .then(response => {
          updateCache(event.request, response);
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) {
              fetch(event.request).then(response => updateCache(event.request, response)).catch(() => {});
              return cached;
            }
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  if (isApiPortfolio(url)) {
    event.respondWith(
      fetchWithTimeout(event.request, 3000)
        .then(response => {
          updateCache(event.request, response);
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) {
              fetch(event.request).then(response => updateCache(event.request, response)).catch(() => {});
              return cached;
            }
            throw new Error('portfolio data unavailable');
          });
        })
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request)
          .then(response => {
            updateCache(event.request, response);
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
  );
});
