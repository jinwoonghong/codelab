# Projects

이 폴더에는 각각의 독립적인 MVP 프로젝트들이 저장됩니다.

## 명명 규칙

프로젝트 폴더명 형식: `프로젝트명` 또는 `01-프로젝트명`

예시:
- `todo-app`
- `chat-service`
- `analytics-dashboard`

## 각 프로젝트 구조 예시

```
project-name/
├── README.md              # 프로젝트 설명, 실행 방법
├── .env.example          # 환경 변수 샘플
├── package.json          # (Node.js 프로젝트)
├── requirements.txt      # (Python 프로젝트)
├── docker-compose.yml    # (Docker 사용 시)
├── frontend/             # 프론트엔드 (필요시)
├── backend/              # 백엔드 (필요시)
└── docs/                 # 프로젝트별 추가 문서
```

## 프로젝트 README 템플릿

각 프로젝트의 README.md에는 다음 내용을 포함하세요:

1. **프로젝트 설명**: 무엇을 만드는지
2. **기술 스택**: 사용한 프레임워크/라이브러리
3. **설치 및 실행**: 로컬에서 실행하는 방법
4. **주요 기능**: 구현된 기능 목록
5. **배포 URL**: (있다면)
6. **개발 기간**: 시작일, 완료일
