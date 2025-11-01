/**
 * SpecialBlocks - 특수 블록 클래스들
 * TODO: 추후 구현 예정
 */

/**
 * 접착 블록 - 착지 시 주변 블록과 잠시 접착
 */
class AdhesiveBlock extends Block {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, width, height, 0xFFD93D);
        this.type = 'adhesive';
    }

    onCollide() {
        // TODO: 접착 효과 구현
        console.log('Adhesive block collision!');
    }
}

/**
 * 고무 블록 - 높은 반발력과 탄성
 */
class RubberBlock extends Block {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, width, height, 0xFF6B9D);
        this.type = 'rubber';

        // 고무 블록은 반발력이 높음
        if (this.body) {
            this.body.restitution = 0.8;
        }
    }
}

/**
 * 가속 블록 - 빠른 낙하 속도, 추가 점수
 */
class SpeedBlock extends Block {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, width, height, 0xFF5733);
        this.type = 'speed';

        // 가속 블록은 밀도가 높음 (빠르게 떨어짐)
        if (this.body) {
            this.body.density = 0.003;
        }
    }
}

/**
 * 유리 블록 - 가볍고 섬세, 쉽게 깨짐
 */
class GlassBlock extends Block {
    constructor(scene, x, y, width, height) {
        super(scene, x, y, width, height, 0xA8DADC);
        this.type = 'glass';
        this.health = 3; // 낮은 내구도

        // 유리 블록은 매우 가벼움
        if (this.body) {
            this.body.density = 0.0005;
        }

        // 반투명 효과
        this.graphics.setAlpha(0.7);
    }

    takeDamage() {
        this.health--;
        if (this.health <= 0) {
            this.shatter();
        }
    }

    shatter() {
        // TODO: 깨지는 효과 구현
        console.log('Glass block shattered!');
        this.destroy();
    }
}
