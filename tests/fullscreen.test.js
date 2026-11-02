const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function createFullscreenPromptContext(requestFullscreen) {
    const listeners = new Map();
    const errors = [];
    let showModalCalls = 0;
    let closeCalls = 0;
    const errorMessage = { textContent: '' };
    const dialog = {
        showModal() { showModalCalls += 1; },
        close() { closeCalls += 1; },
    };
    const enterFullscreenButton = {
        addEventListener(eventName, listener) {
            listeners.set(eventName, listener);
        },
    };
    const elements = new Map([
        ['fullscreenPrompt', dialog],
        ['enterFullscreen', enterFullscreenButton],
        ['fullscreenPromptError', errorMessage],
    ]);
    const context = vm.createContext({
        document: {
            documentElement: { requestFullscreen },
            getElementById(id) { return elements.get(id); },
        },
        console: { error(message) { errors.push(message); } },
    });
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'SupportingFunctions.js'), 'utf8');
    vm.runInContext(source, context, { filename: 'SupportingFunctions.js' });

    return {
        closeCalls: () => closeCalls,
        context,
        dialog,
        enterFullscreenButton,
        errorMessage,
        errors,
        listeners,
        showModalCalls: () => showModalCalls,
    };
}

test('fullscreen prompt opens and enters fullscreen only after the user chooses it', async () => {
    let requestCalls = 0;
    const prompt = createFullscreenPromptContext(async () => { requestCalls += 1; });

    vm.runInContext('setupFullscreenPrompt()', prompt.context);

    assert.equal(prompt.showModalCalls(), 1);
    assert.equal(requestCalls, 0);
    await prompt.listeners.get('click')();
    assert.equal(requestCalls, 1);
    assert.equal(prompt.closeCalls(), 1);
    assert.equal(prompt.errorMessage.textContent, '');
});

test('fullscreen prompt stays open and explains when entering fullscreen fails', async () => {
    const prompt = createFullscreenPromptContext(async () => {
        throw new Error('Fullscreen is unavailable');
    });

    vm.runInContext('setupFullscreenPrompt()', prompt.context);
    await prompt.listeners.get('click')();

    assert.equal(prompt.closeCalls(), 0);
    assert.equal(prompt.errorMessage.textContent, 'Unable to enter fullscreen: Fullscreen is unavailable');
    assert.deepEqual(prompt.errors, ['Error entering fullscreen mode: Fullscreen is unavailable']);
});
