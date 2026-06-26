const CACHE_NAME = 'static-social-shell-v1'
const SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/assets/brand/static-mark-official-working.png',
  '/assets/world/city/heroes/static-signals-boulevard-v8-final.png',
  '/assets/world/city/heroes/static-radio-rooftop-v1-approved.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => null)
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => null)
        return response
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  )
})

self.addEventListener('push', (event) => {
  const data = event.data?.json?.() || {}
  const title = data.title || 'STATIC Social'
  const body = data.body || 'New activity is waiting.'
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/assets/brand/static-mark-official-working.png',
      badge: '/assets/brand/static-mark-official-working.png',
      data: { url: data.url || '/notifications' }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/notifications'
  event.waitUntil(self.clients.openWindow(url))
})
