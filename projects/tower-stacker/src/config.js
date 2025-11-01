/**
 * 게임 전역 설정
 */
const GameConfig = {
    // 게임 기본 설정
    width: 800,
    height: 600,
    type: Phaser.AUTO,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',

    // 물리 엔진 설정
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false,
            debugBodyColor: 0x00ff00
        }
    },

    // 씬 목록
    scene: [],  // game.js에서 동적으로 추가됨

    // 스케일 설정 (모바일 반응형)
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        min: {
            width: 320,
            height: 480
        },
        max: {
            width: 1920,
            height: 1080
        }
    },

    // 렌더링 설정
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true
    },

    // 게임 플레이 설정
    gameplay: {
        // 블록 설정
        block: {
            width: 80,
            height: 40,
            colors: ['0xFF6B6B', '0x4ECDC4', '0xFFE66D', '0x95E1D3', '0xF38181'],
            friction: 0.8,
            restitution: 0.3,
            density: 0.001
        },

        // 특수 블록 등장 확률
        specialBlockChance: 0.2,  // 20%

        // 환경 변수 발동 조건
        environmentTriggers: {
            wind: { minHeight: 200 },      // 200 이상에서 돌풍
            gravity: { minHeight: 300 },   // 300 이상에서 중력 변화
            drone: { minHeight: 400 }      // 400 이상에서 드론 등장
        },

        // 게임 오버 조건
        gameOver: {
            maxTilt: 45,           // 최대 기울기 (도)
            fallDistance: 100,     // 낙하 판정 거리
            stabilityTime: 1000    // 안정성 체크 시간 (ms)
        }
    },

    // 게임 모드
    modes: {
        classic: {
            name: '클래식',
            description: '가장 높이 쌓기',
            timeLimit: null
        },
        timeAttack: {
            name: '타임 어택',
            description: '90초 안에 최고 높이 달성',
            timeLimit: 90000  // 90초
        },
        dailyChallenge: {
            name: '일일 도전',
            description: '매일 동일한 블록 순서',
            timeLimit: null
        },
        puzzle: {
            name: '퍼즐',
            description: '미션을 완료하세요',
            timeLimit: null
        }
    },

    // 로컬 스토리지 키
    storage: {
        highScores: 'tower-stacker-high-scores',
        settings: 'tower-stacker-settings',
        inventory: 'tower-stacker-inventory',
        achievements: 'tower-stacker-achievements'
    }
};
