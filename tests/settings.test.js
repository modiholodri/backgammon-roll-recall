const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('legacy felt board theme settings migrate to moss', () => {
    const values = new Map([['boardThemeSelection', 'felt']]);
    const elements = new Map([
        ['themeSelection', { value: '' }],
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
});
