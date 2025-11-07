# Link Keeper 기술 문서

## 🏗 기술 아키텍처

### 전체 구조
```
┌─────────────────────────────────────┐
│         User Interface              │
│    (HTML + CSS + JavaScript)        │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Application Layer              │
│  - LinkManager (비즈니스 로직)       │
│  - UIController (UI 업데이트)        │
│  - EventHandler (사용자 이벤트)      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│       Data Layer                    │
│  - StorageManager (데이터 저장)      │
│  - IndexedDB / LocalStorage         │
└─────────────────────────────────────┘
```

### 레이어 설명

#### 1. User Interface Layer
- 사용자가 직접 상호작용하는 화면
- Responsive Web Design으로 모바일 최적화
- CSS Grid/Flexbox 활용한 레이아웃
- Touch-friendly UI (44x44px 이상 터치 영역)

#### 2. Application Layer
- 비즈니스 로직 처리
- 상태 관리
- UI 업데이트 조율
- 이벤트 핸들링

#### 3. Data Layer
- 데이터 영속성 관리
- CRUD 연산 수행
- 데이터 검증 및 무결성 보장

---

## 🛠 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업, Web Components (선택)
- **CSS3**:
  - CSS Variables (테마 관리)
  - CSS Grid & Flexbox (레이아웃)
  - CSS Animations (부드러운 전환)
- **JavaScript (ES6+)**:
  - Vanilla JS (프레임워크 없이 가볍게)
  - 또는 React/Vue.js (Phase 2에서 고려)
  - Async/Await (비동기 처리)
  - Modules (코드 모듈화)

### 데이터 저장소
- **Primary**: IndexedDB
  - 대용량 데이터 저장 (수백 MB)
  - 구조화된 데이터 저장
  - 인덱싱을 통한 빠른 검색
- **Secondary**: LocalStorage
  - 설정 데이터 저장
  - 간단한 key-value 저장

### PWA 기능
- **Service Worker**: 오프라인 지원, 캐싱
- **Web App Manifest**: 홈 화면 추가, 앱처럼 실행
- **Web Share API**: 다른 앱에서 링크 받기
- **Web Share Target API**: 시스템 공유 메뉴에 등록

### 개발 도구
- **번들러**: Vite (빠른 개발 서버, HMR)
- **패키지 매니저**: npm
- **테스팅**: Jest (유닛 테스트), Playwright (E2E 테스트)
- **포맷터**: Prettier
- **린터**: ESLint

### 배포
- **호스팅**: Vercel / Netlify / GitHub Pages
- **도메인**: *.vercel.app (무료) → 커스텀 도메인 (선택)
- **HTTPS**: 필수 (PWA 요구사항)

---

## 📊 데이터 모델

### Link Entity
```javascript
{
  id: String,              // UUID v4
  url: String,             // 원본 URL (필수)
  title: String,           // 제목 (자동 추출 또는 수동 입력)
  description: String,     // 설명/메모 (선택)
  thumbnail: String,       // 썸네일 이미지 URL (선택)
  favicon: String,         // 파비콘 URL (선택)
  isRead: Boolean,         // 읽음 상태 (기본값: false)
  category: String,        // 카테고리 (선택)
  tags: Array<String>,     // 태그 목록 (선택)
  createdAt: Timestamp,    // 생성 시간
  updatedAt: Timestamp,    // 수정 시간
  readAt: Timestamp|null,  // 읽은 시간
  domain: String,          // 도메인 (자동 추출, 예: youtube.com)
  metadata: {              // 추가 메타데이터
    author: String,
    publishDate: String,
    contentType: String    // article, video, etc.
  }
}
```

### Category Entity
```javascript
{
  id: String,              // UUID v4
  name: String,            // 카테고리 이름
  icon: String,            // 이모지 또는 아이콘
  color: String,           // 색상 코드
  linkCount: Number,       // 링크 개수 (캐시)
  createdAt: Timestamp
}
```

### Settings Entity
```javascript
{
  theme: String,           // 'light' | 'dark' | 'auto'
  defaultView: String,     // 'all' | 'unread' | 'read'
  sortBy: String,          // 'date' | 'title' | 'domain'
  sortOrder: String,       // 'asc' | 'desc'
  groupBy: String,         // 'date' | 'category' | 'none'
  notifications: Boolean,
  autoExtractMetadata: Boolean
}
```

---

