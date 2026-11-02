const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const canvas = { style: {} };
const selection = { value: 'classic' };
const body = {
    style: {
        values: new Map(),
        setProperty(name, value) {
            this.values.set(name, value);
        },
    },
};
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
        body,
        getElementById(id) {
            if (id === 'boardChartCanvas') return canvas;
            if (id === 'boardThemeSelection') return selection;
            return null;
        },
    },
});

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'Board.js'), 'utf8');
vm.runInContext(source, context, { filename: 'Board.js' });

test('board theme changes update the canvas and chart palette', () => {
    let updates = 0;
    const chart = {
        data: { datasets: Array.from({ length: 8 }, () => ({})) },
        options: { scales: { x: { grid: {} }, y: { grid: {} } } },
        update() {
            updates++;
        },
    };
    context.testChart = chart;
    vm.runInContext('boardChart = testChart', context);

    vm.runInContext("setBoardTheme('walnut')", context);

    assert.equal(canvas.style.backgroundColor, 'black');
    assert.equal(body.style.values.get('--text-accent'), 'rgba(255, 223, 167, 0.9)');
    assert.equal(body.style.values.get('--button-primary'), '#925f00');
    assert.equal(body.style.values.get('--border-accent'), 'rgba(255, 223, 167, 0.9)');
    assert.equal(chart.data.datasets[4].borderColor, 'rgba(255, 223, 167, 0.9)');
    assert.equal(chart.data.datasets[5].backgroundColor, 'rgba(242, 196, 110, 0.65)');
    assert.equal(chart.data.datasets[6].backgroundColor, 'rgba(88, 45, 24, 0.7)');
    assert.equal(chart.data.datasets[0].backgroundColor, 'rgba(242, 196, 110, 0.95)');
    assert.equal(chart.data.datasets[1].backgroundColor, 'rgba(129, 84, 0, 0.95)');
    assert.equal(chart.options.scales.x.grid.color, 'rgba(255, 255, 255, 0.12)');
    assert.equal(chart.options.scales.y.grid.color, 'rgba(255, 255, 255, 0.12)');
    assert.equal(updates, 1);

    vm.runInContext("setBoardTheme('classic')", context);

    assert.equal(canvas.style.backgroundColor, 'black');
    assert.equal(chart.data.datasets[0].backgroundColor, 'rgba(0, 82, 214, 0.95)');
    assert.equal(chart.data.datasets[1].backgroundColor, 'rgba(255, 44, 255, 0.95)');
    assert.equal(updates, 2);
});

test('unknown board themes restore the classic selection', () => {
    selection.value = 'unknown';

    vm.runInContext("setBoardTheme('unknown')", context);

    assert.equal(canvas.style.backgroundColor, 'black');
    assert.equal(selection.value, 'classic');
});

test('moss, ocean, and fire themes use their greener, bluer, and warmer palettes', () => {
    const chart = {
        data: { datasets: Array.from({ length: 8 }, () => ({})) },
        options: { scales: { x: { grid: {} }, y: { grid: {} } } },
        update() {},
    };
    context.testChart = chart;
    vm.runInContext('boardChart = testChart', context);

    vm.runInContext("setBoardTheme('moss')", context);

    assert.equal(body.style.values.get('--text-accent'), 'rgba(116, 176, 92, 0.9)');
    assert.equal(body.style.values.get('--button-primary'), '#3d7a00');
    assert.equal(chart.data.datasets[4].borderColor, 'rgba(116, 176, 92, 0.9)');
    assert.equal(chart.data.datasets[5].backgroundColor, 'rgba(92, 176, 79, 0.65)');
    assert.equal(chart.data.datasets[6].backgroundColor, 'rgba(0, 82, 19, 0.75)');
    assert.equal(chart.data.datasets[0].borderColor, '#3d7a00');
    assert.equal(chart.data.datasets[0].backgroundColor, 'rgba(96, 192, 0, 0.95)');
    assert.equal(chart.data.datasets[1].borderColor, '#5d9000');
    assert.equal(chart.data.datasets[1].backgroundColor, 'rgba(217, 249, 157, 0.95)');

    vm.runInContext("setBoardTheme('felt')", context);

    assert.equal(selection.value, 'moss');
    assert.equal(chart.data.datasets[4].borderColor, 'rgba(116, 176, 92, 0.9)');

    vm.runInContext("setBoardTheme('ocean')", context);

    assert.equal(chart.data.datasets[4].borderColor, 'rgba(110, 190, 225, 0.9)');
    assert.equal(chart.data.datasets[5].backgroundColor, 'rgba(95, 190, 225, 0.65)');
    assert.equal(chart.data.datasets[6].backgroundColor, 'rgba(40, 105, 175, 0.75)');
    assert.equal(chart.data.datasets[0].backgroundColor, 'rgba(38, 139, 255, 0.95)');
    assert.equal(chart.data.datasets[1].backgroundColor, 'rgba(0, 46, 230, 0.95)');

    vm.runInContext("setBoardTheme('fire')", context);

    assert.equal(chart.data.datasets[4].borderColor, 'rgba(214, 98, 24, 0.9)');
    assert.equal(chart.data.datasets[5].backgroundColor, 'rgba(255, 140, 0, 0.65)');
    assert.equal(chart.data.datasets[6].backgroundColor, 'rgba(120, 32, 15, 0.75)');
    assert.equal(chart.data.datasets[0].backgroundColor, 'rgba(255, 180, 72, 0.95)');
    assert.equal(chart.data.datasets[1].backgroundColor, 'rgba(255, 85, 0, 0.95)');
});
