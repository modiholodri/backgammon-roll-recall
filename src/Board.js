// default colors
const showDebug = false;

const boardThemes = {
    classic: {
        frame: 'rgb(75, 75, 75)',
        pointsA: 'rgba(255, 255, 0, 0.3)',
        pointsB: 'rgba(50, 205, 50, 0.3)',
        grid: 'rgba(255, 255, 0, 0.1)',
        player0Fore: 'rgb(0, 99, 255)',
        player0Back: 'rgba(0, 99, 255, 0.7)',
        player1Fore: 'rgba(255, 0, 255, 1)',
        player1Back: 'rgba(255, 0, 255, 0.7)',
    },
    felt: {
        frame: 'rgba(116, 176, 92, 0.9)',
        pointsA: 'rgba(92, 176, 79, 0.65)',
        pointsB: 'rgba(34, 105, 51, 0.75)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#f5deb3',
        player0Back: 'rgba(245, 222, 179, 0.85)',
        player1Fore: '#d95f45',
        player1Back: 'rgba(217, 95, 69, 0.85)',
    },
    walnut: {
        frame: 'rgba(255, 223, 167, 0.9)',
        pointsA: 'rgba(242, 196, 110, 0.65)',
        pointsB: 'rgba(88, 45, 24, 0.7)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#f2c46e',
        player0Back: 'rgba(242, 196, 110, 0.85)',
        player1Fore: '#79bce0',
        player1Back: 'rgba(121, 188, 224, 0.85)',
    },
    ocean: {
        frame: 'rgba(110, 190, 225, 0.9)',
        pointsA: 'rgba(95, 190, 225, 0.65)',
        pointsB: 'rgba(40, 105, 175, 0.75)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#8bd3f2',
        player0Back: 'rgba(139, 211, 242, 0.85)',
        player1Fore: '#647ff0',
        player1Back: 'rgba(100, 127, 240, 0.85)',
    },
};

let frameColor = boardThemes.classic.frame;
let pointsAForeColor = boardThemes.classic.pointsA;
let pointsBForeColor = boardThemes.classic.pointsB;

let player0ForeColor = boardThemes.classic.player0Fore;
let player0BackColor = boardThemes.classic.player0Back;

let player1ForeColor = boardThemes.classic.player1Fore;
let player1BackColor = boardThemes.classic.player1Back;

const unimportantColor = 'rgba(255, 255, 255, 0.3)';

const gridColor = { color: boardThemes.classic.grid };

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

let diceDots = [];
let diceDotsData = [];

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
const cube = [];
const away = [];
const pointsB = [];
const pointsA = [];


function resetCheckerData() {
    player0CheckerData.length = 0;
    player1CheckerData.length = 0;
    Player0OffCheckerData.length = 0;
    Player1OffCheckerData.length = 0;
}

const baaDots = [[true, true, true, true, true, true, true], //! not rolled yet
                 [true, true, true, false, true, true, true], //! one          1   2
                 [true, false, true, true, true, false, true], //! two         3 4 5
                 [false, true, true, false, true, true, false], //! three      6   7
                 [false, false, true, true, true, false, false], //! four
                 [false, false, true, false, true, false, false], //! five
                 [false, false, false, true, false, false, false], //! six
];

let diceDotsTempData = [];

function addDiceToBoard() {
    diceDotsData.length = 0;
    diceDotsTempData = [];

    setDice(1, matchInfo.FirstDice);
    setDice(8, matchInfo.SecondDice);

    diceDotsData = diceDotsTempData;
    boardChart.data.datasets[7].data = diceDotsData;
    boardChart.update();
}

function setDice(start, value)
{
    if (value < 0 || value > 6) return;

    const baseIndex = start - 1;
    for (let dotPosition = 0; dotPosition < 7; dotPosition++)
    {
        const i = baseIndex + dotPosition;
        if (i < 0 || i >= diceDots.length) continue;

        // Access the baaDots 2D array correctly and push when a dot is present
        if (baaDots[value] && baaDots[value][dotPosition] === false)
        {
            diceDotsTempData.push(diceDots[i]);
        }
    }
}

