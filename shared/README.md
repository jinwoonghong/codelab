# Shared

여러 프로젝트에서 공통으로 사용할 수 있는 코드를 저장하는 공간입니다.

## 폴더 구조

```
shared/
├── ui-components/     # 재사용 가능한 UI 컴포넌트
├── utils/            # 유틸리티 함수들
├── hooks/            # 커스텀 React hooks (React 사용 시)
├── config/           # 공통 설정 파일
└── types/            # 공통 타입 정의 (TypeScript)
```

## 사용 방법

각 프로젝트에서 상대 경로로 import하여 사용:

```javascript
// 예시
import { Button } from '../../shared/ui-components/Button';
import { formatDate } from '../../shared/utils/date';
```

## 주의사항

- 프로젝트별 특화된 코드가 아닌, 진짜 공통으로 쓸 코드만 추가
- 의존성이 적고 독립적인 코드 위주로 작성
- 각 모듈은 README나 주석으로 사용법 명시
