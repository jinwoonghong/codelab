# 코딩 컨벤션 및 베스트 프랙티스

## 일반 원칙

- **KISS (Keep It Simple, Stupid)**: MVP는 단순하게
- **DRY (Don't Repeat Yourself)**: 공통 코드는 shared로
- **YAGNI (You Aren't Gonna Need It)**: 필요한 것만 구현

## Git 커밋 메시지

### 형식
```
type: 간단한 설명

상세 설명 (선택)
```

### Type 종류
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가
- `chore`: 기타 작업

### 예시
```bash
git commit -m "feat: 사용자 로그인 기능 추가"
git commit -m "fix: 회원가입 시 이메일 검증 오류 수정"
git commit -m "docs: README에 설치 가이드 추가"
```

## 코드 스타일

### JavaScript/TypeScript

```javascript
// 변수명: camelCase
const userName = "John";

// 함수명: camelCase
function getUserData() {}

// 클래스명: PascalCase
class UserService {}

// 상수: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// async/await 사용
async function fetchData() {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
```

### Python

```python
# 변수/함수명: snake_case
user_name = "John"

def get_user_data():
    pass

# 클래스명: PascalCase
class UserService:
    pass

# 상수: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
```

## 폴더 구조

### Next.js 프로젝트
```
project/
├── app/              # App Router (Next.js 13+)
│   ├── page.tsx
│   └── layout.tsx
├── components/       # 재사용 컴포넌트
├── lib/             # 유틸리티, 헬퍼 함수
├── public/          # 정적 파일
└── styles/          # 스타일 파일
```

### Express 프로젝트
```
project/
├── src/
│   ├── routes/      # 라우트 정의
│   ├── controllers/ # 비즈니스 로직
│   ├── models/      # 데이터 모델
│   ├── middleware/  # 미들웨어
│   └── utils/       # 유틸리티
├── tests/           # 테스트
└── server.ts        # 진입점
```

### FastAPI 프로젝트
```
project/
├── app/
│   ├── main.py      # 진입점
│   ├── routers/     # 라우터
│   ├── models/      # Pydantic 모델
│   ├── schemas/     # DB 스키마
│   └── utils/       # 유틸리티
└── tests/           # 테스트
```

## 환경 변수

### .env 파일 관리
```bash
# .env.example (깃에 커밋)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=your_api_key_here

# .env (깃에 커밋하지 않음)
DATABASE_URL=postgresql://user:realpass@localhost:5432/db
API_KEY=sk_real_api_key_12345
```

### 사용 방법
```javascript
// Node.js
require('dotenv').config();
const apiKey = process.env.API_KEY;
```

```python
# Python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('API_KEY')
```

## 에러 핸들링

### Frontend
```javascript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Failed to fetch:', error);
  toast.error('데이터를 불러오는데 실패했습니다');
}
```

### Backend
```javascript
// Express
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

```python
# FastAPI
from fastapi import HTTPException

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = get_user_from_db(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## 보안

### 체크리스트
- [ ] 민감한 정보는 환경 변수로 관리
- [ ] API 엔드포인트에 rate limiting 적용
- [ ] 사용자 입력값 검증
- [ ] SQL Injection 방지 (ORM 사용)
- [ ] XSS 방지 (입력값 sanitize)
- [ ] CORS 적절히 설정
- [ ] HTTPS 사용 (프로덕션)

## 성능

### 최적화 팁
- 이미지 최적화 (Next.js Image 컴포넌트)
- 코드 스플리팅 (dynamic import)
- 캐싱 전략
- DB 쿼리 최적화 (N+1 문제 주의)
- 불필요한 re-render 방지 (React.memo, useMemo)

## 테스팅

### MVP 단계에서 필수 테스트
```javascript
// 중요 비즈니스 로직만 테스트
describe('User Authentication', () => {
  test('should create user with valid data', () => {
    // 테스트 코드
  });
});
```

## 문서화

### README 필수 항목
- 프로젝트 설명
- 설치 방법
- 실행 방법
- 주요 기능
- 기술 스택

### 코드 주석
```javascript
// 복잡한 로직에만 주석 추가
// 나쁜 예: 변수를 선언합니다
const x = 10;

// 좋은 예: 재시도 로직이 3번으로 제한된 이유 설명
const MAX_RETRY = 3; // API 서버가 3번 이상 요청 시 IP 차단
```

## 배포 전 체크리스트

- [ ] 모든 환경 변수 설정 확인
- [ ] 에러 핸들링 구현
- [ ] 로딩 상태 처리
- [ ] 모바일 반응형 확인
- [ ] 주요 기능 테스트
- [ ] .gitignore 확인
- [ ] README 업데이트
