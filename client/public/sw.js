/**
 * Service Worker for Zeshto AI Skin Analyzer PWA
 * Provides offline functionality and advanced caching
 */

const CACHE_NAME = 'zeshto-ai-v1.0.0';
const STATIC_CACHE = 'zeshto-static-v1.0.0';
const DYNAMIC_CACHE = 'zeshto-dynamic-v1.0.0';
const AI_MODELS_CACHE = 'zeshto-ai-models-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png',
  // Add other critical static assets
];

// AI model URLs to cache
const AI_MODEL_URLS = [
  'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.22.0/dist/tf-backend-webgl.min.js',
  'https://docs.opencv.org/4.8.0/opencv.js'
];

// Network-first strategies for these patterns
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /\/auth\//,
  /\/analysis\//
];

// Cache-first strategies for these patterns
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:js|css|woff|woff2|ttf|eot)$/,
  /\/assets\//
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Pre-cache AI models
      caches.open(AI_MODELS_CACHE).then((cache) => {
        console.log('🤖 Pre-caching AI models');
        return Promise.allSettled(
          AI_MODEL_URLS.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(err => console.warn(`Failed to cache ${url}:`, err))
          )
        );
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      // Force activation
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== AI_MODELS_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    })
  );
});

/**
 * Fetch event - handle network requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

/**
 * Handle fetch requests with appropriate caching strategy
 */
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // AI Models - Cache first with long TTL
    if (isAIModelRequest(url)) {
      return await cacheFirstStrategy(request, AI_MODELS_CACHE);
    }
    
    // Static assets - Cache first
    if (isCacheFirstRequest(url)) {
      return await cacheFirstStrategy(request, STATIC_CACHE);
    }
    
    // API requests - Network first with fallback
    if (isNetworkFirstRequest(url)) {
      return await networkFirstStrategy(request);
    }
    
    // Default - Stale while revalidate
    return await staleWhileRevalidateStrategy(request);
    
  } catch (error) {
    console.error('Fetch failed:', error);
    
    // Return offline fallback
    return await getOfflineFallback(request);
  }
}

/**
 * Cache-first strategy
 */
async function cacheFirstStrategy(request, cacheName = STATIC_CACHE) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network failed for cache-first:', request.url);
    throw error;
  }
}

/**
 * Network-first strategy
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network failed, trying cache:', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(err => {
    console.warn('Background fetch failed:', request.url, err);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await fetchPromise;
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return cached index.html
  if (request.headers.get('accept')?.includes('text/html')) {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match('/index.html') || new Response(
      '<h1>Offline</h1><p>Please check your internet connection.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  // For API requests, return offline message
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
  
  // For other requests, return generic offline response
  return new Response('Offline', { status: 503 });
}

/**
 * Check if request is for AI models
 */
function isAIModelRequest(url) {
  return AI_MODEL_URLS.some(modelUrl => url.href.includes(modelUrl)) ||
         url.pathname.includes('tensorflow') ||
         url.pathname.includes('mediapipe') ||
         url.pathname.includes('opencv');
}

/**
 * Check if request should use cache-first strategy
 */
function isCacheFirstRequest(url) {
  return CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Check if request should use network-first strategy
 */
function isNetworkFirstRequest(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Background sync for offline analysis
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-analysis') {
    event.waitUntil(processOfflineAnalysis());
  }
});

/**
 * Process offline analysis when connection is restored
 */
async function processOfflineAnalysis() {
  try {
    // Get offline analysis data from IndexedDB
    const offlineData = await getOfflineAnalysisData();
    
    for (const analysis of offlineData) {
      try {
        // Send to server
        await fetch('/api/analysis/offline-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysis)
        });
        
        // Remove from offline storage
        await removeOfflineAnalysis(analysis.id);
        
      } catch (error) {
        console.error('Failed to sync analysis:', analysis.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New skin analysis insights available!',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Analysis',
        icon: '/assets/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Zeshto AI', options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/analysis')
    );
  }
});

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
});

/**
 * Get cache status
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    status[cacheName] = keys.length;
  }
  
  return status;
}

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map(name => caches.delete(name)));
}

/**
 * Placeholder functions for IndexedDB operations
 * These would be implemented with a proper IndexedDB wrapper
 */
async function getOfflineAnalysisData() {
  // Implementation would use IndexedDB to get offline analysis data
  return [];
}

async function removeOfflineAnalysis(id) {
  // Implementation would remove analysis from IndexedDB
  console.log('Removing offline analysis:', id);
}

console.log('🎉 Service Worker script loaded successfully');