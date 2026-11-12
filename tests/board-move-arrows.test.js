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
            return values[id] || { value: '0.000' };
        },
    },
    Chart: {
        defaults: {
            color: null,
            borderColor: null,
            plugins: { legend: { labels: { color: null } } },
            scale: { title: { font: {}, color: null } },
            layout: { padding: {} },
        },
    },
    console,
    atob: (value) => Buffer.from(value, 'base64').toString('binary'),
    setTimeout,
    clearTimeout,
    module: { exports: {} },
});

vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'Move.js'), 'utf8'), context, { filename: 'Move.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'Blunder.js'), 'utf8'), context, { filename: 'Blunder.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'Board.js'), 'utf8'), context, { filename: 'Board.js' });

test('move notation is parsed into board arrows', () => {
    const parsed = vm.runInContext('JSON.stringify(parseBoardMoveNotation("13/9 13/8"))', context);
    assert.deepEqual(JSON.parse(parsed), [
        { from: 13, to: 9, count: 1, label: null, hit: false },
        { from: 13, to: 8, count: 1, label: null, hit: false },
    ]);

    const barMove = vm.runInContext('JSON.stringify(parseBoardMoveNotation("bar/24 24/23"))', context);
    assert.deepEqual(JSON.parse(barMove), [
        { from: 25, to: 24, count: 1, label: null, hit: false },
        { from: 24, to: 23, count: 1, label: null, hit: false },
    ]);

    const comboMove = vm.runInContext('JSON.stringify(parseBoardMoveNotation("6/3*/2"))', context);
    assert.deepEqual(JSON.parse(comboMove), [
        { from: 6, to: 3, count: 1, label: null, hit: true },
        { from: 3, to: 2, count: 1, label: null, hit: false },
    ]);

    const hitMove = vm.runInContext('JSON.stringify(parseBoardMoveNotation("6/3*"))', context);
    assert.deepEqual(JSON.parse(hitMove), [{ from: 6, to: 3, count: 1, label: null, hit: true }]);

    const doubleMove = vm.runInContext('JSON.stringify(parseBoardMoveNotation("6/4(2)"))', context);
    assert.deepEqual(JSON.parse(doubleMove), [{ from: 6, to: 4, count: 2, label: '(2)', hit: false }]);
});

test('bar move arrows start from the checker row on the correct side of the bar', () => {
    const topHalfBarStart = vm.runInContext('JSON.stringify(boardMovePointToPixel(25, 10))', context);
    assert.deepEqual(JSON.parse(topHalfBarStart), { x: 7, y: 3.5 });

    const bottomHalfBarStart = vm.runInContext('JSON.stringify(boardMovePointToPixel(25, 20))', context);
    assert.deepEqual(JSON.parse(bottomHalfBarStart), { x: 7, y: 7.5 });
});

test('selected move arrows are generated using the move color and refreshed on the board', () => {
    let updates = 0;
    vm.runInContext('boardChart = { update() { globalThis.__moveArrowUpdates = (globalThis.__moveArrowUpdates || 0) + 1; } };', context);
    vm.runInContext('move = { notation: "13/9* 13/8 6/off 19/off", lostEquityValue: 0.100 };', context);
    vm.runInContext('setSelectedMoveArrows(move);', context);

    const arrowCount = vm.runInContext('selectedMoveArrows.length', context);
    assert.equal(arrowCount, 4);
    assert.equal(vm.runInContext('selectedMoveArrows[0].color', context), 'hsl(60, 100%, 50%)');
    assert.equal(vm.runInContext('selectedMoveArrows[0].hit', context), true);
    assert.equal(vm.runInContext('selectedMoveArrows[1].hit', context), false);
    assert.equal(vm.runInContext('selectedMoveArrows[2].end.x', context), 13.8);
    assert.equal(vm.runInContext('selectedMoveArrows[2].end.y', context), 2.5);
    assert.equal(vm.runInContext('selectedMoveArrows[3].end.x', context), 13.8);
    assert.equal(vm.runInContext('selectedMoveArrows[3].end.y', context), 8.5);
    assert.equal(vm.runInContext('globalThis.__moveArrowUpdates || 0', context), 1);
});

test('selected move lost equity is shown in the middle left board area at cube size', () => {
    vm.runInContext('move = { notation: "13/9*", lostEquity: "(-0.123)", lostEquityValue: 0.123 }; setSelectedMoveArrows(move);', context);
    const labelColor = vm.runInContext('moveColor(0.123)', context);
    const selectedValue = JSON.parse(vm.runInContext('JSON.stringify(selectedMoveLostEquity)', context));
    assert.deepEqual(selectedValue, [{ x: 3.5, y: 5.5, label: '(-0.123)', labelColor }]);
});

test('board arrows use a curved line and mark their starting point', () => {
    const calls = [];
    const ctx = {
        beginPath() { calls.push(['beginPath']); },
        moveTo(...args) { calls.push(['moveTo', ...args]); },
        lineTo(...args) { calls.push(['lineTo', ...args]); },
        quadraticCurveTo(...args) { calls.push(['quadraticCurveTo', ...args]); },
        arc(...args) { calls.push(['arc', ...args]); },
        closePath() { calls.push(['closePath']); },
        stroke() { calls.push(['stroke']); },
        fill() { calls.push(['fill']); },
        fillText(...args) { calls.push(['fillText', ...args, this.fillStyle, this.font]); },
        save() { calls.push(['save']); },
        restore() { calls.push(['restore']); },
    };

    vm.runInContext('drawBoardArrow(ctx, { x: 10, y: 20 }, { x: 100, y: 80 }, "magenta", "(2)", true);', vm.createContext({
        drawBoardArrow: vm.runInContext('drawBoardArrow', context),
        ctx,
        Math,
    }));

    assert.ok(calls.some(([name]) => name === 'quadraticCurveTo'));
    const curve = calls.find(([name]) => name === 'quadraticCurveTo');
    assert.ok(curve[1] > 55);
    assert.ok(curve[2] < 50);
    assert.deepEqual(calls.find(([name]) => name === 'arc'), ['arc', 10, 20, 4, 0, Math.PI * 2]);
    const labelCall = calls.find(([name]) => name === 'fillText');
    assert.equal(labelCall[1], '(2)');
    assert.ok(labelCall[2] > 50);
    assert.ok(labelCall[3] > 30);
    const hitMarkerCall = calls.find(([name, text]) => name === 'fillText' && text === '*');
    assert.equal(hitMarkerCall[4], 'cyan');
    assert.equal(hitMarkerCall[5], 'bold 32px sans-serif');
    assert.ok(hitMarkerCall[2] > 50);
    assert.ok(hitMarkerCall[3] > 30);
});
