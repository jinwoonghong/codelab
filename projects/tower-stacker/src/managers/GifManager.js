/**
 * GifManager - GIF 생성 및 공유 관리
 * TODO: 추후 구현 예정
 */
class GifManager {
    constructor() {
        this.isRecording = false;
        this.frames = [];
        this.maxFrames = 150; // 5초 @ 30fps
    }

    startRecording(canvas) {
        this.isRecording = true;
        this.frames = [];
        this.canvas = canvas;
    }

    stopRecording() {
        this.isRecording = false;
    }

    captureFrame() {
        if (!this.isRecording || !this.canvas) return;

        // TODO: 캔버스에서 프레임 캡처
        // const imageData = this.canvas.toDataURL();
        // this.frames.push(imageData);

        // 최대 프레임 수 제한
        if (this.frames.length > this.maxFrames) {
            this.frames.shift();
        }
    }

    async generateGif() {
        // TODO: gif.js를 사용하여 GIF 생성
        console.log('Generating GIF with', this.frames.length, 'frames');
        return null;
    }

    async shareGif(gifBlob) {
        // TODO: Web Share API를 사용하여 공유
        if (navigator.share) {
            try {
                await navigator.share({
                    files: [new File([gifBlob], 'tower-stacker.gif', { type: 'image/gif' })],
                    title: 'Tower Stacker',
                    text: '내 타워 스태커 기록!'
                });
            } catch (error) {
                console.error('Share failed:', error);
            }
        }
    }

    downloadGif(gifBlob) {
        // TODO: GIF 다운로드
        const url = URL.createObjectURL(gifBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tower-stacker.gif';
        a.click();
        URL.revokeObjectURL(url);
    }
}
