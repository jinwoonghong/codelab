# Link Keeper - 개발 가이드

## 개발 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 자동으로 열립니다.

### 3. 빌드
```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 4. 프리뷰
```bash
npm run preview
```

## PWA 테스트

### 로컬 HTTPS 테스트
PWA 기능(특히 Web Share Target API)은 HTTPS 환경에서만 작동합니다.

로컬에서 HTTPS로 테스트하려면:

1. **ngrok 사용** (추천)
```bash
# ngrok 설치 후
npm run dev

# 다른 터미널에서
ngrok http 5173
```

2. **Vercel/Netlify 배포**
```bash
# Vercel CLI로 배포
vercel --prod
```

### Web Share Target API 테스트

1. PWA 설치 (홈 화면에 추가)
2. 다른 앱 (유튜브, 크롬 등)에서 링크 공유
3. 공유 시트에서 "Link Keeper" 선택
4. 링크 저장 확인

## 프로젝트 구조

```
link-keeper/
├── public/
│   ├── icons/           # 앱 아이콘
│   ├── manifest.json    # PWA 매니페스트 (share_target!)
│   └── sw.js           # Service Worker
├── src/
│   ├── managers/
│   │   └── storage-manager.js  # IndexedDB 관리
│   ├── handlers/
│   │   └── share-handler.js    # 공유 데이터 처리
│   ├── components/
│   │   └── link-card.js        # UI 컴포넌트
│   ├── utils/
│   │   └── formatters.js       # 유틸리티
│   └── app.js                  # 메인 앱 로직
├── styles/
│   ├── variables.css   # CSS 변수
│   ├── reset.css       # CSS 리셋
│   └── main.css        # 메인 스타일
├── index.html          # 메인 페이지
├── share-confirm.html  # 공유 확인 페이지
└── vite.config.js     # Vite 설정
```

## 주요 기능

### 1. Web Share Target API
- `public/manifest.json`의 `share_target` 설정
- `public/sw.js`에서 POST /share 요청 처리
- `share-confirm.html`에서 저장 확인

### 2. IndexedDB
- 4개 object stores: links, sharedData, categories, settings
- `StorageManager`로 CRUD 연산

### 3. Service Worker
- 앱 셸 캐싱
- 공유 데이터 수신 및 임시 저장
- 오프라인 지원

## 디버깅

### Chrome DevTools
1. F12로 개발자 도구 열기
2. Application 탭
   - Manifest: PWA 설정 확인
   - Service Workers: SW 상태 확인
   - IndexedDB: 데이터 확인
3. Console 탭: 로그 확인

### Service Worker 디버깅
```javascript
// sw.js에 console.log 추가
console.log('[Service Worker] 메시지');
```

Chrome DevTools > Application > Service Workers에서 로그 확인

### IndexedDB 확인
Chrome DevTools > Application > IndexedDB > LinkKeeperDB

## 트러블슈팅

### Service Worker가 등록되지 않음
- HTTPS 환경인지 확인
- `public/sw.js` 경로 확인
- 브라우저 콘솔 에러 확인

### Web Share Target이 작동하지 않음
- PWA 설치 여부 확인
- `manifest.json`의 `share_target` 설정 확인
- HTTPS 환경 확인 (로컬에서는 ngrok 사용)

### IndexedDB 에러
- 브라우저 시크릿 모드에서는 IndexedDB 제한됨
- 브라우저 설정에서 쿠키/데이터 허용 확인

## 다음 단계

- [ ] 실제 앱 아이콘 제작 (192x192, 512x512)
- [ ] 카테고리 기능 추가
- [ ] 검색 기능 추가
- [ ] 다크 모드 구현
- [ ] 테스트 코드 작성

