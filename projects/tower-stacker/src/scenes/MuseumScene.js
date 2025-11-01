/**
 * MuseumScene - 박물관 (업적, 칭호, 컬렉션 전시)
 */
class MuseumScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MuseumScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

        // 탭 관리
        this.currentTab = 'achievements'; // achievements, titles, collection

        // 타이틀
        const title = this.add.text(width / 2, 50, '🏛️ 나만의 박물관', {
            font: 'bold 36px Arial',
            fill: '#4ECDC4',
            stroke: '#000000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // 탭 버튼
        this.createTabButtons(width, 120);

        // 컨텐츠 영역
        this.contentY = 180;
        this.contentContainer = this.add.container(0, 0);

        // 첫 탭 표시
        this.showTab('achievements');

        // 뒤로가기 버튼
        const backButton = this.createButton(width / 2, height - 50, '메인 메뉴', () => {
            this.scene.start('MainMenuScene');
        });
        backButton.scaleX = 0.8;
        backButton.scaleY = 0.8;
    }

    createTabButtons(width, y) {
        const tabs = [
            { id: 'achievements', label: '🏆 업적', x: width / 2 - 180 },
            { id: 'titles', label: '👑 칭호', x: width / 2 },
            { id: 'collection', label: '🎨 컬렉션', x: width / 2 + 180 }
        ];

        this.tabButtons = {};

        tabs.forEach(tab => {
            const button = this.add.container(tab.x, y);

            const bg = this.add.rectangle(0, 0, 150, 40, 0x4ECDC4, 0.5);
            bg.setInteractive({ useHandCursor: true });

            const text = this.add.text(0, 0, tab.label, {
                font: 'bold 16px Arial',
                fill: '#ffffff'
            });
            text.setOrigin(0.5);

            button.add([bg, text]);

            bg.on('pointerdown', () => {
                this.showTab(tab.id);
            });

            this.tabButtons[tab.id] = { container: button, bg, text };
        });
    }

    showTab(tabId) {
        this.currentTab = tabId;

        // 모든 탭 버튼 비활성화 스타일
        Object.keys(this.tabButtons).forEach(id => {
            const btn = this.tabButtons[id];
            btn.bg.setFillStyle(0x4ECDC4, 0.5);
        });

        // 현재 탭 활성화 스타일
        this.tabButtons[tabId].bg.setFillStyle(0x95E1D3, 1);

        // 컨텐츠 지우기
        this.contentContainer.removeAll(true);

        // 탭별 컨텐츠 표시
        switch (tabId) {
            case 'achievements':
                this.showAchievements();
                break;
            case 'titles':
                this.showTitles();
                break;
            case 'collection':
                this.showCollection();
                break;
        }
    }

    showAchievements() {
        const width = this.cameras.main.width;
        const achievements = window.dataManager.getAchievements();
        const statistics = window.dataManager.getStatistics();

        let y = this.contentY;

        GameConfig.achievements.forEach((ach, index) => {
            const unlocked = achievements[ach.id] && achievements[ach.id].unlocked;
            const statValue = statistics[ach.type] || 0;
            const progress = Math.min(100, (statValue / ach.target) * 100);

            // 업적 카드
            const card = this.add.container(width / 2, y);

            const cardBg = this.add.rectangle(0, 0, 700, 80, 0x2d2d2d, unlocked ? 1 : 0.5);
            cardBg.setStrokeStyle(2, unlocked ? 0xFFD700 : 0x666666);

            // 아이콘
            const icon = this.add.text(-320, 0, ach.icon, {
                font: '32px Arial'
            });
            icon.setOrigin(0.5);

            // 이름 & 설명
            const name = this.add.text(-270, -15, ach.name, {
                font: 'bold 18px Arial',
                fill: unlocked ? '#FFD700' : '#999999'
            });
            name.setOrigin(0, 0.5);

            const desc = this.add.text(-270, 10, ach.description, {
                font: '14px Arial',
                fill: unlocked ? '#ffffff' : '#666666'
            });
            desc.setOrigin(0, 0.5);

            // 진행도
            const progressText = this.add.text(200, 0, `${statValue}/${ach.target}`, {
                font: 'bold 16px Arial',
                fill: unlocked ? '#4ECDC4' : '#999999'
            });
            progressText.setOrigin(0.5);

            // 보상
            const reward = this.add.text(300, 0, `💰 ${ach.reward}`, {
                font: 'bold 16px Arial',
                fill: unlocked ? '#FFD700' : '#999999'
            });
            reward.setOrigin(0.5);

            card.add([cardBg, icon, name, desc, progressText, reward]);
            this.contentContainer.add(card);

            y += 90;
        });

        // 스크롤 안내
        if (GameConfig.achievements.length > 4) {
            const scrollHint = this.add.text(width / 2, this.contentY + 400, '↕ 스크롤하여 더 보기', {
                font: '14px Arial',
                fill: '#666666'
            });
            scrollHint.setOrigin(0.5);
            this.contentContainer.add(scrollHint);
        }
    }

    showTitles() {
        const width = this.cameras.main.width;
        const currentTitleId = window.dataManager.getCurrentTitle();
        const unlockedTitles = window.dataManager.getUnlockedTitles();

        let y = this.contentY;

        // 현재 칭호 표시
        const currentTitle = GameConfig.titles.find(t => t.id === currentTitleId);
        if (currentTitle) {
            const currentCard = this.add.container(width / 2, y);
            const bg = this.add.rectangle(0, 0, 400, 80, 0xFFD700, 0.3);
            bg.setStrokeStyle(3, 0xFFD700);

            const label = this.add.text(0, -25, '현재 칭호', {
                font: 'bold 14px Arial',
                fill: '#FFD700'
            });
            label.setOrigin(0.5);

            const titleText = this.add.text(0, 10, `${currentTitle.icon} ${currentTitle.name}`, {
                font: 'bold 24px Arial',
                fill: '#ffffff'
            });
            titleText.setOrigin(0.5);

            currentCard.add([bg, label, titleText]);
            this.contentContainer.add(currentCard);

            y += 120;
        }

        // 해금된 칭호 목록
        const titleLabel = this.add.text(width / 2, y, '해금된 칭호', {
            font: 'bold 20px Arial',
            fill: '#4ECDC4'
        });
        titleLabel.setOrigin(0.5);
        this.contentContainer.add(titleLabel);

        y += 40;

        GameConfig.titles.forEach(title => {
            const unlocked = unlockedTitles.find(t => t.id === title.id);

            const card = this.add.container(width / 2, y);

            const cardBg = this.add.rectangle(0, 0, 400, 60, 0x2d2d2d, unlocked ? 1 : 0.3);
            cardBg.setStrokeStyle(2, unlocked ? 0x4ECDC4 : 0x666666);

            if (unlocked) {
                cardBg.setInteractive({ useHandCursor: true });
                cardBg.on('pointerdown', () => {
                    window.dataManager.setCurrentTitle(title.id);
                    this.showTab('titles'); // 갱신
                });
            }

            const icon = this.add.text(-170, 0, title.icon, {
                font: '24px Arial'
            });
            icon.setOrigin(0.5);

            const name = this.add.text(-130, 0, title.name, {
                font: 'bold 18px Arial',
                fill: unlocked ? '#ffffff' : '#666666'
            });
            name.setOrigin(0, 0.5);

            // 조건 표시
            let condText = '';
            if (title.requirement) {
                const reqAch = GameConfig.achievements.find(a => a.id === title.requirement);
                condText = unlocked ? '✓ 해금됨' : `🔒 ${reqAch ? reqAch.name : '???'}`;
            } else {
                condText = '✓ 기본 칭호';
            }

            const cond = this.add.text(130, 0, condText, {
                font: '14px Arial',
                fill: unlocked ? '#4ECDC4' : '#999999'
            });
            cond.setOrigin(1, 0.5);

            card.add([cardBg, icon, name, cond]);
            this.contentContainer.add(card);

            y += 70;
        });
    }

    showCollection() {
        const width = this.cameras.main.width;
        const inventory = window.dataManager.getInventory();
        const currentSkinId = window.dataManager.getCurrentSkin();

        let y = this.contentY;

        // 현재 스킨 표시
        const currentSkin = window.dataManager.getSkinById(currentSkinId);
        if (currentSkin) {
            const currentCard = this.add.container(width / 2, y);
            const bg = this.add.rectangle(0, 0, 500, 120, 0x4ECDC4, 0.3);
            bg.setStrokeStyle(3, 0x4ECDC4);

            const label = this.add.text(0, -45, '현재 적용 중인 스킨', {
                font: 'bold 16px Arial',
                fill: '#4ECDC4'
            });
            label.setOrigin(0.5);

            const name = this.add.text(0, -15, currentSkin.name, {
                font: 'bold 20px Arial',
                fill: '#ffffff'
            });
            name.setOrigin(0.5);

            // 색상 샘플
            currentSkin.colors.forEach((color, index) => {
                const sample = this.add.rectangle(-100 + index * 50, 30, 40, 60, color);
                sample.setStrokeStyle(2, 0xffffff);
                currentCard.add(sample);
            });

            currentCard.add([bg, label, name]);
            this.contentContainer.add(currentCard);

            y += 160;
        }

        // 전체 스킨 컬렉션
        const collectionLabel = this.add.text(width / 2, y, '스킨 컬렉션', {
            font: 'bold 20px Arial',
            fill: '#4ECDC4'
        });
        collectionLabel.setOrigin(0.5);
        this.contentContainer.add(collectionLabel);

        y += 40;

        // 모든 스킨 표시
        const allSkins = [
            ...GameConfig.skins.common,
            ...GameConfig.skins.rare,
            ...GameConfig.skins.epic,
            ...GameConfig.skins.legendary
        ];

        allSkins.forEach(skin => {
            const card = this.add.container(width / 2, y);

            // 기본 스킨(클래식)은 항상 소유한 것으로 간주
            const owned = skin.id === 'classic' || inventory.some(item => item.skinId === skin.id);

            const rarityColors = {
                common: 0xCCCCCC,
                rare: 0x4169E1,
                epic: 0x9370DB,
                legendary: 0xFFD700
            };

            const cardBg = this.add.rectangle(0, 0, 500, 100, 0x2d2d2d, owned ? 1 : 0.3);
            cardBg.setStrokeStyle(2, rarityColors[skin.rarity]);

            if (owned) {
                cardBg.setInteractive({ useHandCursor: true });
                cardBg.on('pointerdown', () => {
                    window.dataManager.setCurrentSkin(skin.id);
                    this.showTab('collection'); // 갱신
                });
            }

            const name = this.add.text(-220, -30, skin.name, {
                font: 'bold 18px Arial',
                fill: owned ? '#ffffff' : '#666666'
            });
            name.setOrigin(0, 0.5);

            const rarityText = this.add.text(-220, -5, skin.rarity.toUpperCase(), {
                font: '12px Arial',
                fill: `#${rarityColors[skin.rarity].toString(16).padStart(6, '0')}`
            });
            rarityText.setOrigin(0, 0.5);

            // 색상 샘플
            if (owned) {
                skin.colors.forEach((color, index) => {
                    const sample = this.add.rectangle(-220 + index * 45, 30, 35, 50, color);
                    sample.setStrokeStyle(2, 0xffffff);
                    card.add(sample);
                });
            } else {
                const locked = this.add.text(0, 30, '🔒 미획득', {
                    font: 'bold 16px Arial',
                    fill: '#666666'
                });
                locked.setOrigin(0.5);
                card.add(locked);
            }

            card.add([cardBg, name, rarityText]);
            this.contentContainer.add(card);

            y += 110;
        });
    }

    createButton(x, y, label, callback) {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 250, 50, 0x4ECDC4, 0.8);
        bg.setInteractive({ useHandCursor: true });

        const text = this.add.text(0, 0, label, {
            font: 'bold 18px Arial',
            fill: '#ffffff'
        });
        text.setOrigin(0.5);

        button.add([bg, text]);

        bg.on('pointerover', () => {
            bg.setFillStyle(0x95E1D3);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x4ECDC4, 0.8);
        });

        bg.on('pointerdown', callback);

        return button;
    }
}
