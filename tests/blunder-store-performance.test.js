const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createBlunderStore({
    resetPerformance,
    records = [],
    importData = [],
    confirmSampleImport = false,
    sampleData = [],
    stubStats = true,
    blunderStoreVisible = false,
}) {
    let exportedJSON = '';
    let importedBlunders = [];
    let sampleFetchCount = 0;
    const table = {
        async toArray() {
            return records.map((record) => ({ ...record }));
        },
        async count() {
            return records.length;
        },
        orderBy(field) {
            return {
                async toArray() {
                    return records
                        .map((record) => ({ ...record }))
                        .sort((a, b) => Number(a[field]) - Number(b[field]));
                },
            };
        },
        async bulkPut(blunders) {
            importedBlunders = JSON.parse(JSON.stringify(blunders));
            records.push(...blunders.map((blunder) => ({ ...blunder })));
        },
    };

    class FakeDexie {
        version() {
            return { stores() {} };
        }

        table() {
            return table;
        }

        async open() {}

        async transaction(_mode, _table, callback) {
            return callback();
        }
    }

    const statsElement = { innerHTML: '' };
    const blunderStoreElement = {
        classList: {
            contains(className) {
                return className === 'show' && blunderStoreVisible;
            },
        },
    };

    const context = vm.createContext({
        Dexie: FakeDexie,
        document: {
            getElementById(id) {
                if (id === 'blunderStore') {
                    return blunderStoreElement;
                }
                if (id === 'blunderStoreStatistics') {
                    return statsElement;
                }
                assert.equal(id, 'resetBlunderPerformance');
                return { checked: resetPerformance };
            },
        },
        window: {
            async confirm() {
                return confirmSampleImport;
            },
            atob(encoded) {
                return Buffer.from(encoded, 'base64').toString('binary');
            },
            async showSaveFilePicker() {
                return {
                    async createWritable() {
                        return {
                            async write(content) {
                                exportedJSON = content;
                            },
                            async close() {},
                        };
                    },
                };
            },
            async showOpenFilePicker() {
                return [{
                    async getFile() {
                        return { async text() { return JSON.stringify(importData); } };
                    },
                }];
            },
        },
        fetch: async (url) => {
            sampleFetchCount++;
            assert.equal(
                url,
                'https://api.github.com/repos/modiholodri/backgammon-roll-recall/contents/SampleBlunders.json'
            );
            const content = Buffer.from(JSON.stringify(sampleData), 'binary').toString('base64');
            return { ok: true, async json() { return { content }; } };
        },
        repoOwner: 'modiholodri',
        repoName: 'backgammon-roll-recall',
        fetchBlundersFromStore() {},
        marked: { parse(markdown) { return markdown; } },
        console: { log() {}, error() {}, warn() {} },
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'BlunderStore.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'BlunderStore.js' });
    const store = vm.runInContext('blunderStore', context);
    if (stubStats) {
        store.updateLevelStats = async () => {};
    }

    return {
        store,
        context,
        getExportedBlunders: () => JSON.parse(exportedJSON),
        getImportedBlunders: () => importedBlunders,
        getSampleFetchCount: () => sampleFetchCount,
    };
}

test('sample blunders are downloaded and imported after confirmation when the store is empty', async () => {
    const sampleBlunder = { positionID: 'sample-position', matchID: 'sample-match', moves: [] };
    const harness = createBlunderStore({
        resetPerformance: false,
        sampleData: [sampleBlunder],
    });

    await new Promise((resolve) => setImmediate(resolve));
    harness.context.window.confirm = async () => true;
    const result = await harness.store.importSampleBlundersIfEmpty();

    assert.equal(result, 1);
    assert.equal(harness.getSampleFetchCount(), 1);
    assert.deepEqual(harness.getImportedBlunders(), [sampleBlunder]);
});

test('download sample blunders imports the sample data without confirmation', async () => {
    const sampleBlunder = { positionID: 'sample-position', matchID: 'sample-match', moves: [] };
    const harness = createBlunderStore({
        resetPerformance: false,
        sampleData: [sampleBlunder],
    });

    const result = await harness.store.downloadSampleBlunders();

    assert.equal(result, 1);
    assert.equal(harness.getSampleFetchCount(), 1);
    assert.deepEqual(harness.getImportedBlunders(), [sampleBlunder]);
});

test('blunder store statistics refresh even while the section is open', async () => {
    const records = [
        { positionID: 'l1', matchID: 'm1', level: 1 },
        { positionID: 'l2', matchID: 'm2', level: 2 },
    ];
    const harness = createBlunderStore({
        resetPerformance: false,
        records,
        stubStats: false,
        blunderStoreVisible: true,
    });

    await harness.store.updateLevelStats();

    assert.match(harness.context.document.getElementById('blunderStoreStatistics').innerHTML, /\|1\|1\|/);
    assert.match(harness.context.document.getElementById('blunderStoreStatistics').innerHTML, /\|2\|1\|/);
    assert.match(harness.context.document.getElementById('blunderStoreStatistics').innerHTML, /\|∑\|2\|/);
});

test('sample blunders are not downloaded when the store already has data', async () => {
    const harness = createBlunderStore({
        resetPerformance: false,
        records: [{ positionID: 'existing', matchID: 'match' }],
        confirmSampleImport: true,
        sampleData: [{ positionID: 'sample', matchID: 'match' }],
    });

    assert.equal(await harness.store.importSampleBlundersIfEmpty(), 0);
    assert.equal(harness.getSampleFetchCount(), 0);
    assert.deepEqual(harness.getImportedBlunders(), []);
});

test('sample blunders are not downloaded when import is declined', async () => {
    const harness = createBlunderStore({
        resetPerformance: false,
        confirmSampleImport: false,
        sampleData: [{ positionID: 'sample', matchID: 'match' }],
    });

    assert.equal(await harness.store.importSampleBlundersIfEmpty(), 0);
    assert.equal(harness.getSampleFetchCount(), 0);
    assert.deepEqual(harness.getImportedBlunders(), []);
});

test('import resets performance data when the option is checked', async () => {
    const blunder = {
        positionID: 'position',
        matchID: 'match',
        level: 4,
        timesAsked: 12,
        totalLostEquity: 0.36,
    };
    const harness = createBlunderStore({
        resetPerformance: true,
        importData: [blunder],
    });

    assert.equal(await harness.store.importJSON(), 1);
    assert.deepEqual(harness.getImportedBlunders(), [{
        ...blunder,
        level: 0,
        timesAsked: 0,
        totalLostEquity: 0,
    }]);
});

test('import preserves performance data when the option is unchecked', async () => {
    const blunder = {
        positionID: 'position',
        matchID: 'match',
        level: 4,
        timesAsked: 12,
        totalLostEquity: 0.36,
    };
    const harness = createBlunderStore({
        resetPerformance: false,
        importData: [blunder],
    });

    assert.equal(await harness.store.importJSON(), 1);
    assert.deepEqual(harness.getImportedBlunders(), [blunder]);
});

test('import preserves existing performance when the same blunder is imported again', async () => {
    const existingBlunder = {
        positionID: 'position',
        matchID: 'match',
        level: 5,
        timesAsked: 14,
        totalLostEquity: 0.72,
    };
    const incomingBlunder = {
        positionID: 'position',
        matchID: 'match',
        level: 2,
        timesAsked: 3,
        totalLostEquity: 0.12,
    };
    const harness = createBlunderStore({
        resetPerformance: false,
        records: [existingBlunder],
        importData: [incomingBlunder],
    });

    assert.equal(await harness.store.importJSON(), 1);
    assert.deepEqual(harness.getImportedBlunders(), [{
        ...incomingBlunder,
        level: existingBlunder.level,
        timesAsked: existingBlunder.timesAsked,
        totalLostEquity: existingBlunder.totalLostEquity,
    }]);
});

test('download sample blunders preserves existing performance when the same blunder is downloaded again', async () => {
    const existingBlunder = {
        positionID: 'sample-position',
        matchID: 'sample-match',
        level: 6,
        timesAsked: 18,
        totalLostEquity: 1.2,
    };
    const sampleBlunder = {
        positionID: 'sample-position',
        matchID: 'sample-match',
        level: 1,
        timesAsked: 2,
        totalLostEquity: 0.08,
    };
    const harness = createBlunderStore({
        resetPerformance: false,
        records: [existingBlunder],
        sampleData: [sampleBlunder],
    });

    assert.equal(await harness.store.downloadSampleBlunders(), 1);
    assert.deepEqual(harness.getImportedBlunders(), [{
        ...sampleBlunder,
        level: existingBlunder.level,
        timesAsked: existingBlunder.timesAsked,
        totalLostEquity: existingBlunder.totalLostEquity,
    }]);
});

test('export resets performance data without changing the stored blunder', async () => {
    const blunder = {
        positionID: 'position',
        matchID: 'match',
        level: 4,
        timesAsked: 12,
        totalLostEquity: 0.36,
    };
    const harness = createBlunderStore({
        resetPerformance: true,
        records: [blunder],
    });

    assert.equal(await harness.store.exportJSON(), true);
    assert.deepEqual(harness.getExportedBlunders(), [{
        ...blunder,
        level: 0,
        timesAsked: 0,
        totalLostEquity: 0,
    }]);
    assert.deepEqual(await harness.store.blunders.toArray(), [blunder]);
});

test('export preserves performance data when the option is unchecked', async () => {
    const blunder = {
        positionID: 'position',
        matchID: 'match',
        level: 4,
        timesAsked: 12,
        totalLostEquity: 0.36,
    };
    const harness = createBlunderStore({
        resetPerformance: false,
        records: [blunder],
    });

    assert.equal(await harness.store.exportJSON(), true);
    assert.deepEqual(harness.getExportedBlunders(), [blunder]);
});

test('challenge ordering defaults to level', async () => {
    const harness = createBlunderStore({
        resetPerformance: false,
        records: [
            { positionID: 'higher', matchID: 'match', level: 3 },
            { positionID: 'lower', matchID: 'match', level: 1 },
        ],
    });

    const blunders = await harness.store.getAllBlunders();

    assert.deepEqual(blunders.map(({ positionID }) => positionID), ['lower', 'higher']);
});

test('performance challenge order prioritizes unasked and higher average lost equity', async () => {
    const harness = createBlunderStore({
        resetPerformance: false,
        records: [
            { positionID: 'good', matchID: 'match', level: 2, timesAsked: 4, totalLostEquity: 0.04 },
            { positionID: 'bad', matchID: 'match', level: 1, timesAsked: 2, totalLostEquity: 0.12 },
            { positionID: 'unasked', matchID: 'match', level: 0, timesAsked: 0, totalLostEquity: 0 },
            { positionID: 'tie', matchID: 'match', level: 0, timesAsked: 1, totalLostEquity: 0.05 },
        ],
    });

    const blunders = await harness.store.getAllBlunders('performance');

    assert.deepEqual(blunders.map(({ positionID }) => positionID), ['unasked', 'bad', 'tie', 'good']);
});
