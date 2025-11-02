/**
 * GameScene - 메인 게임 플레이 씬
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x16213e).setOrigin(0);

        // 게임 모드 설정
        this.gameMode = window.TowerStacker.currentMode || 'classic';
        this.modeConfig = GameConfig.modes[this.gameMode];

        // 현재 스킨 불러오기
        const currentSkinId = window.dataManager.getCurrentSkin();
        this.currentSkin = window.dataManager.getSkinById(currentSkinId);

        // 고스트 모드 확인
        this.isGhostMode = window.TowerStacker.isGhostMode || false;
        this.replayData = window.TowerStacker.currentReplayData || null;

        if (this.isGhostMode && this.replayData) {
            // 리플레이 반복자 생성
            this.replayIterator = window.replayManager.createReplayIterator(this.replayData);
            this.replayStartTime = Date.now();
            this.ghostBlocks = [];
            console.log('고스트 모드 시작:', this.replayData.metadata);
        }

        // 게임 상태 초기화
        this.score = 0;
        this.currentHeight = 0;
        this.isGameOver = false;
        this.blocks = [];
        this.groundY = height - 25; // 바닥 y 위치 저장
        this.blockCount = 0;
        this.movingDirection = 1; // 블록 이동 방향

        // 타임 어택 모드 초기화
        if (this.gameMode === 'timeAttack') {
            this.timeRemaining = this.modeConfig.timeLimit; // 90000ms = 90초
            this.startTime = Date.now();
        }

        // 일일 도전 모드 초기화
        if (this.gameMode === 'dailyChallenge') {
            this.initDailySeed();
        }

        // 퍼즐 모드 초기화
        if (this.gameMode === 'puzzle') {
            this.currentStage = window.TowerStacker.currentStage || 1;
            this.stageGoal = this.getStageGoal(this.currentStage);
        }

        // 리플레이 녹화 시작
        window.replayManager.startRecording(this.gameMode, {
            skinId: window.dataManager.getCurrentSkin()
        });

        // GIF 녹화 시작
        if (window.gifManager) {
            window.gifManager.startRecording(this.game.canvas);
        }

        // UI 생성
        this.createUI();

        // 바닥 생성
        this.createGround();

        // 첫 블록 생성
        this.spawnNextBlock();

        // 입력 처리
        this.input.on('pointerdown', () => this.dropBlock());
    }

    createUI() {
        const width = this.cameras.main.width;

        // 게임 모드 표시
        this.modeText = this.add.text(width / 2, 20, this.modeConfig.name, {
            font: 'bold 18px Arial',
            fill: '#4ECDC4'
        });
        this.modeText.setOrigin(0.5, 0);

        // 점수 텍스트
        this.scoreText = this.add.text(20, 60, '높이: 0m | 점수: 0', {
            font: 'bold 20px Arial',
            fill: '#FFE66D'
        });

        // 타임 어택 모드: 타이머 표시
        if (this.gameMode === 'timeAttack') {
            this.timerText = this.add.text(width / 2, 50, '⏱ 90', {
                font: 'bold 32px Arial',
                fill: '#FF6B6B'
            });
            this.timerText.setOrigin(0.5, 0);
        }

        // 퍼즐 모드: 스테이지 및 목표 표시
        if (this.gameMode === 'puzzle') {
            this.stageText = this.add.text(20, 100, `스테이지 ${this.currentStage}`, {
                font: 'bold 18px Arial',
                fill: '#95E1D3'
            });

            this.goalText = this.add.text(20, 130, this.getGoalText(), {
                font: '16px Arial',
                fill: '#ffffff'
            });
        }

        // 일일 도전 모드: 날짜 표시
        if (this.gameMode === 'dailyChallenge') {
            const today = new Date().toLocaleDateString('ko-KR');
            this.dateText = this.add.text(20, 100, `📅 ${today}`, {
                font: '16px Arial',
                fill: '#95E1D3'
            });
        }

        // 일시정지 버튼
        const pauseBtn = this.add.text(width - 20, 20, '⏸', {
            font: '32px Arial',
            fill: '#ffffff'
        });
        pauseBtn.setOrigin(1, 0);
        pauseBtn.setInteractive({ useHandCursor: true });
        pauseBtn.on('pointerdown', () => this.pauseGame());
    }

    createGround() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const groundHeight = 50;

        // 바닥 그래픽
        this.add.rectangle(width / 2, height - groundHeight / 2, width, groundHeight, 0x2d4059);

        // 물리 바디
        this.ground = this.matter.add.rectangle(
            width / 2,
            height - groundHeight / 2,
            width,
            groundHeight,
            {
                isStatic: true,
                friction: 0.8,
                restitution: 0
            }
        );
    }

    spawnNextBlock() {
        if (this.isGameOver) return;

        const width = this.cameras.main.width;
        const blockConfig = GameConfig.gameplay.block;

        // 블록 생성 위치 (타워 위)
        const x = width / 2;
        const y = 50;

        // 특수 블록 타입 결정 (확률 기반)
        const blockType = this.determineBlockType();
        const blockInfo = this.getBlockInfo(blockType);

        // 그래픽 객체 (먼저 스태틱으로 생성 - 좌우로 움직일 예정)
        const graphics = this.add.rectangle(x, y, blockConfig.width, blockConfig.height, blockInfo.color);
        graphics.setStrokeStyle(2, blockInfo.strokeColor || 0xffffff, 0.5);

        // 특수 블록은 반투명 효과
        if (blockType !== 'normal') {
            graphics.setAlpha(blockInfo.alpha || 1);
        }

        // 특수 블록 아이콘/텍스트 표시
        const icon = this.add.text(x, y, blockInfo.icon, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        });
        icon.setOrigin(0.5);

        this.currentBlock = {
            graphics: graphics,
            icon: icon,
            body: null,
            dropped: false,
            type: blockType,
            color: blockInfo.color,
            properties: blockInfo.properties,
            startX: 100,
            endX: width - 100,
            speed: 3
        };

        this.blockCount++;
    }

    determineBlockType() {
        // 일일 도전 모드에서는 시드 기반 랜덤 사용
        const rand = this.gameMode === 'dailyChallenge' ? this.seededRandom() : Math.random();
        const specialChance = GameConfig.gameplay.specialBlockChance;

        if (rand < specialChance) {
            // 특수 블록 중 랜덤 선택
            const types = ['adhesive', 'rubber', 'speed', 'glass'];

            // 일일 도전 모드에서는 시드 기반 선택
            if (this.gameMode === 'dailyChallenge') {
                const typeIndex = Math.floor(this.seededRandom() * types.length);
                return types[typeIndex];
            }

            return Phaser.Math.RND.pick(types);
        }

        return 'normal';
    }

    getBlockInfo(type) {
        // 현재 스킨의 색상 사용
        const skinColors = this.currentSkin ? this.currentSkin.colors : [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181];

        const blockTypes = {
            normal: {
                color: Phaser.Math.RND.pick(skinColors),
                icon: '',
                properties: {}
            },
            adhesive: {
                color: 0xFFD93D,
                strokeColor: 0xFFAA00,
                icon: '🔗',
                alpha: 1,
                properties: {
                    friction: 1.5,
                    adhesionTime: 2000, // 2초간 접착
                    adhesionStrength: 0.05
                }
            },
            rubber: {
                color: 0xFF6B9D,
                strokeColor: 0xFF1493,
                icon: '⚽',
                alpha: 1,
                properties: {
                    restitution: 0.9, // 높은 반발력
                    friction: 0.3
                }
            },
            speed: {
                color: 0xFF5733,
                strokeColor: 0xFF0000,
                icon: '⚡',
                alpha: 1,
                properties: {
                    density: 0.004, // 더 빠르게 떨어짐
                    bonusScore: 50
                }
            },
            glass: {
                color: 0xA8DADC,
                strokeColor: 0x87CEEB,
                icon: '💎',
                alpha: 0.6,
                properties: {
                    density: 0.0005, // 매우 가벼움
                    fragile: true,
                    health: 3
                }
            }
        };

        return blockTypes[type] || blockTypes.normal;
    }

    dropBlock() {
        if (this.isGameOver || !this.currentBlock || this.currentBlock.dropped) return;

        const blockConfig = GameConfig.gameplay.block;
        const graphics = this.currentBlock.graphics;
        const props = this.currentBlock.properties;

        // 특수 블록의 물리 속성 적용
        const physicsOptions = {
            friction: props.friction || blockConfig.friction,
            restitution: props.restitution || blockConfig.restitution,
            density: props.density || blockConfig.density,
            label: this.currentBlock.type
        };

        // 현재 위치에서 물리 바디 생성
        const body = this.matter.add.rectangle(
            graphics.x,
            graphics.y,
            blockConfig.width,
            blockConfig.height,
            physicsOptions
        );

        this.currentBlock.body = body;
        this.currentBlock.dropped = true;

        // 블록 배열에 추가
        this.blocks.push(this.currentBlock);

        // 리플레이 녹화: 블록 드롭 이벤트
        window.replayManager.recordBlockDrop(
            this.currentBlock.type,
            graphics.x,
            graphics.y
        );

        // 특수 블록 효과 적용
        this.applySpecialBlockEffect(this.currentBlock);

        // 가속 블록 보너스 점수
        if (this.currentBlock.type === 'speed' && props.bonusScore) {
            this.score += props.bonusScore;
            this.showBonusText(graphics.x, graphics.y, `+${props.bonusScore}`);
        }

        // 다음 블록 생성 (약간의 딜레이 후)
        this.time.delayedCall(1000, () => {
            this.spawnNextBlock();
        });
    }

    update() {
        if (this.isGameOver) return;

        // 현재 블록이 드롭되지 않았다면 좌우로 움직이기
        if (this.currentBlock && !this.currentBlock.dropped) {
            const block = this.currentBlock;
            const graphics = block.graphics;

            // 좌우로 이동
            graphics.x += block.speed * this.movingDirection;

            // 아이콘도 함께 이동
            if (block.icon) {
                block.icon.x = graphics.x;
                block.icon.y = graphics.y;
            }

            // 경계에 닿으면 방향 전환
            if (graphics.x <= block.startX || graphics.x >= block.endX) {
                this.movingDirection *= -1;
            }
        }

        // 모든 드롭된 블록의 위치를 물리 바디와 동기화
        this.blocks.forEach(block => {
            if (block.body && block.graphics) {
                block.graphics.x = block.body.position.x;
                block.graphics.y = block.body.position.y;
                block.graphics.rotation = block.body.angle;

                // 아이콘도 함께 동기화
                if (block.icon) {
                    block.icon.x = block.body.position.x;
                    block.icon.y = block.body.position.y;
                    block.icon.rotation = block.body.angle;
                }
            }

            // 유리 블록 충돌 감지 (깨짐 효과)
            if (block.type === 'glass' && block.properties.fragile && block.body) {
                this.checkGlassBlockDamage(block);
            }
        });

        // 타워 높이 계산 및 업데이트
        this.updateTowerHeight();

        // 게임 오버 조건 체크 (블록이 화면 밖으로 떨어짐)
        this.checkGameOver();

        // 환경 변수 체크
        this.checkEnvironmentalEffects();

        // 타임 어택 모드: 타이머 업데이트
        if (this.gameMode === 'timeAttack' && this.timerText) {
            this.updateTimer();
        }

        // 퍼즐 모드: 목표 달성 체크
        if (this.gameMode === 'puzzle') {
            this.checkStageGoal();
        }

        // 고스트 모드: 리플레이 재생
        if (this.isGhostMode && this.replayIterator) {
            this.updateGhostReplay();
        }

        // GIF 프레임 캡처
        if (window.gifManager && window.gifManager.isCurrentlyRecording()) {
            window.gifManager.captureFrame();
        }
    }

    updateTowerHeight() {
        if (this.blocks.length === 0) return;

        // 가장 높은 블록의 y 위치 찾기 (y가 작을수록 높음)
        let highestY = this.groundY;
        this.blocks.forEach(block => {
            if (block.body && block.body.position.y < highestY) {
                highestY = block.body.position.y;
            }
        });

        // 높이 계산 (픽셀을 미터로 변환, 약 10픽셀 = 1m)
        const height = Math.floor((this.groundY - highestY) / 10);

        if (height > this.currentHeight) {
            this.currentHeight = height;
            this.score = height * 10; // 점수 = 높이 x 10
            this.scoreText.setText(`높이: ${this.currentHeight}m | 점수: ${this.score}`);
        }
    }

    checkGameOver() {
        const height = this.cameras.main.height;
        const margin = 100; // 화면 밖으로 떨어진 것으로 판정할 여유 공간

        this.blocks.forEach(block => {
            if (!block.body) return;

            // 블록이 화면 아래로 떨어졌는지 체크
            if (block.body.position.y > height + margin) {
                this.gameOver();
            }

            // 블록이 너무 기울어졌는지 체크 (45도 이상)
            const angle = Math.abs(block.body.angle);
            if (angle > Math.PI / 4) { // 45도
                // 일정 시간 이상 기울어져 있으면 게임 오버
                if (!block.tiltTime) {
                    block.tiltTime = this.time.now;
                } else if (this.time.now - block.tiltTime > 2000) {
                    this.gameOver();
                }
            } else {
                block.tiltTime = null;
            }
        });
    }

    pauseGame() {
        console.log('Game paused');
        // TODO: 일시정지 기능 구현
    }

    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;
        console.log('Game Over! Final score:', this.score);

        // 코인 계산
        const earnedCoins = this.calculateEarnedCoins();
        const specialBlockCount = this.blocks.filter(b => b.type !== 'normal').length;

        // 통계 업데이트
        const updates = {
            maxHeight: this.currentHeight,
            totalBlocks: this.blockCount,
            specialBlocks: specialBlockCount,
            coinsEarned: earnedCoins,
            gamesPlayed: 1
        };

        // 퍼즐 모드라면 스테이지 정보 추가
        if (this.gameMode === 'puzzle' && this.currentStage) {
            updates.puzzleStage = this.currentStage;
        }

        window.dataManager.updateStatistics(updates);

        // 리플레이 녹화: 게임 결과 기록 및 중지
        window.replayManager.recordGameResult({
            score: this.score,
            height: this.currentHeight,
            blockCount: this.blockCount
        });
        window.replayManager.stopRecording();

        // GIF 녹화 중지
        if (window.gifManager && window.gifManager.isCurrentlyRecording()) {
            window.gifManager.stopRecording();
        }

        // 게임 오버 씬으로 전환
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                score: this.score,
                mode: this.gameMode,
                stage: this.currentStage, // 퍼즐 모드의 경우
                earnedCoins: earnedCoins,
                height: this.currentHeight,
                blockCount: this.blockCount,
                specialBlockCount: specialBlockCount
            });
        });
    }

    /**
     * 획득한 코인 계산
     */
    calculateEarnedCoins() {
        const coinConfig = GameConfig.coins;
        const modeConfig = this.modeConfig;

        let coins = 0;

        // 기본 코인 (높이 + 블록 수)
        coins += this.currentHeight * coinConfig.perHeight;
        coins += this.blockCount * coinConfig.perBlock;

        // 특수 블록 보너스
        const specialBlockCount = this.blocks.filter(b => b.type !== 'normal').length;
        coins += specialBlockCount * coinConfig.specialBlockBonus;

        // 타임 어택 시간 보너스
        if (this.gameMode === 'timeAttack' && this.timeRemaining && this.startTime) {
            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, this.timeRemaining - elapsed);
            const secondsRemaining = Math.floor(remaining / 1000);
            coins += secondsRemaining * coinConfig.timeAttackTimeBonus;
        }

        // 퍼즐 스테이지 완료 보너스
        if (this.gameMode === 'puzzle' && this.stageCompleted) {
            coins += coinConfig.stageCompleteBonus;
        }

        // 모드별 배율 적용
        coins = Math.floor(coins * modeConfig.coinMultiplier);

        console.log(`Earned coins: ${coins}`);
        return coins;
    }

    // ===== 특수 블록 효과 함수들 =====

    applySpecialBlockEffect(block) {
        switch (block.type) {
            case 'adhesive':
                this.applyAdhesiveEffect(block);
                break;
            case 'rubber':
                // 고무 블록은 이미 물리 속성으로 적용됨
                this.createParticleEffect(block.graphics.x, block.graphics.y, 0xFF6B9D);
                break;
            case 'speed':
                this.createParticleEffect(block.graphics.x, block.graphics.y, 0xFF5733);
                break;
            case 'glass':
                this.createParticleEffect(block.graphics.x, block.graphics.y, 0xA8DADC);
                break;
        }
    }

    applyAdhesiveEffect(block) {
        if (!block.body) return;

        // 접착 블록이 착지한 후 2초간 주변 블록과 접착
        this.time.delayedCall(100, () => {
            // 주변 블록 찾기
            const nearbyBlocks = this.blocks.filter(b => {
                if (b === block || !b.body) return false;

                const distance = Phaser.Math.Distance.Between(
                    block.body.position.x,
                    block.body.position.y,
                    b.body.position.x,
                    b.body.position.y
                );

                return distance < 100; // 100픽셀 이내의 블록
            });

            // 접착 효과 (일시적으로 연결)
            nearbyBlocks.forEach(nearbyBlock => {
                if (nearbyBlock.body && block.body) {
                    // 물리 엔진의 constraint 사용하여 연결
                    const constraint = this.matter.add.constraint(
                        block.body,
                        nearbyBlock.body,
                        0, // 거리
                        block.properties.adhesionStrength || 0.05
                    );

                    // 일정 시간 후 접착 해제
                    this.time.delayedCall(block.properties.adhesionTime || 2000, () => {
                        this.matter.world.removeConstraint(constraint);
                    });
                }
            });

            this.createParticleEffect(block.graphics.x, block.graphics.y, 0xFFD93D);
        });
    }

    checkGlassBlockDamage(block) {
        if (!block.body || block.broken) return;

        // 속도가 일정 이상이면 깨짐
        const velocity = block.body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

        if (speed > 3) { // 임계 속도
            block.properties.health--;

            if (block.properties.health <= 0) {
                this.breakGlassBlock(block);
            }
        }
    }

    breakGlassBlock(block) {
        if (block.broken) return;

        block.broken = true;

        // 깨지는 효과
        this.createShatterEffect(block.graphics.x, block.graphics.y);

        // 블록 제거
        if (block.graphics) block.graphics.setAlpha(0.2);
        if (block.icon) block.icon.setAlpha(0);

        // 물리 바디 제거
        this.time.delayedCall(500, () => {
            if (block.body) {
                this.matter.world.remove(block.body);
                block.body = null;
            }
        });
    }

    showBonusText(x, y, text) {
        const bonusText = this.add.text(x, y, text, {
            font: 'bold 24px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        });
        bonusText.setOrigin(0.5);

        // 위로 올라가며 사라지는 효과
        this.tweens.add({
            targets: bonusText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => bonusText.destroy()
        });
    }

    createParticleEffect(x, y, color) {
        // 간단한 파티클 효과
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 3, color);
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 50;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }

    createShatterEffect(x, y) {
        // 유리 깨지는 효과
        for (let i = 0; i < 12; i++) {
            const shard = this.add.rectangle(x, y, 10, 10, 0xA8DADC);
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 50;

            this.tweens.add({
                targets: shard,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                alpha: 0,
                duration: 800,
                onComplete: () => shard.destroy()
            });
        }
    }

    // ===== 환경 변수 함수들 =====

    checkEnvironmentalEffects() {
        if (this.currentHeight < 10) return; // 일정 높이 이상에서만 발동

        const triggers = GameConfig.gameplay.environmentTriggers;

        // 돌풍 효과
        if (this.currentHeight >= triggers.wind.minHeight / 10 && !this.windActive) {
            if (Math.random() < 0.002) { // 0.2% 확률로 발동
                this.triggerWindEffect();
            }
        }

        // 중력 변화
        if (this.currentHeight >= triggers.gravity.minHeight / 10 && !this.gravityChangeActive) {
            if (Math.random() < 0.001) { // 0.1% 확률로 발동
                this.triggerGravityChange();
            }
        }
    }

    triggerWindEffect() {
        this.windActive = true;

        const direction = Math.random() < 0.5 ? -1 : 1;
        const force = 0.002 * direction;

        console.log('💨 돌풍 발생!');

        // 리플레이 녹화: 환경 효과
        window.replayManager.recordEnvironmentEffect('wind', direction);

        // 모든 블록에 힘 적용
        this.blocks.forEach(block => {
            if (block.body) {
                this.matter.body.applyForce(block.body, block.body.position, {
                    x: force,
                    y: 0
                });
            }
        });

        // 시각 효과 (바람 라인)
        this.createWindEffect(direction);

        // 3초 후 종료
        this.time.delayedCall(3000, () => {
            this.windActive = false;
        });
    }

    createWindEffect(direction) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        for (let i = 0; i < 5; i++) {
            const line = this.add.line(
                0, 0,
                0, Math.random() * height,
                width * (direction > 0 ? -0.2 : 1.2), Math.random() * height,
                0xffffff, 0.3
            );
            line.setOrigin(0, 0);
            line.setLineWidth(2);

            this.tweens.add({
                targets: line,
                x: width * (direction > 0 ? 1.2 : -0.2),
                duration: 1000,
                repeat: 2,
                onComplete: () => line.destroy()
            });
        }
    }

    triggerGravityChange() {
        this.gravityChangeActive = true;

        const originalGravity = this.matter.world.engine.gravity.y;
        const multiplier = Math.random() < 0.5 ? 1.5 : 0.5;
        const newGravity = originalGravity * multiplier;

        console.log('🌍 중력 변화!', newGravity > originalGravity ? '증가' : '감소');

        // 리플레이 녹화: 환경 효과
        window.replayManager.recordEnvironmentEffect('gravity', multiplier);

        this.matter.world.engine.gravity.y = newGravity;

        // 시각 효과
        this.cameras.main.shake(100, 0.002);

        // 5초 후 원래대로
        this.time.delayedCall(5000, () => {
            this.matter.world.engine.gravity.y = originalGravity;
            this.gravityChangeActive = false;
        });
    }

    // ===== 게임 모드별 함수들 =====

    /**
     * 타임 어택 모드: 타이머 업데이트
     */
    updateTimer() {
        if (!this.startTime || !this.timeRemaining) return;

        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.timeRemaining - elapsed);
        const seconds = Math.ceil(remaining / 1000);

        // 타이머 업데이트
        if (this.timerText) {
            this.timerText.setText(`⏱ ${seconds}`);

            // 시간이 얼마 남지 않으면 빨간색으로 깜빡임
            if (seconds <= 10) {
                this.timerText.setTint(seconds % 2 === 0 ? 0xFF0000 : 0xFF6B6B);
            }
        }

        // 시간 종료
        if (remaining <= 0) {
            console.log('⏱ 시간 종료!');
            this.gameOver();
        }
    }

    /**
     * 일일 도전 모드: 날짜 기반 시드 초기화
     */
    initDailySeed() {
        // 오늘 날짜로 시드 생성 (YYYYMMDD 형식)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.dailySeed = parseInt(`${year}${month}${day}`);
        this.seedIndex = 0;

        console.log('📅 일일 도전 시드:', this.dailySeed);
    }

    /**
     * 시드 기반 랜덤 숫자 생성 (0-1 사이)
     */
    seededRandom() {
        if (!this.dailySeed) return Math.random();

        // Simple Linear Congruential Generator (LCG)
        this.seedIndex++;
        const x = Math.sin(this.dailySeed + this.seedIndex) * 10000;
        return x - Math.floor(x);
    }

    /**
     * 퍼즐 모드: 스테이지 목표 달성 체크
     */
    checkStageGoal() {
        if (!this.stageGoal || this.stageCompleted) return;

        let goalAchieved = false;

        switch (this.stageGoal.type) {
            case 'height':
                // 특정 높이 도달
                if (this.currentHeight >= this.stageGoal.target) {
                    goalAchieved = true;
                }
                break;

            case 'blocks':
                // 특정 개수의 블록 쌓기
                if (this.blockCount >= this.stageGoal.target) {
                    goalAchieved = true;
                }
                break;

            case 'special':
                // 특수 블록 사용 횟수
                const specialCount = this.blocks.filter(b => b.type !== 'normal').length;
                if (specialCount >= this.stageGoal.target) {
                    goalAchieved = true;
                }
                break;

            case 'survive':
                // 시간 생존
                if (!this.surviveStartTime) {
                    this.surviveStartTime = Date.now();
                }
                const survivedTime = Date.now() - this.surviveStartTime;
                if (survivedTime >= this.stageGoal.target) {
                    goalAchieved = true;
                }
                break;
        }

        if (goalAchieved) {
            this.completeStage();
        }
    }

    /**
     * 스테이지 완료 처리
     */
    completeStage() {
        if (this.stageCompleted) return;

        this.stageCompleted = true;
        console.log('🎉 스테이지 완료!');

        // 완료 메시지 표시
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const completeText = this.add.text(width / 2, height / 2, '🎉 스테이지 완료! 🎉', {
            font: 'bold 36px Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        completeText.setOrigin(0.5);
        completeText.setAlpha(0);

        this.tweens.add({
            targets: completeText,
            alpha: 1,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 0
        });

        // 3초 후 다음 스테이지 또는 게임 오버
        this.time.delayedCall(3000, () => {
            const nextStage = this.currentStage + 1;
            const nextGoal = this.getStageGoal(nextStage);

            if (nextGoal) {
                // 다음 스테이지로
                window.TowerStacker.currentStage = nextStage;
                this.scene.restart();
            } else {
                // 모든 스테이지 완료
                this.gameOver();
            }
        });
    }

    /**
     * 스테이지 목표 가져오기
     */
    getStageGoal(stageNumber) {
        const stages = [
            { stage: 1, type: 'height', target: 5, description: '높이 5m 달성' },
            { stage: 2, type: 'blocks', target: 10, description: '블록 10개 쌓기' },
            { stage: 3, type: 'height', target: 10, description: '높이 10m 달성' },
            { stage: 4, type: 'special', target: 3, description: '특수 블록 3개 사용' },
            { stage: 5, type: 'height', target: 15, description: '높이 15m 달성' },
            { stage: 6, type: 'blocks', target: 20, description: '블록 20개 쌓기' },
            { stage: 7, type: 'survive', target: 30000, description: '30초 생존' },
            { stage: 8, type: 'height', target: 20, description: '높이 20m 달성' },
            { stage: 9, type: 'special', target: 5, description: '특수 블록 5개 사용' },
            { stage: 10, type: 'height', target: 30, description: '높이 30m 달성 (최종)' }
        ];

        return stages.find(s => s.stage === stageNumber);
    }

    /**
     * 목표 텍스트 가져오기
     */
    getGoalText() {
        if (!this.stageGoal) return '';

        return `목표: ${this.stageGoal.description}`;
    }

    // ===== 고스트 리플레이 함수들 =====

    /**
     * 고스트 리플레이 업데이트
     */
    updateGhostReplay() {
        if (!this.replayIterator) return;

        const currentTime = Date.now() - this.replayStartTime;
        const events = this.replayIterator.getNext(currentTime);

        events.forEach(event => {
            this.processGhostEvent(event);
        });

        // 고스트 블록 위치 업데이트 (물리 시뮬레이션)
        this.ghostBlocks.forEach(ghostBlock => {
            if (ghostBlock.body && ghostBlock.graphics) {
                ghostBlock.graphics.x = ghostBlock.body.position.x;
                ghostBlock.graphics.y = ghostBlock.body.position.y;
                ghostBlock.graphics.rotation = ghostBlock.body.angle;

                if (ghostBlock.icon) {
                    ghostBlock.icon.x = ghostBlock.body.position.x;
                    ghostBlock.icon.y = ghostBlock.body.position.y;
                    ghostBlock.icon.rotation = ghostBlock.body.angle;
                }
            }
        });
    }

    /**
     * 고스트 이벤트 처리
     */
    processGhostEvent(event) {
        switch (event.type) {
            case 'drop':
                this.createGhostBlock(event);
                break;
            case 'environment':
                // 환경 효과는 이미 플레이어에게도 적용됨
                console.log('고스트 환경 효과:', event.effectType);
                break;
        }
    }

    /**
     * 고스트 블록 생성
     */
    createGhostBlock(event) {
        const blockConfig = GameConfig.gameplay.block;
        const blockInfo = this.getBlockInfo(event.blockType);

        // 그래픽 객체 (반투명)
        const graphics = this.add.rectangle(
            event.x,
            event.y,
            blockConfig.width,
            blockConfig.height,
            blockInfo.color,
            0.3 // 반투명
        );
        graphics.setStrokeStyle(2, 0xFFFFFF, 0.5);
        graphics.setDepth(-1); // 플레이어 블록 뒤에 표시

        // 아이콘 (반투명)
        const icon = this.add.text(event.x, event.y, blockInfo.icon, {
            font: 'bold 20px Arial',
            fill: '#ffffff',
            alpha: 0.3
        });
        icon.setOrigin(0.5);
        icon.setDepth(-1);

        // 물리 바디 생성 (센서 모드 - 충돌 없음)
        const body = this.matter.add.rectangle(
            event.x,
            event.y,
            blockConfig.width,
            blockConfig.height,
            {
                friction: blockInfo.properties.friction || blockConfig.friction,
                restitution: blockInfo.properties.restitution || blockConfig.restitution,
                density: blockInfo.properties.density || blockConfig.density,
                isSensor: true, // 충돌 없음
                label: 'ghost_' + event.blockType
            }
        );

        const ghostBlock = {
            graphics: graphics,
            icon: icon,
            body: body,
            type: event.blockType,
            isGhost: true
        };

        this.ghostBlocks.push(ghostBlock);

        // 고스트 블록이 화면 밖으로 떨어지면 제거
        this.time.delayedCall(30000, () => {
            if (ghostBlock.graphics) ghostBlock.graphics.destroy();
            if (ghostBlock.icon) ghostBlock.icon.destroy();
            if (ghostBlock.body) this.matter.world.remove(ghostBlock.body);
        });
    }
}
