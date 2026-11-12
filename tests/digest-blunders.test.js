const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadSupportingFunctions(context) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'SupportingFunctions.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'SupportingFunctions.js' });
}

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

    loadSupportingFunctions(context);
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'DigestBlunders.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'DigestBlunders.js' });
    vm.runInContext('fetchBlundersFromStore()', context);
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(collapsedSections, ['blunderStore', 'settings', 'heatMap']);
});

test('board, move option, and delete interactions collapse the Blunder Store and Settings sections', async () => {
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

    loadSupportingFunctions(context);
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'DigestBlunders.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'DigestBlunders.js' });
    await vm.runInContext('showNextBlunder(); checkSelectedMoveOption(); deleteCurrentBlunder()', context);

    assert.deepEqual(collapsedSections, [
        'blunderStore', 'settings', 'heatMap',
        'blunderStore', 'settings', 'heatMap',
        'blunderStore', 'settings', 'heatMap',
    ]);
});

test('loading a new blunder keeps answer buttons uncolored until the user answers or the best move is revealed', () => {
    const blunderSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'Blunder.js'), 'utf8');
    assert.doesNotMatch(blunderSource, /if \(typeof colorMoveOptions === 'function'\)/);
    assert.doesNotMatch(blunderSource, /colorMoveOptions\(\);/);
});

test('deleteCurrentBlunder uses the app confirmation dialog instead of the browser prompt', async () => {
    let confirmed = false;
    const deleted = [];
    const context = vm.createContext({
        blunders: [{
            positionID: 'pos-1',
            matchID: 'match-1',
            moves: [{ notation: '3/2', lostEquityValue: 0.5 }],
        }],
        currentBlunder: 0,
        collapseElements() {},
        window: {
            confirmAction(message) {
                confirmed = true;
                assert.match(message, /delete this blunder/i);
                return Promise.resolve(true);
            },
            confirm() {
                throw new Error('Native browser confirm should not be used for deletes');
            },
        },
        console: { log() {}, error() {}, warn() {} },
        blunderStore: {
            getMaxLostEquity() {
                return 0.5;
            },
            deleteBlunder(id) {
                deleted.push(id);
                return Promise.resolve(true);
            },
        },
        Blunder: class {
            constructor(data) {
                Object.assign(this, data);
            }
            show() {}
        },
    });
    context.globalThis = context;

    loadSupportingFunctions(context);
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'DigestBlunders.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'DigestBlunders.js' });
    vm.runInContext(`
        blunders = [{
            positionID: 'pos-1',
            matchID: 'match-1',
            moves: [{ notation: '3/2', lostEquityValue: 0.5 }],
        }];
        currentBlunder = 0;
    `, context);

    const result = await vm.runInContext('deleteCurrentBlunder()', context);

    assert.equal(result, true);
    assert.equal(confirmed, true);
    assert.equal(deleted.length, 1);
    assert.equal(deleted[0].length, 2);
    assert.equal(deleted[0][0], 'pos-1');
    assert.equal(deleted[0][1], 'match-1');
});

test('clicking a move option records its selection so a later evaluation can resolve the answer without browser focus quirks', () => {
    const makeButton = (textContent) => ({
        textContent,
        id: textContent === '3/2' ? 'moveOption1' : 'moveOption2',
        dataset: {},
        classList: {
            add(name) { this[name] = true; },
            remove(name) { delete this[name]; },
            contains(name) { return !!this[name]; },
            has(name) { return !!this[name]; },
        },
        style: {},
        setAttribute(name, value) { this[name] = value; },
        focus() { this.focused = true; },
    });

    const moveOption1 = makeButton('3/2');
    const moveOption2 = makeButton('24/23');
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
            activeElement: null,
            getElementById(id) {
                if (id === 'moveDisplay') return moveDisplay;
                return {
                    'moveOption1': moveOption1,
                    'moveOption2': moveOption2,
                    'moveOption3': null,
                    'moveOption4': null,
                    'moveOption5': null,
                }[id] || null;
            },
            querySelector(selector) {
                if (selector.includes('data-selected')) return moveOption2;
                return null;
            },
        },
        Blunder: class {
            constructor(data) {
                Object.assign(this, data);
            }
            updateStatistics() {}
        },
        blunderStore: { updateBlunder() { return Promise.resolve(); } },
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

    loadSupportingFunctions(context);
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'DigestBlunders.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'DigestBlunders.js' });
    vm.runInContext('selectMoveOption("moveOption2"); checkSelectedMoveOption();', context);

    assert.equal(moveOption2['aria-pressed'], 'true');
    assert.equal(moveOption2.dataset.selected, 'true');
});

test('selecting another answer updates its board arrows without recording the blunder twice', () => {
    const makeButton = (id, textContent) => ({
        id,
        textContent,
        dataset: {},
        classList: {
            add(name) { this[name] = true; },
            remove(name) { delete this[name]; },
        },
        style: {},
        setAttribute(name, value) { this[name] = value; },
        focus() { document.activeElement = this; },
    });
    const options = [
        makeButton('moveOption1', '3/2'),
        makeButton('moveOption2', '24/23'),
        makeButton('moveOption3', ''),
        makeButton('moveOption4', ''),
        makeButton('moveOption5', ''),
    ];
    const document = {
        activeElement: null,
        getElementById(id) {
            if (id === 'moveDisplay') return { innerHTML: '' };
            return options.find((option) => option.id === id) || null;
        },
        querySelector() {
            return options.find((option) => option.dataset.selected === 'true') || null;
        },
    };
    const arrowUpdates = [];
    let statisticsUpdates = 0;
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
        document,
        Blunder: class {
            constructor(data) {
                Object.assign(this, data);
            }
            updateStatistics() {
                statisticsUpdates++;
            }
        },
        moveToTable() {
            return 'Move';
        },
        moveColor() {
            return 'gray';
        },
        setSelectedMoveArrows(move) {
            arrowUpdates.push(move.notation);
        },
        collapseElements() {},
        marked: { parse(markup) { return markup; } },
        console: { log() {}, error() {}, warn() {} },
    });

    loadSupportingFunctions(context);
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
        selectMoveOption('moveOption1');
        checkSelectedMoveOption();
        selectMoveOption('moveOption2');
        checkSelectedMoveOption();
    `, context);

    assert.deepEqual(arrowUpdates, ['3/2', '24/23']);
    assert.equal(statisticsUpdates, 1);
});

test('revealing the best move marks the correct option button with the highlighted style', () => {
    const makeButton = (textContent) => ({
        textContent,
        dataset: {},
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

    loadSupportingFunctions(context);
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
