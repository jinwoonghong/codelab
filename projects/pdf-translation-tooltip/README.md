# PDF Translation Tooltip

> 브라우저에서 PDF를 열고 텍스트를 드래그하면 즉시 번역 툴팁이 뜨는 Chrome 확장 프로그램

## 프로젝트 소개

구글 학술검색, arXiv 등에서 영어 PDF를 읽을 때 모르는 단어가 나오면 새 탭을 열어 번역기를 찾아야 하는 번거로움을 해결합니다. 드래그 한 번으로 즉시 번역을 확인할 수 있습니다.

**기존 번역 확장 프로그램과의 차이점**: Google 번역, DeepL 확장 등은 일반 웹페이지에서만 동작하고 **PDF에서는 안 됩니다**. 이 확장 프로그램은 PDF 특화!

## 기술 스택

- **Platform**: Chrome Extension (Manifest V3)
- **Language**: Vanilla JavaScript
- **Translation API**: MyMemory API (무료)

## 설치 방법

### 개발자 모드 설치
```
1. 이 저장소 클론
2. Chrome에서 chrome://extensions 접속
3. "개발자 모드" 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 클릭
5. 이 폴더 선택
```

## 주요 기능

### Phase 1: MVP
- [x] Chrome 확장 프로그램 기본 구조
- [x] 텍스트 드래그 감지
- [x] 번역 API 연동
- [x] 번역 툴팁 표시
- [x] **PDF 뷰어에서 동작**

### Phase 2: 편의 기능
- [ ] 단어장 저장
- [ ] 발음 듣기
- [ ] 설정 (언어, 테마)

## 사용 방법

1. 확장 프로그램 설치
2. 브라우저에서 PDF 열기 (구글 학술검색, arXiv 등)
3. 모르는 단어/문장 드래그
4. 툴팁으로 번역 확인!

## 배포

- **Chrome Web Store**: (배포 후 추가)

## 문서

- [프로젝트 기획서](./docs/PROJECT_PLAN.md)

## 라이선스

MIT
