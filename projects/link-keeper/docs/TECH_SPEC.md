# Link Keeper 기술 문서

## 🏗 기술 아키텍처 (공유 중심 설계)

### 전체 구조
```
┌─────────────────────────────────────┐
│      외부 앱 (유튜브, 크롬 등)        │
│         [공유 버튼] 클릭             │
└────────────┬────────────────────────┘
             │
             │ Web Share API
             ↓
┌─────────────────────────────────────┐
│       Service Worker                │
│  - 공유 데이터 수신 (/share)         │
│  - 임시 저장 (IndexedDB)             │
│  - /share-confirm으로 리다이렉트     │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│      Link Keeper App (PWA)          │
│  ┌─────────────────────────────┐    │
│  │ Share Confirm Screen        │    │
│  │ - URL, 제목 표시            │    │
│  │ - 메모 입력 (선택)          │    │
│  │ - 저장 버튼                 │    │
│  └────────┬────────────────────┘    │
│           │                         │
│  ┌────────▼────────────────────┐    │
│  │ Application Layer           │    │
│  │ - LinkManager               │    │
│  │ - UIController              │    │
│  └────────┬────────────────────┘    │
│           │                         │
│  ┌────────▼────────────────────┐    │
│  │ Data Layer (IndexedDB)      │    │
│  │ - links store               │    │
│  │ - categories store          │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 공유 데이터 플로우

```
1. [외부 앱] 공유 버튼 → "Link Keeper" 선택
   ↓
2. [OS] Web Share Target API 호출
   → POST /share {title, url, text}
   ↓
3. [Service Worker] fetch 이벤트 캐치
   - formData 파싱
   - sharedData를 임시 IndexedDB에 저장
   - Response.redirect('/share-confirm', 303)
   ↓
4. [App] /share-confirm 페이지 열림
   - 임시 저장된 공유 데이터 로드
   - UI에 표시 (제목, URL, 썸네일 등)
   - 사용자가 메모 추가 (선택)
   ↓
5. [User] 저장 버튼 클릭
   ↓
6. [App] IndexedDB links store에 최종 저장
   - 메타데이터 추출 (비동기)
   - 링크 객체 생성
   - 저장 완료 토스트
   ↓
