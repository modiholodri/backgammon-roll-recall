const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('mobile layout constrains the app to phone-friendly width', () => {
    const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'RollRecall.css'), 'utf8');

    assert.match(css, /body\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*center;/is);
    assert.match(css, /\.container\s*\{[^}]*width:\s*min\(100%,\s*430px\);[^}]*max-width:\s*430px;/is);
    assert.match(css, /touch-action:\s*manipulation;/is);
});

test('mobile button controls are explicit and tap-friendly on iPhone Safari', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.html'), 'utf8');

    assert.match(html, /<button[^>]*id="moveOption1"[^>]*type="button"/is);
    assert.match(html, /<button[^>]*id="deleteIndubitable"[^>]*type="button"/is);
    assert.match(html, /<button[^>]*id="downloadSampleBlunders"[^>]*type="button"/is);
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

test('heat map board matches the main board height at narrow widths', () => {
    const boardCanvas = {
        parentElement: { clientWidth: 430 },
        style: {},
    };
    const heatMapCanvas = {
        parentElement: { clientWidth: 200 },
        style: {},
    };
    const chart = {
        data: { datasets: Array.from({ length: 8 }, () => ({})) },
        update() {},
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
                if (id === 'boardChartCanvas') return boardCanvas;
                if (id === 'heatMapChartCanvas') return heatMapCanvas;
                return null;
            },
        },
    });
    const boardSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'Board.js'), 'utf8');
    vm.runInContext(boardSource, context, { filename: 'Board.js' });

    vm.runInContext('boardChart = { data: { datasets: Array.from({ length: 8 }, () => ({})) }, update() {} }; heatMapChart = { update() {} }; setCanvasHeight(); setHeatMapCanvasHeight()', context);

    assert.equal(boardCanvas.style.height, '365.5px');
    assert.equal(heatMapCanvas.style.height, boardCanvas.style.height);
});
