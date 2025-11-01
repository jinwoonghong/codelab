# 타워 스태커 (Tower Stacker) 🏗️

> 블록을 쌓아 올리는 모바일 웹 게임

## 📝 프로젝트 소개

타워 스태커는 블록을 쌓아 올리는 간단한 행위에서 오는 원초적인 재미와 물리 엔진의 예측 불가능성을 결합한 모바일 웹 기반 퍼즐 아케이드 게임입니다. 중고등학생을 주요 타겟으로, 짧은 플레이 타임과 직관적인 조작감을 제공하면서도, 다양한 특수 블록, 환경 변수, 그리고 독특한 경쟁 및 수집 요소를 통해 깊이 있는 경험을 선사합니다.

## 🎮 주요 특징

- **물리 엔진 기반** - Phaser 3 + Matter.js를 활용한 실감나는 물리 시뮬레이션
- **다양한 게임 모드** - 클래식, 타임 어택, 일일 도전, 퍼즐 모드
- **특수 블록** - 접착, 고무, 가속, 유리 등 다양한 특성을 가진 블록
- **환경 변수** - 돌풍, 중력 변화, 방해 드론 등 예측 불가능한 요소
- **성장 시스템** - 코인 획득, 블록 스킨/테마 수집, 업적 달성
- **챌린지 코드** - 친구와 기록을 공유하고 경쟁
- **고스트 리플레이** - 친구의 플레이를 고스트로 보며 도전
- **GIF 공유** - 명장면을 자동으로 GIF로 저장 및 공유

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Game Engine**: Phaser 3
- **Physics**: Matter.js (Phaser 내장)
- **Storage**: IndexedDB, LocalStorage
- **Libraries**:
  - `lz-string` - 데이터 압축
  - `crypto-js` - 챌린지 코드 암호화
  - `gif.js` - GIF 생성

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ (개발 서버용)
- 모던 웹 브라우저 (Chrome, Safari, Firefox 등)

### 설치 및 실행

```bash
# 프로젝트 디렉토리로 이동
cd projects/tower-stacker

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 게임을 시작합니다.

### 간단한 실행 (의존성 설치 없이)

```bash
# Python 3가 설치되어 있다면
python3 -m http.server 3000

# 또는 npx 사용
npx serve
```

## 📂 프로젝트 구조

```
tower-stacker/
├── index.html              # 메인 HTML 파일
├── package.json            # 프로젝트 설정
├── docs/                   # 문서
│   └── game-design-document.md  # 게임 기획서
├── src/                    # 소스 코드
│   ├── game.js            # 메인 게임 엔트리
│   ├── config.js          # 게임 설정
│   ├── scenes/            # Phaser 씬들
│   │   ├── BootScene.js
│   │   ├── MainMenuScene.js
│   │   ├── GameScene.js
│   │   └── GameOverScene.js
│   ├── entities/          # 게임 객체
│   │   ├── Block.js
│   │   └── SpecialBlocks.js
│   ├── managers/          # 관리 클래스
│   │   ├── ScoreManager.js
│   │   ├── ReplayManager.js
│   │   └── GifManager.js
│   └── utils/             # 유틸리티
│       └── DataManager.js
├── assets/                # 게임 에셋
│   ├── images/
│   ├── sounds/
│   └── themes/
└── styles/                # CSS 스타일
    └── main.css
```

## 📋 개발 로드맵

### Phase 1: 핵심 기능 (진행 중)
- [x] 프로젝트 초기 설정
- [x] 기본 게임 루프 구현
- [ ] 블록 드롭 및 물리 시뮬레이션
- [ ] 타워 안정성 판정
- [ ] 점수 시스템

### Phase 2: 게임 모드
- [ ] 클래식 모드
- [ ] 타임 어택 모드
- [ ] 일일 도전 모드
- [ ] 퍼즐 모드

### Phase 3: 특수 요소
- [ ] 특수 블록 구현
- [ ] 환경 변수 구현
- [ ] 사운드 및 이펙트

### Phase 4: 성장 시스템
- [ ] 코인 시스템
- [ ] 블록 스킨 & 테마
- [ ] 업적 및 칭호
- [ ] 박물관

### Phase 5: 소셜 기능
- [ ] 챌린지 코드
- [ ] 고스트 리플레이
- [ ] GIF 생성 및 공유

## 🎯 게임 플레이

1. **화면을 터치** 또는 **클릭**하여 움직이는 블록을 떨어뜨립니다
2. 이전 블럭 위에 **정확하게 쌓을수록** 높은 점수를 획득합니다
3. 블록이 완전히 벗어나거나 타워가 무너지면 **게임 오버**
4. 최고 기록을 갱신하고 친구들과 경쟁하세요!

## 📚 문서

- [게임 기획 및 개발 문서](docs/game-design-document.md) - 상세한 게임 기획서, 요구사항, To-Do List

## 🔗 배포

- **Live URL**: (배포 후 추가 예정)
- **배포 환경**: Vercel / Netlify

## 📅 개발 기간

- **시작일**: 2025-11-01
- **완료일**: 진행 중

## 🤝 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

MIT

---

*Made with ❤️ using Phaser 3*