## 🗄 데이터베이스 설계 (IndexedDB)

### Database: LinkKeeperDB
- **Version**: 1

### Object Stores

#### 1. links
- **keyPath**: `id`
- **indexes**:
  - `url` (unique)
  - `isRead`
  - `category`
  - `createdAt`
  - `domain`

```javascript
const linksStore = db.createObjectStore('links', { keyPath: 'id' });
linksStore.createIndex('url', 'url', { unique: true });
linksStore.createIndex('isRead', 'isRead', { unique: false });
linksStore.createIndex('category', 'category', { unique: false });
linksStore.createIndex('createdAt', 'createdAt', { unique: false });
linksStore.createIndex('domain', 'domain', { unique: false });
```

#### 2. categories
- **keyPath**: `id`
- **indexes**:
  - `name` (unique)

#### 3. settings
- **keyPath**: `key`

---

## 🔌 API 설계 (내부 API)

### StorageManager API

#### Link 관련
```javascript
class StorageManager {
  // 링크 생성
  async createLink(linkData)

  // 링크 조회
  async getLink(id)
  async getAllLinks(options = { sortBy, order, filter })
  async getLinksByCategory(category)
  async getUnreadLinks()
  async getReadLinks()

  // 링크 업데이트
  async updateLink(id, updates)
  async markAsRead(id)
  async markAsUnread(id)

  // 링크 삭제
  async deleteLink(id)
  async deleteLinks(ids)

  // 검색
  async searchLinks(query)
}
```

#### Category 관련
```javascript
class StorageManager {
  async createCategory(categoryData)
  async getAllCategories()
  async updateCategory(id, updates)
  async deleteCategory(id)
}
```

#### Settings 관련
```javascript
class StorageManager {
  async getSetting(key)
  async setSetting(key, value)
  async getAllSettings()
}
```

---

## 🎨 UI 컴포넌트 구조

### 1. AppShell (전체 레이아웃)
```
<div id="app">
  <header>
    <TopBar />
  </header>

  <main>
    <FilterBar />
    <LinkList />
  </main>

  <footer>
    <BottomNav />
  </footer>

  <FloatingActionButton />
  <Modal />
  <Toast />
</div>
```

### 2. 주요 컴포넌트

#### LinkCard
```javascript
// 링크 카드 컴포넌트
class LinkCard {
  constructor(linkData) {
    this.data = linkData;
  }

  render() {
    // HTML 생성
  }

  onToggleRead() {
    // 읽음 상태 토글
  }

  onDelete() {
    // 삭제
  }

  onEdit() {
    // 편집
  }
}
```

#### LinkList
```javascript
class LinkList {
  constructor(links) {
    this.links = links;
    this.groupBy = 'date'; // 'date' | 'category' | 'none'
  }

  groupLinks() {
    // 날짜별 또는 카테고리별로 그룹화
  }

  render() {
    // 그룹화된 링크 목록 렌더링
  }

  onScroll() {
    // 무한 스크롤 (선택)
  }
}
```

#### AddLinkModal
```javascript
class AddLinkModal {
  show() {
    // 모달 표시
  }

  hide() {
    // 모달 숨김
  }

  async extractMetadata(url) {
    // URL에서 메타데이터 추출
  }

  onSubmit() {
    // 링크 저장
  }
}
```

---

## 🔍 메타데이터 추출 전략

### 방법 1: 클라이언트 사이드 추출 (기본)
```javascript
async function extractMetadata(url) {
  try {
    // CORS 이슈로 직접 fetch는 어려울 수 있음
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return {
      title: doc.querySelector('title')?.textContent,
      description: doc.querySelector('meta[name="description"]')?.content,
      thumbnail: doc.querySelector('meta[property="og:image"]')?.content,
      favicon: doc.querySelector('link[rel="icon"]')?.href
    };
  } catch (error) {
    // 실패 시 기본값 반환
    return { title: url };
  }
}
```

### 방법 2: 외부 API 사용 (대안)
- **Link Preview API**: https://www.linkpreview.net/
- **OpenGraph.io**: https://www.opengraph.io/
- **Microlink**: https://microlink.io/

단, 무료 API는 요청 제한이 있으므로 캐싱 필요

### 방법 3: 백엔드 프록시 (Phase 3+)
- CORS 우회를 위한 자체 백엔드 구축
- 메타데이터 캐싱으로 성능 향상

---

## 🚀 성능 최적화

