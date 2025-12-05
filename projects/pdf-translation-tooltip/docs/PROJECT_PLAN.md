# PDF Translation Tooltip 프로젝트 기획서

## 프로젝트 개요

### 프로젝트명
**PDF Translation Tooltip** (PDF 번역 툴팁)

### 한 줄 설명
브라우저에서 PDF를 열고 텍스트를 드래그하면 즉시 번역 툴팁이 뜨는 Chrome 확장 프로그램

### 배경 및 문제점
- 구글 학술검색, arXiv 등에서 PDF를 브라우저로 바로 열어서 읽음
- 모르는 단어가 나오면 새 탭에서 번역기를 열어야 함
- 복사 → 탭 전환 → 붙여넣기 → 번역 확인 → 다시 탭 전환... 너무 번거로움
- 기존 번역 확장 프로그램은 일반 웹페이지에선 잘 되는데 **PDF에서 안 됨**

### 해결 방안
**"브라우저에서 PDF 열고, 드래그만 하면 번역 끝!"**

1. Chrome 확장 프로그램 설치 (한 번만)
2. 브라우저에서 PDF 열기 (구글 학술검색, 직접 URL 등)
3. 모르는 단어/문장 드래그
4. 툴팁으로 즉시 한국어 번역 표시

→ **탭 전환 없이, 현재 PDF에서 바로 번역**

### 목표
- **즉시 번역**: 드래그 → 툴팁 (1초 이내)
- **PDF 특화**: 브라우저 PDF 뷰어에서 완벽 동작
- **심플한 UI**: 툴팁 하나, 그게 전부
- **무료**: 무료 번역 API 활용

---

## 타겟 사용자

### 주 타겟
- 구글 학술검색에서 논문 PDF를 브라우저로 읽는 대학생/연구자
- arXiv, IEEE 등에서 영어 논문을 자주 보는 개발자
- 브라우저에서 영어 PDF 문서를 직접 여는 모든 사람

### 핵심 사용 시나리오

#### 시나리오 1: 구글 학술검색에서 논문 읽기
```
구글 학술검색에서 논문 검색
 ↓
[PDF] 링크 클릭 → 브라우저에서 PDF 열림
 ↓
논문 읽는 중 모르는 단어 "ubiquitous" 발견
 ↓
해당 단어 드래그
 ↓
툴팁: "ubiquitous - 어디에나 있는, 편재하는"
 ↓
이해하고 계속 읽기 (탭 전환 없음!)
```

#### 시나리오 2: arXiv 논문 읽기
```
arXiv에서 최신 AI 논문 PDF 열기
 ↓
Abstract의 어려운 문장 발견
 ↓
문장 전체 드래그
 ↓
툴팁: 전체 문장 한국어 번역
 ↓
맥락 이해하고 계속 읽기
```

#### 시나리오 3: 일반 웹페이지에서도 사용
```
영어 기술 블로그 읽는 중
 ↓
모르는 표현 드래그
 ↓
툴팁으로 번역 확인
 ↓
PDF뿐 아니라 모든 웹페이지에서 동작!
```

---

## 핵심 가치 제안

### "PDF에서 드래그 한 번, 번역 완료"

1. **PDF 특화**: 브라우저 PDF 뷰어에서 완벽 동작
2. **1초 번역**: 드래그하면 바로 툴팁
3. **탭 전환 없음**: 현재 페이지에서 모든 게 해결
4. **무료**: 돈 안 듦

---

## 기능 목록

### Phase 1: MVP (핵심 기능)
**목표: PDF에서 드래그 → 번역 툴팁**

#### 1. Chrome 확장 프로그램 기본 구조
- manifest.json (Manifest V3)
- Content Script (페이지에 주입)
- 확장 프로그램 아이콘

#### 2. 텍스트 선택 감지
- `mouseup` 이벤트로 텍스트 선택 감지
- `window.getSelection()`으로 선택 텍스트 추출
- 선택 위치 좌표 획득
- **PDF 뷰어 호환**: Chrome 내장 PDF 뷰어에서 동작

