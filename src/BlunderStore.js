if (typeof Dexie === 'undefined') {
    throw new Error('Dexie is required and should be loaded before this script');
}

const DB_NAME = 'RollRecallDB';
const DB_VERSION = 1;
const TABLE_NAME = 'blunders';

class BlunderStore extends Dexie {
    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores({
            blunders: '[positionID+matchID]'
        });
            this.blunders = this.table(TABLE_NAME);
    }

    async init() {
        try {
            await this.open();
            return true;
        } catch (error) {
            console.error('BlunderStore init failed', error);
            return false;
        }
    }

    async addBlunder(blunder) {
        if (!blunder || typeof blunder !== 'object') {
            throw new Error('Invalid blunder object');
        }

        if (blunder.positionID == null || blunder.matchID == null) {
            throw new Error('Blunder must include positionID and matchID');
        }

        const existing = await this.blunders
            .where('[positionID+matchID]')
            .equals([blunder.positionID, blunder.matchID])
            .first();

        if (existing) {
            return existing;
        }

        return this.blunders.add(blunder);
    }


    // Simple Blunder model wrapper so returned values are instances of Blunder
    // rather than plain objects.
    createBlunderInstance(obj) {
        if (!obj) return null;
        return new Blunder(obj);
    }

    // Returns the Blunder instance that comes after the blunder with the given id
    // in id order. If id is null/undefined, returns the first blunder.
    async getNextBlunder(id) {
        if (id == null) {
            const first = await this.blunders.orderBy('id').first();
            return this.createBlunderInstance(first);
        }

        // Find blunder with given id to ensure it exists and then get next
        const next = await this.blunders
            .orderBy('id')
            .filter((b) => b.id > id)
            .first();

        return this.createBlunderInstance(next);
    }

    async getBlunder(id) {
        return this.blunders.get(id);
    }

    async getAllBlunders() {
        return this.blunders.toArray();
    }

    async updateBlunder(id, changes) {
        return this.blunders.update(id, changes);
    }

    async deleteBlunder(id) {
        return this.blunders.delete(id);
    }

    async deleteAllBlunders() {
        return this.blunders.clear();
    }

    //   async findBlundersByGame(gameId) {
    //     return this.blunders.where('gameId').equals(gameId).toArray();
    //   }

    async exportJSON() {
        try {
            const blunders = await this.blunders.toArray();
            const jsonData = JSON.stringify(blunders, null, 2);
            const fileName = `blunders-${new Date().toISOString().split('T')[0]}.json`;

            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'JSON Files',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });

                    const writable = await handle.createWritable();
                    await writable.write(jsonData);
                    await writable.close();
                    return true;
                } catch (error) {
                    if (error.name === 'AbortError') {
                        return false;
                    }
                    if (error.name !== 'SecurityError') {
                        throw error;
                    }
                    console.warn('showSaveFilePicker failed, falling back to download link', error);
                }
            }

            // fallback in case the file saving does not work
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Export failed', error);
            }
            return false;
        }
    }

    async importJSON() {
        try {
            let file;

            if (window.showOpenFilePicker) {
                const [handle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] }
                    }],
                    multiple: false
                });

                file = await handle.getFile();
            } else {
                file = await new Promise((resolve, reject) => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'application/json';
                    input.style.display = 'none';

                    input.addEventListener('change', () => {
                        if (input.files && input.files[0]) {
                            resolve(input.files[0]);
                        } else {
                            reject(new Error('No file selected'));
                        }
                    });

                    input.addEventListener('cancel', () => reject(new Error('File selection canceled')));
                    document.body.appendChild(input);
                    input.click();
                    document.body.removeChild(input);
                });
            }

            const text = await file.text();
            const data = JSON.parse(text);

            if (!Array.isArray(data)) {
                throw new Error('Invalid JSON format: expected an array of blunders');
            }

            const blundersToImport = data.filter((item) => {
                return item && typeof item === 'object' && item.positionID != null && item.matchID != null;
            });

            if (!blundersToImport.length) {
                return 0;
            }

            await this.transaction('rw', this.blunders, async () => {
                await this.blunders.bulkPut(blundersToImport);
            });

            return blundersToImport.length;
        } catch (error) {
            if (error.name === 'AbortError') {
                return 0;
            }
            console.error('Import failed', error);
            return 0;
        }
    }

}

const blunderStore = new BlunderStore();

blunderStore.init().then(() => {
    console.log('BlunderStore initialized successfully');
}).catch((error) => {
    console.error('Failed to initialize BlunderStore', error);
});
