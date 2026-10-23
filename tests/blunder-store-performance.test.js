const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createBlunderStore({ resetPerformance, records = [], importData = [] }) {
    let exportedJSON = '';
    let importedBlunders = [];
    const table = {
        async toArray() {
            return records.map((record) => ({ ...record }));
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

    const context = vm.createContext({
        Dexie: FakeDexie,
        document: {
            getElementById(id) {
                assert.equal(id, 'resetBlunderPerformance');
                return { checked: resetPerformance };
            },
        },
        window: {
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
        fetchBlundersFromStore() {},
        console: { log() {}, error() {}, warn() {} },
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'BlunderStore.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'BlunderStore.js' });
    const store = vm.runInContext('blunderStore', context);
    store.updateLevelStats = async () => {};

    return {
        store,
        getExportedBlunders: () => JSON.parse(exportedJSON),
        getImportedBlunders: () => importedBlunders,
    };
}

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
