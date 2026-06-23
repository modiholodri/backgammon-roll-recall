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

    

    async getBlunder(id) {
        return this.blunders.get(id);
    }

    getAllBlunders() {
        return this.blunders.toArray();
    }

    async updateBlunder(id, changes) {
        return this.blunders.update(id, changes);
    }

    async deleteBlunder(id) {
        return this.blunders.delete(id);
    }

    async clearBlunders() {
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

    
}

const blunderStore = new BlunderStore();

blunderStore.init().then(() => {
    console.log('BlunderStore initialized successfully');
}).catch((error) => {
    console.error('Failed to initialize BlunderStore', error);
});