function generateDice(dPointPosition, dMovePosition)
{
    const dOffset = 0.3;
    const dSize = 1.0;
    diceDots.push({ x: dPointPosition - dOffset, y: dMovePosition - dOffset });
    diceDots.push({ x: dPointPosition + dOffset, y: dMovePosition - dOffset });
    diceDots.push({ x: dPointPosition - dOffset, y: dMovePosition });
    diceDots.push({ x: dPointPosition, y: dMovePosition });
    diceDots.push({ x: dPointPosition + dOffset, y: dMovePosition });
    diceDots.push({ x: dPointPosition - dOffset, y: dMovePosition + dOffset });
    diceDots.push({ x: dPointPosition + dOffset, y: dMovePosition + dOffset });
}


function addCheckerToBoard(series, moveNumber, point)
{
    // if (series == blackCheckerData) point = 25 - point;
    let boardPosition = pointNumberToBoardPosition(point);
    if (boardPosition == 7) moveNumber += 3;  // start the off checkers a little bit higher
    let movePosition = moveNumberToBoardPosition(moveNumber, point);
    series.push({ x: boardPosition, y: movePosition });
}

function addOffCheckerToBoard(series, dOffCheckerNumber, player)
{
    let where = player != 0 ? 11.6 : -0.6;
    let stackedNumber = 13.9 - dOffCheckerNumber / 3 - 0.15;
    // if (player != 0) stackedNumber = 11 - stackedNumber;
    series.push({ x: stackedNumber, y: where - 0.4 });
    series.push({ x: stackedNumber, y: where + 0.4 });
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
    let checkers = [];
    let offCheckers = 15;

    let player0TempChecker = []; // don't know why but it needs the temp checkers
    let player1TempChecker = [];

    if (player === 0) checkers = player0TempChecker;
    else checkers = player1TempChecker;
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
                checkers = player1TempChecker;
                player = 1;
            }
            else
            {
                checkers = player0TempChecker;
                player = 0;
            }
        }
    }

    player0CheckerData = player0TempChecker;
    player1CheckerData = player1TempChecker;

    boardChart.data.datasets[0].data = player0CheckerData;
    boardChart.data.datasets[1].data = player1CheckerData;
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


function addCubeToBoard()
{
    cube.length = 0;

    // the Cube
    const cubeColor = matchInfo.CubeOwner == 0 ? player1ForeColor : (matchInfo.CubeOwner == 1 ? player0ForeColor : frameColor);
    const cubePosition = matchInfo.CubeOwner == 0 ? 9.0 : (matchInfo.CubeOwner == 1 ? 2.0 : 5.45);

    // the cube
    cube.push({
        x: 7.0,
        y: cubePosition,
        label: matchInfo.Cube.toString(),
        labelColor: cubeColor,
    });
}

