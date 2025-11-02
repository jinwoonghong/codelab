/**
 * ChallengeScene - 챌린지 코드 입력 및 검증
 */
class ChallengeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ChallengeScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // 타이틀
        const title = this.add.text(width / 2, 80, '🏆 챌린지 도전', {
            font: 'bold 42px Arial',
            fill: '#4ECDC4',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // 설명
        const description = this.add.text(width / 2, 150, '친구의 챌린지 코드를 입력하고\n고스트와 경쟁하세요!', {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        description.setOrigin(0.5);

        // 입력 박스 배경
        const inputBg = this.add.rectangle(width / 2, 250, 600, 80, 0x2d2d2d);
        inputBg.setStrokeStyle(3, 0x4ECDC4);

        // 안내 텍스트
        this.placeholderText = this.add.text(width / 2, 250, '여기를 클릭하여 코드 입력', {
            font: '20px Arial',
            fill: '#666666'
        });
        this.placeholderText.setOrigin(0.5);

        // 입력된 코드 표시
        this.codeText = this.add.text(width / 2, 250, '', {
            font: '16px monospace',
            fill: '#ffffff',
            wordWrap: { width: 550 }
        });
        this.codeText.setOrigin(0.5);
        this.codeText.setVisible(false);

        // 클릭 영역
        const inputArea = this.add.rectangle(width / 2, 250, 600, 80, 0x000000, 0);
        inputArea.setInteractive({ useHandCursor: true });
        inputArea.on('pointerdown', () => {
            this.showInputDialog();
        });

        // 붙여넣기 버튼
        const pasteBtn = this.createButton(width / 2, 360, '📋 클립보드에서 붙여넣기', () => {
            this.pasteFromClipboard();
        });
        pasteBtn.scaleX = 0.9;
        pasteBtn.scaleY = 0.9;

        // 시작 버튼 (처음엔 비활성화)
        this.startBtn = this.createButton(width / 2, 450, '챌린지 시작', () => {
            this.startChallenge();
        });
        this.startBtn.setAlpha(0.5);
        this.challengeCode = null;
        this.replayData = null;

        // 뒤로가기 버튼
        const backBtn = this.createButton(width / 2, height - 60, '메인 메뉴', () => {
            this.scene.start('MainMenuScene');
        });
        backBtn.scaleX = 0.8;
        backBtn.scaleY = 0.8;
    }

    showInputDialog() {
        const code = prompt('챌린지 코드를 입력하세요:');
        if (code && code.trim()) {
            this.validateCode(code.trim());
        }
    }

    async pasteFromClipboard() {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                    this.validateCode(text.trim());
                } else {
                    this.showMessage('클립보드가 비어있습니다', 0xFF6B6B);
                }
            } else {
                this.showMessage('클립보드 접근이 지원되지 않습니다', 0xFF6B6B);
                this.showInputDialog();
            }
        } catch (error) {
            console.error('클립보드 읽기 실패:', error);
            this.showMessage('클립보드 읽기 실패', 0xFF6B6B);
            this.showInputDialog();
        }
    }

    validateCode(code) {
        // 코드 파싱 시도
        const replayData = window.replayManager.parseChallengeCode(code);

        if (replayData && replayData.metadata && replayData.events) {
            // 검증 성공
            this.challengeCode = code;
            this.replayData = replayData;

            // UI 업데이트
            this.placeholderText.setVisible(false);
            this.codeText.setText(`코드 길이: ${code.length}자\n모드: ${replayData.metadata.mode || '알 수 없음'}\n이벤트: ${replayData.events.length}개`);
            this.codeText.setVisible(true);

            // 시작 버튼 활성화
            this.startBtn.setAlpha(1);

            this.showMessage('✅ 유효한 챌린지 코드입니다!', 0x4ECDC4);

            // 상세 정보 표시
            this.showChallengeInfo(replayData);
        } else {
            // 검증 실패
            this.showMessage('❌ 유효하지 않은 챌린지 코드입니다', 0xFF6B6B);
        }
    }

    showChallengeInfo(replayData) {
        const width = this.cameras.main.width;

        // 기존 정보 제거
        if (this.infoContainer) {
            this.infoContainer.destroy();
        }

        // 정보 컨테이너
        this.infoContainer = this.add.container(width / 2, 520);

        const bg = this.add.rectangle(0, 0, 500, 100, 0x2d2d2d, 0.8);
        bg.setStrokeStyle(2, 0x4ECDC4);

        const metadata = replayData.metadata;
        const result = metadata.result || {};

        const infoText = this.add.text(0, 0,
            `🎯 점수: ${result.score || 0} | 높이: ${result.height || 0}m | 블록: ${result.blockCount || 0}개`, {
            font: 'bold 16px Arial',
            fill: '#FFD700',
            align: 'center'
        });
        infoText.setOrigin(0.5);

        this.infoContainer.add([bg, infoText]);
    }

    startChallenge() {
        if (!this.replayData) {
            this.showMessage('챌린지 코드를 먼저 입력하세요', 0xFF6B6B);
            return;
        }

        // 리플레이 데이터를 전역 변수에 저장
        window.TowerStacker.currentReplayData = this.replayData;
        window.TowerStacker.currentMode = this.replayData.metadata.mode || 'classic';
        window.TowerStacker.isGhostMode = true;

        // 게임 시작
        this.scene.start('GameScene');
    }

    createButton(x, y, label, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 300, 60, 0x4ECDC4, 0.8);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, label, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        });
        text.setOrigin(0.5);

        button.add([bg, text]);

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

        bg.on('pointerdown', callback);

        return button;
    }

    showMessage(text, color = 0xFFFFFF) {
        const width = this.cameras.main.width;
        const message = this.add.text(width / 2, 180, text, {
            font: 'bold 20px Arial',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 3
        });
        message.setOrigin(0.5);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 130,
            duration: 2000,
            onComplete: () => message.destroy()
        });
    }
}
