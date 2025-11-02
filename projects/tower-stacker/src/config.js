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
        roundPixels: true,
        transparent: false,
        clearBeforeRender: true,
        powerPreference: 'high-performance', // GPU 사용 우선
        batchSize: 4096, // 배치 사이즈 증가 (성능 향상)
        maxTextures: 16
    },

    // FPS 설정
    fps: {
        target: 60,
        forceSetTimeOut: false,
        min: 30,
        smoothStep: true
    },

    // DOM 설정
    dom: {
        createContainer: false
    },

    // 오디오 설정
    audio: {
        disableWebAudio: false,
        noAudio: false
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

    // 업적 시스템
    achievements: [
        // 높이 관련
        { id: 'height_5', name: '초보 건축가', description: '높이 5m 달성', icon: '🏗️', type: 'height', target: 5, reward: 50 },
        { id: 'height_10', name: '숙련 건축가', description: '높이 10m 달성', icon: '🏢', type: 'height', target: 10, reward: 100 },
        { id: 'height_20', name: '마스터 건축가', description: '높이 20m 달성', icon: '🏙️', type: 'height', target: 20, reward: 200 },
        { id: 'height_30', name: '전설의 건축가', description: '높이 30m 달성', icon: '🗼', type: 'height', target: 30, reward: 500 },

        // 블록 수 관련
        { id: 'blocks_50', name: '블록 마스터', description: '블록 50개 쌓기', icon: '📦', type: 'totalBlocks', target: 50, reward: 100 },
        { id: 'blocks_100', name: '블록 그랜드마스터', description: '블록 100개 쌓기', icon: '📚', type: 'totalBlocks', target: 100, reward: 200 },

        // 특수 블록 관련
        { id: 'special_10', name: '특수블록 수집가', description: '특수 블록 10개 사용', icon: '✨', type: 'specialBlocks', target: 10, reward: 150 },
        { id: 'special_30', name: '특수블록 애호가', description: '특수 블록 30개 사용', icon: '⭐', type: 'specialBlocks', target: 30, reward: 300 },

        // 코인 관련
        { id: 'coins_1000', name: '부자', description: '코인 1000개 획득', icon: '💰', type: 'coinsEarned', target: 1000, reward: 100 },
        { id: 'coins_5000', name: '재벌', description: '코인 5000개 획득', icon: '💎', type: 'coinsEarned', target: 5000, reward: 500 },

        // 게임 모드 관련
        { id: 'play_10', name: '열정적인 플레이어', description: '10회 플레이', icon: '🎮', type: 'gamesPlayed', target: 10, reward: 100 },
        { id: 'play_50', name: '열렬한 플레이어', description: '50회 플레이', icon: '🎯', type: 'gamesPlayed', target: 50, reward: 300 },

        // 퍼즐 관련
        { id: 'puzzle_stage5', name: '퍼즐 입문', description: '퍼즐 스테이지 5 클리어', icon: '🧩', type: 'puzzleStage', target: 5, reward: 200 },
        { id: 'puzzle_stage10', name: '퍼즐 마스터', description: '퍼즐 스테이지 10 클리어', icon: '🏆', type: 'puzzleStage', target: 10, reward: 500 },

        // 스킨 관련
        { id: 'skins_5', name: '컬렉터', description: '스킨 5개 수집', icon: '🎨', type: 'skinsOwned', target: 5, reward: 200 },
        { id: 'skins_all', name: '완벽한 컬렉터', description: '모든 스킨 수집', icon: '👑', type: 'skinsOwned', target: 10, reward: 1000 }
    ],

    // 칭호 시스템 (업적 달성 시 해금)
    titles: [
        { id: 'beginner', name: '초보자', requirement: null, icon: '🆕' },
        { id: 'builder', name: '건축가', requirement: 'height_10', icon: '🏗️' },
        { id: 'master_builder', name: '마스터 건축가', requirement: 'height_20', icon: '🏙️' },
        { id: 'legend', name: '전설', requirement: 'height_30', icon: '🗼' },
        { id: 'collector', name: '수집가', requirement: 'skins_5', icon: '🎨' },
        { id: 'perfectionist', name: '완벽주의자', requirement: 'skins_all', icon: '👑' },
        { id: 'puzzle_master', name: '퍼즐 마스터', requirement: 'puzzle_stage10', icon: '🧩' },
        { id: 'rich', name: '부자', requirement: 'coins_5000', icon: '💎' },
        { id: 'enthusiast', name: '열정가', requirement: 'play_50', icon: '🎯' }
    ],

    // 로컬 스토리지 키
    storage: {
        highScores: 'tower-stacker-high-scores',
        settings: 'tower-stacker-settings',
        inventory: 'tower-stacker-inventory',
        achievements: 'tower-stacker-achievements',
        coins: 'tower-stacker-coins',
        currentSkin: 'tower-stacker-current-skin',
        statistics: 'tower-stacker-statistics',
        currentTitle: 'tower-stacker-current-title'
    }
};
