/**
 * GameOverScene - 게임 오버 화면
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.gameMode = data.mode || 'classic';
        this.currentStage = data.stage || 1;
        this.earnedCoins = data.earnedCoins || 0;
        this.height = data.height || 0;
        this.blockCount = data.blockCount || 0;
        this.specialBlockCount = data.specialBlockCount || 0;
    }

    async create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

        // Game Over 텍스트
        const gameOverText = this.add.text(width / 2, height / 2 - 200, 'GAME OVER', {
            font: 'bold 48px Arial',
            fill: '#FF6B6B',
            stroke: '#000000',
            strokeThickness: 4
        });
        gameOverText.setOrigin(0.5);

        // 모드 표시
        const modeConfig = GameConfig.modes[this.gameMode];
        const modeText = this.add.text(width / 2, height / 2 - 140, `${modeConfig.name} 모드`, {
            font: '20px Arial',
            fill: '#95E1D3'
        });
        modeText.setOrigin(0.5);

        // 최종 점수
        const scoreText = this.add.text(width / 2, height / 2 - 90, `최종 점수: ${this.finalScore}`, {
            font: 'bold 32px Arial',
            fill: '#FFE66D'
        });
        scoreText.setOrigin(0.5);

        // 게임 통계
        const statsY = height / 2 - 50;
        const statsText = this.add.text(width / 2, statsY,
            `높이: ${this.height}m | 블록: ${this.blockCount}개 | 특수: ${this.specialBlockCount}개`, {
            font: '16px Arial',
            fill: '#ffffff'
        });
        statsText.setOrigin(0.5);

        // 획득 코인 표시 및 추가
        const coinY = height / 2 - 10;
        const coinText = this.add.text(width / 2, coinY, `💰 +${this.earnedCoins} 코인`, {
            font: 'bold 28px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        coinText.setOrigin(0.5);

        // 코인 애니메이션
        this.tweens.add({
            targets: coinText,
            scale: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 0
        });

        // 실제로 코인 추가
        const newBalance = window.dataManager.addCoins(this.earnedCoins);

        // 현재 잔액 표시
        const balanceY = height / 2 + 30;
        const balanceText = this.add.text(width / 2, balanceY, `잔액: ${newBalance} 코인`, {
            font: '18px Arial',
            fill: '#95E1D3'
        });
        balanceText.setOrigin(0.5);

        // 최고 기록 (IndexedDB에서 불러오기)
        const highScore = await this.getHighScore();
        const highScoreText = this.add.text(width / 2, height / 2 + 60, `최고 기록: ${highScore}`, {
            font: '24px Arial',
            fill: '#4ECDC4'
        });
        highScoreText.setOrigin(0.5);

        // 새 기록 달성 여부
        let newRecordBonus = 0;
        if (this.finalScore > highScore) {
            const newRecordText = this.add.text(width / 2, height / 2 + 100, '🎉 새 기록 달성!', {
                font: 'bold 24px Arial',
                fill: '#95E1D3'
            });
            newRecordText.setOrigin(0.5);

            // 신기록 보너스 코인 추가
            newRecordBonus = GameConfig.coins.newRecordBonus;
            window.dataManager.addCoins(newRecordBonus);

            const bonusText = this.add.text(width / 2, height / 2 + 130, `+${newRecordBonus} 보너스 코인!`, {
                font: '18px Arial',
                fill: '#FFD700'
            });
            bonusText.setOrigin(0.5);

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
        const buttonStartY = newRecordBonus > 0 ? height / 2 + 180 : height / 2 + 150;
        this.createButton(width / 2, buttonStartY, '다시 시작', () => {
            // 같은 모드로 재시작
            window.TowerStacker.currentMode = this.gameMode;
            // 퍼즐 모드는 스테이지 1부터 시작
            if (this.gameMode === 'puzzle') {
                window.TowerStacker.currentStage = 1;
            }
            this.scene.start('GameScene');
        });

        this.createButton(width / 2, buttonStartY + 70, '메인 메뉴', () => {
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
