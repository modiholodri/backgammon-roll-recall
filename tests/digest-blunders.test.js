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

test('revealing the best move marks the correct option button with the highlighted style', () => {
    const makeButton = (textContent) => ({
        textContent,
        classList: {
            add(name) { this[name] = true; },
            remove(name) { delete this[name]; },
            contains(name) { return !!this[name]; },
            has(name) { return !!this[name]; },
        },
        style: {},
        setAttribute(name, value) { this[name] = value; },
    });

    const moveOption1 = makeButton('3/2');
    const moveOption2 = makeButton('24/23');
    const moveOption3 = makeButton('');
    const moveOption4 = makeButton('');
    const moveOption5 = makeButton('');
    const moveDisplay = { innerHTML: '' };
    const context = vm.createContext({
        blunders: [{
            positionID: 'pos-1',
            matchID: 'match-1',
            moves: [
                { notation: '3/2', lostEquityValue: 0.123 },
                { notation: '24/23', lostEquityValue: 0.0 },
            ],
        }],
        currentBlunder: 0,
        lastCheckedBlunder: -1,
        document: {
            getElementById(id) {
                if (id === 'moveDisplay') return moveDisplay;
                return {
                    'moveOption1': moveOption1,
                    'moveOption2': moveOption2,
                    'moveOption3': moveOption3,
                    'moveOption4': moveOption4,
                    'moveOption5': moveOption5,
                }[id] || null;
            },
            querySelector() {
                return moveOption1;
            },
        },
        Blunder: class {
            constructor(data) {
                Object.assign(this, data);
            }
        },
        moveToTable() {
            return 'Best move';
        },
        moveColor() {
            return 'gray';
        },
        collapseElements() {},
        marked: { parse(markup) { return markup; } },
        console: { log() {}, error() {}, warn() {} },
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'DigestBlunders.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'DigestBlunders.js' });
    vm.runInContext(`
        blunders = [{
            positionID: 'pos-1',
            matchID: 'match-1',
            moves: [
                { notation: '3/2', lostEquityValue: 0.123 },
                { notation: '24/23', lostEquityValue: 0.0 },
            ],
        }];
        currentBlunder = 0;
        lastCheckedBlunder = -1;
        revealBestMoveOption();
    `, context);

    assert.ok(moveOption2.classList.has('best-move-option'));
    assert.ok(!moveOption1.classList.has('best-move-option'));
    assert.equal(moveOption2['aria-pressed'], 'true');
});