7. [OS] 원래 앱으로 복귀
```

---

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**:
  - CSS Variables (테마 관리)
  - CSS Grid & Flexbox (레이아웃)
  - CSS Transitions (부드러운 애니메이션)
- **JavaScript (ES6+)**:
  - Vanilla JS (가볍게)
  - Async/Await (비동기 처리)
  - ES Modules (코드 모듈화)

### PWA 핵심 기술 (MVP 필수!)
- **Service Worker**:
  - 오프라인 지원
  - 공유 데이터 수신 및 처리
  - 캐싱 전략
- **Web App Manifest**:
  - 홈 화면 추가
  - **share_target 설정 (핵심!)**
  - 앱 아이콘 및 테마
- **Web Share Target API**:
  - 시스템 공유 메뉴 통합
  - 다른 앱에서 링크 수신

### 데이터 저장소
- **Primary**: IndexedDB
  - links: 링크 데이터 (제목, URL, 메타데이터 등)
  - sharedData: 공유받은 임시 데이터
  - categories: 카테고리 정보
- **Secondary**: LocalStorage
  - 설정 데이터
  - 간단한 key-value

### 개발 도구
- **번들러**: Vite (빠른 개발 서버)
- **패키지 매니저**: npm
- **테스팅**: Jest (유닛), Playwright (E2E)
- **린터**: ESLint + Prettier

### 배포
- **호스팅**: Vercel / Netlify
- **HTTPS**: 필수 (PWA 요구사항)
- **도메인**: *.vercel.app → 커스텀 도메인

---

## 📊 데이터 모델

### Link Entity
```javascript
{
  id: String,              // UUID v4
  url: String,             // 원본 URL (필수, unique)
  title: String,           // 제목
  description: String,     // 설명/메모
  thumbnail: String,       // 썸네일 이미지 URL
  favicon: String,         // 파비콘 URL
  domain: String,          // 도메인 (예: youtube.com)

  isRead: Boolean,         // 읽음 상태 (기본: false)
  category: String,        // 카테고리 ID (선택)
  tags: Array<String>,     // 태그 목록

  createdAt: Timestamp,    // 저장 시간
  updatedAt: Timestamp,    // 수정 시간
  readAt: Timestamp|null,  // 읽은 시간

  // 공유받은 경우
  sharedFrom: String,      // 'share-api' | 'manual'
  sharedText: String,      // 공유 시 전달된 텍스트

  metadata: {
    author: String,
    publishDate: String,
    contentType: String,   // 'article' | 'video' | 'image' | 'other'
    duration: Number       // 동영상 길이 (초)
  }
}
```

### SharedData Entity (임시 저장)
```javascript
{
  id: String,              // 임시 ID
  url: String,
  title: String,
  text: String,
  timestamp: Timestamp,    // 공유받은 시간
  processed: Boolean       // 처리 완료 여부
}
```

### Category Entity
```javascript
{
  id: String,
  name: String,
  icon: String,            // 이모지
  color: String,           // HEX 색상
  linkCount: Number,       // 캐시된 링크 수
  createdAt: Timestamp
}
```

---

## 🗄 IndexedDB 설계

### Database: LinkKeeperDB (version 1)

```javascript
const DB_NAME = 'LinkKeeperDB';
const DB_VERSION = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. links store
      if (!db.objectStoreNames.contains('links')) {
        const linksStore = db.createObjectStore('links', { keyPath: 'id' });
        linksStore.createIndex('url', 'url', { unique: true });
        linksStore.createIndex('isRead', 'isRead', { unique: false });
        linksStore.createIndex('createdAt', 'createdAt', { unique: false });
        linksStore.createIndex('domain', 'domain', { unique: false });
        linksStore.createIndex('category', 'category', { unique: false });
      }

      // 2. sharedData store (임시 저장)
      if (!db.objectStoreNames.contains('sharedData')) {
        const sharedStore = db.createObjectStore('sharedData', { keyPath: 'id' });
        sharedStore.createIndex('processed', 'processed', { unique: false });
        sharedStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 3. categories store
      if (!db.objectStoreNames.contains('categories')) {
        const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
        categoriesStore.createIndex('name', 'name', { unique: true });
      }

      // 4. settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
};
```

---

## 🚀 핵심 구현: Web Share Target API

### 1. manifest.json 설정

```json
{
  "name": "Link Keeper",
  "short_name": "LinkKeeper",
  "description": "모바일 링크 관리 PWA",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait-primary",

  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],

  // 🔥 핵심: Web Share Target 설정
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "application/x-www-form-urlencoded",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### 2. Service Worker 구현

```javascript
// sw.js
const CACHE_NAME = 'link-keeper-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/share-confirm.html',
  '/styles/main.css',
  '/src/app.js',
  '/manifest.json'
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
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
    event.respondWith(handleShare(event.request));
    return;
  }

  // 일반 fetch 요청: 캐시 우선 전략
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
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

    // IndexedDB에 임시 저장
    const sharedData = {
      id: crypto.randomUUID(),
      url: url || text, // URL이 없으면 text에서 추출 시도
      title: title,
      text: text,
      timestamp: Date.now(),
      processed: false
    };

    // IndexedDB 저장
    await saveSharedData(sharedData);

    // 공유 확인 페이지로 리다이렉트
    return Response.redirect('/share-confirm?id=' + sharedData.id, 303);
  } catch (error) {
    console.error('Error handling share:', error);
    return Response.redirect('/', 303);
  }
}

// IndexedDB 저장 함수 (Service Worker 내)
async function saveSharedData(data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LinkKeeperDB', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['sharedData'], 'readwrite');
      const store = transaction.objectStore('sharedData');
      const addRequest = store.add(data);

      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}
```

### 3. 앱에서 공유 데이터 처리

