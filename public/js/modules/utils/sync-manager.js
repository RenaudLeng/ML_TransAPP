class SyncManager {
    constructor() {
        this.db = null;
        this.initDB();
    }

    async initDB() {
        try {
            this.db = await this.openDB();
            console.log('Base de données initialisée');
        } catch (error) {
            console.error('Erreur d\'initialisation de la base de données:', error);
        }
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MLTransportDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('pendingChanges')) {
                    db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async saveChange(change) {
        try {
            // Sauvegarder localement
            await this.saveToLocalStorage(change);
            
            // Ajouter aux changements en attente
            await this.addToPendingChanges(change);
            
            // Tenter la synchronisation si en ligne
            if (navigator.onLine) {
                await this.requestSync();
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    async saveToLocalStorage(change) {
        const key = change.type + '_' + change.id;
        localStorage.setItem(key, JSON.stringify(change.data));
    }

    async addToPendingChanges(change) {
        const transaction = this.db.transaction(['pendingChanges'], 'readwrite');
        const store = transaction.objectStore('pendingChanges');
        await store.add({
            timestamp: new Date().toISOString(),
            ...change
        });
    }

    async requestSync() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            try {
                await registration.sync.register('sync-data');
                console.log('Synchronisation programmée');
            } catch (error) {
                console.error('Erreur de programmation de la synchronisation:', error);
            }
        }
    }

    // Écouter les changements de connexion
    listenToNetworkChanges() {
        window.addEventListener('online', () => {
            console.log('Connexion rétablie');
            this.requestSync();
        });

        window.addEventListener('offline', () => {
            console.log('Connexion perdue - Mode hors ligne activé');
        });
    }
}

// Initialiser le gestionnaire de synchronisation
const syncManager = new SyncManager();
syncManager.listenToNetworkChanges();

// Exporter pour utilisation dans d'autres fichiers
window.syncManager = syncManager; 