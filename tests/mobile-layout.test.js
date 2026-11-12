const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('mobile layout constrains the app to phone-friendly width', () => {
    const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'RollRecall.css'), 'utf8');

    assert.match(css, /body\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*center;/is);
    assert.match(css, /\.container\s*\{[^}]*width:\s*min\(100%,\s*430px\);[^}]*max-width:\s*430px;/is);
});

test('board sizing uses its container width instead of the viewport width', () => {
    const canvas = {
        parentElement: { clientWidth: 430 },
        style: {},
    };
    const chart = {
        data: { datasets: Array.from({ length: 8 }, () => ({})) },
        updates: 0,
        update() {
            this.updates++;
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
            getElementById(id) {
                return id === 'boardChartCanvas' ? canvas : null;
            },
        },
        window: { innerWidth: 1440 },
        testChart: chart,
    });
    const boardSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'Board.js'), 'utf8');
    vm.runInContext(boardSource, context, { filename: 'Board.js' });

    vm.runInContext('boardChart = testChart; setCanvasHeight()', context);

    assert.equal(canvas.style.height, '365.5px');
    assert.equal(chart.data.datasets[0].pointRadius, chart.data.datasets[1].pointRadius);
    assert.ok(chart.data.datasets[0].pointRadius < 15);
    assert.equal(chart.updates, 1);
});