```javascript
// src/share-handler.js
class ShareHandler {
  constructor(storageManager, uiController) {
    this.storage = storageManager;
    this.ui = uiController;
  }

  // 공유받은 데이터 로드
  async loadSharedData(shareId) {
    const sharedData = await this.storage.getSharedData(shareId);

    if (!sharedData || sharedData.processed) {
      return null;
    }

    return {
      url: this.extractURL(sharedData.url || sharedData.text),
      title: sharedData.title,
      text: sharedData.text
    };
  }

  // URL 추출 (text에서)
  extractURL(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : text;
  }

  // 메타데이터 추출 (비동기)
  async fetchMetadata(url) {
    try {
      // CORS 이슈로 직접 fetch는 어려울 수 있음
      // 대안: Open Graph Scraper API 또는 자체 백엔드 프록시

      // 간단한 방법: URL에서 도메인과 파비콘만 추출
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

      return {
        domain,
        favicon,
        title: null,  // 사용자가 입력한 title 사용
        thumbnail: null
      };
    } catch (error) {
      return {
        domain: new URL(url).hostname,
        favicon: null,
        title: null,
        thumbnail: null
      };
    }
  }

  // 링크 저장
  async saveLink(data) {
    const { url, title, note, category } = data;

    // 메타데이터 추출
    const metadata = await this.fetchMetadata(url);

    // 링크 객체 생성
    const link = {
      id: crypto.randomUUID(),
      url,
      title: title || metadata.title || url,
      description: note || '',
      thumbnail: metadata.thumbnail,
      favicon: metadata.favicon,
      domain: metadata.domain,
      isRead: false,
      category: category || null,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      readAt: null,
      sharedFrom: 'share-api',
      sharedText: data.originalText || '',
      metadata: {
        author: null,
        publishDate: null,
        contentType: this.detectContentType(url),
        duration: null
      }
    };

    // IndexedDB에 저장
    await this.storage.createLink(link);

    // 공유 데이터를 처리 완료로 표시
    if (data.shareId) {
      await this.storage.markSharedDataProcessed(data.shareId);
    }

    return link;
  }

  // 콘텐츠 타입 감지
  detectContentType(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'video';
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'social';
    }
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return 'image';
    }
    return 'article';
  }
}

export default ShareHandler;
```

### 4. 공유 확인 페이지 (share-confirm.html)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>링크 저장 - Link Keeper</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <div class="share-confirm-container">
    <header>
      <button id="cancel-btn" class="back-btn">취소</button>
      <h1>링크 저장</h1>
    </header>

    <main>
      <div class="preview-card">
        <img id="preview-thumbnail" class="thumbnail" src="" alt="" />
        <div class="preview-content">
          <h2 id="preview-title">제목 로딩 중...</h2>
          <p id="preview-url" class="url"></p>
        </div>
      </div>

      <form id="save-form">
        <div class="form-group">
          <label for="note-input">메모 (선택)</label>
          <textarea
            id="note-input"
            rows="3"
            placeholder="이 링크에 대한 메모를 추가하세요..."></textarea>
        </div>

        <div class="form-group">
          <label for="category-select">카테고리 (선택)</label>
          <select id="category-select">
            <option value="">카테고리 없음</option>
            <!-- 동적으로 추가 -->
          </select>
        </div>

        <button type="submit" class="btn-primary">저장</button>
      </form>
    </main>
  </div>

  <script type="module">
    import ShareHandler from '/src/share-handler.js';
    import StorageManager from '/src/storage-manager.js';
    import UIController from '/src/ui-controller.js';

    // 초기화
    const storage = new StorageManager();
    const ui = new UIController();
    const shareHandler = new ShareHandler(storage, ui);

    // URL에서 shareId 추출
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('id');

    // 공유 데이터 로드 및 표시
    async function init() {
      if (!shareId) {
        window.location.href = '/';
        return;
      }

      const sharedData = await shareHandler.loadSharedData(shareId);

      if (!sharedData) {
        window.location.href = '/';
        return;
      }

      // UI 업데이트
      document.getElementById('preview-title').textContent = sharedData.title || '제목 없음';
      document.getElementById('preview-url').textContent = sharedData.url;

      // 메타데이터 가져오기
      const metadata = await shareHandler.fetchMetadata(sharedData.url);
      if (metadata.thumbnail) {
        document.getElementById('preview-thumbnail').src = metadata.thumbnail;
      }

      // 카테고리 목록 로드
      const categories = await storage.getAllCategories();
      const select = document.getElementById('category-select');
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        select.appendChild(option);
      });
    }

    // 폼 제출
    document.getElementById('save-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const sharedData = await shareHandler.loadSharedData(shareId);
      const note = document.getElementById('note-input').value;
      const category = document.getElementById('category-select').value;

      try {
        await shareHandler.saveLink({
          url: sharedData.url,
          title: sharedData.title,
          note,
          category,
          shareId,
          originalText: sharedData.text
        });

        // 저장 완료 → 홈으로
        window.location.href = '/?saved=true';
      } catch (error) {
        alert('저장 실패: ' + error.message);
      }
    });

    // 취소 버튼
    document.getElementById('cancel-btn').addEventListener('click', () => {
      window.location.href = '/';
    });

    // 초기화 실행
    init();
  </script>
