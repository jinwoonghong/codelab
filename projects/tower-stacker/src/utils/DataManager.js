/**
 * DataManager - IndexedDB를 사용한 로컬 데이터 관리
 */
class DataManager {
    constructor() {
        this.dbName = 'TowerStackerDB';
        this.dbVersion = 1;
        this.db = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized && this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.initialized = true;
                console.log('IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Object Stores 생성
                if (!db.objectStoreNames.contains('highScores')) {
                    db.createObjectStore('highScores', { keyPath: 'mode' });
                }

                if (!db.objectStoreNames.contains('inventory')) {
                    db.createObjectStore('inventory', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('achievements')) {
                    db.createObjectStore('achievements', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('replays')) {
                    db.createObjectStore('replays', { keyPath: 'id', autoIncrement: true });
                }

                console.log('IndexedDB object stores created');
            };
        });
    }

    async saveHighScore(mode, score) {
        try {
            await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['highScores'], 'readwrite');
                const store = transaction.objectStore('highScores');

                // 먼저 기존 기록 조회
                const getRequest = store.get(mode);

                getRequest.onsuccess = () => {
                    const existingRecord = getRequest.result;

                    // 기존 기록이 없거나 새 점수가 더 높으면 저장
                    if (!existingRecord || score > existingRecord.score) {
                        const record = {
                            mode: mode,
                            score: score,
                            timestamp: Date.now()
                        };

                        const putRequest = store.put(record);

                        putRequest.onsuccess = () => {
                            console.log(`New high score saved for ${mode}: ${score}`);
                            resolve(true);
                        };

                        putRequest.onerror = () => {
                            console.error('Error saving high score:', putRequest.error);
                            reject(putRequest.error);
                        };
                    } else {
                        console.log('Score not high enough to save');
                        resolve(false);
                    }
                };

                getRequest.onerror = () => {
                    console.error('Error getting high score:', getRequest.error);
                    reject(getRequest.error);
                };
            });
        } catch (error) {
            console.error('Error in saveHighScore:', error);
            return false;
        }
    }

    async getHighScore(mode) {
        try {
            await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['highScores'], 'readonly');
                const store = transaction.objectStore('highScores');
                const request = store.get(mode);

                request.onsuccess = () => {
                    const record = request.result;
                    resolve(record ? record.score : 0);
                };

                request.onerror = () => {
                    console.error('Error getting high score:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error in getHighScore:', error);
            return 0;
        }
    }

    async saveInventoryItem(item) {
        try {
            await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['inventory'], 'readwrite');
                const store = transaction.objectStore('inventory');
                const request = store.put(item);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error saving inventory item:', error);
            return false;
        }
    }

    async getInventory() {
        try {
            await this.init();

            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['inventory'], 'readonly');
                const store = transaction.objectStore('inventory');
                const request = store.getAll();

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting inventory:', error);
            return [];
        }
    }

    // ===== 코인 관리 (LocalStorage 사용) =====

    /**
     * 현재 코인 잔액 조회
     */
    getCoins() {
        try {
            const coins = localStorage.getItem(GameConfig.storage.coins);
            return coins ? parseInt(coins, 10) : 0;
        } catch (error) {
            console.error('Error getting coins:', error);
            return 0;
        }
    }

    /**
     * 코인 추가
     */
    addCoins(amount) {
        try {
            const currentCoins = this.getCoins();
            const newAmount = currentCoins + amount;
            localStorage.setItem(GameConfig.storage.coins, newAmount.toString());
            console.log(`Added ${amount} coins. Total: ${newAmount}`);
            return newAmount;
        } catch (error) {
            console.error('Error adding coins:', error);
            return this.getCoins();
        }
    }

    /**
     * 코인 사용 (차감)
     */
    spendCoins(amount) {
        try {
            const currentCoins = this.getCoins();
            if (currentCoins >= amount) {
                const newAmount = currentCoins - amount;
                localStorage.setItem(GameConfig.storage.coins, newAmount.toString());
                console.log(`Spent ${amount} coins. Remaining: ${newAmount}`);
                return true;
            } else {
                console.log('Not enough coins');
                return false;
            }
        } catch (error) {
            console.error('Error spending coins:', error);
            return false;
        }
    }

    /**
     * 코인 설정 (디버그/관리자용)
     */
    setCoins(amount) {
        try {
            localStorage.setItem(GameConfig.storage.coins, amount.toString());
            console.log(`Coins set to: ${amount}`);
            return amount;
        } catch (error) {
            console.error('Error setting coins:', error);
            return this.getCoins();
        }
    }

    // ===== 스킨 관리 =====

    /**
     * 현재 적용된 스킨 ID 조회
     */
    getCurrentSkin() {
        try {
            const skinId = localStorage.getItem(GameConfig.storage.currentSkin);
            return skinId || 'classic'; // 기본값: 클래식
        } catch (error) {
            console.error('Error getting current skin:', error);
            return 'classic';
        }
    }

    /**
     * 스킨 적용
     */
    setCurrentSkin(skinId) {
        try {
            localStorage.setItem(GameConfig.storage.currentSkin, skinId);
            console.log(`Current skin set to: ${skinId}`);
            return true;
        } catch (error) {
            console.error('Error setting current skin:', error);
            return false;
        }
    }

    /**
     * 스킨 ID로 스킨 데이터 가져오기
     */
    getSkinById(skinId) {
        const allSkins = [
            ...GameConfig.skins.common,
            ...GameConfig.skins.rare,
            ...GameConfig.skins.epic,
            ...GameConfig.skins.legendary
        ];
        return allSkins.find(skin => skin.id === skinId);
    }

    /**
     * 뽑기 실행
     */
    performGacha() {
        const rand = Math.random();
        const rates = GameConfig.gacha.rates;

        let rarity;
        if (rand < rates.legendary) {
            rarity = 'legendary';
        } else if (rand < rates.legendary + rates.epic) {
            rarity = 'epic';
        } else if (rand < rates.legendary + rates.epic + rates.rare) {
            rarity = 'rare';
        } else {
            rarity = 'common';
        }

        // 해당 등급의 스킨 중 랜덤 선택
        const skinsInRarity = GameConfig.skins[rarity];
        const selectedSkin = Phaser.Math.RND.pick(skinsInRarity);

        return { ...selectedSkin, isNew: false };
    }

    // ===== 통계 관리 (LocalStorage 사용) =====

    /**
     * 통계 조회
     */
    getStatistics() {
        try {
            const stats = localStorage.getItem(GameConfig.storage.statistics);
            if (stats) {
                return JSON.parse(stats);
            }
            // 기본 통계 구조
            return {
                maxHeight: 0,
                totalBlocks: 0,
                specialBlocks: 0,
                coinsEarned: 0,
                gamesPlayed: 0,
                puzzleStage: 0,
                skinsOwned: 1 // 클래식 스킨 기본 소유
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                maxHeight: 0,
                totalBlocks: 0,
                specialBlocks: 0,
                coinsEarned: 0,
                gamesPlayed: 0,
                puzzleStage: 0,
                skinsOwned: 1
            };
        }
    }

    /**
     * 통계 업데이트
     */
    updateStatistics(updates) {
        try {
            const stats = this.getStatistics();

            // 업데이트 적용
            Object.keys(updates).forEach(key => {
                if (key === 'maxHeight') {
                    // 최대 높이는 현재보다 큰 경우에만 갱신
                    stats[key] = Math.max(stats[key] || 0, updates[key]);
                } else if (key === 'puzzleStage') {
                    // 퍼즐 스테이지도 현재보다 큰 경우에만 갱신
                    stats[key] = Math.max(stats[key] || 0, updates[key]);
                } else {
                    // 나머지는 누적
                    stats[key] = (stats[key] || 0) + updates[key];
                }
            });

            localStorage.setItem(GameConfig.storage.statistics, JSON.stringify(stats));
            console.log('Statistics updated:', stats);

            // 업적 체크
            this.checkAchievements(stats);

            return stats;
        } catch (error) {
            console.error('Error updating statistics:', error);
            return this.getStatistics();
        }
    }

    // ===== 업적 관리 =====

    /**
     * 모든 업적 상태 조회
     */
    getAchievements() {
        try {
            const saved = localStorage.getItem(GameConfig.storage.achievements);
            if (saved) {
                return JSON.parse(saved);
            }
            // 초기 상태: 모든 업적 미달성
            const initial = {};
            GameConfig.achievements.forEach(ach => {
                initial[ach.id] = { unlocked: false, timestamp: null };
            });
            return initial;
        } catch (error) {
            console.error('Error getting achievements:', error);
            return {};
        }
    }

    /**
     * 업적 달성 상태 저장
     */
    unlockAchievement(achievementId) {
        try {
            const achievements = this.getAchievements();

            if (!achievements[achievementId] || !achievements[achievementId].unlocked) {
                achievements[achievementId] = {
                    unlocked: true,
                    timestamp: Date.now()
                };

                localStorage.setItem(GameConfig.storage.achievements, JSON.stringify(achievements));

                // 업적 정보 가져오기
                const achInfo = GameConfig.achievements.find(a => a.id === achievementId);
                if (achInfo) {
                    console.log(`🏆 업적 달성: ${achInfo.name}`);
                    // 보상 코인 지급
                    this.addCoins(achInfo.reward);
                    return achInfo;
                }
            }
            return null;
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            return null;
        }
    }

    /**
     * 통계 기반 업적 체크
     */
    checkAchievements(stats) {
        const unlockedAchievements = [];

        GameConfig.achievements.forEach(achievement => {
            const statValue = stats[achievement.type];
            if (statValue >= achievement.target) {
                const unlocked = this.unlockAchievement(achievement.id);
                if (unlocked) {
                    unlockedAchievements.push(unlocked);
                }
            }
        });

        return unlockedAchievements;
    }

    // ===== 칭호 관리 =====

    /**
     * 현재 칭호 조회
     */
    getCurrentTitle() {
        try {
            const titleId = localStorage.getItem(GameConfig.storage.currentTitle);
            return titleId || 'beginner'; // 기본값: 초보자
        } catch (error) {
            console.error('Error getting current title:', error);
            return 'beginner';
        }
    }

    /**
     * 칭호 설정
     */
    setCurrentTitle(titleId) {
        try {
            // 칭호가 해금되었는지 확인
            const title = GameConfig.titles.find(t => t.id === titleId);
            if (!title) return false;

            // 조건 확인 (업적 달성 여부)
            if (title.requirement) {
                const achievements = this.getAchievements();
                if (!achievements[title.requirement] || !achievements[title.requirement].unlocked) {
                    console.log('칭호 조건을 만족하지 않습니다.');
                    return false;
                }
            }

            localStorage.setItem(GameConfig.storage.currentTitle, titleId);
            console.log(`칭호 변경: ${title.name}`);
            return true;
        } catch (error) {
            console.error('Error setting current title:', error);
            return false;
        }
    }

    /**
     * 해금된 칭호 목록
     */
    getUnlockedTitles() {
        const achievements = this.getAchievements();
        const unlockedTitles = [];

        GameConfig.titles.forEach(title => {
            // 조건이 없거나 (기본 칭호) 조건 달성한 경우
            if (!title.requirement || (achievements[title.requirement] && achievements[title.requirement].unlocked)) {
                unlockedTitles.push(title);
            }
        });

        return unlockedTitles;
    }
}

// 전역 인스턴스
window.dataManager = new DataManager();
