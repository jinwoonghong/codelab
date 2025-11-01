/**
 * MainMenuScene - 메인 메뉴 화면
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    async create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // 타이틀
        const title = this.add.text(width / 2, 100, '🏗️ 타워 스태커', {
            font: 'bold 48px Arial',
            fill: '#4ECDC4',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // 서브타이틀
        const subtitle = this.add.text(width / 2, 160, 'Tower Stacker', {
            font: '24px Arial',
            fill: '#ffffff'
        });
        subtitle.setOrigin(0.5);

        // 코인 잔액 표시 (우측 상단)
        const coins = window.dataManager.getCoins();
        const coinText = this.add.text(width - 20, 20, `💰 ${coins}`, {
            font: 'bold 24px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        coinText.setOrigin(1, 0);

        // 게임 모드 버튼들
        const modes = [
            { key: 'classic', label: '클래식 모드', y: 230 },
            { key: 'timeAttack', label: '타임 어택', y: 300 },
            { key: 'dailyChallenge', label: '일일 도전', y: 370 },
            { key: 'puzzle', label: '퍼즐 모드', y: 440 }
        ];

        modes.forEach(mode => {
            this.createButton(width / 2, mode.y, mode.label, () => {
                this.startGame(mode.key);
            });
        });

        // 상점 버튼
        const shopButton = this.createButton(width / 2, 520, '🎁 블록 스킨 상점', () => {
            this.scene.start('ShopScene');
        });
        shopButton.scaleX = 0.9;
        shopButton.scaleY = 0.9;

        // 최고 기록 표시 (IndexedDB에서 불러오기)
        const highScore = await this.getHighScore('classic');
        const highScoreText = this.add.text(width / 2, height - 30, `클래식 최고 기록: ${highScore}`, {
            font: '16px Arial',
            fill: '#FFE66D'
        });
        highScoreText.setOrigin(0.5);
    }

    async getHighScore(mode) {
        try {
            return await window.dataManager.getHighScore(mode);
        } catch (error) {
            console.error('Error getting high score:', error);
            return 0;
        }
    }

    createButton(x, y, label, callback) {
        const button = this.add.container(x, y);

        // 버튼 배경
        const bg = this.add.rectangle(0, 0, 300, 60, 0x4ECDC4, 0.8);
        bg.setInteractive({ useHandCursor: true });

        // 버튼 텍스트
        const text = this.add.text(0, 0, label, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        });
        text.setOrigin(0.5);

        button.add([bg, text]);

        // 호버 효과
        bg.on('pointerover', () => {
            bg.setFillStyle(0x95E1D3);
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x4ECDC4, 0.8);
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        // 클릭 이벤트
        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });

        return button;
    }

    startGame(mode) {
        console.log('Starting game mode:', mode);
        window.TowerStacker.currentMode = mode;
        this.scene.start('GameScene');
    }
}
