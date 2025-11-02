/**
 * SettingsScene - 설정 화면
 */
class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // 배경
        this.add.rectangle(0, 0, width, height, 0x1a1a2e, 0.95).setOrigin(0);

        // 타이틀
        const title = this.add.text(width / 2, 50, '⚙️ 설정', {
            font: 'bold 36px Arial',
            fill: '#4ECDC4',
            stroke: '#000000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // 현재 설정 가져오기
        const settings = window.soundManager ? window.soundManager.getSettings() : {
            muted: false,
            masterVolume: 0.7,
            sfxVolume: 0.8,
            musicVolume: 0.5
        };

        // 사운드 온/오프
        const soundY = 140;
        this.add.text(width / 2, soundY, '사운드', {
            font: 'bold 24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        const soundToggleBtn = this.createToggleButton(
            width / 2,
            soundY + 50,
            !settings.muted,
            (enabled) => {
                if (window.soundManager) {
                    window.soundManager.setMuted(!enabled);
                    if (enabled) {
                        this.showMessage('사운드 켜짐 🔊', 0x4ECDC4);
                    } else {
                        this.showMessage('사운드 꺼짐 🔇', 0xFF6B6B);
                    }
                }
            }
        );

        // 마스터 볼륨
        const masterY = 260;
        this.add.text(width / 2, masterY, '마스터 볼륨', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.createVolumeSlider(
            width / 2,
            masterY + 50,
            settings.masterVolume,
            (value) => {
                if (window.soundManager) {
                    window.soundManager.setMasterVolume(value);
                }
            }
        );

        // 효과음 볼륨
        const sfxY = 360;
        this.add.text(width / 2, sfxY, '효과음 볼륨', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.createVolumeSlider(
            width / 2,
            sfxY + 50,
            settings.sfxVolume,
            (value) => {
                if (window.soundManager) {
                    window.soundManager.setSfxVolume(value);
                    // 테스트 사운드 재생
                    window.soundManager.playButtonClick();
                }
            }
        );

        // 음악 볼륨
        const musicY = 460;
        this.add.text(width / 2, musicY, '음악 볼륨', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.createVolumeSlider(
            width / 2,
            musicY + 50,
            settings.musicVolume,
            (value) => {
                if (window.soundManager) {
                    window.soundManager.setMusicVolume(value);
                }
            }
        );

        // 뒤로 가기 버튼
        this.createButton(width / 2, height - 80, '← 메인 메뉴', () => {
            this.scene.start('MainMenuScene');
        });
    }

    createToggleButton(x, y, initialState, callback) {
        const container = this.add.container(x, y);

        // 배경
        const bg = this.add.rectangle(0, 0, 120, 50, 0x2d2d2d);
        bg.setStrokeStyle(2, 0x4ECDC4);

        // 슬라이더
        const slider = this.add.rectangle(-30, 0, 40, 40, initialState ? 0x4ECDC4 : 0xFF6B6B);
        slider.setInteractive({ useHandCursor: true });

        // 상태 텍스트
        const statusText = this.add.text(0, 0, initialState ? 'ON' : 'OFF', {
            font: 'bold 18px Arial',
            fill: '#ffffff'
        });
        statusText.setOrigin(0.5);

        container.add([bg, slider, statusText]);

        let state = initialState;

        // 클릭 이벤트
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
            state = !state;

            // 애니메이션
            this.tweens.add({
                targets: slider,
                x: state ? 30 : -30,
                fillColor: state ? 0x4ECDC4 : 0xFF6B6B,
                duration: 200,
                ease: 'Back.easeOut'
            });

            statusText.setText(state ? 'ON' : 'OFF');

            // 버튼 클릭 사운드
            if (window.soundManager) {
                window.soundManager.playButtonClick();
            }

            callback(state);
        });

        return container;
    }

    createVolumeSlider(x, y, initialValue, callback) {
        const container = this.add.container(x, y);

        // 슬라이더 배경
        const sliderBg = this.add.rectangle(0, 0, 300, 10, 0x2d2d2d);
        sliderBg.setStrokeStyle(2, 0x4ECDC4);

        // 슬라이더 핸들
        const handle = this.add.circle((initialValue - 0.5) * 300, 0, 15, 0x4ECDC4);
        handle.setInteractive({ useHandCursor: true, draggable: true });

        // 값 표시 텍스트
        const valueText = this.add.text(0, 30, `${Math.round(initialValue * 100)}%`, {
            font: 'bold 16px Arial',
            fill: '#FFE66D'
        });
        valueText.setOrigin(0.5);

        container.add([sliderBg, handle, valueText]);

        // 드래그 이벤트
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === handle) {
                // 슬라이더 범위 제한
                const minX = -150;
                const maxX = 150;
                const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);

                handle.x = clampedX;

                // 값 계산 (0.0 ~ 1.0)
                const value = (clampedX + 150) / 300;
                valueText.setText(`${Math.round(value * 100)}%`);

                callback(value);
            }
        });

        return container;
    }

    createButton(x, y, label, callback) {
        const button = this.add.container(x, y);

        // 버튼 배경
        const bg = this.add.rectangle(0, 0, 300, 60, 0x4ECDC4, 0.8);
        bg.setInteractive({ useHandCursor: true });

        // 버튼 텍스트
        const text = this.add.text(0, 0, label, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        });
        text.setOrigin(0.5);

        button.add([bg, text]);

        // 호버 효과
        bg.on('pointerover', () => {
            bg.setFillStyle(0x95E1D3);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x4ECDC4, 0.8);
        });

        // 클릭 이벤트
        bg.on('pointerdown', () => {
            // 버튼 클릭 사운드
            if (window.soundManager) {
                window.soundManager.playButtonClick();
            }

            this.tweens.add({
                targets: button,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });

        return button;
    }

    showMessage(text, color = 0xFFFFFF) {
        const width = this.cameras.main.width;
        const message = this.add.text(width / 2, 80, text, {
            font: 'bold 18px Arial',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000',
            strokeThickness: 3
        });
        message.setOrigin(0.5);

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: 50,
            duration: 1500,
            onComplete: () => message.destroy()
        });
    }
}
