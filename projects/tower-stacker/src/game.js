/**
 * 타워 스태커 - 메인 게임 파일
 * Phaser 3 게임 인스턴스를 생성하고 초기화합니다.
 */

// 게임 설정 복사 및 씬 추가
const config = {
    ...GameConfig,
    scene: [
        BootScene,
        MainMenuScene,
        GameScene,
        GameOverScene,
        ShopScene,
        MuseumScene
    ]
};

// 게임 인스턴스 생성
const game = new Phaser.Game(config);

// 전역 게임 상태
window.TowerStacker = {
    game: game,
    currentMode: 'classic',
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: true
};

console.log('🏗️ Tower Stacker initialized!');
