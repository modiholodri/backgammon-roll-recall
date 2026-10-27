if (typeof Dexie === 'undefined') {
    throw new Error('Dexie is required and should be loaded before this script');
}

const DB_NAME = 'RollRecallDB';
const DB_VERSION = 2;
const TABLE_NAME = 'blunders';

class BlunderStore extends Dexie {
    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores({
            blunders: '[positionID+matchID], level'
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

    async mergeImportedBlunders(blunders) {
        const existingBlunders = await this.blunders.toArray();
        const existingByKey = new Map();

        existingBlunders.forEach((existingBlunder) => {
            if (existingBlunder && existingBlunder.positionID != null && existingBlunder.matchID != null) {
                existingByKey.set(`${existingBlunder.positionID}:${existingBlunder.matchID}`, existingBlunder);
            }
        });

        const resetPerformance = document.getElementById('resetBlunderPerformance').checked;

        return blunders.map((blunder) => {
            const key = `${blunder.positionID}:${blunder.matchID}`;
            const existingBlunder = existingByKey.get(key);

            if (!existingBlunder) {
                if (resetPerformance) {
                    return { ...blunder, level: 0, timesAsked: 0, totalLostEquity: 0 };
                }
                return blunder;
            }

            if (resetPerformance) {
                return {
                    ...blunder,
                    ...existingBlunder,
                    level: 0,
                    timesAsked: 0,
                    totalLostEquity: 0,
                };
            }

            return {
                ...blunder,
                level: existingBlunder.level ?? blunder.level,
                timesAsked: existingBlunder.timesAsked ?? blunder.timesAsked,
                totalLostEquity: existingBlunder.totalLostEquity ?? blunder.totalLostEquity,
            };
        });
    }

    async downloadSampleBlunders() {
        const response = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/SampleBlunders.json`
        );
        if (!response.ok) {
            throw new Error(`Failed to download sample blunders: ${response.status}`);
        }

        const file = await response.json();
        if (typeof file.content !== 'string') {
            throw new Error('Invalid sample blunders response: missing file content');
        }

        const data = JSON.parse(window.atob(file.content));
        if (!Array.isArray(data)) {
            throw new Error('Invalid sample blunders format: expected an array');
        }

        const sampleBlunders = data.filter((item) => {
            return item && typeof item === 'object' && item.positionID != null && item.matchID != null;
        });
        if (sampleBlunders.length === 0) {
            throw new Error('The sample blunders file contains no valid blunders');
        }

        const importBlunders = await this.mergeImportedBlunders(sampleBlunders);

        const importedCount = await this.transaction('rw', this.blunders, async () => {
            await this.blunders.bulkPut(importBlunders);
            return importBlunders.length;
        });

        await this.updateLevelStats();
        fetchBlundersFromStore();
        return importedCount;
    }

    async importSampleBlundersIfEmpty() {
        if (await this.blunders.count() > 0) {
            return 0;
        }

        const confirmed = await window.confirm(
            'Your Blunder Store is empty. Would you like to download and import the sample blunders?'
        );
        if (!confirmed) {
            return 0;
        }

        return this.downloadSampleBlunders();
    }

    async getAllBlunders(order = 'level') {
        if (order === 'performance') {
            const blunders = await this.blunders.toArray();
            return blunders.sort((a, b) => {
                const timesAskedA = Number(a.timesAsked) || 0;
                const timesAskedB = Number(b.timesAsked) || 0;
                if (timesAskedA === 0 && timesAskedB !== 0) return -1;
                if (timesAskedB === 0 && timesAskedA !== 0) return 1;

                const performanceA = timesAskedA > 0 ? (Number(a.totalLostEquity) || 0) / timesAskedA : 0;
                const performanceB = timesAskedB > 0 ? (Number(b.totalLostEquity) || 0) / timesAskedB : 0;
                return performanceB - performanceA || (Number(a.level) || 0) - (Number(b.level) || 0);
            });
        }

        return this.blunders.orderBy('level').toArray();
    }

    // Returns a statistics string like "L0:1 L1:21 L2:12" counting blunders per level
    async updateLevelStats() {
        const blunderStoreElement = document.getElementById('blunderStore');
        if (blunderStoreElement.classList.contains('show')) {
            return;
        }

        const all = await this.blunders.toArray();
        const counts = all.reduce((acc, b) => {
            const lvl = (b && b.level != null) ? b.level : 0;
            acc[lvl] = (acc[lvl] || 0) + 1;
            return acc;
        }, {});

        const parts = Object.keys(counts)
            .map(k => ({ k: Number(k), v: counts[k] }))
            .sort((a, b) => a.k - b.k)
            .map(entry => `|${entry.k}|${entry.v}|`);

        const total = all.length;
        let levels = '';
        if (total > 0) levels = parts.join('\n') + '\n';
        const statisticsTable = `|Level|Blunders|\n|:-:|:-:|\n${levels}|∑|${total}|`;
        const htmlStatisticsTable = marked.parse(statisticsTable);

        const blunderStoreStatistics = document.getElementById('blunderStoreStatistics');
        blunderStoreStatistics.innerHTML = htmlStatisticsTable;
    }

    async updateBlunder(id, changes) {
        return this.blunders.update(id, changes);
    }

    async deleteBlunder(id) {
        if (id == null) {
            console.warn('deleteBlunder called with invalid id', id);
            return false;
        }

        try {
            await this.blunders.delete(id);
            return true;
        } catch (error) {
            console.error('deleteBlunder failed', error);
            return false;
        }
    }

    async deleteAllBlunders() {
        const confirmed = window.confirm('Are you sure you want to delete all blunders?');
        if (!confirmed) {
            return false;
        }

        return this.blunders.clear();
    }

    async exportJSON() {
        try {
            const blunders = await this.blunders.toArray();
            const resetPerformance = document.getElementById('resetBlunderPerformance').checked;
            const blundersToExport = resetPerformance
                ? blunders.map((blunder) => ({ ...blunder, level: 0, timesAsked: 0, totalLostEquity: 0 }))
                : blunders;
            const jsonData = JSON.stringify(blundersToExport, null, 2);
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

            const mergedBlundersToImport = await this.mergeImportedBlunders(blundersToImport);

            await this.transaction('rw', this.blunders, async () => {
                await this.blunders.bulkPut(mergedBlundersToImport);
            });

            await this.updateLevelStats();
            fetchBlundersFromStore();
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

blunderStore.init().then(async (initialized) => {
    if (!initialized) {
        fetchBlundersFromStore();
        return;
    }

    console.log('BlunderStore initialized successfully');
    try {
        await blunderStore.importSampleBlundersIfEmpty();
    } catch (error) {
        console.error('Failed to import sample blunders', error);
    }

    fetchBlundersFromStore();
}).catch((error) => {
    console.error('Failed to initialize BlunderStore', error);
    fetchBlundersFromStore();
});
