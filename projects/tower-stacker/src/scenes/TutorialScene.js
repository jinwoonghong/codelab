/**
 * TutorialScene - 튜토리얼 화면
 */
class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x16213e).setOrigin(0);

        // 튜토리얼 단계
        this.currentStep = 0;
        this.steps = [
            {
                title: '게임 방법',
                text: '화면을 탭하여\n블록을 떨어뜨리세요!',
                icon: '👆',
                action: 'tap'
            },
            {
                title: '타워 쌓기',
                text: '블록을 높이 쌓아서\n최고 기록을 만드세요!',
                icon: '🏗️',
                action: 'stack'
            },
            {
                title: '특수 블록',
                text: '⚡ 가속 블록: 빠르게 떨어짐\n🎈 풍선 블록: 천천히 떨어짐\n🧲 자석 블록: 서로 끌어당김\n💎 유리 블록: 깨지기 쉬움',
                icon: '✨',
                action: 'special'
            },
            {
                title: '게임 모드',
                text: '클래식: 제한 없이 플레이\n타임 어택: 90초 안에 최대한!\n일일 도전: 매일 새로운 도전\n퍼즐: 목표 높이 달성',
                icon: '🎮',
                action: 'modes'
            },
            {
                title: '코인 & 스킨',
                text: '게임을 플레이하여 코인을 모으고\n상점에서 새로운 스킨을\n구매하세요!',
                icon: '💰',
                action: 'shop'
            }
        ];

        // 컨테이너
        this.tutorialContainer = this.add.container(width / 2, height / 2);

        // 진행도 표시
        this.progressText = this.add.text(width / 2, 50, '', {
            font: 'bold 18px Arial',
            fill: '#4ECDC4'
        });
        this.progressText.setOrigin(0.5);

        // 스킵 버튼
        const skipBtn = this.add.text(width - 20, 20, '건너뛰기 →', {
            font: 'bold 16px Arial',
            fill: '#FF6B6B'
        });
        skipBtn.setOrigin(1, 0);
        skipBtn.setInteractive({ useHandCursor: true });
        skipBtn.on('pointerdown', () => {
            if (window.soundManager) {
                window.soundManager.playButtonClick();
            }
            this.completeTutorial();
        });

        // 첫 단계 표시
        this.showStep(0);

        // 다음 단계로 진행 (화면 탭)
        this.input.on('pointerdown', (pointer) => {
            // 스킵 버튼이 아닌 경우에만
            if (pointer.y > 60) {
                this.nextStep();
            }
        });
    }

    showStep(stepIndex) {
        // 이전 콘텐츠 제거
        this.tutorialContainer.removeAll(true);

        const step = this.steps[stepIndex];

        // 아이콘
        const icon = this.add.text(0, -150, step.icon, {
            font: 'bold 80px Arial'
        });
        icon.setOrigin(0.5);

        // 제목
        const title = this.add.text(0, -50, step.title, {
            font: 'bold 32px Arial',
            fill: '#4ECDC4',
            stroke: '#000000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // 설명 텍스트
        const text = this.add.text(0, 40, step.text, {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center',
            lineSpacing: 10
        });
        text.setOrigin(0.5);

        // 컨테이너에 추가
        this.tutorialContainer.add([icon, title, text]);

        // 애니메이션
        this.tutorialContainer.setAlpha(0);
        this.tweens.add({
            targets: this.tutorialContainer,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });

        // 아이콘 애니메이션
        this.tweens.add({
            targets: icon,
            scale: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 진행도 업데이트
        this.progressText.setText(`${stepIndex + 1} / ${this.steps.length}`);

        // 마지막 단계면 "시작하기" 버튼 표시
        if (stepIndex === this.steps.length - 1) {
            const startBtn = this.createButton(0, 140, '게임 시작! 🚀', () => {
                this.completeTutorial();
            });
            this.tutorialContainer.add(startBtn);
        } else {
            // 다음 표시
            const nextHint = this.add.text(0, 140, '탭하여 계속 →', {
                font: 'italic 16px Arial',
                fill: '#95E1D3'
            });
            nextHint.setOrigin(0.5);
            this.tutorialContainer.add(nextHint);

            // 깜박임 애니메이션
            this.tweens.add({
                targets: nextHint,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;

            // 버튼 클릭 사운드
            if (window.soundManager) {
                window.soundManager.playButtonClick();
            }

            this.showStep(this.currentStep);
        }
    }

    completeTutorial() {
        // 튜토리얼 완료 플래그 설정
        try {
            localStorage.setItem('towerStacker_tutorialCompleted', 'true');
        } catch (error) {
            console.error('튜토리얼 완료 저장 실패:', error);
        }

        // 메인 메뉴로 이동
        this.scene.start('MainMenuScene');
    }

    createButton(x, y, label, callback) {
        const button = this.add.container(x, y);

        // 버튼 배경
        const bg = this.add.rectangle(0, 0, 280, 55, 0x4ECDC4);
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
            bg.setFillStyle(0x4ECDC4);
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
}
