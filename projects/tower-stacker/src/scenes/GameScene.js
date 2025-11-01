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

        // 블록 생성 (임시로 사각형만)
        const x = width / 2;
        const y = 100;

        const color = Phaser.Math.RND.pick([
            0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181
        ]);

        // 그래픽 객체
        const graphics = this.add.rectangle(x, y, blockConfig.width, blockConfig.height, color);

        // 물리 바디
        const body = this.matter.add.rectangle(
            x, y,
            blockConfig.width,
            blockConfig.height,
            {
                friction: blockConfig.friction,
                restitution: blockConfig.restitution,
                density: blockConfig.density
            }
        );

        // 물리 바디와 그래픽 연결
        graphics.setData('body', body);

        this.currentBlock = {
            graphics: graphics,
            body: body,
            dropped: false
        };
    }

    dropBlock() {
        if (this.isGameOver || !this.currentBlock || this.currentBlock.dropped) return;

        this.currentBlock.dropped = true;

        // 다음 블록 생성 (약간의 딜레이 후)
        this.time.delayedCall(1000, () => {
            this.spawnNextBlock();
        });

        // 점수 업데이트 (임시)
        this.score += 10;
        this.scoreText.setText(`높이: ${this.score}m`);
    }

    update() {
        // 현재 블록의 위치를 물리 바디와 동기화
        if (this.currentBlock && this.currentBlock.dropped) {
            const body = this.currentBlock.body;
            const graphics = this.currentBlock.graphics;

            graphics.x = body.position.x;
            graphics.y = body.position.y;
            graphics.rotation = body.angle;
        }

        // TODO: 타워 안정성 체크
        // TODO: 게임 오버 조건 체크
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
