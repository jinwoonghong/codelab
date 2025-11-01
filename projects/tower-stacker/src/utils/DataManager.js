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
}

// 전역 인스턴스
window.dataManager = new DataManager();