### 1. 데이터 로딩
- **Lazy Loading**: 스크롤 시 점진적으로 로드
- **Virtual Scrolling**: 대량 데이터 처리 시 (Phase 2)
- **Pagination**: 페이지 단위 로딩

### 2. 이미지 최적화
- **Lazy Image Loading**: Intersection Observer 활용
- **Placeholder**: 썸네일 로딩 중 스켈레톤 UI
- **CDN**: 외부 이미지는 캐싱

### 3. 캐싱 전략
```javascript
// Service Worker 캐싱
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 4. 번들 최적화
- **Code Splitting**: 라우트별 코드 분할
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Minification**: CSS/JS 압축

---

## 🔐 보안 고려사항

### 1. XSS 방지
```javascript
// 사용자 입력 sanitize
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### 2. URL 검증
```javascript
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
```

### 3. HTTPS 강제
- PWA는 HTTPS 필수
- Mixed Content 방지

### 4. CSP (Content Security Policy)
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; img-src 'self' https:; script-src 'self'">
```

---

## 📱 PWA 구현

### 1. Service Worker
```javascript
// sw.js
const CACHE_NAME = 'link-keeper-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/src/app.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // 오래된 캐시 정리
});

self.addEventListener('fetch', (event) => {
  // 캐시 우선 전략
});
```

### 2. Web App Manifest
```json
{
  "name": "Link Keeper",
  "short_name": "LinkKeeper",
  "description": "모바일 링크 관리 앱",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3. 설치 프롬프트
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // 설치 버튼 표시
});

// 사용자가 설치 버튼 클릭 시
btnInstall.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    deferredPrompt = null;
  }
});
```

---

## 🧪 테스트 전략

### 1. 유닛 테스트
```javascript
// StorageManager 테스트
describe('StorageManager', () => {
  test('should create a link', async () => {
    const link = await storageManager.createLink({
      url: 'https://example.com',
      title: 'Example'
    });
    expect(link.id).toBeDefined();
    expect(link.url).toBe('https://example.com');
  });

  test('should mark link as read', async () => {
    const link = await storageManager.createLink({ url: 'https://test.com' });
    await storageManager.markAsRead(link.id);
    const updated = await storageManager.getLink(link.id);
    expect(updated.isRead).toBe(true);
  });
});
```

### 2. E2E 테스트
```javascript
// Playwright 테스트
test('should add and display a link', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="add-link-btn"]');
  await page.fill('[data-testid="url-input"]', 'https://example.com');
  await page.click('[data-testid="save-btn"]');
  await expect(page.locator('text=example.com')).toBeVisible();
});
```

### 3. 브라우저 호환성 테스트
- Chrome (Android)
- Safari (iOS)
- Firefox Mobile
- Samsung Internet

---

## 📈 모니터링 및 분석

### 1. 성능 모니터링
```javascript
// Performance API
window.addEventListener('load', () => {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page load time:', pageLoadTime);
});
```

### 2. 에러 트래킹
```javascript
window.addEventListener('error', (event) => {
  // 에러 로그 전송 (예: Sentry)
  console.error('Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

### 3. 사용자 분석 (선택)
- Google Analytics 4
- Plausible (프라이버시 중심)
- 자체 구축

---

## 🔧 개발 환경 설정

### 프로젝트 구조
```
link-keeper/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── LinkCard.js
│   │   ├── LinkList.js
│   │   ├── AddLinkModal.js
│   │   └── ...
│   ├── managers/
│   │   ├── StorageManager.js
│   │   ├── UIController.js
│   │   └── LinkManager.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── metadata.js
│   ├── styles/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   └── main.css
│   ├── app.js
│   └── main.js
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
│   ├── PROJECT_PLAN.md
│   └── TECH_SPEC.md
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

### package.json
```json
{
  "name": "link-keeper",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "jest": "^29.0.0",
    "playwright": "^1.40.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🚢 배포 전략

### 1. Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### 2. GitHub Pages 배포
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 📝 다음 단계

1. ✅ 프로젝트 초기 설정
2. ⏳ 기본 UI 레이아웃 구현
3. ⏳ IndexedDB 연동 및 CRUD 구현
4. ⏳ 링크 추가/목록/삭제 기능
5. ⏳ PWA 기능 추가
6. ⏳ 배포 및 테스트

---

**최종 업데이트**: 2025-11-07
**버전**: 1.0
**작성자**: CodeLab Team
