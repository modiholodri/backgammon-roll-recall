// default colors
const frameColor = 'rgba(0, 255, 0, 1)';

const opponentForeColor = 'rgba(255, 0, 255, 1)';
const opponentBackColor = 'rgba(255, 0, 255, 0.3)';

const yourForeColor = 'rgba(54, 162, 255, 1)';
const yourBackColor = 'rgba(54, 162, 255, 0.3)';

const chartColor = 'rgba(255, 255, 0, 0.2)';
const gridColor = { color: 'rgba(255, 255, 0, 0.1)' };

Chart.defaults.color = chartColor;  // default text color
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
    { x: -0.5, y: 5.0 - dOut },
    { x: -0.5, y: NaN },

    // Dice borders
    { x: 9.0, y: 5.0 },
    { x: 10.0, y: 5.0 },
    { x: 10.0, y: 6.0 },
    { x: 9.0, y: 6.0 },
    { x: 9.0, y: 5.0 - dOut },
    { x: 9.0, y: NaN },

    { x: 11.0, y: 5.0 },
    { x: 12.0, y: 5.0 },
    { x: 12.0, y: 6.0 },
    { x: 11.0, y: 6.0 },
    { x: 11.0, y: 5.0 - dOut },
    { x: 11.0, y: NaN },
];


const pointNumbers = [];

function AddPointNumberToBoard(iPoint, iPlayer)
{
    const iBoardPosition = PointNumberToBoardPosition(iPoint);
    let dMovePosition = MoveNumberToBoardPosition(0, iPoint);

    if (iPoint > 12) dMovePosition -= 0.2; // move the numbers closer to the board
    else dMovePosition += 0.1;

    const displayNumber = (iPlayer === 0) ? 25 - iPoint : iPoint;

    pointNumbers.push({
        x: iBoardPosition,
        y: dMovePosition,
        label: displayNumber.toString(),
        labelColor: yourForeColor,
    });
}

const pointNumberAnnotations = {
    id: 'pointNumbers',
    afterDatasetsDraw(chart, args, options) {
        const { ctx } = chart;
        ctx.save();
        pointNumbers.forEach(point => {
            if (point.label) {
                ctx.fillStyle = point.labelColor;
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const xPos = chart.scales.x.getPixelForValue(point.x);
                const yPos = chart.scales.y.getPixelForValue(point.y);
                ctx.fillText(point.label, xPos, yPos);
            }
        });
        ctx.restore();
    }
};

function SetPointNumbers(iPlayer)
{
    pointNumbers.length = 0;
    for (let iPoint = 1; iPoint < 25; iPoint++)
    {
        AddPointNumberToBoard(iPoint, iPlayer);
    }
}

function MoveNumberToBoardPosition(iMoveNumber, iPoint)
{
    let dMovePosition;
    let dStackThem = 0;
    if (iMoveNumber > 5) dStackThem = 4.5;  // stack the checkers if there are too many
    if (iPoint < 13) dMovePosition = iMoveNumber - 0.5 - dStackThem;
    else dMovePosition = 11.0 - iMoveNumber + 0.5 + dStackThem;
    return dMovePosition;
}


const whitePointData = [];
const blackPointData = [];

function PointNumberToBoardPosition(iPoint)
{
    if (iPoint < 0) return 14;
    if (iPoint == 25 || iPoint == 0) return 7; // the bar
    if (iPoint > 12) iPoint -= 12;
    else iPoint = 13 - iPoint;
    if (iPoint > 6) iPoint++;
    if (iPoint > 14) iPoint = 14; // just to make sure, don;t ask me why
    return iPoint;
}

function AddPointToBoard(pointData, iPoint)
{
    const iBoardPosition = PointNumberToBoardPosition(iPoint);
    pointData.push({ x: iBoardPosition - 0.5, y: 0 });
    pointData.push({ x: iBoardPosition, y: 4.3 });
    pointData.push({ x: iBoardPosition + 0.5, y: 0 });
    pointData.push({ x: NaN, y: NaN });
}

function AddTopPointToBoard(pointData, iPoint)
{
    const iBoardPosition = PointNumberToBoardPosition(iPoint);
    pointData.push({ x: iBoardPosition - 0.5, y: 11 });
    pointData.push({ x: iBoardPosition, y: 6.7 });
    pointData.push({ x: iBoardPosition + 0.5, y: 11 });
    pointData.push({ x: NaN, y: NaN });
}

function generatePointData() {
    for (let iPoint = 1; iPoint < 25; iPoint++)
    {
        let pointData = (iPoint % 2 === 1) ? blackPointData : whitePointData;

        if (iPoint < 13) AddPointToBoard(pointData, iPoint);
        else AddTopPointToBoard(pointData, iPoint);
    }
}

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

function setCanvasHeight() {
    const canvas = document.getElementById('boardChartCanvas');
    if (canvas) {
        let height = window.innerHeight * 0.75;
        let width = window.innerWidth;
        if (height > width * 0.66) {
            height = width * 0.66; // Maintain 3:2 aspect ratio (width:height)
        } 
        else if (width > height * 1.5) {
            width = height * 1.5; // Maintain 3:2 aspect ratio (width:height)
        }
        canvas.style.height = `${height}px`;
        canvas.style.width = `${width}px`;
    }
}

// Function to create the Backgammon Board
function createBoard() {
    setCanvasHeight();

    const canvas = document.getElementById('boardChartCanvas');
    const ctx = canvas.getContext('2d');

    const chartTitle = 'Board';

    generatePointData();
    SetPointNumbers(1);

    destroyBoardChart('');


    // Create the chart if it doesn't exist
    boardChart = new Chart(ctx, {
        type: 'scatter',
        plugins: [pointNumberAnnotations],
        data: {
            datasets: [
                {
                    label: 'Board Frame',
                    data: boardFrameData,
                    borderColor: frameColor,
                    borderWidth: 3,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
                },
                {
                    label: 'B Points',
                    data: blackPointData,
                    borderColor: yourForeColor,
                    backgroundColor: yourBackColor,
                    borderWidth: 2,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
                },
                {
                    label: 'W Points',
                    data: whitePointData,
                    borderColor: opponentForeColor,
                    backgroundColor: opponentBackColor,
                    borderWidth: 2,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow the chart to resize freely
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    title: {
                        text: chartTitle,
                        display: true,
                    },
                    beginAtZero: true,
                    stacked: true,
                    position: 'bottom',
                    ticks: {
                        color: chartColor,
                        callback: wholeNumbersOnly,
                    },                            
                    grid: gridColor,
                    min: -1.0,
                },
                y: {
                    beginAtZero: true,
                    ticks: { autoSkip: false }, // show all the names
                    min: -0.5,
                    max: 11.5,
                    grid: gridColor,
                }
            }
        }
    });
}