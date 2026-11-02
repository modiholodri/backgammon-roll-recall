const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('showing a blunder updates the board chart once after all board data is set', () => {
    let updates = 0;
    const calls = [];
    const context = vm.createContext({
        alert() {},
        boardChart: {
            update() {
                updates++;
            },
        },
        console: { error() {} },
        document: { getElementById: () => null },
        setPositionID(...args) {
            calls.push(['position', ...args]);
        },
        readMatchID(...args) {
            calls.push(['match', ...args]);
        },
        addCubeToBoard() {
            calls.push(['cube']);
        },
        addDiceToBoard(...args) {
            calls.push(['dice', ...args]);
        },
        addAwayToBoard() {
            calls.push(['away']);
        },
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'Blunder.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'Blunder.js' });
    const blunder = vm.runInContext(
        "new Blunder({ positionID: 'position', matchID: 'match' })",
        context
    );
    blunder.populateMoveOptions = () => {};
    blunder.showStatistics = () => {};

    blunder.show();

    assert.deepEqual(calls, [
        ['position', 'position', 1, false],
        ['match', 'match'],
        ['cube'],
        ['dice', false],
        ['away'],
    ]);
    assert.equal(updates, 1);
});
