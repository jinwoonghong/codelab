// Service Worker
const CACHE_NAME = 'link-keeper-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/share-confirm.html',
  '/styles/variables.css',
  '/styles/reset.css',
  '/styles/main.css',
  '/src/app.js',
  '/src/managers/storage-manager.js',
  '/src/handlers/share-handler.js',
  '/public/manifest.json'
];

// 설치
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(URLS_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// 활성화
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Removing old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

// 🔥 핵심: Fetch 이벤트에서 공유 데이터 처리
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Web Share Target API 요청 처리
  if (url.pathname === '/share' && event.request.method === 'POST') {
    console.log('[Service Worker] Handling share request');
    event.respondWith(handleShare(event.request));
    return;
  }

  // 일반 fetch 요청: 캐시 우선 전략
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // 성공적인 응답만 캐시
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 응답 복제 (스트림은 한 번만 사용 가능하므로)
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // 오프라인이고 캐시에도 없는 경우
        console.log('[Service Worker] Fetch failed, offline');
        // 오프라인 페이지 반환 (선택 사항)
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// 공유 데이터 처리 함수
async function handleShare(request) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') || '';
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';

    console.log('[Service Worker] Share data:', { url, title, text });

    // SharedData 객체 생성
    const sharedData = {
      id: generateId(),
      url: url || text, // URL이 없으면 text에서 추출 시도
      title: title,
      text: text,
      timestamp: Date.now(),
      processed: false
    };

    // IndexedDB에 임시 저장
    await saveSharedData(sharedData);

    console.log('[Service Worker] Shared data saved, redirecting...');

    // 공유 확인 페이지로 리다이렉트
    return Response.redirect('/share-confirm.html?id=' + sharedData.id, 303);
  } catch (error) {
    console.error('[Service Worker] Error handling share:', error);
    // 에러 발생 시 홈으로 리다이렉트
    return Response.redirect('/', 303);
  }
}

// IndexedDB 저장 함수 (Service Worker 내)
function saveSharedData(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LinkKeeperDB', 1);

    request.onerror = () => {
      console.error('[Service Worker] IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;

      // sharedData store가 없으면 에러
      if (!db.objectStoreNames.contains('sharedData')) {
        console.error('[Service Worker] sharedData store not found');
        reject(new Error('sharedData store not found'));
        return;
      }

      const transaction = db.transaction(['sharedData'], 'readwrite');
      const store = transaction.objectStore('sharedData');
      const addRequest = store.add(data);

      addRequest.onsuccess = () => {
        console.log('[Service Worker] Shared data stored successfully');
        resolve();
      };

      addRequest.onerror = () => {
        console.error('[Service Worker] Failed to store shared data:', addRequest.error);
        reject(addRequest.error);
      };
    };

    // DB 업그레이드가 필요한 경우 (처음 실행 시)
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // links store
      if (!db.objectStoreNames.contains('links')) {
        const linksStore = db.createObjectStore('links', { keyPath: 'id' });
        linksStore.createIndex('url', 'url', { unique: true });
        linksStore.createIndex('isRead', 'isRead', { unique: false });
        linksStore.createIndex('createdAt', 'createdAt', { unique: false });
        linksStore.createIndex('domain', 'domain', { unique: false });
      }

      // sharedData store
      if (!db.objectStoreNames.contains('sharedData')) {
        const sharedStore = db.createObjectStore('sharedData', { keyPath: 'id' });
        sharedStore.createIndex('processed', 'processed', { unique: false });
        sharedStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // categories store
      if (!db.objectStoreNames.contains('categories')) {
        const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
        categoriesStore.createIndex('name', 'name', { unique: true });
      }

      // settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      console.log('[Service Worker] IndexedDB upgraded');
    };
  });
}

// ID 생성 함수
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

console.log('[Service Worker] Loaded');
