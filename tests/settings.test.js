const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('settings migrate legacy board theme and persist challenge ordering', () => {
    const values = new Map([['boardThemeSelection', 'felt']]);
    const elements = new Map([
        ['themeSelection', { value: '' }],
        ['challengeOrder', { value: '' }],
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
        localStorage: {
            getItem(key) {
                return values.get(key) ?? null;
            },
            setItem(key, value) {
                values.set(key, value);
            },
        },
        themeSelectionChanged() {},
        setBoardTheme() {},
    });

    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'Settings.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'Settings.js' });
    vm.runInContext('loadSettings()', context);

    assert.equal(elements.get('boardThemeSelection').value, 'moss');
    assert.equal(values.get('boardThemeSelection'), 'moss');
    assert.equal(elements.get('challengeOrder').value, 'level');

    elements.get('challengeOrder').value = 'performance';
    vm.runInContext('saveSettings()', context);
    assert.equal(values.get('challengeOrder'), 'performance');
});
