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
}

// 전역 인스턴스
window.dataManager = new DataManager();
