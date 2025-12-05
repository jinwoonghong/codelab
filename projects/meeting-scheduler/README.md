# Meeting Scheduler

> 단체채팅방에서 회의 일정을 쉽게 조율하는 모바일웹 서비스

## 프로젝트 소개

**Meeting Scheduler**는 카카오톡, 라인, 슬랙 등 단체채팅방에서 여러 사람의 회의 장소/날짜/시간을 쉽게 조율할 수 있도록 도와주는 모바일 웹 서비스입니다.

### 주요 특징
- **간편한 투표 생성**: 3단계만에 투표 링크 생성
- **모바일 최적화**: 터치 친화적인 UI/UX
- **실시간 결과**: 참여자 투표 현황 실시간 확인
- **익명 투표**: 선택적 익명 투표 지원
- **카카오톡 최적화**: 링크 공유 시 예쁜 미리보기 카드

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **데이터 저장**: Supabase / Firebase (또는 LocalStorage for MVP)
- **배포**: Vercel / Netlify

## 시작하기

### 필수 요구사항

- Node.js 18+
- 모던 브라우저 (Chrome, Safari, Firefox)

### 설치

```bash
# 레포지토리 클론
git clone https://github.com/jinwoonghong/codelab.git
cd codelab/projects/meeting-scheduler

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

## 주요 기능

### Phase 1: MVP (필수 기능)
- [ ] 투표 생성 (날짜/시간/장소 옵션)
- [ ] 투표 링크 공유
- [ ] 투표 참여 (이름 입력 + 선택)
- [ ] 실시간 투표 결과 확인
- [ ] 투표 마감 및 결과 확정

### Phase 2: 고급 기능
- [ ] 카카오톡 공유 API 연동
- [ ] 구글 캘린더 연동
- [ ] 알림 기능 (투표 마감 임박)
- [ ] 익명 투표 옵션

### Phase 3: 프리미엄 기능
- [ ] 정기 회의 템플릿
- [ ] 팀 워크스페이스
- [ ] 회의록 연동

## 관련 문서

- [프로젝트 기획서](./docs/PROJECT_PLAN.md) - 상세한 기획 및 기능 명세

## 개발 기간

- **시작일**: 2025-12-05
- **MVP 목표**: 2025-12-12 (1주)

## 라이선스

MIT License

---

**제작**: CodeLab Team | **최종 수정**: 2025-12-05
