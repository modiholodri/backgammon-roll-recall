const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('heat map weights unasked blunders like a single attempt and tracks the selected type', () => {
    const selection = { value: 'missedChecker' };
    const context = vm.createContext({
        Chart: {
            defaults: {
                color: '',
                borderColor: '',
                plugins: { legend: { labels: { color: '' } } },
                scale: { title: { font: {}, color: '' } },
                layout: { padding: {} },
            },
        },
        document: {
            getElementById(id) {
                if (id === 'heatMapTypeSelection') return selection;
                return null;
            },
        },
        blunders: [
            {
                timesAsked: 0,
                totalLostEquity: 0,
                moves: [
                    { notation: '5/3', lostEquityValue: 0.75 },
                    { notation: '5/3', lostEquityValue: 0 },
                ],
            },
            {
                timesAsked: 2,
                totalLostEquity: 1.2,
                moves: [
                    { notation: '8/7', lostEquityValue: 0.4 },
                    { notation: '8/7', lostEquityValue: 0 },
                ],
            },
        ],
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'Board.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'Board.js' });

    const data = vm.runInContext('buildHeatMapData(blunders, "missedChecker")', context);
    assert.ok(Array.isArray(data));
    assert.ok(data.some((entry) => entry.point === 5 && entry.value >= 1));
    assert.ok(data.some((entry) => entry.point === 8 && entry.value >= 1));
    assert.ok(['red', 'green'].includes(data[0].color));

    vm.runInContext("setHeatMapType('equityLost')", context);
    assert.equal(selection.value, 'equityLost');
    assert.equal(vm.runInContext('heatMapType', context), 'equityLost');
});

test('should-have-been-put shows best-move destinations while equity-lost weights alternatives by loss', () => {
    const context = vm.createContext({
        Chart: {
            defaults: {
                color: '',
                borderColor: '',
                plugins: { legend: { labels: { color: '' } } },
                scale: { title: { font: {}, color: '' } },
                layout: { padding: {} },
            },
        },
        document: { getElementById() { return null; } },
        blunders: [{
            timesAsked: 2,
            moves: [
                { notation: '8/7', lostEquityValue: 0 },
                { notation: '5/3', lostEquityValue: 0.75 },
                { notation: '4/2', lostEquityValue: 0.25 },
            ],
        }],
    });
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'Board.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'Board.js' });

    const recommended = vm.runInContext('buildHeatMapData(blunders, "shouldHavePut")', context);
    const equityLost = vm.runInContext('buildHeatMapData(blunders, "equityLost")', context);
    const bestDestinations = vm.runInContext('buildHeatMapData(blunders, "bestMoveDestinations")', context);

    assert.deepEqual(Array.from(recommended, ({ point, value, color }) => ({ point, value, color })), [
        { point: 7, value: 2, color: 'green' },
    ]);
    assert.deepEqual(Array.from(bestDestinations, ({ point, value, color }) => ({ point, value, color })), [
        { point: 7, value: 1, color: 'green' },
    ]);
    assert.notDeepEqual(
        Array.from(recommended, ({ point, value }) => ({ point, value })),
        Array.from(bestDestinations, ({ point, value }) => ({ point, value })),
    );
    assert.ok(equityLost.some(({ point, value, color }) => point === 3 && value === 1.5 && color === 'red'));
    assert.ok(equityLost.some(({ point }) => point === 2));
    assert.notDeepEqual(
        Array.from(recommended, ({ point, value }) => ({ point, value })),
        Array.from(equityLost, ({ point, value }) => ({ point, value })),
    );
});

test('most frequent mistake counts each losing move equally and excludes best moves', () => {
    const context = vm.createContext({
        Chart: {
            defaults: {
                color: '',
                borderColor: '',
                plugins: { legend: { labels: { color: '' } } },
                scale: { title: { font: {}, color: '' } },
                layout: { padding: {} },
            },
        },
        document: { getElementById() { return null; } },
        blunders: [{
            timesAsked: 3,
            moves: [
                { notation: '8/7', lostEquityValue: 0 },
                { notation: '8/6', lostEquityValue: 0.05 },
                { notation: '8/5', lostEquityValue: 0.9 },
            ],
        }],
    });
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'Board.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'Board.js' });

    const frequentMistakes = vm.runInContext('buildHeatMapData(blunders, "frequentMistake")', context);

    assert.deepEqual(Array.from(frequentMistakes, ({ point, value, color }) => ({ point, value, color })), [
        { point: 8, value: 6, color: 'red' },
    ]);
});
