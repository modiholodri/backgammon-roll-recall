const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const context = vm.createContext({
    document: {
        getElementById(id) {
            const values = {
                doubtfulLostEquity: { value: '0.100' },
                veryBadLostEquity: { value: '0.300' },
            };
            return values[id];
        },
    },
    module: { exports: {} },
});

for (const filename of ['Blunder.js', 'Move.js']) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', filename), 'utf8');
    vm.runInContext(source, context, { filename });
}

test('perfect and near-perfect moves transition from lime toward yellow', () => {
    assert.equal(vm.runInContext('moveColor(0)', context), 'lime');
    assert.equal(vm.runInContext('moveColor(0.001)', context), 'hsl(119.994, 100%, 50%)');
    assert.equal(vm.runInContext('moveColor(0.1)', context), 'hsl(60, 100%, 50%)');
});
