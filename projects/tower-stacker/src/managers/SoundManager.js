/**
 * SoundManager - 게임 사운드 및 음악 관리
 * Web Audio API를 사용하여 프로그래밍 방식으로 사운드 생성
 */
class SoundManager {
    constructor() {
        // AudioContext 초기화
        this.audioContext = null;
        this.masterGain = null;

        // 설정
        this.settings = {
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5,
            muted: false
        };

        // 로컬 스토리지에서 설정 불러오기
        this.loadSettings();

        // 현재 재생 중인 음악
        this.currentMusic = null;
        this.musicGain = null;
    }

    /**
     * AudioContext 초기화 (사용자 인터랙션 후 호출 필요)
     */
    init() {
        if (this.audioContext) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // 마스터 게인 노드 생성
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;

            console.log('🔊 SoundManager initialized');
        } catch (error) {
            console.error('AudioContext 초기화 실패:', error);
        }
    }

    /**
     * 블록 드롭 효과음
     */
    playBlockDrop() {
        if (!this.canPlaySound()) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 오실레이터 (톡 소리)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // 주파수: 높은 음에서 낮은 음으로 (톡!)
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        // 볼륨 조절
        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * 블록 쌓기 성공 효과음
     */
    playBlockStack() {
        if (!this.canPlaySound()) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // 밝은 음 (성공적인 느낌)
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        osc.type = 'sine';

        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    /**
     * 게임 오버 효과음
     */
    playGameOver() {
        if (!this.canPlaySound()) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 하강하는 음 (실망스러운 느낌)
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        osc.type = 'sawtooth';

        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    /**
     * 코인 획득 효과음
     */
    playCoinCollect() {
        if (!this.canPlaySound()) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 밝은 상승음
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
        osc.type = 'sine';

        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * 버튼 클릭 효과음
     */
    playButtonClick() {
        if (!this.canPlaySound()) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(800, now);
        osc.type = 'sine';

        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    /**
     * 새 기록 달성 효과음
     */
    playNewRecord() {
        if (!this.canPlaySound()) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 상승하는 화음
        const frequencies = [523, 659, 784]; // C, E, G (메이저 코드)

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            osc.type = 'sine';

            gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.2, now + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
    }

    /**
     * 특수 블록 효과음
     */
    playSpecialBlock(blockType) {
        if (!this.canPlaySound()) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // 블록 타입별 다른 소리
        switch (blockType) {
            case 'heavy':
                osc.frequency.setValueAtTime(150, now);
                osc.type = 'square';
                break;
            case 'bouncy':
                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
                osc.type = 'sine';
                break;
            case 'magnetic':
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
                osc.type = 'triangle';
                break;
            case 'glass':
                osc.frequency.setValueAtTime(2000, now);
                osc.type = 'sine';
                break;
            default:
                osc.frequency.setValueAtTime(500, now);
        }

        gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    /**
     * 배경 음악 재생 (간단한 루프)
     */
    playBackgroundMusic() {
        if (!this.canPlaySound() || this.currentMusic) return;

        const ctx = this.audioContext;

        // 음악용 게인 노드
        this.musicGain = ctx.createGain();
        this.musicGain.connect(this.masterGain);
        this.musicGain.gain.value = this.settings.musicVolume;

        // 간단한 멜로디 시퀀스 (메인 메뉴용)
        const melody = [
            { freq: 523, duration: 0.4 },  // C
            { freq: 659, duration: 0.4 },  // E
            { freq: 784, duration: 0.4 },  // G
            { freq: 659, duration: 0.4 },  // E
            { freq: 523, duration: 0.8 }   // C
        ];

        let currentTime = ctx.currentTime;
        const loopDuration = melody.reduce((sum, note) => sum + note.duration, 0);

        // 음악 재생 함수
        const playMelody = () => {
            if (!this.currentMusic) return;

            melody.forEach((note, i) => {
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc.connect(gainNode);
                gainNode.connect(this.musicGain);

                osc.frequency.setValueAtTime(note.freq, currentTime);
                osc.type = 'sine';

                gainNode.gain.setValueAtTime(0.05, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

                osc.start(currentTime);
                osc.stop(currentTime + note.duration);

                currentTime += note.duration;
            });

            // 루프
            this.currentMusic = setTimeout(() => {
                currentTime = ctx.currentTime;
                playMelody();
            }, loopDuration * 1000);
        };

        this.currentMusic = true;
        playMelody();
    }

    /**
     * 배경 음악 정지
     */
    stopBackgroundMusic() {
        if (this.currentMusic) {
            if (typeof this.currentMusic === 'number') {
                clearTimeout(this.currentMusic);
            }
            this.currentMusic = null;
        }
    }

    /**
     * 사운드 재생 가능 여부 확인
     */
    canPlaySound() {
        if (!this.audioContext) {
            this.init();
        }
        return this.audioContext && !this.settings.muted;
    }

    /**
     * 마스터 볼륨 설정
     */
    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
        }
        this.saveSettings();
    }

    /**
     * 효과음 볼륨 설정
     */
    setSfxVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    /**
     * 음악 볼륨 설정
     */
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.settings.musicVolume;
        }
        this.saveSettings();
    }

    /**
     * 음소거 토글
     */
    toggleMute() {
        this.settings.muted = !this.settings.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
        }
        this.saveSettings();
        return this.settings.muted;
    }

    /**
     * 음소거 설정
     */
    setMuted(muted) {
        this.settings.muted = muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
        }
        this.saveSettings();
    }

    /**
     * 설정 불러오기
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('towerStacker_soundSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
            }
        } catch (error) {
            console.error('사운드 설정 불러오기 실패:', error);
        }
    }

    /**
     * 설정 저장하기
     */
    saveSettings() {
        try {
            localStorage.setItem('towerStacker_soundSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('사운드 설정 저장 실패:', error);
        }
    }

    /**
     * 현재 설정 가져오기
     */
    getSettings() {
        return { ...this.settings };
    }
}
