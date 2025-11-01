/**
 * ScoreManager - 점수 및 기록 관리
 * TODO: 추후 구현 예정
 */
class ScoreManager {
    constructor() {
        this.currentScore = 0;
        this.currentHeight = 0;
    }

    reset() {
        this.currentScore = 0;
        this.currentHeight = 0;
    }

    addScore(points) {
        this.currentScore += points;
    }

    updateHeight(height) {
        if (height > this.currentHeight) {
            this.currentHeight = height;
        }
    }

    getScore() {
        return this.currentScore;
    }

    getHeight() {
        return this.currentHeight;
    }
}
