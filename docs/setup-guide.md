# 개발 환경 설정 가이드

## 기본 요구사항

### 필수 도구

- **Git**: 버전 관리
- **Node.js**: v18 이상 (JavaScript/TypeScript 프로젝트용)
- **Python**: v3.10 이상 (Python 프로젝트용)
- **Code Editor**: VS Code 권장

### 권장 도구

- **Claude Code**: AI 코딩 어시스턴트
- **Docker**: 컨테이너화된 개발 환경
- **Postman/Insomnia**: API 테스팅

## 초기 설정

### 1. 레포지토리 클론

```bash
git clone https://github.com/jinwoonghong/codelab.git
cd codelab
```

### 2. Node.js 프로젝트 설정

```bash
cd projects/[프로젝트명]
npm install
cp .env.example .env
npm run dev
```

### 3. Python 프로젝트 설정

```bash
cd projects/[프로젝트명]
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

## VS Code 확장 프로그램 권장

- ESLint
- Prettier
- GitLens
- Python (Python 프로젝트용)
- Tailwind CSS IntelliSense

## Git 설정

```bash
# 사용자 정보 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 기본 브랜치명 설정
git config --global init.defaultBranch main
```

## 문제 해결

### npm install 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### Python 가상환경 문제
```bash
# 가상환경 재생성
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 다음 단계

- [deployment.md](./deployment.md)에서 배포 방법 확인
- [best-practices.md](./best-practices.md)에서 코딩 가이드 확인
