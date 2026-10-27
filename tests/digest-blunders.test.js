const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('fetching blunders collapses the Blunder Store and Settings sections', async () => {
    const collapsedSections = [];
    const context = vm.createContext({
        document: {
            getElementById(id) {
                assert.equal(id, 'challengeOrder');
                return { value: 'level' };
            },
        },
        blunderStore: {
            getAllBlunders(order) {
                assert.equal(order, 'level');
                return Promise.resolve([]);
            },
        },
        collapseElements(sections) {
            collapsedSections.push(...sections);
        },
        console: { error() {}, log() {} },
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'DigestBlunders.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'DigestBlunders.js' });
    vm.runInContext('fetchBlundersFromStore()', context);
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(collapsedSections, ['blunderStore', 'settings']);
});

test('board, move option, and delete interactions collapse the Blunder Store and Settings sections', () => {
    const collapsedSections = [];
    const context = vm.createContext({
        collapseElements(sections) {
            collapsedSections.push(...sections);
        },
        window: {
            confirm() {
                return false;
            },
        },
        console: { log() {} },
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'DigestBlunders.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'DigestBlunders.js' });
    vm.runInContext('showNextBlunder(); checkSelectedMoveOption(); deleteCurrentBlunder()', context);

    assert.deepEqual(collapsedSections, [
        'blunderStore', 'settings',
        'blunderStore', 'settings',
        'blunderStore', 'settings',
    ]);
});
