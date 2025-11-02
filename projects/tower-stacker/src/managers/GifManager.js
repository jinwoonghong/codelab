/**
 * GifManager - GIF 생성 및 공유 관리
 * gif.js를 사용하여 게임 플레이 하이라이트를 GIF로 저장
 */
class GifManager {
    constructor() {
        this.isRecording = false;
        this.frames = [];
        this.maxFrames = 90; // 3초 @ 30fps (파일 크기 고려)
        this.frameInterval = 33; // ~30fps (1000ms / 30)
        this.lastCaptureTime = 0;
        this.canvas = null;
    }

    /**
     * 녹화 시작
     * @param {HTMLCanvasElement} canvas - Phaser 게임 캔버스
     */
    startRecording(canvas) {
        this.isRecording = true;
        this.frames = [];
        this.canvas = canvas;
        this.lastCaptureTime = Date.now();
        console.log('🎬 GIF 녹화 시작');
    }

    /**
     * 녹화 중지
     */
    stopRecording() {
        this.isRecording = false;
        console.log('⏹️ GIF 녹화 중지 -', this.frames.length, '프레임');
    }

    /**
     * 프레임 캡처 (게임 루프에서 호출)
     */
    captureFrame() {
        if (!this.isRecording || !this.canvas) return;

        const now = Date.now();
        // 프레임레이트 제한 (30fps)
        if (now - this.lastCaptureTime < this.frameInterval) return;

        try {
            // 캔버스에서 ImageData 추출
            const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // 작은 크기로 캡처 (성능 및 파일 크기 최적화)
            const width = 400;
            const height = Math.floor(this.canvas.height * (width / this.canvas.width));

            // 임시 캔버스에 리사이즈하여 저장
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.canvas, 0, 0, width, height);

            const imageData = tempCtx.getImageData(0, 0, width, height);
            this.frames.push({
                data: imageData,
                width: width,
                height: height
            });

            this.lastCaptureTime = now;

            // 최대 프레임 수 제한 (링 버퍼)
            if (this.frames.length > this.maxFrames) {
                this.frames.shift();
            }
        } catch (error) {
            console.error('프레임 캡처 오류:', error);
        }
    }

    /**
     * GIF 생성
     * @param {Object} options - GIF 생성 옵션
     * @returns {Promise<Blob>} - GIF Blob
     */
    async generateGif(options = {}) {
        if (this.frames.length === 0) {
            throw new Error('저장할 프레임이 없습니다');
        }

        return new Promise((resolve, reject) => {
            try {
                console.log('🎨 GIF 생성 시작 -', this.frames.length, '프레임');

                // gif.js 인스턴스 생성
                const gif = new GIF({
                    workers: 2,
                    quality: 10, // 1-30 (낮을수록 좋음)
                    width: this.frames[0].width,
                    height: this.frames[0].height,
                    workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
                    ...options
                });

                // 모든 프레임 추가
                this.frames.forEach(frame => {
                    gif.addFrame(frame.data, {
                        delay: this.frameInterval,
                        copy: true
                    });
                });

                // 완료 이벤트
                gif.on('finished', (blob) => {
                    console.log('✅ GIF 생성 완료 -', (blob.size / 1024).toFixed(2), 'KB');
                    resolve(blob);
                });

                // 에러 이벤트
                gif.on('error', (error) => {
                    console.error('❌ GIF 생성 실패:', error);
                    reject(error);
                });

                // 진행률 이벤트 (선택적)
                gif.on('progress', (progress) => {
                    console.log('GIF 생성 진행률:', Math.round(progress * 100) + '%');
                });

                // 렌더링 시작
                gif.render();
            } catch (error) {
                console.error('GIF 생성 오류:', error);
                reject(error);
            }
        });
    }

    /**
     * GIF 다운로드
     * @param {Blob} gifBlob - GIF Blob
     * @param {string} filename - 파일명
     */
    downloadGif(gifBlob, filename = 'tower-stacker.gif') {
        try {
            const url = URL.createObjectURL(gifBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('💾 GIF 다운로드:', filename);
        } catch (error) {
            console.error('GIF 다운로드 오류:', error);
        }
    }

    /**
     * Web Share API를 사용하여 GIF 공유
     * @param {Blob} gifBlob - GIF Blob
     * @param {Object} shareData - 공유 데이터
     */
    async shareGif(gifBlob, shareData = {}) {
        if (!navigator.share) {
            console.warn('Web Share API가 지원되지 않습니다');
            return false;
        }

        try {
            const file = new File([gifBlob], 'tower-stacker.gif', { type: 'image/gif' });
            await navigator.share({
                files: [file],
                title: shareData.title || 'Tower Stacker',
                text: shareData.text || '내 타워 스태커 기록!',
                ...shareData
            });
            console.log('📤 GIF 공유 완료');
            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('GIF 공유 실패:', error);
            }
            return false;
        }
    }

    /**
     * 현재 녹화 상태
     */
    isCurrentlyRecording() {
        return this.isRecording;
    }

    /**
     * 녹화된 프레임 수
     */
    getFrameCount() {
        return this.frames.length;
    }

    /**
     * 녹화 데이터 초기화
     */
    reset() {
        this.isRecording = false;
        this.frames = [];
        this.canvas = null;
        this.lastCaptureTime = 0;
    }
}
