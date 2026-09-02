/* The Hostinger build injects a content-hashed asset list above this line. */
const offlineBuild = self.__DEUTSCH_OFFLINE_BUILD__ ?? {
  version: 'development-v1',
  assets: ['/', '/study/', '/docs/', '/practice/', '/test/', '/flashcards/'],
};

const cachePrefix = 'deutsch-a1-offline';
const precacheName = `${cachePrefix}-precache-${offlineBuild.version}`;
const runtimeName = `${cachePrefix}-runtime-${offlineBuild.version}`;
const offlineApiMessage = 'Ta funkcja wymaga połączenia z internetem.';

function absoluteUrl(pathname) {
  return new URL(pathname, self.location.origin).toString();
}

async function installOfflineCopy() {
  const cache = await caches.open(precacheName);
  const assets = [...new Set(offlineBuild.assets)];

  // Small batches avoid overwhelming mobile browsers on the first visit. A failed
  // batch keeps the previous service worker active, so a partial update never
  // replaces a complete offline copy.
  for (let index = 0; index < assets.length; index += 20) {
    const batch = assets.slice(index, index + 20);
    await Promise.all(
      batch.map(async (asset) => {
        const response = await fetch(new Request(absoluteUrl(asset), { cache: 'reload' }));
        if (!response.ok) throw new Error(`Could not cache ${asset}: ${response.status}`);
        await cache.put(absoluteUrl(asset), response);
      }),
    );
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(installOfflineCopy().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(cachePrefix) && ![precacheName, runtimeName].includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

async function cachedResponse(request, { allowQuerylessFallback = true } = {}) {
  const precache = await caches.open(precacheName);
  const runtime = await caches.open(runtimeName);
  const exact = (await runtime.match(request)) ?? (await precache.match(request));
  if (exact) return exact;

  if (!allowQuerylessFallback) return undefined;
  const url = new URL(request.url);
  const querylessRequest = new Request(absoluteUrl(url.pathname));
  return (await runtime.match(querylessRequest)) ?? (await precache.match(querylessRequest));
}

async function fetchWithTimeout(request, timeout = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function navigationCandidates(url) {
  const cleanPath = url.pathname.replace(/\/index\.html$/, '/');
  const withSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  return [
    absoluteUrl(cleanPath),
    absoluteUrl(withSlash),
    absoluteUrl(`${withSlash}index.html`),
    absoluteUrl('/'),
  ];
}

async function handleNavigation(request) {
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok) {
      const runtime = await caches.open(runtimeName);
      await runtime.put(request, response.clone());
    }
    return response;
  } catch {
    const url = new URL(request.url);
    const precache = await caches.open(precacheName);
    const runtime = await caches.open(runtimeName);
    for (const candidate of navigationCandidates(url)) {
      const match = (await runtime.match(candidate)) ?? (await precache.match(candidate));
      if (match) return match;
    }
    return new Response('Strona nie jest jeszcze dostępna offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

async function handleAsset(request) {
  const url = new URL(request.url);
  const isNextDataRequest = url.searchParams.has('_rsc');
  const cached = await cachedResponse(request, {
    // Exported Next.js data lives in stable .txt files; only the _rsc token changes.
    // An RSC request for a page pathname must still never receive cached HTML.
    allowQuerylessFallback: !isNextDataRequest || url.pathname.endsWith('.txt'),
  });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const runtime = await caches.open(runtimeName);
      await runtime.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function handleHead(request) {
  try {
    return await fetchWithTimeout(request);
  } catch {
    const getRequest = new Request(request.url, { method: 'GET' });
    let match = await cachedResponse(getRequest);

    if (!match) {
      const url = new URL(request.url);
      const precache = await caches.open(precacheName);
      const runtime = await caches.open(runtimeName);
      for (const candidate of navigationCandidates(url)) {
        match = (await runtime.match(candidate)) ?? (await precache.match(candidate));
        if (match) break;
      }
    }

    if (!match) return new Response(null, { status: 503, statusText: 'Offline' });
    return new Response(null, {
      status: match.status,
      statusText: match.statusText,
      headers: match.headers,
    });
  }
}

function offlineApiResponse() {
  return new Response(JSON.stringify({ error: offlineApiMessage, offline: true }), {
    status: 503,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(offlineApiResponse));
    return;
  }

  if (request.method === 'HEAD') {
    event.respondWith(handleHead(request));
    return;
  }

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleAsset(request));
});
