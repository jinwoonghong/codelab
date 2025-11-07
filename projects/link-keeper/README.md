# Link Keeper 🔗

> 모바일 웹 탐색 중 발견한 링크를 **공유 버튼 한 번**으로 저장하고 체계적으로 관리하는 PWA

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🌟 핵심 가치

### "공유 버튼만 누르면 끝!"

- **2초 저장**: 유튜브, 크롬 등 어떤 앱에서든 공유 → Link Keeper → 완료
- **앱 전환 없음**: 흐름이 끊기지 않고 빠르게 저장
- **시스템 통합**: 카카오톡, 메시지와 나란히 있는 네이티브 경험 🔥
- **자동 정리**: 날짜별 그룹화, 읽음/안 읽음 구분
- **완전 오프라인**: 설치 후 인터넷 없어도 작동
- **계정 불필요**: 로그인 없이 바로 사용

## 📱 사용 시나리오

```
1. 유튜브 앱에서 재미있는 영상 발견
   ↓
2. [공유 버튼] 탭 → "Link Keeper" 선택
   ↓
3. Link Keeper 앱 자동 열림 (제목, URL 표시)
   ↓
4. [저장] 버튼 탭
   ↓
5. 저장 완료! 원래 앱으로 자동 복귀
   ↓
6. 나중에 Link Keeper 열어서 편하게 확인
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18+
- 모던 브라우저 (Chrome, Safari, Firefox)

### 로컬 개발

```bash
# 레포지토리 클론
git clone https://github.com/jinwoonghong/codelab.git
cd codelab/projects/link-keeper

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173

# 빌드
npm run build
```

### PWA 테스트 (HTTPS 필수)

Web Share Target API는 HTTPS 환경에서만 작동합니다.

**옵션 1: Vercel 배포 (추천)**
```bash
npm i -g vercel
vercel --prod
# → 자동 HTTPS
```

**옵션 2: ngrok으로 로컬 HTTPS**
```bash
# 터미널 1
npm run dev

# 터미널 2
ngrok http 5173
# → https://xxxx.ngrok.io
```

## 🛠 기술 스택

- **Frontend**: Vanilla JavaScript (ES6+ Modules)
- **데이터 저장**: IndexedDB
- **PWA**: Service Worker, Web App Manifest, **Web Share Target API** 🔥
- **빌드 도구**: Vite
- **배포**: Vercel / Netlify

## ✅ 구현된 기능

### Phase 1: MVP ✅
- ✅ **Web Share Target API** - 시스템 공유 메뉴 통합 (핵심!)
- ✅ **공유받기 및 저장** - 다른 앱에서 링크 자동 저장
- ✅ **링크 목록** - 날짜별 자동 그룹화
- ✅ **읽음/안 읽음 관리** - 상태 토글 및 시각적 구분
- ✅ **필터링** - 전체/안읽음/읽음 탭
- ✅ **링크 삭제** - 개별 삭제
- ✅ **앱 내 추가** - 수동으로도 추가 가능 (보조)
- ✅ **완전 오프라인** - Service Worker 캐싱

### Phase 2: 계획 중 🚧
- ⏳ 카테고리/태그 시스템
- ⏳ 검색 기능
- ⏳ 링크 편집
- ⏳ 다크 모드
- ⏳ 통계 대시보드

### Phase 3: 향후 📅
- ⏳ 대량 작업 (일괄 처리)
- ⏳ 데이터 내보내기/가져오기
- ⏳ 브라우저 확장 프로그램

### Phase 4: 프리미엄 💡
- ⏳ 클라우드 동기화
- ⏳ AI 요약 기능

## 📁 프로젝트 구조

```
link-keeper/
├── public/
│   ├── icons/              # 앱 아이콘
│   ├── manifest.json       # PWA 매니페스트 (share_target!)
│   └── sw.js              # Service Worker
├── src/
│   ├── managers/
│   │   └── storage-manager.js    # IndexedDB 관리
│   ├── handlers/
│   │   └── share-handler.js      # 공유 데이터 처리
│   ├── components/
│   │   └── link-card.js          # UI 컴포넌트
│   ├── utils/
│   │   └── formatters.js         # 유틸리티
│   └── app.js                    # 메인 앱 로직
├── styles/                        # CSS
├── index.html                     # 홈 페이지
├── share-confirm.html             # 공유 확인 페이지
└── vite.config.js                 # Vite 설정
```

## 🔍 핵심 구현: Web Share Target API

### 1. manifest.json
```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### 2. Service Worker (sw.js)
```javascript
self.addEventListener('fetch', (event) => {
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleShare(event.request));
  }
});
```