const diceNumberAnnotations = {
    id: 'cube',
    afterDatasetsDraw(chart, args, options) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        cube.forEach(point => {
            if (point.label) {
                ctx.fillStyle = point.labelColor;
                const xPos = chart.scales.x.getPixelForValue(point.x);
                const yPos = chart.scales.y.getPixelForValue(point.y);
                ctx.fillText(point.label, xPos, yPos);
            }
        });
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = 'bold 8px Arial';
        const xValue = (cube[0] && typeof cube[0].x === 'number') ? cube[0].x : 0.0;
        const yValue = (cube[0] && typeof cube[0].y === 'number') ? cube[0].y : 0.0;
        const xPos = chart.scales.x.getPixelForValue(xValue);
        let yPos = chart.scales.y.getPixelForValue(yValue - 0.5);
        ctx.fillText('Cube', xPos, yPos);
        yPos = chart.scales.y.getPixelForValue(yValue + 0.6);
        ctx.fillText('Cube', xPos, yPos);

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
        x: 7.0,
        y: 0.55,
        yAway: -0.4,
        label: player0Away.toString(),
        labelColor: player0ForeColor,
    });
    away.push({
        x: 7.0,
        y: 10.25,
        yAway: 11.4,
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

    if (point > 12) movePosition -= 0.1; // adjust the top
    else movePosition += 0.06;

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
                ctx.font = 'bold 14px Arial';
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

function setBoardTheme(themeName) {
    const isKnownTheme = Object.prototype.hasOwnProperty.call(boardThemes, themeName);
    const theme = isKnownTheme ? boardThemes[themeName] : boardThemes.classic;
    const canvas = document.getElementById('boardChartCanvas');
    if (canvas) canvas.style.backgroundColor = 'black';

    const previousFrameColor = frameColor;
    const previousPlayer0ForeColor = player0ForeColor;
    const previousPlayer1ForeColor = player1ForeColor;
    frameColor = theme.frame;
    pointsAForeColor = theme.pointsA;
    pointsBForeColor = theme.pointsB;
    player0ForeColor = theme.player0Fore;
    player0BackColor = theme.player0Back;
    player1ForeColor = theme.player1Fore;
    player1BackColor = theme.player1Back;
    gridColor.color = theme.grid;
    cube.forEach(point => {
        if (point.labelColor === previousPlayer0ForeColor) point.labelColor = player0ForeColor;
        else if (point.labelColor === previousPlayer1ForeColor) point.labelColor = player1ForeColor;
        else if (point.labelColor === previousFrameColor) point.labelColor = frameColor;
    });
    away.forEach(point => {
        if (point.labelColor === previousPlayer0ForeColor) point.labelColor = player0ForeColor;
        else if (point.labelColor === previousPlayer1ForeColor) point.labelColor = player1ForeColor;
    });

    if (boardChart) {
        boardChart.data.datasets[0].borderColor = player0ForeColor;
        boardChart.data.datasets[0].backgroundColor = player0BackColor;
        boardChart.data.datasets[1].borderColor = player1ForeColor;
        boardChart.data.datasets[1].backgroundColor = player1BackColor;
        boardChart.data.datasets[2].borderColor = player0ForeColor;
        boardChart.data.datasets[3].borderColor = player1ForeColor;
        boardChart.data.datasets[4].borderColor = frameColor;
        boardChart.data.datasets[5].borderColor = pointsAForeColor;
        boardChart.data.datasets[5].backgroundColor = pointsAForeColor;
        boardChart.data.datasets[6].borderColor = pointsBForeColor;
        boardChart.data.datasets[6].backgroundColor = pointsBForeColor;
        boardChart.data.datasets[7].borderColor = player0ForeColor;
        boardChart.data.datasets[7].backgroundColor = player0BackColor;
        boardChart.options.scales.x.grid.color = gridColor.color;
        boardChart.options.scales.y.grid.color = gridColor.color;
        boardChart.update();
    }

    if (!isKnownTheme) {
        const selection = document.getElementById('boardThemeSelection');
        if (selection) selection.value = 'classic';
    }
}

function wholeNumbersOnly(value) {
    return Number.isInteger(value) ? value.toLocaleString() : null;
}

function setCanvasHeight() {
    const canvas = document.getElementById('boardChartCanvas');
    if (canvas) {
        const width = window.innerWidth;
        const height = width * 0.85; // Maintain 3:2 aspect ratio (width:height)
        canvas.style.height = `${height}px`;

        checkerSize = Math.min(height / 12 * 0.8, width / 15 * 0.8) / 1.8; // Adjust checker size based on canvas size
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

    generateDice(9.5, 5.5);
    generateDice(11.5, 5.5);

    destroyBoardChart('');
    cube.length = 0;

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
                    borderWidth: 2,
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
                {
                    label: 'Dice Dots',
                    data: diceDotsData,
                    borderColor: player0ForeColor,
                    backgroundColor: player0BackColor,
                    borderWidth: 1,
                    pointRadius: 2,
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
                tooltip: {
                    enabled: showDebug 
                },
            },
            events: [], // This makes the chart completely "blind" to mouse hover and touch events
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
                    min: 0.4,
                    max: 13.6,
                    display: showDebug,
                },
                y: {
                    ticks: { 
                        display: showDebug,
                    },
                    beginAtZero: true,
                    min: -0.7,
                    max: 11.7,
                    grid: gridColor,
                    display: showDebug,
                }
            }
        }
    });

    const themeSelection = document.getElementById('boardThemeSelection');
    setBoardTheme(themeSelection ? themeSelection.value : 'classic');
}