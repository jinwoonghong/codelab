/**
 * Block - 기본 블록 클래스
 * TODO: 추후 구현 예정
 */
class Block {
    constructor(scene, x, y, width, height, color) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        // 그래픽 객체
        this.graphics = null;

        // 물리 바디
        this.body = null;

        this.create();
    }

    create() {
        // 그래픽 생성
        this.graphics = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            this.color
        );

        // 물리 바디 생성
        this.body = this.scene.matter.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            {
                friction: GameConfig.gameplay.block.friction,
                restitution: GameConfig.gameplay.block.restitution,
                density: GameConfig.gameplay.block.density
            }
        );
    }

    update() {
        // 그래픽을 물리 바디 위치와 동기화
        if (this.body && this.graphics) {
            this.graphics.x = this.body.position.x;
            this.graphics.y = this.body.position.y;
            this.graphics.rotation = this.body.angle;
        }
    }

    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
        if (this.body) {
            this.scene.matter.world.remove(this.body);
        }
    }
}
