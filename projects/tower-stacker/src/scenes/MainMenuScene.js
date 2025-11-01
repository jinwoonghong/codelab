/**
 * MainMenuScene - 메인 메뉴 화면
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
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

        // 게임 모드 버튼들
        const modes = [
            { key: 'classic', label: '클래식 모드', y: 250 },
            { key: 'timeAttack', label: '타임 어택', y: 330 },
            { key: 'dailyChallenge', label: '일일 도전', y: 410 },
            { key: 'puzzle', label: '퍼즐 모드', y: 490 }
        ];

        modes.forEach(mode => {
            this.createButton(width / 2, mode.y, mode.label, () => {
                this.startGame(mode.key);
            });
        });

        // 최고 기록 표시 (임시)
        const highScoreText = this.add.text(width / 2, height - 50, '최고 기록: 0m', {
            font: '18px Arial',
            fill: '#FFE66D'
        });
        highScoreText.setOrigin(0.5);
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
