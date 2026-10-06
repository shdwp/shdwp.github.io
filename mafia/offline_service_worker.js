'use strict';

const CACHE_NAME = 'mafia-engine-offline-v6';
const APP_FILES = [
  './',
  'index.html',
  'flutter_bootstrap.js',
  'main.dart.js',
  'flutter.js',
  'manifest.json',
  'favicon.png',
  'version.json',
  'assets/AssetManifest.bin',
  'assets/AssetManifest.bin.json',
  'assets/FontManifest.json',
  'assets/NOTICES',
  'assets/fonts/MaterialIcons-Regular.otf',
  'assets/fonts/Roboto-Regular.ttf',
  'assets/fonts/Roboto-Medium.ttf',
  'assets/fonts/OFL.txt',
  'assets/fonts/FluentEmojiColor.ttf',
  'assets/fonts/FluentEmojiColor-LICENSE.txt',
  'assets/fonts/FluentEmojiArtwork-LICENSE.txt',
  'assets/packages/cupertino_icons/assets/CupertinoIcons.ttf',
  'assets/shaders/ink_sparkle.frag',
  'assets/shaders/stretch_effect.frag',
  'canvaskit/canvaskit.js',
  'canvaskit/canvaskit.wasm',
  'canvaskit/chromium/canvaskit.js',
  'canvaskit/chromium/canvaskit.wasm',
  'icons/Icon-192.png',
  'icons/Icon-512.png',
  'icons/Icon-maskable-192.png',
  'icons/Icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('mafia-engine-offline-') && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        );
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const appShell = await caches.match(new URL('./', self.registration.scope));
        if (appShell) return appShell;
      }
      return Response.error();
    })
  );
});
