// default colors
const frameColor = 'rgba(0, 255, 0, 1)';

const player1ForeColor = 'rgba(255, 0, 255, 1)';
const player1BackColor = 'rgba(255, 0, 255, 0.3)';

const player0ForeColor = 'rgba(0, 255, 255, 1)';
const player0BackColor = 'rgba(0, 255, 255, 0.3)';

const labelColor = 'rgba(255, 255, 0, 0.3)';

const chartColor = 'rgba(255, 255, 0, 0.2)';
const gridColor = { color: 'rgba(255, 255, 0, 0.1)' };

Chart.defaults.color = chartColor;  // default text color
Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.0)';  // don't show the default grid
Chart.defaults.plugins.legend.labels.color = chartColor;
Chart.defaults.scale.title.font = { size: 16, weight: 'bold' };
Chart.defaults.scale.title.color = chartColor;
Chart.defaults.layout.padding.top = 7;

let player0CheckerData = [];
let player1CheckerData = [];
let Player0OffCheckerData = [];
let Player1OffCheckerData = [];

function resetCheckerData() {
    player0CheckerData.length = 0;
    player1CheckerData.length = 0;
    Player0OffCheckerData.length = 0;
    Player1OffCheckerData.length = 0;
}

function AddCheckerToBoard(series, moveNumber, point)
{
    // if (series == blackCheckerData) point = 25 - point;
    let boardPosition = PointNumberToBoardPosition(point);
    if (boardPosition == 7) moveNumber += 2;  // start the off checkers a little bit higher
    let movePosition = MoveNumberToBoardPosition(moveNumber, point);
    series.push({ x: boardPosition, y: movePosition });
}

function AddOffCheckerToBoard(series, dOffCheckerNumber, player)
{
    let where = 15.0;
    let stackedNumber = dOffCheckerNumber / 3 - 0.15;
    if (player != 0) stackedNumber = 11 - stackedNumber;
    series.push({ x: where - 0.4, y: stackedNumber });
    series.push({ x: where + 0.4, y: stackedNumber });
    series.push({ x: NaN, y: NaN });
}

function AddOffCheckersToBoard(offCheckers, player)
{
    let series;
    if (player == 0) series = Player1OffCheckerData;
    else series = Player0OffCheckerData;

    for (let offCheckerNumber = 1; offCheckerNumber <= offCheckers; offCheckerNumber++)
    {
        AddOffCheckerToBoard(series, offCheckerNumber, player);
    }
}


function SetPositionID(sPositionID, player)
{
    if (sPositionID.length < 10) return;

    resetCheckerData();

    let sBinary = PositionIDToBinaryString(sPositionID);  // add padding

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
            AddCheckerToBoard(checkers, number++, player === 0 ? point : 25 - point);
            offCheckers--;
        }
        else
        {
            point++;
            number = 1;
        }
        if (point === 26)
        {
            AddOffCheckersToBoard(offCheckers, player);
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

function PositionIDToBinaryString(sPositionID)
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


//* Draw the simple board stuff

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

function AddPointNumberToBoard(point)
{
    const boardPosition = PointNumberToBoardPosition(point);
    let movePosition = MoveNumberToBoardPosition(0, point);

    if (point > 12) movePosition -= 0.2; // move the numbers closer to the board
    else movePosition += 0.1;

    pointNumbers.push({
        x: boardPosition,
        y: movePosition,
        label: point.toString(),
        labelColor: labelColor,
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

function SetPointNumbers()
{
    pointNumbers.length = 0;
    for (let point = 1; point < 25; point++)
    {
        AddPointNumberToBoard(point);
    }
}

function MoveNumberToBoardPosition(iMoveNumber, point)
{
    let dMovePosition;
    let dStackThem = 0;
    if (iMoveNumber > 5) dStackThem = 4.5;  // stack the checkers if there are too many
    if (point < 13) dMovePosition = iMoveNumber - 0.5 - dStackThem;
    else dMovePosition = 11.0 - iMoveNumber + 0.5 + dStackThem;
    return dMovePosition;
}


const whitePointData = [];
const blackPointData = [];

function PointNumberToBoardPosition(point)
{
    if (point < 0) return 14;
    if (point == 25 || point == 0) return 7; // the bar
    if (point > 12) point -= 12;
    else point = 13 - point;
    if (point > 6) point++;
    if (point > 14) point = 14; // just to make sure, don;t ask me why
    return point;
}

function AddPointToBoard(pointData, point)
{
    const iBoardPosition = PointNumberToBoardPosition(point);
    pointData.push({ x: iBoardPosition - 0.5, y: 0 });
    pointData.push({ x: iBoardPosition, y: 4.3 });
    pointData.push({ x: iBoardPosition + 0.5, y: 0 });
    pointData.push({ x: NaN, y: NaN });
}

function AddTopPointToBoard(pointData, point)
{
    const iBoardPosition = PointNumberToBoardPosition(point);
    pointData.push({ x: iBoardPosition - 0.5, y: 11 });
    pointData.push({ x: iBoardPosition, y: 6.7 });
    pointData.push({ x: iBoardPosition + 0.5, y: 11 });
    pointData.push({ x: NaN, y: NaN });
}

function generatePointData() {
    for (let point = 1; point < 25; point++)
    {
        let pointData = (point % 2 === 1) ? blackPointData : whitePointData;

        if (point < 13) AddPointToBoard(pointData, point);
        else AddTopPointToBoard(pointData, point);
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

    generatePointData();
    SetPointNumbers();

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
                    showLine: true,
                    pointRadius: 0
                },
                {
                    label: 'A Points',
                    data: blackPointData,
                    borderColor: player0BackColor,
                    backgroundColor: player0BackColor,
                    borderWidth: 3,
                    showLine: true,
                    pointRadius: 0
                },
                {
                    label: 'B Points',
                    data: whitePointData,
                    borderColor: player1BackColor,
                    backgroundColor: player1BackColor,
                    borderWidth: 3,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
                },
                {
                    label: 'P0 Checkers',
                    data: player0CheckerData,
                    borderColor: player0ForeColor,
                    backgroundColor: player0BackColor,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 25
                },
                {
                    label: 'P1 Checkers',
                    data: player1CheckerData,
                    borderColor: player1ForeColor,
                    backgroundColor: player1BackColor,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 25
                },
                {
                    label: 'P0 Off Checkers',
                    data: Player0OffCheckerData,
                    borderColor: player0ForeColor,
                    backgroundColor: player0BackColor,
                    borderWidth: 5,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
                },
                {
                    label: 'P1 Off Checkers',
                    data: Player1OffCheckerData,
                    borderColor: player1ForeColor,
                    backgroundColor: player1BackColor,
                    borderWidth: 5,
                    fill: false,
                    showLine: true,
                    pointRadius: 0
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
            scales: {
                x: {
                    title: {
                        display: false,
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
                    max: 15.5,
                    display: false,
                },
                y: {
                    beginAtZero: true,
                    min: -0.5,
                    max: 11.5,
                    grid: gridColor,
                    display: false,
                }
            }
        }
    });
}