#### 3. 번역 API 연동
- 무료 번역 API 사용 (MyMemory API)
- 영어 → 한국어 번역
- Background Script에서 API 호출 (CORS 우회)

#### 4. 번역 툴팁 표시
- 선택 위치 근처에 툴팁 표시
- 원문 + 번역문 표시
- 툴팁 외부 클릭 시 닫기
- 깔끔한 디자인

---

### Phase 2: 편의 기능
**목표: 사용성 개선**

#### 1. 단어장 기능
- 번역한 단어/문장 저장 (chrome.storage)
- 팝업에서 저장 목록 보기
- 내보내기 (CSV)

#### 2. 발음 기능
- 영어 발음 듣기 (Web Speech API)
- 툴팁에 스피커 아이콘

#### 3. 설정
- 번역 언어 선택 (영→한, 영→일 등)
- 툴팁 테마 (라이트/다크)
- 단축키 설정

#### 4. 팝업 UI
- 확장 프로그램 팝업에서 설정
- 최근 번역 히스토리
- On/Off 토글

---

### Phase 3: 고급 기능 (선택)
**목표: 확장성**

#### 1. 다양한 번역 엔진
- Google Translate API
- DeepL API
- 사용자 선택 가능

#### 2. 사전 기능
- 단어인 경우 사전 뜻도 표시
- 품사, 예문 등

#### 3. Firefox 지원
- Firefox 확장 프로그램 버전

---

## 기술 스택

### 최소 기술 스택 (Phase 1)
```
Chrome Extension (Manifest V3)
├── manifest.json        # 확장 프로그램 설정
├── content.js           # 페이지에 주입되는 스크립트
├── background.js        # 백그라운드 서비스 워커
├── popup.html/js        # 팝업 UI
├── styles.css           # 툴팁 스타일
└── 무료 번역 API (MyMemory)
```

### 왜 이 스택인가?
- **Manifest V3**: 최신 Chrome 확장 표준
- **Vanilla JS**: 프레임워크 불필요, 가벼움
- **Background Script**: CORS 문제 없이 API 호출
- **Content Script**: PDF 포함 모든 페이지에서 동작

---

## 화면 구성

### 1. 번역 툴팁 (핵심)
```
┌────────────────────────────┐
│ ubiquitous            [x]  │
├────────────────────────────┤
│ 어디에나 있는, 편재하는      │
├────────────────────────────┤
│ [🔊] [📋 복사] [💾 저장]    │
└────────────────────────────┘
```

### 2. 긴 문장 번역 툴팁
```
┌─────────────────────────────────────┐
│ The ubiquitous use of...       [x]  │
├─────────────────────────────────────┤
│ 어디에서나 사용되는...의 보편적인    │
│ 활용은 현대 사회에서...              │
├─────────────────────────────────────┤
│ [🔊] [📋 복사] [💾 저장]            │
└─────────────────────────────────────┘
```

### 3. 확장 프로그램 팝업
```
┌─────────────────────────┐
│ PDF Translation Tooltip │
├─────────────────────────┤
│ 번역 기능: [ON] / OFF   │
├─────────────────────────┤
│ 최근 번역:              │
│ • ubiquitous → 어디에나 │
│ • manifest → 명백한     │
│ • cognition → 인지      │
├─────────────────────────┤
│ [⚙️ 설정] [📚 단어장]   │
└─────────────────────────┘
```

---

## 핵심 사용자 플로우

### 기본 플로우
```
[Chrome 웹스토어에서 확장 프로그램 설치]
                ↓
[브라우저에서 PDF 열기 (구글 학술검색 등)]
                ↓
[모르는 단어/문장 드래그]
                ↓
[Content Script가 선택 감지]
                ↓
[Background Script로 번역 요청]
                ↓
[번역 API 호출 → 결과 수신]
                ↓
[Content Script가 툴팁 표시]
                ↓
[계속 읽기 or 단어 저장]
```

---

## 개발 단계별 구현 계획

### Step 1: 확장 프로그램 기본 구조
- [ ] manifest.json 작성 (Manifest V3)
- [ ] 기본 파일 구조 생성
- [ ] Chrome에서 개발자 모드로 로드 테스트

