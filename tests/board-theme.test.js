const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const canvas = { style: {} };
const selection = { value: 'classic' };
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
    assert.equal(chart.data.datasets[4].borderColor, 'rgba(255, 223, 167, 0.9)');
    assert.equal(chart.data.datasets[5].backgroundColor, 'rgba(242, 196, 110, 0.65)');
    assert.equal(chart.data.datasets[6].backgroundColor, 'rgba(88, 45, 24, 0.7)');
    assert.equal(chart.data.datasets[0].backgroundColor, 'rgba(242, 196, 110, 0.85)');
    assert.equal(chart.data.datasets[1].backgroundColor, 'rgba(121, 188, 224, 0.85)');
    assert.equal(chart.options.scales.x.grid.color, 'rgba(255, 255, 255, 0.12)');
    assert.equal(chart.options.scales.y.grid.color, 'rgba(255, 255, 255, 0.12)');
    assert.equal(updates, 1);

    vm.runInContext("setBoardTheme('classic')", context);

    assert.equal(canvas.style.backgroundColor, 'black');
    assert.equal(chart.data.datasets[0].backgroundColor, 'rgba(0, 99, 255, 0.7)');
    assert.equal(chart.data.datasets[1].backgroundColor, 'rgba(255, 0, 255, 0.7)');
    assert.equal(updates, 2);
});

test('unknown board themes restore the classic selection', () => {
    selection.value = 'unknown';

    vm.runInContext("setBoardTheme('unknown')", context);

    assert.equal(canvas.style.backgroundColor, 'black');
    assert.equal(selection.value, 'classic');
});
