// default colors
const frameColor = 'rgba(0, 255, 0, 1)';

const opponentForeColor = 'rgba(255, 0, 255, 1)';
const opponentBackColor = 'rgba(255, 0, 255, 0.3)';

const yourForeColor = 'rgba(54, 162, 255, 1)';
const yourBackColor = 'rgba(54, 162, 255, 0.3)';

const chartColor = 'rgba(255, 255, 0, 0.7)';
const gridColor = { color: 'rgba(255, 255, 0, 0.3)' };

Chart.defaults.color = 'white';  // default text color
Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.0)';  // don't show the default grid
Chart.defaults.plugins.legend.labels.color = chartColor;
Chart.defaults.scale.title.font = { size: 16, weight: 'bold' };
Chart.defaults.scale.title.color = chartColor;
Chart.defaults.layout.padding.top = 7;

const dOut = 0.04;
const boardFrameData = [
    // Outer Frame
    { x: 0.5, y: 0.0 - dOut },
    { x: 13.5, y: 0.0 - dOut },
    { x: 13.5, y: 11.0 + dOut },
    { x: 0.5, y: 11.0 + dOut },
    { x: 0.5, y: 0.0 - dOut },
    { x: 0.5, y: NaN },

    // Bar
    { x: 6.5, y: 0.0 },
    { x: 6.5, y: 11.0 },
    { x: 6.5, y: NaN },
    { x: 7.5, y: 0.0 },
    { x: 7.5, y: 11.0 },
    { x: 7.5, y: NaN },

    // Cube borders
    { x: -0.5, y: 5.0 },
    { x: 0.5, y: 5.0 },
    { x: 0.5, y: 6.0 },
    { x: -0.5, y: 6.0 },
    { x: -0.5, y: 5.0 },
    { x: -0.5, y: NaN },

    // Dice borders
    { x: 9.0, y: 5.0 },
    { x: 10.0, y: 5.0 },
    { x: 10.0, y: 6.0 },
    { x: 9.0, y: 6.0 },
    { x: 9.0, y: 5.0 },
    { x: 9.0, y: NaN },

    { x: 11.0, y: 5.0 },
    { x: 12.0, y: 5.0 },
    { x: 12.0, y: 6.0 },
    { x: 11.0, y: 6.0 },
    { x: 11.0, y: 5.0 },
    { x: 11.0, y: NaN },
];

let boardChart;

// If the Ranking chart already exists, destroy it before creating a new one
function destroyBoardChart(message) {
    if (boardChart) {
        boardChart.destroy();
        boardChart = null;
    }
    const boardChartMessage = document.getElementById('boardChartMessage');
    if (boardChartMessage) {
        boardChartMessage.innerText = message;
    }
}

function wholeNumbersOnly(value) {
    return Number.isInteger(value) ? value.toLocaleString() : null;
}


// Function to create the Backgammon Board
function createBoard() {
    const canvas = document.getElementById('boardChartCanvas');
    if (canvas) {
        canvas.style.height = `${window.innerHeight * 0.75}px`;
    }
    const ctx = canvas.getContext('2d');

    const chartTitle = 'Board';

    destroyBoardChart('');


    // Create the chart if it doesn't exist
    boardChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Board Frame',
                    data: boardFrameData,
                    borderColor: frameColor,
                    borderWidth: 2,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow the chart to resize freely
            scales: {
                x: {
                    title: {
                        text: chartTitle,
                        display: true,
                    },
                    beginAtZero: true,
                    stacked: true,
                    position: 'top',
                    ticks: {
                        color: chartColor,
                        callback: wholeNumbersOnly,
                    },                            
                    grid: gridColor,
                },
                y: {
                    beginAtZero: true,
                    ticks: { autoSkip: false } // show all the names
                }
            }
        }
    });
}