### Step 2: 텍스트 선택 감지
- [ ] Content Script 작성
- [ ] mouseup 이벤트로 선택 감지
- [ ] 선택 텍스트 및 위치 추출
- [ ] **PDF 뷰어에서 테스트**

### Step 3: 번역 API 연동
- [ ] Background Script 작성
- [ ] MyMemory API 연동
- [ ] Content ↔ Background 메시지 통신

### Step 4: 툴팁 UI 구현
- [ ] 툴팁 HTML/CSS 작성
- [ ] 위치 계산 로직
- [ ] 표시/숨김 기능
- [ ] 복사 버튼 기능

### Step 5: 팝업 UI
- [ ] popup.html 작성
- [ ] On/Off 토글
- [ ] 최근 번역 히스토리

### Step 6: 테스트 및 배포
- [ ] 다양한 PDF에서 테스트
- [ ] 일반 웹페이지에서 테스트
- [ ] Chrome 웹스토어 배포 준비

---

## 파일 구조

```
pdf-translation-tooltip/
├── manifest.json           # 확장 프로그램 설정
├── background.js           # 백그라운드 서비스 워커
├── content.js              # 콘텐츠 스크립트
├── content.css             # 툴팁 스타일
├── popup/
│   ├── popup.html          # 팝업 UI
│   ├── popup.js            # 팝업 로직
│   └── popup.css           # 팝업 스타일
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── docs/
│   └── PROJECT_PLAN.md     # 이 문서
└── README.md               # 프로젝트 설명
```

---

## manifest.json 예시

```json
{
  "manifest_version": 3,
  "name": "PDF Translation Tooltip",
  "version": "1.0.0",
  "description": "PDF에서 텍스트를 드래그하면 즉시 번역 툴팁이 표시됩니다",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "https://api.mymemory.translated.net/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## 번역 API

### MyMemory API (무료)
```
GET https://api.mymemory.translated.net/get
    ?q=hello
    &langpair=en|ko
```
- 무료: 하루 1000회 (익명), 10000회 (이메일 등록)
- API 키 불필요
- CORS 지원

### 응답 예시
```json
{
  "responseData": {
    "translatedText": "안녕하세요"
  },
  "responseStatus": 200
}
```

---

## 기술적 고려사항

### Chrome PDF 뷰어 호환성
- Chrome 내장 PDF 뷰어는 `<embed>` 태그 사용
- Content Script는 PDF 뷰어에서도 동작
- `window.getSelection()` API 사용 가능

### CORS 처리
- Content Script에서 직접 API 호출 시 CORS 에러 발생 가능
- **해결**: Background Script에서 API 호출
- Content Script ↔ Background Script 메시지 통신

### 성능 최적화
- 번역 결과 캐싱 (동일 텍스트 재요청 방지)
- 디바운싱 (빠른 연속 선택 시 API 호출 제한)

---

## MVP 완료 체크리스트

- [ ] Chrome 확장 프로그램 로드 가능
- [ ] 일반 웹페이지에서 텍스트 드래그 시 툴팁 표시
- [ ] **PDF 뷰어에서 텍스트 드래그 시 툴팁 표시**
- [ ] 툴팁에 원문 + 번역문 표시
- [ ] 툴팁 닫기 가능
- [ ] 복사 버튼 동작
- [ ] 팝업에서 On/Off 가능

---

## 경쟁 서비스 분석

| 서비스 | PDF 지원 | 가격 | 특징 |
|--------|----------|------|------|
| Google 번역 확장 | ❌ PDF 미지원 | 무료 | 일반 웹만 |
| DeepL 확장 | ❌ PDF 미지원 | 무료/유료 | 고품질 번역 |
| 우리 서비스 | ✅ PDF 지원 | 무료 | PDF 특화 |

### 차별점
**기존 번역 확장 프로그램들은 PDF에서 안 됨. 우리는 PDF 특화!**

---

**최종 업데이트**: 2025-12-05
**버전**: 2.0 (Chrome Extension으로 재설계)
**작성자**: CodeLab Team
