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

        // 게임 상태 초기화
        this.score = 0;
        this.currentHeight = 0;
        this.isGameOver = false;
        this.blocks = [];
        this.groundY = height - 25; // 바닥 y 위치 저장
        this.blockCount = 0;
        this.movingDirection = 1; // 블록 이동 방향

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

        // 점수 텍스트
        this.scoreText = this.add.text(20, 20, '높이: 0m', {
            font: 'bold 24px Arial',
            fill: '#FFE66D'
        });

        // 일시정지 버튼 (간단히 텍스트로)
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
        // 특수 블록 등장 확률
        const rand = Math.random();
        const specialChance = GameConfig.gameplay.specialBlockChance;

        if (rand < specialChance) {
            // 특수 블록 중 랜덤 선택
            const types = ['adhesive', 'rubber', 'speed', 'glass'];
            return Phaser.Math.RND.pick(types);
        }

        return 'normal';
    }

    getBlockInfo(type) {
        const blockTypes = {
            normal: {
                color: Phaser.Math.RND.pick([0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181]),
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

        // 게임 오버 씬으로 전환
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', { score: this.score });
        });
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
        const newGravity = originalGravity * (Math.random() < 0.5 ? 1.5 : 0.5);

        console.log('🌍 중력 변화!', newGravity > originalGravity ? '증가' : '감소');

        this.matter.world.engine.gravity.y = newGravity;

        // 시각 효과
        this.cameras.main.shake(100, 0.002);

        // 5초 후 원래대로
        this.time.delayedCall(5000, () => {
            this.matter.world.engine.gravity.y = originalGravity;
            this.gravityChangeActive = false;
        });
    }
}
