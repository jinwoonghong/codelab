# PDF Translation Tooltip

> PDF에서 영어 단어/문장을 드래그하면 즉시 한국어 번역 툴팁이 표시되는 웹 서비스

## 프로젝트 소개

영어 PDF 문서를 읽을 때 모르는 단어가 나오면 번역기 탭을 열어 복사-붙여넣기하는 번거로움을 해결합니다. 드래그 한 번으로 즉시 번역을 확인할 수 있습니다.

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF 렌더링**: PDF.js
- **번역 API**: MyMemory API (무료)

## 시작하기

### 실행

```bash
# 프로젝트 폴더로 이동
cd codelab/projects/pdf-translation-tooltip

# 간단한 HTTP 서버로 실행
npx serve .
# 또는
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속

## 주요 기능

### Phase 1: MVP
- [x] PDF 파일 업로드 및 표시
- [x] 텍스트 드래그 감지
- [x] 번역 API 연동
- [x] 번역 툴팁 표시

### Phase 2: 편의 기능
- [ ] 단어장 저장
- [ ] 발음 듣기
- [ ] 다크 모드

## 사용 방법

1. 웹사이트 접속
2. PDF 파일 선택 또는 드래그 앤 드롭
3. 모르는 단어/문장 드래그
4. 툴팁으로 번역 확인

## 배포

- **Live URL**: (배포 후 추가)
- **배포 환경**: GitHub Pages

## 문서

- [프로젝트 기획서](./docs/PROJECT_PLAN.md)

## 라이선스

MIT
