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

        // 코인 획득 사운드
        if (this.earnedCoins > 0 && window.soundManager) {
            window.soundManager.playCoinCollect();
        }

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

            // 새 기록 달성 사운드
            if (window.soundManager) {
                window.soundManager.playNewRecord();
            }

            // 반짝임 효과
            this.tweens.add({
                targets: newRecordText,
                alpha: 0.3,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // 챌린지 코드 버튼
        const challengeY = newRecordBonus > 0 ? height / 2 + 170 : height / 2 + 140;
        const challengeBtn = this.createButton(width / 2, challengeY, '📋 챌린지 코드 복사', () => {
            this.copyChallengCode();
        });
        challengeBtn.scaleX = 0.85;
        challengeBtn.scaleY = 0.85;

        // GIF 저장 버튼
        const gifY = challengeY + 60;
        const gifBtn = this.createButton(width / 2, gifY, '🎬 명장면 GIF 저장', () => {
            this.saveHighlightGif();
        });
        gifBtn.scaleX = 0.85;
        gifBtn.scaleY = 0.85;

        // 버튼들
        const buttonStartY = newRecordBonus > 0 ? height / 2 + 290 : height / 2 + 260;
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

    copyChallengCode() {
        // 챌린지 코드 생성
        const challengeCode = window.replayManager.generateChallengeCode();

        if (!challengeCode) {
            this.showMessage('챌린지 코드 생성 실패', 0xFF6B6B);
            return;
        }

        // 클립보드에 복사
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(challengeCode).then(() => {
                this.showMessage('챌린지 코드가 클립보드에 복사되었습니다!', 0x4ECDC4);
                console.log('챌린지 코드:', challengeCode);
            }).catch(err => {
                console.error('클립보드 복사 실패:', err);
                this.showFallbackCopyUI(challengeCode);
            });
        } else {
            // Clipboard API를 지원하지 않는 경우
            this.showFallbackCopyUI(challengeCode);
        }
    }

    showFallbackCopyUI(code) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 반투명 배경
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);
        overlay.setInteractive();

        // 코드 표시 박스
        const box = this.add.container(width / 2, height / 2);

        const bg = this.add.rectangle(0, 0, 600, 300, 0x2d2d2d);
        bg.setStrokeStyle(3, 0x4ECDC4);

        const title = this.add.text(0, -120, '챌린지 코드', {
            font: 'bold 24px Arial',
            fill: '#4ECDC4'
        });
        title.setOrigin(0.5);

        const codeText = this.add.text(0, -50, code.substring(0, 60) + '...', {
            font: '14px monospace',
            fill: '#ffffff',
            wordWrap: { width: 550 }
        });
        codeText.setOrigin(0.5);

        const instruction = this.add.text(0, 20, '코드를 선택하여 복사하세요', {
            font: '16px Arial',
            fill: '#95E1D3'
        });
        instruction.setOrigin(0.5);

        const closeBtn = this.add.text(0, 100, '닫기', {
            font: 'bold 20px Arial',
            fill: '#ffffff',
            backgroundColor: '#4ECDC4',
            padding: { x: 40, y: 10 }
        });
        closeBtn.setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            box.destroy();
        });

        box.add([bg, title, codeText, instruction, closeBtn]);

        console.log('챌린지 코드:', code);
    }

    showMessage(text, color = 0xFFFFFF) {
        const width = this.cameras.main.width;
        const message = this.add.text(width / 2, 100, text, {
            font: 'bold 20px Arial',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 3
        });
        message.setOrigin(0.5);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 50,
            duration: 2000,
            onComplete: () => message.destroy()
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
            // 버튼 클릭 사운드
            if (window.soundManager) {
                window.soundManager.playButtonClick();
            }

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

    async saveHighlightGif() {
        if (!window.gifManager) {
            this.showMessage('GIF 생성 기능을 사용할 수 없습니다', 0xFF6B6B);
            return;
        }

        const frameCount = window.gifManager.getFrameCount();
        if (frameCount === 0) {
            this.showMessage('저장할 프레임이 없습니다', 0xFF6B6B);
            return;
        }

        try {
            // 생성 중 메시지 표시
            this.showMessage(`GIF 생성 중... (${frameCount}프레임)`, 0x4ECDC4);

            // GIF 생성
            const gifBlob = await window.gifManager.generateGif();

            // 파일명 생성 (타임스탬프 포함)
            const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
            const filename = `tower-stacker_${this.finalScore}점_${timestamp}.gif`;

            // 다운로드
            window.gifManager.downloadGif(gifBlob, filename);

            // 성공 메시지
            this.showMessage('✅ GIF 저장 완료!', 0x4ECDC4);

            // Web Share API 지원 확인 및 공유 옵션 제공
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([gifBlob], filename, { type: 'image/gif' })] })) {
                // 공유 버튼 표시 (선택적)
                const shareBtn = this.add.text(this.cameras.main.width / 2, 150, '📤 공유하기', {
                    font: 'bold 18px Arial',
                    fill: '#ffffff',
                    backgroundColor: '#4ECDC4',
                    padding: { x: 20, y: 10 }
                });
                shareBtn.setOrigin(0.5);
                shareBtn.setInteractive({ useHandCursor: true });
                shareBtn.on('pointerdown', async () => {
                    const success = await window.gifManager.shareGif(gifBlob, {
                        title: 'Tower Stacker',
                        text: `타워 스태커에서 ${this.finalScore}점을 기록했어요! 🏗️`
                    });
                    if (success) {
                        shareBtn.destroy();
                    }
                });

                // 3초 후 자동으로 제거
                this.time.delayedCall(3000, () => {
                    if (shareBtn && shareBtn.active) {
                        this.tweens.add({
                            targets: shareBtn,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => shareBtn.destroy()
                        });
                    }
                });
            }

            console.log('GIF 저장 완료:', filename, `(${(gifBlob.size / 1024).toFixed(2)} KB)`);
        } catch (error) {
            console.error('GIF 생성 오류:', error);
            this.showMessage('❌ GIF 생성 실패', 0xFF6B6B);
        }
    }
}
