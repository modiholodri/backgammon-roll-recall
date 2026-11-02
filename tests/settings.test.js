const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('settings migrate the board theme and persist challenge order and statistic details', () => {
    const values = new Map([['boardThemeSelection', 'felt']]);
    const performanceMessage = { innerHTML: '' };
    const timesAsked = { textContent: '' };
    const questionLevel = { textContent: '' };
    const elements = new Map([
        ['themeSelection', { value: '' }],
        ['challengeOrder', { value: '' }],
        ['showStatisticDetails', { checked: false }],
        ['performanceMessage', performanceMessage],
        ['timesAsked', timesAsked],
        ['questionLevel', questionLevel],
        ['boardThemeSelection', { value: '' }],
        ['acceptedLostEquity', { value: '' }],
        ['doubtfulLostEquity', { value: '' }],
        ['prettyBadLostEquity', { value: '' }],
        ['veryBadLostEquity', { value: '' }],
    ]);
    const context = vm.createContext({
        document: {
            addEventListener() {},
            getElementById(id) {
                return elements.get(id);
            },
        },
        window: { addEventListener() {} },
        blunders: [{ timesAsked: 2, totalLostEquity: 0.02 }],
        currentBlunder: 0,
        performanceMessage,
        localStorage: {
            getItem(key) {
                return values.get(key) ?? null;
            },
            setItem(key, value) {
                values.set(key, String(value));
            },
        },
        themeSelectionChanged() {},
        setBoardTheme() {},
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'Settings.js'), 'utf8');
    const blunderSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'Blunder.js'), 'utf8');
    vm.runInContext(blunderSource, context, { filename: 'Blunder.js' });
    vm.runInContext(source, context, { filename: 'Settings.js' });
    vm.runInContext('loadSettings()', context);

    assert.equal(elements.get('boardThemeSelection').value, 'moss');
    assert.equal(values.get('boardThemeSelection'), 'moss');
    assert.equal(elements.get('challengeOrder').value, 'level');
    assert.equal(elements.get('showStatisticDetails').checked, true);
    assert.equal(vm.runInContext('showStatisticDetails', context), true);
    vm.runInContext('new Blunder(blunders[0]).showStatistics()', context);
    assert.match(performanceMessage.innerHTML, />5\.0</);
    assert.match(performanceMessage.innerHTML, />10\.0</);
    assert.equal(timesAsked.textContent, '2 x Asked');
    assert.equal(questionLevel.textContent, 'Q Level 0');

    elements.get('challengeOrder').value = 'performance';
    vm.runInContext('setStatisticDetails(false)', context);
    vm.runInContext('saveSettings()', context);
    assert.equal(values.get('challengeOrder'), 'performance');
    assert.equal(values.get('showStatisticDetails'), 'false');
    assert.equal(elements.get('showStatisticDetails').checked, false);
    assert.doesNotMatch(performanceMessage.innerHTML, />5\.0</);
    assert.doesNotMatch(performanceMessage.innerHTML, />10\.0</);
    assert.equal(timesAsked.textContent, '');
    assert.equal(questionLevel.textContent, '');

    vm.runInContext('loadSettings()', context);
    assert.equal(elements.get('showStatisticDetails').checked, false);
    assert.equal(vm.runInContext('showStatisticDetails', context), false);
});
