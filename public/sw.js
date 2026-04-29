/**
 * Service Worker - 离线缓存策略
 * 
 * 策略：
 * - 静态资源：Cache First（缓存优先）
 * - API 请求：Network First（网络优先），失败时返回缓存
 * - 图片：Cache First，最长缓存 30 天
 */

const CACHE_NAME = 'dobi-elf-v2';
const STATIC_ASSETS = [
  '/',
  '/globals.css',
];

const API_CACHE_NAME = 'dobi-api-v1';
const API_ROUTES = [
  '/api/courses',
  '/api/homework',
  '/api/achievements',
  '/api/users',
];

/**
 * 安装事件 - 预缓存静态资源
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

/**
 * 请求拦截
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  
  // API 请求：Network First
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // 图片：Cache First
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // 静态资源：Cache First
  event.respondWith(handleStaticRequest(event.request));
});

/**
 * API 请求：Network First，失败时返回缓存
 */
async function handleApiRequest(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // 尝试网络请求
    const response = await fetch(request);
    
    // 只缓存 GET 请求
    if (request.method === 'GET' && response.ok) {
      const clone = response.clone();
      const data = await clone.json();
      
      // 添加缓存元数据
      const cachedResponse = new Response(JSON.stringify({
        _cached: true,
        _timestamp: Date.now(),
        data,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600',
        },
      });
      
      await cache.put(request, cachedResponse);
    }
    
    return response;
  } catch (error) {
    // 网络失败，返回缓存
    const cached = await cache.match(request);
    
    if (cached) {
      return new Response(cached.body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Offline': 'true',
        },
      });
    }
    
    // 无缓存，返回错误响应
    return new Response(JSON.stringify({
      error: '离线状态，暂无缓存数据',
      offline: true,
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Offline': 'true',
      },
    });
  }
}

/**
 * 图片请求：Cache First
 */
async function handleImageRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const clone = response.clone();
      await cache.put(request, clone);
    }
    
    return response;
  } catch (error) {
    return new Response('图片加载失败', { status: 404 });
  }
}

/**
 * 静态资源：Cache First
 */
async function handleStaticRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const clone = response.clone();
      await cache.put(request, clone);
    }
    
    return response;
  } catch (error) {
    return new Response('资源加载失败', { status: 404 });
  }
}

/**
 * 后台同步
 */
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'dobi-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData(): Promise<void> {
  // 通知客户端执行同步
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_REQUEST',
      timestamp: Date.now(),
    });
  });
}

/**
 * 推送通知（预留）
 */
self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || '魔法小课桌', {
        body: data.body || '您有一条新消息',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: data.tag || 'default',
      })
    );
  }
});
