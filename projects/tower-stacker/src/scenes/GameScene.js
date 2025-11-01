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

        const color = Phaser.Math.RND.pick([
            0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181
        ]);

        // 그래픽 객체 (먼저 스태틱으로 생성 - 좌우로 움직일 예정)
        const graphics = this.add.rectangle(x, y, blockConfig.width, blockConfig.height, color);
        graphics.setStrokeStyle(2, 0xffffff, 0.5);

        this.currentBlock = {
            graphics: graphics,
            body: null,
            dropped: false,
            color: color,
            startX: 100, // 좌우 이동 범위
            endX: width - 100,
            speed: 3 // 이동 속도
        };

        this.blockCount++;
    }

    dropBlock() {
        if (this.isGameOver || !this.currentBlock || this.currentBlock.dropped) return;

        const blockConfig = GameConfig.gameplay.block;
        const graphics = this.currentBlock.graphics;

        // 현재 위치에서 물리 바디 생성
        const body = this.matter.add.rectangle(
            graphics.x,
            graphics.y,
            blockConfig.width,
            blockConfig.height,
            {
                friction: blockConfig.friction,
                restitution: blockConfig.restitution,
                density: blockConfig.density,
                label: 'block'
            }
        );

        this.currentBlock.body = body;
        this.currentBlock.dropped = true;

        // 블록 배열에 추가
        this.blocks.push(this.currentBlock);

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
            }
        });

        // 타워 높이 계산 및 업데이트
        this.updateTowerHeight();

        // 게임 오버 조건 체크 (블록이 화면 밖으로 떨어짐)
        this.checkGameOver();
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
}
