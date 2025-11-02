/**
 * ReplayManager - 리플레이 및 챌린지 코드 관리
 */
class ReplayManager {
    constructor() {
        this.isRecording = false;
        this.recordedData = [];
        this.startTime = 0;
        this.gameMode = 'classic';
        this.metadata = {};
    }

    /**
     * 녹화 시작
     */
    startRecording(gameMode, metadata = {}) {
        this.isRecording = true;
        this.recordedData = [];
        this.startTime = Date.now();
        this.gameMode = gameMode;
        this.metadata = {
            mode: gameMode,
            timestamp: this.startTime,
            ...metadata
        };
        console.log('리플레이 녹화 시작');
    }

    /**
     * 녹화 중지
     */
    stopRecording() {
        this.isRecording = false;
        console.log(`리플레이 녹화 중지 (${this.recordedData.length}개 이벤트)`);
    }

    /**
     * 블록 드롭 이벤트 기록
     */
    recordBlockDrop(blockType, x, y) {
        if (!this.isRecording) return;

        const time = Date.now() - this.startTime;
        this.recordedData.push({
            time: time,
            type: 'drop',
            blockType: blockType,
            x: Math.round(x),
            y: Math.round(y)
        });
    }

    /**
     * 환경 효과 이벤트 기록
     */
    recordEnvironmentEffect(effectType, direction = null) {
        if (!this.isRecording) return;

        const time = Date.now() - this.startTime;
        this.recordedData.push({
            time: time,
            type: 'environment',
            effectType: effectType,
            direction: direction
        });
    }

    /**
     * 게임 결과 기록
     */
    recordGameResult(result) {
        if (!this.isRecording) return;

        this.metadata.result = {
            score: result.score,
            height: result.height,
            blockCount: result.blockCount,
            timestamp: Date.now()
        };
    }

    /**
     * 챌린지 코드 생성 (LZ-String + Base64)
     */
    generateChallengeCode() {
        try {
            const replayData = {
                metadata: this.metadata,
                events: this.recordedData
            };

            const dataString = JSON.stringify(replayData);

            // LZ-String 압축 (CDN에서 로드됨)
            if (typeof LZString !== 'undefined') {
                const compressed = LZString.compressToBase64(dataString);
                console.log(`챌린지 코드 생성 완료 (압축률: ${((compressed.length / dataString.length) * 100).toFixed(1)}%)`);
                return compressed;
            } else {
                // LZ-String이 없으면 Base64만 사용
                const base64 = btoa(dataString);
                console.log('챌린지 코드 생성 (Base64만 사용)');
                return base64;
            }
        } catch (error) {
            console.error('챌린지 코드 생성 실패:', error);
            return null;
        }
    }

    /**
     * 챌린지 코드 파싱
     */
    parseChallengeCode(code) {
        try {
            let dataString;

            // LZ-String 압축 해제 시도
            if (typeof LZString !== 'undefined') {
                try {
                    dataString = LZString.decompressFromBase64(code);
                } catch (e) {
                    console.log('LZ-String 압축 해제 실패, Base64 시도');
                }
            }

            // Base64 디코딩 시도
            if (!dataString) {
                dataString = atob(code);
            }

            const replayData = JSON.parse(dataString);
            console.log('챌린지 코드 파싱 성공:', replayData.metadata);
            return replayData;
        } catch (error) {
            console.error('챌린지 코드 파싱 실패:', error);
            return null;
        }
    }

    /**
     * 녹화된 데이터 가져오기
     */
    getRecordedData() {
        return this.recordedData;
    }

    /**
     * 메타데이터 가져오기
     */
    getMetadata() {
        return this.metadata;
    }

    /**
     * 녹화 중인지 확인
     */
    isRecordingActive() {
        return this.isRecording;
    }

    /**
     * 리플레이 재생을 위한 이벤트 반복자
     */
    createReplayIterator(replayData) {
        let currentIndex = 0;
        const events = replayData.events || [];

        return {
            hasNext: () => currentIndex < events.length,
            getNext: (currentTime) => {
                const nextEvents = [];

                while (currentIndex < events.length && events[currentIndex].time <= currentTime) {
                    nextEvents.push(events[currentIndex]);
                    currentIndex++;
                }

                return nextEvents;
            },
            reset: () => {
                currentIndex = 0;
            },
            getMetadata: () => replayData.metadata
        };
    }
}

// 전역 인스턴스
window.replayManager = new ReplayManager();
