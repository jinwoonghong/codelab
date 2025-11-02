/**
 * BootScene - 게임 부트 및 에셋 로딩
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 로딩 화면 표시
        this.createLoadingScreen();

        // TODO: 에셋 로딩
        // this.load.image('logo', 'assets/images/logo.png');
        // this.load.audio('bgm', 'assets/sounds/bgm.mp3');
    }

    create() {
        console.log('BootScene: Assets loaded');

        // GifManager 초기화
        if (typeof window.gifManager === 'undefined') {
            window.gifManager = new GifManager();
            console.log('✅ GifManager initialized');
        }

        // SoundManager 초기화
        if (typeof window.soundManager === 'undefined') {
            window.soundManager = new SoundManager();
            console.log('✅ SoundManager initialized');
        }

        // 튜토리얼 완료 여부 확인
        let tutorialCompleted = false;
        try {
            tutorialCompleted = localStorage.getItem('towerStacker_tutorialCompleted') === 'true';
        } catch (error) {
            console.error('튜토리얼 상태 확인 실패:', error);
            tutorialCompleted = true; // 오류 시 튜토리얼 건너뛰기
        }

        // 첫 방문이면 튜토리얼, 아니면 메인 메뉴
        if (!tutorialCompleted) {
            this.scene.start('TutorialScene');
        } else {
            this.scene.start('MainMenuScene');
        }
    }

    createLoadingScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 로딩 텍스트
        const loadingText = this.add.text(width / 2, height / 2 - 50, '로딩 중...', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5);

        // 프로그레스 바
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

        // 로딩 이벤트
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x4ECDC4, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }
}
