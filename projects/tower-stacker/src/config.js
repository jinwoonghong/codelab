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
            gravity: { y: 0.8 },
            debug: false, // true로 설정하면 물리 바디 보임
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
            friction: 0.9,       // 마찰력 증가 (더 안정적)
            restitution: 0.1,    // 반발력 감소 (덜 튕김)
            density: 0.002       // 밀도 증가 (조금 더 무거움)
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
            timeLimit: null,
            coinMultiplier: 1.0
        },
        timeAttack: {
            name: '타임 어택',
            description: '90초 안에 최고 높이 달성',
            timeLimit: 90000,  // 90초
            coinMultiplier: 1.5
        },
        dailyChallenge: {
            name: '일일 도전',
            description: '매일 동일한 블록 순서',
            timeLimit: null,
            coinMultiplier: 2.0
        },
        puzzle: {
            name: '퍼즐',
            description: '미션을 완료하세요',
            timeLimit: null,
            coinMultiplier: 1.2
        }
    },

    // 코인 시스템
    coins: {
        // 기본 획득량
        perHeight: 2,           // 높이 1m당 2코인
        perBlock: 5,            // 블록 1개당 5코인
        specialBlockBonus: 10,  // 특수 블록 사용 시 10코인

        // 모드별 보너스
        newRecordBonus: 100,    // 신기록 달성 시 100코인
        stageCompleteBonus: 50, // 퍼즐 스테이지 완료 시 50코인

        // 타임 어택 시간 보너스 (남은 시간 1초당)
        timeAttackTimeBonus: 2
    },

    // 블록 스킨 & 테마
    skins: {
        // 일반 등급 (70%)
        common: [
            { id: 'classic', name: '클래식', colors: [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181], rarity: 'common' },
            { id: 'pastel', name: '파스텔', colors: [0xFFB3BA, 0xFFDFBA, 0xFFFFBA, 0xBAFFC9, 0xBAE1FF], rarity: 'common' },
            { id: 'earth', name: '대지', colors: [0x8B4513, 0xD2691E, 0xA0522D, 0xCD853F, 0xDEB887], rarity: 'common' }
        ],
        // 레어 등급 (25%)
        rare: [
            { id: 'neon', name: '네온', colors: [0xFF00FF, 0x00FFFF, 0xFF00AA, 0x00FF00, 0xFFFF00], rarity: 'rare' },
            { id: 'ocean', name: '바다', colors: [0x006994, 0x0099CC, 0x33B5E5, 0x66CCFF, 0x99E5FF], rarity: 'rare' },
            { id: 'sunset', name: '석양', colors: [0xFF6B35, 0xFF8C42, 0xFFA07A, 0xFFB347, 0xFFC875], rarity: 'rare' }
        ],
        // 에픽 등급 (4%)
        epic: [
            { id: 'galaxy', name: '은하수', colors: [0x190061, 0x240090, 0x3500D3, 0x7209B7, 0xB5179E], rarity: 'epic' },
            { id: 'fire', name: '불꽃', colors: [0xFF0000, 0xFF4500, 0xFF6347, 0xFF7F50, 0xFFA500], rarity: 'epic' }
        ],
        // 레전드 등급 (1%)
        legendary: [
            { id: 'rainbow', name: '무지개', colors: [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF], rarity: 'legendary' },
            { id: 'gold', name: '황금', colors: [0xFFD700, 0xFFC700, 0xFFB700, 0xFFA700, 0xFF9700], rarity: 'legendary' }
        ]
    },

    // 뽑기 시스템
    gacha: {
        cost: 100,  // 1회 뽑기 비용
        rates: {
            common: 0.70,      // 70%
            rare: 0.25,        // 25%
            epic: 0.04,        // 4%
            legendary: 0.01    // 1%
        }
    },

    // 로컬 스토리지 키
    storage: {
        highScores: 'tower-stacker-high-scores',
        settings: 'tower-stacker-settings',
        inventory: 'tower-stacker-inventory',
        achievements: 'tower-stacker-achievements',
        coins: 'tower-stacker-coins',
        currentSkin: 'tower-stacker-current-skin'
    }
};
