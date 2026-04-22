// Rejse 2026 offline service worker
// Bump the version string to force a refresh on all clients.
const VERSION = "rejse-2026-v2";
const STATIC = `${VERSION}-static`;
const DATA = `${VERSION}-data`;
const PDF = `${VERSION}-pdf`;
const TILE = `${VERSION}-tile`;
const ALL = [STATIC, DATA, PDF, TILE];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC).then((cache) =>
      cache.addAll([
        "/",
        "/kamera",
        "/saboten/game",
        "/papa",
        "/viewer",
      ]).catch(() => {}),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => !ALL.includes(n)).map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    if (hit) return hit;
    throw err;
  }
}

async function networkFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw new Error("offline and no cache");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Don't touch cross-origin except for map tiles
  if (url.origin !== self.location.origin) {
    if (
      url.hostname.includes("basemaps.cartocdn.com") ||
      url.hostname.includes("cdnjs.cloudflare.com")
    ) {
      event.respondWith(cacheFirst(TILE, request));
    }
    return;
  }

  // Skip auth endpoints entirely — always go to network
  if (
    url.pathname === "/api/signin" ||
    url.pathname === "/api/ask" ||
    url.pathname === "/signin"
  ) {
    return;
  }

  // Navigations (HTML pages): network first, fall back to cached "/"
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(STATIC);
          cache.put(request, res.clone());
          return res;
        } catch {
          const cache = await caches.open(STATIC);
          const hit = await cache.match(request);
          return hit || (await cache.match("/")) || Response.error();
        }
      })(),
    );
    return;
  }

  // Trip data API: network first with cache fallback
  if (url.pathname === "/api/trip") {
    event.respondWith(networkFirst(DATA, request));
    return;
  }

  // Ticket PDFs: cache first (they don't change)
  if (url.pathname.startsWith("/tickets/")) {
    event.respondWith(cacheFirst(PDF, request));
    return;
  }

  // Next.js static chunks, fonts, images: cache first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/icon" ||
    url.pathname === "/apple-icon" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(STATIC, request));
    return;
  }

  // everything else: let the browser handle it
});
