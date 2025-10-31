// Service worker to handle caching and prevent ChunkLoadError
const CACHE_NAME = 'app-cache-v1'
const urlsToCache = [
  '/',
]

// Install event - cache essential resources
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event - implement cache-first strategy with fallback
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Check if this is a request for a JavaScript chunk
  const url = new URL(event.request.url)
  const isChunk = url.pathname.includes('/_next/static/chunks/') || 
    url.pathname.includes('/_next/static/css/') ||
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.css')

  if (isChunk) {
    // For chunks, use network-first strategy with cache fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the response is successful, cache it
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })
          }
          return response
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request)
        })
    )
  } else {
    // For other resources, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response
          }
          return fetch(event.request)
        })
    )
  }
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Handle messages from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})