# Templates

새 프로젝트를 빠르게 시작할 수 있는 템플릿들입니다.

## 사용 가능한 템플릿

### 1. Next.js + TypeScript
- 풀스택 React 애플리케이션
- API Routes 포함
- Tailwind CSS 설정

### 2. FastAPI + Python
- RESTful API 백엔드
- SQLAlchemy ORM
- Pydantic validation

### 3. Express + TypeScript
- Node.js 백엔드
- REST API 구조
- JWT 인증 예시

### 4. React + Vite
- 프론트엔드 전용
- 빠른 개발 환경
- TypeScript 지원

## 사용 방법

```bash
# 1. 원하는 템플릿 폴더를 projects로 복사
cp -r templates/nextjs-template projects/my-new-project

# 2. 프로젝트 폴더로 이동
cd projects/my-new-project

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

## 템플릿 추가하기

자주 사용하는 셋업이 있다면 이 폴더에 템플릿으로 추가하세요.

1. 최소한의 보일러플레이트 코드만 포함
2. `.env.example` 파일 포함
3. README.md에 사용법 명시