### 3. 공유 데이터 처리
- POST /share로 공유 데이터 수신
- IndexedDB에 임시 저장
- share-confirm.html로 리다이렉트
- 사용자 확인 후 최종 저장

## 🎯 차별화 포인트

| 기존 솔루션 | 단점 | Link Keeper |
|------------|------|-------------|
| 브라우저 북마크 | 공유 못 받음, 앱 전환 필요 | ✅ 시스템 공유 메뉴 통합 |
| Pocket | 무겁고 복잡, 계정 필요 | ✅ 가볍고 간단, 로컬 저장 |
| 카카오톡 나와의 채팅 | 검색/관리 어려움 | ✅ 링크 전용 관리 |
| 메모 앱 | 링크에 특화 안 됨 | ✅ 메타데이터 자동 추출 |

## 📱 지원 플랫폼

- ✅ Android Chrome (Web Share Target 완벽 지원)
- ✅ iOS Safari 16.4+ (Web Share Target 지원)
- ✅ Desktop Chrome (테스트용)

## 💡 사용 방법

### 1. PWA 설치
1. 배포된 사이트 방문 (HTTPS)
2. "홈 화면에 추가" 선택
3. 앱 아이콘으로 실행

### 2. 공유로 링크 저장 (메인 방식)
1. 유튜브, 크롬 등 아무 앱에서 [공유] 버튼
2. "Link Keeper" 선택
3. 자동으로 제목/URL 표시, 메모 추가 (선택)
4. [저장] 버튼
5. 완료!

### 3. 앱 내에서 직접 추가 (보조 방식)
1. Link Keeper 앱 열기
2. 우측 하단 [+] 버튼
3. URL 입력
4. 저장

### 4. 링크 관리
- **필터링**: 전체/안읽음/읽음 탭
- **읽음 처리**: 링크 카드의 ○/✓ 아이콘 탭
- **링크 열기**: 카드 탭 → 새 탭에서 열림
- **삭제**: 카드 롱프레스 또는 확인 후 삭제

## 📚 문서

- [프로젝트 기획서](./docs/PROJECT_PLAN.md) - 상세 기획 및 사용자 시나리오
- [기술 문서](./docs/TECH_SPEC.md) - 아키텍처 및 구현 가이드
- [기능 리스트](./docs/FEATURES.md) - Phase별 기능 명세
- [개발 가이드](./README_DEV.md) - 개발 환경 설정

## 🐛 알려진 제한사항

- **HTTPS 필수**: PWA 기능은 HTTPS 환경에서만 작동
- **PWA 설치 필수**: 공유 받기 기능은 앱 설치 후 사용 가능
- **일부 앱 제한**: 일부 앱에서는 공유 시 URL이 텍스트로 전달될 수 있음
- **CORS 제한**: 외부 사이트 메타데이터 추출 제한

## 🚀 배포

### Vercel (추천)
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

## 📅 개발 기간

- **시작일**: 2025-11-07
- **MVP 완료**: 2025-11-07 ✅
- **Phase 2 목표**: 2025-11-21

## 🗺 로드맵

- **v0.1.0** (현재): MVP 완료 ✅
- **v0.2.0**: 카테고리 및 검색
- **v0.3.0**: 다크 모드 및 통계
- **v1.0.0**: 정식 릴리스

## 🤝 기여

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 만들어졌습니다.
피드백은 Issues를 통해 남겨주세요!

## 📄 라이선스

MIT License

---

**제작**: CodeLab Team
**최종 수정**: 2025-11-07
**버전**: 0.1.0 (MVP)
