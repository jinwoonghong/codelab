/**
 * DataManager - IndexedDB를 사용한 로컬 데이터 관리
 * TODO: 추후 구현 예정
 */
class DataManager {
    constructor() {
        this.dbName = 'TowerStackerDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
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
            };
        });
    }

    async saveHighScore(mode, score) {
        // TODO: 구현
    }

    async getHighScore(mode) {
        // TODO: 구현
        return 0;
    }

    async saveInventoryItem(item) {
        // TODO: 구현
    }

    async getInventory() {
        // TODO: 구현
        return [];
    }
}

// 전역 인스턴스
window.dataManager = new DataManager();
