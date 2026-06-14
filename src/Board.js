// default colors
const showDebug = false;

const frameColor = 'rgb(75, 75, 75)';
const pointsAForeColor = 'rgba(255, 255, 0, 0.3)';
const pointsBForeColor = 'rgba(50, 205, 50, 0.3)';

const player0ForeColor = 'rgba(0, 255, 255, 1)';
const player0BackColor = 'rgba(0, 255, 255, 0.7)';

const player1ForeColor = 'rgba(255, 0, 255, 1)';
const player1BackColor = 'rgba(255, 0, 255, 0.7)';



const unimportantColor = 'rgba(255, 255, 255, 0.3)';

const gridColor = { color: 'rgba(255, 255, 0, 0.1)' };

Chart.defaults.color = unimportantColor;  // default text color
Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.0)';  // don't show the default grid
Chart.defaults.plugins.legend.labels.color = unimportantColor;
Chart.defaults.scale.title.font = { size: 16, weight: 'bold' };
Chart.defaults.scale.title.color = unimportantColor;
Chart.defaults.layout.padding.top = 7;

let boardChart;

let player0CheckerData = [];
let Player0OffCheckerData = [];
let player1CheckerData = [];
let Player1OffCheckerData = [];

// simple board data
let checkerSize = 25;
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
const diceNumbers = [];
const away = [];
const pointsB = [];
const pointsA = [];


function resetCheckerData() {
    player0CheckerData.length = 0;
    player1CheckerData.length = 0;
    Player0OffCheckerData.length = 0;
    Player1OffCheckerData.length = 0;
}

function addCheckerToBoard(series, moveNumber, point)
{
    // if (series == blackCheckerData) point = 25 - point;
    let boardPosition = pointNumberToBoardPosition(point);
    if (boardPosition == 7) moveNumber += 2;  // start the off checkers a little bit higher
    let movePosition = moveNumberToBoardPosition(moveNumber, point);
    series.push({ x: boardPosition, y: movePosition });
}

function addOffCheckerToBoard(series, dOffCheckerNumber, player)
{
    let where = 14.0;
    let stackedNumber = dOffCheckerNumber / 3 - 0.15;
    if (player != 0) stackedNumber = 11 - stackedNumber;
    series.push({ x: where - 0.4, y: stackedNumber });
    series.push({ x: where + 0.4, y: stackedNumber });
    series.push({ x: NaN, y: NaN });
}

function addOffCheckersToBoard(offCheckers, player)
{
    let series;
    if (player == 0) series = Player0OffCheckerData;
    else series = Player1OffCheckerData;

    for (let offCheckerNumber = 1; offCheckerNumber <= offCheckers; offCheckerNumber++)
    {
        addOffCheckerToBoard(series, offCheckerNumber, player);
    }
}


function setPositionID(sPositionID, player)
{
    if (sPositionID.length < 10) return;

    resetCheckerData();

    let sBinary = positionIDToBinaryString(sPositionID);  // add padding

    let number = 1;
    let point = 1;
    let checkers;
    let offCheckers = 15;

    if (player === 0) checkers = player0CheckerData;
    else checkers = player1CheckerData;
    for (let iBinaryPosition = 0; iBinaryPosition < sBinary.length; iBinaryPosition++)
    {
        if (sBinary[iBinaryPosition] === '1')
        {
            addCheckerToBoard(checkers, number++, player === 0 ? point : 25 - point);
            offCheckers--;
        }
        else
        {
            point++;
            number = 1;
        }
        if (point === 26)
        {
            addOffCheckersToBoard(offCheckers, player);
            point = 1;
            offCheckers = 15;
            if (player === 0)
            {
                checkers = player1CheckerData;
                player = 1;
            }
            else
            {
                checkers = player0CheckerData;
                player = 0;
            }
        }
    }

    boardChart.update();
}

function positionIDToBinaryString(sPositionID)
{
    sPositionID += "==";  // add padding
    let decodedBytes = atob(sPositionID);

    let sBinary = "";
    for (let characterPosition = 0; characterPosition < decodedBytes.length; characterPosition++)
    {
        let bByte = decodedBytes.charCodeAt(characterPosition);
        for (let bitPosition = 0; bitPosition < 8; bitPosition++)
        {
            if ((bByte & (1 << bitPosition)) != 0) sBinary += "1";
            else sBinary += "0";
        }
    }
    return sBinary;
}


