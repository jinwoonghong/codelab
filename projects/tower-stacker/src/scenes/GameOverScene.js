/**
 * GameOverScene - 게임 오버 화면
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    async create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        // Game Over 텍스트
        const gameOverText = this.add.text(width / 2, height / 2 - 120, 'GAME OVER', {
            font: 'bold 48px Arial',
            fill: '#FF6B6B',
            stroke: '#000000',
            strokeThickness: 4
        });
        gameOverText.setOrigin(0.5);

        // 최종 점수
        const scoreText = this.add.text(width / 2, height / 2 - 40, `최종 점수: ${this.finalScore}`, {
            font: 'bold 32px Arial',
            fill: '#FFE66D'
        });
        scoreText.setOrigin(0.5);

        // 최고 기록 (IndexedDB에서 불러오기)
        const highScore = await this.getHighScore();
        const highScoreText = this.add.text(width / 2, height / 2 + 20, `최고 기록: ${highScore}`, {
            font: '24px Arial',
            fill: '#4ECDC4'
        });
        highScoreText.setOrigin(0.5);

        // 새 기록 달성 여부
        if (this.finalScore > highScore) {
            const newRecordText = this.add.text(width / 2, height / 2 + 60, '🎉 새 기록 달성!', {
                font: 'bold 24px Arial',
                fill: '#95E1D3'
            });
            newRecordText.setOrigin(0.5);

            // IndexedDB에 저장
            await this.saveHighScore(this.finalScore);

            // 반짝임 효과
            this.tweens.add({
                targets: newRecordText,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // 버튼들
        this.createButton(width / 2, height / 2 + 130, '다시 시작', () => {
            this.scene.start('GameScene');
        });

        this.createButton(width / 2, height / 2 + 210, '메인 메뉴', () => {
            this.scene.start('MainMenuScene');
        });
    }

    createButton(x, y, label, callback) {
        const button = this.add.container(x, y);

        // 버튼 배경
        const bg = this.add.rectangle(0, 0, 250, 60, 0x4ECDC4, 0.8);
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
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x4ECDC4, 0.8);
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

    async getHighScore() {
        const mode = window.TowerStacker.currentMode || 'classic';
        try {
            return await window.dataManager.getHighScore(mode);
        } catch (error) {
            console.error('Error getting high score:', error);
            return 0;
        }
    }

    async saveHighScore(score) {
        const mode = window.TowerStacker.currentMode || 'classic';
        try {
            await window.dataManager.saveHighScore(mode, score);
        } catch (error) {
            console.error('Error saving high score:', error);
        }
    }
}
