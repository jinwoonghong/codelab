// StorageManager - IndexedDB 관리
class StorageManager {
  constructor() {
    this.db = null;
    this.dbName = 'LinkKeeperDB';
    this.dbVersion = 1;
    this.ready = this.init();
  }

  async init() {
    try {
      this.db = await this.openDB();
      console.log('IndexedDB initialized');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. links store
        if (!db.objectStoreNames.contains('links')) {
          const linksStore = db.createObjectStore('links', { keyPath: 'id' });
          linksStore.createIndex('url', 'url', { unique: true });
          linksStore.createIndex('isRead', 'isRead', { unique: false });
          linksStore.createIndex('createdAt', 'createdAt', { unique: false });
          linksStore.createIndex('domain', 'domain', { unique: false });
          console.log('Created links object store');
        }

        // 2. sharedData store (임시 저장)
        if (!db.objectStoreNames.contains('sharedData')) {
          const sharedStore = db.createObjectStore('sharedData', { keyPath: 'id' });
          sharedStore.createIndex('processed', 'processed', { unique: false });
          sharedStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('Created sharedData object store');
        }

        // 3. categories store
        if (!db.objectStoreNames.contains('categories')) {
          const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoriesStore.createIndex('name', 'name', { unique: true });
          console.log('Created categories object store');
        }

        // 4. settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
          console.log('Created settings object store');
        }
      };
    });
  }

  // === Link 관련 메서드 ===

  async createLink(linkData) {
    await this.ready;
    const transaction = this.db.transaction(['links'], 'readwrite');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.add(linkData);

      request.onsuccess = () => {
        console.log('Link created:', linkData.id);
        resolve(linkData);
      };

      request.onerror = () => {
        console.error('Failed to create link:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllLinks(filter = 'all', sortBy = 'createdAt', order = 'desc') {
    await this.ready;
    const transaction = this.db.transaction(['links'], 'readonly');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        let links = request.result;

        // 필터링
        if (filter === 'unread') {
          links = links.filter(link => !link.isRead);
        } else if (filter === 'read') {
          links = links.filter(link => link.isRead);
        }

        // 정렬
        links.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];

          if (order === 'desc') {
            return bValue - aValue;
          } else {
            return aValue - bValue;
          }
        });

        resolve(links);
      };

      request.onerror = () => {
        console.error('Failed to get links:', request.error);
        reject(request.error);
      };
    });
  }

  async getLink(id) {
    await this.ready;
    const transaction = this.db.transaction(['links'], 'readonly');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateLink(id, updates) {
    await this.ready;
    const link = await this.getLink(id);

    if (!link) {
      throw new Error('Link not found');
    }

    const updatedLink = {
      ...link,
      ...updates,
      updatedAt: Date.now()
    };

    const transaction = this.db.transaction(['links'], 'readwrite');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.put(updatedLink);

      request.onsuccess = () => {
        console.log('Link updated:', id);
        resolve(updatedLink);
      };

      request.onerror = () => {
        console.error('Failed to update link:', request.error);
        reject(request.error);
      };
    });
  }

  async markAsRead(id) {
    return this.updateLink(id, {
      isRead: true,
      readAt: Date.now()
    });
  }

  async markAsUnread(id) {
    return this.updateLink(id, {
      isRead: false,
      readAt: null
    });
  }

  async deleteLink(id) {
    await this.ready;
    const transaction = this.db.transaction(['links'], 'readwrite');
    const store = transaction.objectStore('links');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Link deleted:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete link:', request.error);
        reject(request.error);
      };
    });
  }

  // === SharedData 관련 메서드 ===

  async getSharedData(id) {
    await this.ready;
    const transaction = this.db.transaction(['sharedData'], 'readonly');
    const store = transaction.objectStore('sharedData');

    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async markSharedDataProcessed(id) {
    await this.ready;
    const sharedData = await this.getSharedData(id);

    if (!sharedData) {
      return;
    }

    sharedData.processed = true;

    const transaction = this.db.transaction(['sharedData'], 'readwrite');
    const store = transaction.objectStore('sharedData');

    return new Promise((resolve, reject) => {
      const request = store.put(sharedData);

      request.onsuccess = () => {
        console.log('SharedData marked as processed:', id);
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // === Utility 메서드 ===

  async getCounts() {
    await this.ready;
    const links = await this.getAllLinks('all');

    return {
      all: links.length,
      unread: links.filter(l => !l.isRead).length,
      read: links.filter(l => l.isRead).length
    };
  }
}

export default StorageManager;
