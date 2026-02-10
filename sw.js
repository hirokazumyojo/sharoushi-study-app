// Service Worker for PWA
const CACHE_NAME = 'sharoushi-navi-v4';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data.js',
    './manifest.json',
    './questions.json',
    './kudo_project_schedule.ics'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
    );
});

// リクエスト時にキャッシュから返す
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // questions.json は stale-while-revalidate（キャッシュを返しつつ裏で更新）
    if (url.pathname.endsWith('/questions.json')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cached => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(() => cached);

                    return cached || fetchPromise;
                });
            })
        );
        return;
    }

    // その他はキャッシュ優先
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
