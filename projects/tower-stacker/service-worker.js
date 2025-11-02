/**
 * Tower Stacker - Service Worker
 * PWA 오프라인 지원 및 캐싱
 */

const CACHE_NAME = 'tower-stacker-v1.0.0';
const RUNTIME_CACHE = 'tower-stacker-runtime';

// 캐시할 정적 파일 목록
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles/main.css',

    // 게임 설정
    '/src/config.js',
    '/src/game.js',

    // 유틸리티
    '/src/utils/DataManager.js',

    // 매니저
    '/src/managers/ScoreManager.js',
    '/src/managers/ReplayManager.js',
    '/src/managers/GifManager.js',
    '/src/managers/SoundManager.js',

    // 엔티티
    '/src/entities/Block.js',
    '/src/entities/SpecialBlocks.js',

    // 씬
    '/src/scenes/BootScene.js',
    '/src/scenes/TutorialScene.js',
    '/src/scenes/MainMenuScene.js',
    '/src/scenes/GameScene.js',
    '/src/scenes/GameOverScene.js',
    '/src/scenes/ShopScene.js',
    '/src/scenes/MuseumScene.js',
    '/src/scenes/ChallengeScene.js',
    '/src/scenes/SettingsScene.js'
];

// CDN 리소스 (런타임 캐싱)
const CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js',
    'https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js',
    'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.js',
    'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js'
];

/**
 * Service Worker 설치
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting(); // 즉시 활성화
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

/**
 * Service Worker 활성화
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // 오래된 캐시 삭제
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim(); // 모든 클라이언트 제어
            })
    );
});

/**
 * Fetch 이벤트 처리 (캐시 우선 전략)
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // CDN 리소스는 런타임 캐싱
    if (CDN_URLS.some(cdn => request.url.startsWith(cdn.split('?')[0]))) {
        event.respondWith(
            caches.open(RUNTIME_CACHE).then((cache) => {
                return cache.match(request).then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // 정적 파일은 캐시 우선
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }

                    return fetch(request)
                        .then((networkResponse) => {
                            // 성공적인 응답만 캐싱
                            if (networkResponse && networkResponse.status === 200) {
                                const responseToCache = networkResponse.clone();
                                caches.open(RUNTIME_CACHE).then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                            }
                            return networkResponse;
                        })
                        .catch((error) => {
                            console.error('[SW] Fetch failed:', error);
                            // 오프라인 폴백 페이지 (선택적)
                            return caches.match('/index.html');
                        });
                })
        );
    }
});

/**
 * 메시지 이벤트 처리
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('[SW] All caches cleared');
        });
    }
});

/**
 * 백그라운드 동기화 (선택적)
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-scores') {
        event.waitUntil(
            // 추후 서버 연동 시 점수 동기화
            Promise.resolve()
        );
    }
});

/**
 * 푸시 알림 (선택적)
 */
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '타워 스태커에 새로운 도전이 있습니다!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('타워 스태커', options)
    );
});

console.log('[SW] Service Worker loaded');