function addDiceToBoard()
{
    diceNumbers.length = 0;

    // the Cube
    const cubeColor = matchInfo.CubeOwner == 0 ? player1ForeColor : (matchInfo.CubeOwner == 1 ? player0ForeColor : frameColor);
    const cubePosition = matchInfo.CubeOwner == 0 ? 8.5 : (matchInfo.CubeOwner == 1 ? 2.5 : 5.45);

    // the cube
    diceNumbers.push({
        x: 0.0,
        y: cubePosition,
        label: matchInfo.Cube.toString(),
        labelColor: cubeColor,
    });

    // the dice
    diceNumbers.push({
        x: 9.5,
        y: 5.45,
        label: matchInfo.FirstDice.toString(),
        labelColor: player0ForeColor,
    });
    diceNumbers.push({
        x: 11.5,
        y: 5.45,
        label: matchInfo.SecondDice.toString(),
        labelColor: player0ForeColor,
    });
}

const diceNumberAnnotations = {
    id: 'diceNumbers',
    afterDatasetsDraw(chart, args, options) {
        const { ctx } = chart;
        ctx.save();
        diceNumbers.forEach(point => {
            if (point.label) {
                ctx.fillStyle = point.labelColor;
                ctx.font = 'bold 18px Arial';
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

function addAwayToBoard()
{
    away.length = 0;

    // the Cube
    const player0Away = matchInfo.MatchLength - matchInfo.Player0Score;
    const player1Away = matchInfo.MatchLength - matchInfo.Player1Score;

    away.push({
        x: 0.0,
        y: 0.5,
        yAway: 0.0,
        label: player0Away.toString(),
        labelColor: player0ForeColor,
    });
    away.push({
        x: 0.0,
        y: 10.5,
        yAway: 11.1,
        label: player1Away.toString(),
        labelColor: player1ForeColor,
    });
}

const awayAnnotations = {
    id: 'away',
    afterDatasetsDraw(chart, args, options) {
        const { ctx } = chart;
        ctx.save();
        away.forEach(point => {
            if (point.label) {
                ctx.fillStyle = point.labelColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.font = 'bold 18px Arial';
                const xPos = chart.scales.x.getPixelForValue(point.x);
                const yPos = chart.scales.y.getPixelForValue(point.y);
                ctx.fillText(point.label, xPos, yPos);

                ctx.font = 'bold 8px Arial';
                const yAwayPos = chart.scales.y.getPixelForValue(point.yAway);
                ctx.fillText('Away', xPos, yAwayPos);
            }
        });
        ctx.restore();
    }
};


//* Draw the simple board stuff
function addPointNumberToBoard(point)
{
    const boardPosition = pointNumberToBoardPosition(point);
    let movePosition = moveNumberToBoardPosition(0, point);

    if (point > 12) movePosition -= 0.2; // move the numbers closer to the board
    else movePosition += 0.1;

    pointNumbers.push({
        x: boardPosition,
        y: movePosition,
        label: point.toString(),
        labelColor: unimportantColor,
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

function setPointNumbers()
{
    pointNumbers.length = 0;
    for (let point = 1; point < 25; point++)
    {
        addPointNumberToBoard(point);
    }
}

function moveNumberToBoardPosition(iMoveNumber, point)
{
    let dMovePosition;
    let dStackThem = 0;
    if (iMoveNumber > 5) dStackThem = 4.5;  // stack the checkers if there are too many
    if (point < 13) dMovePosition = iMoveNumber - 0.5 - dStackThem;
    else dMovePosition = 11.0 - iMoveNumber + 0.5 + dStackThem;
    return dMovePosition;
}

function pointNumberToBoardPosition(point)
{
    if (point < 0) return 14;
    if (point == 25 || point == 0) return 7; // the bar
    if (point > 12) point -= 12;
    else point = 13 - point;
    if (point > 6) point++;
    if (point > 14) point = 14; // just to make sure, don;t ask me why
    return point;
}

function addPointToBoard(pointData, point)
{
    const iBoardPosition = pointNumberToBoardPosition(point);
    pointData.push({ x: iBoardPosition - 0.5, y: 0 });
    pointData.push({ x: iBoardPosition, y: 4.3 });
    pointData.push({ x: iBoardPosition + 0.5, y: 0 });
    pointData.push({ x: NaN, y: NaN });
}

function addTopPointToBoard(pointData, point)
{
    const iBoardPosition = pointNumberToBoardPosition(point);
    pointData.push({ x: iBoardPosition - 0.5, y: 11 });
    pointData.push({ x: iBoardPosition, y: 6.7 });
    pointData.push({ x: iBoardPosition + 0.5, y: 11 });
    pointData.push({ x: NaN, y: NaN });
}

function generatePointNumbers() {
    for (let point = 1; point < 25; point++)
    {
        let pointData = (point % 2 === 0) ? pointsB : pointsA;

        if (point < 13) addPointToBoard(pointData, point);
        else addTopPointToBoard(pointData, point);
    }
}

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
        const width = window.innerWidth;
        const height = width * 0.66; // Maintain 3:2 aspect ratio (width:height)
        canvas.style.height = `${height}px`;
        canvas.style.width = `${width}px`;

        checkerSize = Math.min(height / 12 * 0.8, width / 15 * 0.8) / 2; // Adjust checker size based on canvas size
        boardChart?.update();
    }
}

// Function to create the Backgammon Board
function createBoard() {
    setCanvasHeight();

    const canvas = document.getElementById('boardChartCanvas');
    const ctx = canvas.getContext('2d');

    generatePointNumbers();
    setPointNumbers();

    destroyBoardChart('');
    diceNumbers.length = 0;

    // Create the chart if it doesn't exist
    boardChart = new Chart(ctx, {
        type: 'scatter',
        plugins: [pointNumberAnnotations, diceNumberAnnotations, awayAnnotations], 
        data: {
            datasets: [
                {
                    label: 'P0 Checkers',
                    data: player0CheckerData,
                    borderColor: player0ForeColor,
                    backgroundColor: player0BackColor,
                    borderWidth: 2,
                    pointRadius: checkerSize,
                },
                {
                    label: 'P1 Checkers',
                    data: player1CheckerData,
                    borderColor: player1ForeColor,
                    backgroundColor: player1BackColor,
                    borderWidth: 2,
                    pointRadius: checkerSize,
                },
                {
                    label: 'P0 Off Checkers',
                    data: Player0OffCheckerData,
                    borderColor: player0ForeColor,
                    borderWidth: 5,
                    fill: false,
                    showLine: true,
                    pointRadius: 0,
                },
                {
                    label: 'P1 Off Checkers',
                    data: Player1OffCheckerData,
                    borderColor: player1ForeColor,
                    borderWidth: 5,
                    fill: false,
                    showLine: true,
                    pointRadius: 0,
                },
                {
                    label: 'Board Frame',
                    data: boardFrameData,
                    borderColor: frameColor,
                    borderWidth: 3,
                    showLine: true,
                    pointRadius: 0,
                },
                {
                    label: 'Points A',
                    data: pointsA,
                    borderColor: pointsAForeColor,
                    backgroundColor: pointsAForeColor,
                    borderWidth: 3,
                    showLine: true,
                    pointRadius: 0,
                },
                {
                    label: 'Points B',
                    data: pointsB,
                    borderColor: pointsBForeColor,
                    backgroundColor: pointsBForeColor,
                    borderWidth: 3,
                    fill: false,
                    showLine: true,
                    pointRadius: 0,
                },
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
            layout: {
                padding: { bottom: -20 }
            },
            scales: {
                x: {
                    title: {
                        display: showDebug,
                    },
                    beginAtZero: true,
                    stacked: true,
                    position: 'bottom',
                    ticks: {
                        color: unimportantColor,
                        display: showDebug,
                    },                            
                    grid: gridColor,
                    min: -0.1,
                    max: 14.1,
                    display: showDebug,
                },
                y: {
                    ticks: { 
                        display: showDebug,
                    },
                    beginAtZero: true,
                    min: -0.1,
                    max: 11.1,
                    grid: gridColor,
                    display: showDebug,
                }
            }
        }
    });
}