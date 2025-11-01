/**
 * ShopScene - 상점/뽑기 화면
 */
class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // 타이틀
        const title = this.add.text(width / 2, 60, '🎁 블록 스킨 상점', {
            font: 'bold 36px Arial',
            fill: '#4ECDC4',
            stroke: '#000000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // 코인 잔액 표시
        this.coins = window.dataManager.getCoins();
        this.coinText = this.add.text(width - 20, 20, `💰 ${this.coins}`, {
            font: 'bold 24px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.coinText.setOrigin(1, 0);

        // 뽑기 비용 안내
        const costText = this.add.text(width / 2, 130, `뽑기 1회: ${GameConfig.gacha.cost} 코인`, {
            font: '20px Arial',
            fill: '#ffffff'
        });
        costText.setOrigin(0.5);

        // 확률 안내
        const ratesY = 170;
        const ratesText = this.add.text(width / 2, ratesY, '확률: 일반 70% | 레어 25% | 에픽 4% | 레전드 1%', {
            font: '16px Arial',
            fill: '#95E1D3'
        });
        ratesText.setOrigin(0.5);

        // 뽑기 박스 (중앙)
        this.createGachaBox(width / 2, height / 2);

        // 뽑기 버튼
        const buttonY = height / 2 + 150;
        this.gachaButton = this.createButton(width / 2, buttonY, '뽑기 (100 코인)', () => {
            this.performGacha();
        });

        // 메인 메뉴 버튼
        const backButton = this.createButton(width / 2, buttonY + 80, '메인 메뉴', () => {
            this.scene.start('MainMenuScene');
        });
        backButton.scaleX = 0.8;
        backButton.scaleY = 0.8;
    }

    createGachaBox(x, y) {
        // 선물 상자 그래픽
        const box = this.add.container(x, y);

        // 상자 본체
        const body = this.add.rectangle(0, 0, 120, 120, 0xFFD700);
        body.setStrokeStyle(4, 0xFFA500);

        // 리본 (가로)
        const ribbonH = this.add.rectangle(0, 0, 120, 20, 0xFF6B6B);

        // 리본 (세로)
        const ribbonV = this.add.rectangle(0, 0, 20, 120, 0xFF6B6B);

        // 리본 매듭
        const knot = this.add.circle(0, -60, 15, 0xFF0000);

        box.add([body, ribbonH, ribbonV, knot]);

        // 살짝 흔들리는 애니메이션
        this.tweens.add({
            targets: box,
            rotation: 0.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.gachaBox = box;
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

    performGacha() {
        const cost = GameConfig.gacha.cost;

        // 코인 부족 체크
        if (this.coins < cost) {
            this.showMessage('코인이 부족합니다!', 0xFF6B6B);
            return;
        }

        // 코인 차감
        if (!window.dataManager.spendCoins(cost)) {
            this.showMessage('코인 사용 실패!', 0xFF6B6B);
            return;
        }

        // 코인 표시 업데이트
        this.coins = window.dataManager.getCoins();
        this.coinText.setText(`💰 ${this.coins}`);

        // 뽑기 실행
        const result = window.dataManager.performGacha();

        // 상자를 인벤토리에 저장
        window.dataManager.saveInventoryItem({
            id: `${result.id}_${Date.now()}`,
            skinId: result.id,
            timestamp: Date.now()
        });

        // 뽑기 애니메이션
        this.playGachaAnimation(result);
    }

    playGachaAnimation(result) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 상자 흔들기 애니메이션
        this.tweens.add({
            targets: this.gachaBox,
            scaleX: 1.2,
            scaleY: 1.2,
            rotation: 0.3,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                // 상자 터지는 효과
                this.gachaBox.setAlpha(0);
                this.createExplosionEffect(width / 2, height / 2);

                // 결과 표시
                this.time.delayedCall(500, () => {
                    this.showGachaResult(result);
                    this.gachaBox.setAlpha(1);
                });
            }
        });
    }

    createExplosionEffect(x, y) {
        // 파티클 효과
        for (let i = 0; i < 20; i++) {
            const particle = this.add.circle(x, y, 5, 0xFFD700);
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 100 + Math.random() * 100;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }
    }

    showGachaResult(result) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 반투명 배경
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0);
        overlay.setInteractive();

        // 등급별 색상
        const rarityColors = {
            common: 0xCCCCCC,
            rare: 0x4169E1,
            epic: 0x9370DB,
            legendary: 0xFFD700
        };

        const rarityNames = {
            common: '일반',
            rare: '레어',
            epic: '에픽',
            legendary: '레전드'
        };

        // 결과 카드
        const card = this.add.container(width / 2, height / 2);

        const cardBg = this.add.rectangle(0, 0, 350, 400, 0x2d2d2d);
        cardBg.setStrokeStyle(4, rarityColors[result.rarity]);

        // 등급 텍스트
        const rarityText = this.add.text(0, -150, rarityNames[result.rarity], {
            font: 'bold 32px Arial',
            fill: `#${rarityColors[result.rarity].toString(16).padStart(6, '0')}`
        });
        rarityText.setOrigin(0.5);

        // 스킨 이름
        const nameText = this.add.text(0, -100, result.name, {
            font: 'bold 28px Arial',
            fill: '#ffffff'
        });
        nameText.setOrigin(0.5);

        // 스킨 미리보기 (색상 샘플)
        const sampleY = 0;
        result.colors.forEach((color, index) => {
            const sample = this.add.rectangle(-80 + index * 40, sampleY, 35, 60, color);
            sample.setStrokeStyle(2, 0xffffff);
            card.add(sample);
        });

        // 닫기 버튼
        const closeBtn = this.add.text(0, 140, '확인', {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            backgroundColor: '#4ECDC4',
            padding: { x: 40, y: 15 }
        });
        closeBtn.setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            card.destroy();
        });

        card.add([cardBg, rarityText, nameText, closeBtn]);

        // 등장 애니메이션
        card.setScale(0);
        this.tweens.add({
            targets: card,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    showMessage(text, color = 0xFFFFFF) {
        const width = this.cameras.main.width;
        const message = this.add.text(width / 2, 100, text, {
            font: 'bold 24px Arial',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 3
        });
        message.setOrigin(0.5);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 50,
            duration: 1500,
            onComplete: () => message.destroy()
        });
    }
}
