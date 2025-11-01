# 배포 가이드

MVP 프로젝트를 빠르게 배포하기 위한 플랫폼별 가이드입니다.

## 프론트엔드 배포

### Vercel (Next.js, React 권장)

1. Vercel 계정 생성 및 GitHub 연동
2. 프로젝트 선택 및 설정
```bash
# Root Directory 설정
projects/[프로젝트명]

# Build Command
npm run build

# Output Directory
out (또는 dist)
```
3. 환경 변수 설정
4. Deploy 클릭

**장점**: 자동 배포, 무료 플랜, 빠른 속도

### Netlify

비슷한 과정, 정적 사이트에 적합

## 백엔드 배포

### Railway (추천)

1. Railway 계정 생성
2. New Project → Deploy from GitHub
3. 프로젝트 선택 및 root directory 설정
```bash
projects/[프로젝트명]
```
4. 환경 변수 설정
5. 자동 배포

**장점**: 간단한 설정, DB 호스팅 포함, 월 $5 무료 크레딧

### Render

비슷한 과정, 무료 플랜 있음 (느린 시작 시간)

### Fly.io

```bash
# Fly CLI 설치
curl -L https://fly.io/install.sh | sh

# 프로젝트 디렉토리에서
cd projects/[프로젝트명]
fly launch
fly deploy
```

## 데이터베이스

### Supabase (PostgreSQL)
- 무료 플랜: 500MB 저장소
- 실시간 구독 기능
- 인증 기능 내장

### MongoDB Atlas
- 무료 플랜: 512MB
- 글로벌 클라우드 배포

### PlanetScale (MySQL)
- 무료 플랜: 5GB 저장소
- 서버리스 MySQL

## 환경 변수 관리

### .env.example 파일 작성
```bash
# .env.example
DATABASE_URL=your_database_url
API_KEY=your_api_key
SECRET_KEY=your_secret_key
```

### 각 플랫폼에서 환경 변수 설정
- Vercel: Settings → Environment Variables
- Railway: Variables 탭
- Render: Environment → Environment Variables

## 도메인 연결

대부분의 플랫폼에서 커스텀 도메인 연결 가능:
1. 도메인 구매 (Namecheap, GoDaddy 등)
2. DNS 설정
3. 플랫폼에서 도메인 추가
4. SSL 자동 발급

## CI/CD

GitHub Actions를 통한 자동 배포 예시:

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
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

## 체크리스트

배포 전 확인사항:
- [ ] 환경 변수 모두 설정
- [ ] .gitignore에 민감한 파일 포함
- [ ] 프로덕션 빌드 테스트
- [ ] CORS 설정 확인
- [ ] 에러 핸들링 구현
- [ ] 로그 설정

## 비용 관리

무료 플랜으로 시작하기 좋은 조합:
- **프론트**: Vercel (무료)
- **백엔드**: Railway ($5 크레딧)
- **DB**: Supabase (무료)
- **도메인**: Namecheap (~$10/년)

총 월 비용: 거의 무료 ~ $5