</body>
</html>
```

---

## 🔌 StorageManager API

```javascript
// src/storage-manager.js
class StorageManager {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    this.db = await this.openDB();
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LinkKeeperDB', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('links')) {
          const linksStore = db.createObjectStore('links', { keyPath: 'id' });
          linksStore.createIndex('url', 'url', { unique: true });
          linksStore.createIndex('isRead', 'isRead', { unique: false });
          linksStore.createIndex('createdAt', 'createdAt', { unique: false });
          linksStore.createIndex('domain', 'domain', { unique: false });
        }

        if (!db.objectStoreNames.contains('sharedData')) {
          const sharedStore = db.createObjectStore('sharedData', { keyPath: 'id' });
          sharedStore.createIndex('processed', 'processed', { unique: false });
        }

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // === Link 관련 ===

  async createLink(linkData) {
    const transaction = this.db.transaction(['links'], 'readwrite');
    const store = transaction.objectStore('links');
    return new Promise((resolve, reject) => {
      const request = store.add(linkData);
      request.onsuccess = () => resolve(linkData);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllLinks(filter = 'all', sortBy = 'createdAt', order = 'desc') {
    const transaction = this.db.transaction(['links'], 'readonly');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        let links = request.result;

        // 필터링
        if (filter === 'unread') {
          links = links.filter(link => !link.isRead);
        } else if (filter === 'read') {
          links = links.filter(link => link.isRead);
        }

        // 정렬
        links.sort((a, b) => {
          if (order === 'desc') {
            return b[sortBy] - a[sortBy];
          } else {
            return a[sortBy] - b[sortBy];
          }
        });

        resolve(links);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getLink(id) {
    const transaction = this.db.transaction(['links'], 'readonly');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateLink(id, updates) {
    const link = await this.getLink(id);
    if (!link) throw new Error('Link not found');

    const updatedLink = {
      ...link,
      ...updates,
      updatedAt: Date.now()
    };

    const transaction = this.db.transaction(['links'], 'readwrite');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.put(updatedLink);
      request.onsuccess = () => resolve(updatedLink);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsRead(id) {
    return this.updateLink(id, {
      isRead: true,
      readAt: Date.now()
    });
  }

  async markAsUnread(id) {
    return this.updateLink(id, {
      isRead: false,
      readAt: null
    });
  }

  async deleteLink(id) {
    const transaction = this.db.transaction(['links'], 'readwrite');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // === SharedData 관련 ===

  async getSharedData(id) {
    const transaction = this.db.transaction(['sharedData'], 'readonly');
    const store = transaction.objectStore('sharedData');

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markSharedDataProcessed(id) {
    const sharedData = await this.getSharedData(id);
    if (!sharedData) return;

    sharedData.processed = true;

    const transaction = this.db.transaction(['sharedData'], 'readwrite');
    const store = transaction.objectStore('sharedData');

    return new Promise((resolve, reject) => {
      const request = store.put(sharedData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // === Category 관련 ===

  async getAllCategories() {
    const transaction = this.db.transaction(['categories'], 'readonly');
    const store = transaction.objectStore('categories');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export default StorageManager;
```

---

## 📱 PWA 설치 프롬프트

```javascript
// src/install-prompt.js
class InstallPrompt {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA가 설치되었습니다!');
      this.hideInstallButton();
    });
  }

  showInstallButton() {
    const btn = document.getElementById('install-btn');
    if (btn) {
      btn.style.display = 'block';
      btn.addEventListener('click', () => this.promptInstall());
    }
  }

  hideInstallButton() {
    const btn = document.getElementById('install-btn');
    if (btn) btn.style.display = 'none';
  }

  async promptInstall() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);
    this.deferredPrompt = null;
  }

  // 설치 여부 확인
  isInstalled() {
    // Standalone 모드인지 확인
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }
}

export default InstallPrompt;
```

---

## 🔒 보안 고려사항

### 1. XSS 방지
```javascript
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 사용 예
linkTitle.textContent = sanitizeHTML(userInput);
```

### 2. URL 검증
```javascript
function isValidURL(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
```

### 3. HTTPS 강제
- manifest.json의 `start_url`과 `scope`는 HTTPS 필수
- Vercel/Netlify는 자동으로 HTTPS 제공

### 4. CSP (Content Security Policy)
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               img-src 'self' https:;
               style-src 'self' 'unsafe-inline';
               script-src 'self';">
```

---

## 📈 성능 최적화

### 1. Service Worker 캐싱 전략

```javascript
// Network First (공유 데이터)
if (url.pathname === '/share') {
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/offline.html'))
  );
}

// Cache First (정적 자산)
if (url.pathname.startsWith('/styles/') || url.pathname.startsWith('/icons/')) {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
}
```

### 2. IndexedDB 최적화

- **인덱스 활용**: isRead, createdAt 인덱스로 빠른 필터링
- **배치 작업**: transaction 재사용
- **Cursor 사용**: 대량 데이터 처리 시

```javascript
async function getLinksPaginated(offset, limit) {
  const transaction = this.db.transaction(['links'], 'readonly');
  const store = transaction.objectStore('links');
  const index = store.index('createdAt');

  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;

    const request = index.openCursor(null, 'prev'); // 최신순

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (!cursor || count >= offset + limit) {
        resolve(results);
        return;
      }

      if (count >= offset) {
        results.push(cursor.value);
      }

      count++;
      cursor.continue();
    };

    request.onerror = () => reject(request.error);
  });
}
```

---

## 🧪 테스트 전략

### 1. Web Share Target API 테스트

```javascript
// 수동 테스트 방법
// 1. HTTPS 환경에서 PWA 설치
// 2. 다른 앱에서 링크 공유 → Link Keeper 선택
// 3. 확인 화면이 뜨는지 확인
// 4. 저장 후 목록에 표시되는지 확인

// 자동 테스트 (Playwright)
test('should handle shared link', async ({ page, context }) => {
  // PWA 설치
  await page.goto('https://link-keeper.vercel.app');
  await page.click('#install-btn');

  // 공유 시뮬레이션 (POST /share)
  const response = await page.request.post('/share', {
    form: {
      url: 'https://example.com',
      title: 'Example Title',
      text: 'Example text'
    }
  });

  expect(response.status()).toBe(303);
  expect(response.headers()['location']).toContain('/share-confirm');
});
```

---

## 📦 프로젝트 구조

```
link-keeper/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.json          # PWA manifest (share_target!)
│   └── sw.js                  # Service Worker
│
├── src/
│   ├── managers/
│   │   └── storage-manager.js
│   ├── handlers/
│   │   └── share-handler.js   # 공유 처리 로직
│   ├── components/
│   │   ├── link-card.js
│   │   └── link-list.js
│   ├── utils/
│   │   ├── validators.js
│   │   └── formatters.js
│   └── app.js
│
├── styles/
│   ├── variables.css
│   ├── reset.css
│   └── main.css
│
├── index.html                 # 메인 페이지
├── share-confirm.html         # 공유 확인 페이지 (핵심!)
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 배포

### Vercel 배포 (추천)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
vercel --prod

# 3. 자동 HTTPS 적용됨
# 4. PWA 설치 테스트
```

### vercel.json 설정

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

---

## 📝 다음 단계

### MVP 개발 순서

1. ✅ 프로젝트 초기 설정
2. ⏳ PWA 설정 (manifest.json, Service Worker)
3. ⏳ Web Share Target API 구현
4. ⏳ IndexedDB 연동
5. ⏳ 공유 확인 화면
6. ⏳ 링크 목록 화면
7. ⏳ 읽음/안 읽음 관리
8. ⏳ 테스트 및 배포

---

**최종 업데이트**: 2025-11-07
**버전**: 2.0 (공유 중심 설계)
**작성자**: CodeLab Team
