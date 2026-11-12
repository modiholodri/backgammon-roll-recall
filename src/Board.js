// default colors
const showDebug = false;

const boardThemes = {
    classic: {
        frame: 'rgb(75, 75, 75)',
        pointsA: 'rgba(255, 255, 0, 0.3)',
        pointsB: 'rgba(50, 205, 50, 0.3)',
        grid: 'rgba(255, 255, 0, 0.1)',
        player0Fore: 'rgb(0, 99, 255)',
        player0Back: 'rgba(0, 82, 214, 0.95)',
        player1Fore: 'rgb(165, 0, 165)',
        player1Back: 'rgba(255, 44, 255, 0.95)',
    },
    fire: {
        frame: 'rgba(214, 98, 24, 0.9)',
        pointsA: 'rgba(255, 140, 0, 0.65)',
        pointsB: 'rgba(120, 32, 15, 0.75)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#c95d00',
        player0Back: 'rgba(255, 180, 72, 0.95)',
        player1Fore: '#7a1f1f',
        player1Back: 'rgba(255, 85, 0, 0.95)',
    },
    moon: {
        frame: 'rgba(240, 240, 240, 0.9)',
        pointsA: 'rgba(180, 180, 180, 0.65)',
        pointsB: 'rgba(78, 78, 78, 0.75)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#717476',
        player0Back: 'rgba(0, 0, 1, 0.95)',
        player1Fore: '#292727',
        player1Back: 'rgba(80, 80, 80, 0.95)',
    },
    moss: {
        frame: 'rgba(116, 176, 92, 0.9)',
        pointsA: 'rgba(92, 176, 79, 0.65)',
        pointsB: 'rgba(0, 82, 19, 0.75)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#3d7a00',
        player0Back: 'rgba(96, 192, 0, 0.95)',
        player1Fore: '#5d9000',
        player1Back: 'rgba(217, 249, 157, 0.95)',
    },
    ocean: {
        frame: 'rgba(110, 190, 225, 0.9)',
        pointsA: 'rgba(95, 190, 225, 0.65)',
        pointsB: 'rgba(40, 105, 175, 0.75)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#006996',
        player0Back: 'rgba(38, 139, 255, 0.95)',
        player1Fore: '#001d90',
        player1Back: 'rgba(0, 46, 230, 0.95)',
    },
    sun: {
        frame: 'rgba(255, 200, 0, 0.9)',
        pointsA: 'rgba(255, 247, 0, 0.65)',
        pointsB: 'rgba(120, 32, 15, 0.75)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#f97400',
        player0Back: 'rgba(255, 230, 2, 0.95)',
        player1Fore: '#ff0000',
        player1Back: 'rgba(255, 89, 0, 0.95)',
    },
    walnut: {
        frame: 'rgba(255, 223, 167, 0.9)',
        pointsA: 'rgba(242, 196, 110, 0.65)',
        pointsB: 'rgba(88, 45, 24, 0.7)',
        grid: 'rgba(255, 255, 255, 0.12)',
        player0Fore: '#925f00',
        player0Back: 'rgba(242, 196, 110, 0.95)',
        player1Fore: '#5b3b00',
        player1Back: 'rgba(129, 84, 0, 0.95)',
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
let heatMapChart;
let selectedMoveArrows = [];

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

function addDiceToBoard(updateChart = true) {
    diceDotsData.length = 0;
    diceDotsTempData = [];

    setDice(1, matchInfo.FirstDice);
    setDice(8, matchInfo.SecondDice);

    diceDotsData = diceDotsTempData;
    boardChart.data.datasets[7].data = diceDotsData;
    if (updateChart) boardChart.update();
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


function setPositionID(sPositionID, player, updateChart = true)
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
    if (updateChart) boardChart.update();
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

const HEAT_MAP_TYPES = Object.freeze({
    missedChecker: 'missedChecker',
    shouldHavePut: 'shouldHavePut',
    equityLost: 'equityLost',
    frequentMistake: 'frequentMistake',
    bestMoveDestinations: 'bestMoveDestinations',
});

let heatMapType = HEAT_MAP_TYPES.missedChecker;
let heatMapBars = [];

function getHeatMapMovePoints(move, type) {
    if (!move || typeof move !== 'object') return [];

    const parsedMoves = parseBoardMoveNotation(move.notation || '');
    if (parsedMoves.length === 0) {
        return [];
    }

    if (type === HEAT_MAP_TYPES.shouldHavePut ||
        type === HEAT_MAP_TYPES.equityLost ||
        type === HEAT_MAP_TYPES.bestMoveDestinations) {
        return parsedMoves
            .map(({ to }) => normalizeBoardMovePoint(to))
            .filter((point) => point !== null && point !== 25 && point !== 0);
    }

    return parsedMoves
        .map(({ from }) => normalizeBoardMovePoint(from))
        .filter((point) => point !== null && point !== 25 && point !== 0);
}

function buildHeatMapData(blunders, type = heatMapType) {
    const pointWeights = new Map();
    const safeBlunders = Array.isArray(blunders) ? blunders : [];

    safeBlunders.forEach((blunder) => {
        if (!blunder || typeof blunder !== 'object') return;

        const askedCount = Number(blunder.timesAsked) > 0 ? Number(blunder.timesAsked) : 1;
        const moveList = Array.isArray(blunder.moves) ? blunder.moves : [];
        const movesToAggregate = (
            type === HEAT_MAP_TYPES.shouldHavePut ||
            type === HEAT_MAP_TYPES.bestMoveDestinations
        ) && moveList.length > 0
            ? [moveList.reduce((bestMove, move) => {
                if (!move || typeof move !== 'object') return bestMove;
                if (!bestMove) return move;
                return Math.abs(Number(move.lostEquityValue) || 0) < Math.abs(Number(bestMove.lostEquityValue) || 0)
                    ? move
                    : bestMove;
            }, null)].filter(Boolean)
            : type === HEAT_MAP_TYPES.frequentMistake
                ? moveList.filter((move) => move && Math.abs(Number(move.lostEquityValue) || 0) > 0)
                : moveList;

        movesToAggregate.forEach((move) => {
            if (!move || typeof move !== 'object') return;

            const points = getHeatMapMovePoints(move, type);
            if (points.length === 0) return;

            const severity = Math.abs(Number(move.lostEquityValue) || 0);
            const weight = type === HEAT_MAP_TYPES.shouldHavePut || type === HEAT_MAP_TYPES.frequentMistake
                ? askedCount
                : type === HEAT_MAP_TYPES.bestMoveDestinations
                    ? 1
                    : severity > 0 ? Math.max(1, severity * askedCount) : 1;
            const color = type === HEAT_MAP_TYPES.shouldHavePut ||
                type === HEAT_MAP_TYPES.bestMoveDestinations ||
                severity === 0 ? 'green' : 'red';

            points.forEach((point) => {
                const current = pointWeights.get(point) || { value: 0, color: 'green' };
                const nextValue = current.value + weight;
                pointWeights.set(point, {
                    value: nextValue,
                    color: current.value === 0 ? color : (nextValue >= current.value ? current.color : color),
                });
            });
        });
    });

    return Array.from(pointWeights.entries())
        .map(([point, stats]) => ({
            point,
            value: stats.value,
            color: stats.color,
        }))
        .sort((a, b) => b.value - a.value);
}

function refreshHeatMap(blunders, type = heatMapType) {
    heatMapType = Object.prototype.hasOwnProperty.call(HEAT_MAP_TYPES, type) ? type : HEAT_MAP_TYPES.missedChecker;
    heatMapBars = buildHeatMapData(blunders, heatMapType).map((pointData) => ({
        point: pointData.point,
        value: pointData.value,
        color: pointData.color,
    }));

    if (heatMapChart) {
        heatMapChart.update();
    }
}

function setHeatMapType(type) {
    const selection = document.getElementById('heatMapTypeSelection');
    const selectedType = Object.prototype.hasOwnProperty.call(HEAT_MAP_TYPES, type) ? type : HEAT_MAP_TYPES.missedChecker;
    heatMapType = selectedType;
    if (selection) selection.value = selectedType;
    if (typeof window !== 'undefined' && typeof window.blunders !== 'undefined') {
        refreshHeatMap(window.blunders, selectedType);
    }
    if (typeof blunders !== 'undefined') {
        refreshHeatMap(blunders, selectedType);
    }
}

const heatMapAnnotations = {
    id: 'heatMap',
    afterDatasetsDraw(chart, args, options) {
        if (!Array.isArray(heatMapBars) || heatMapBars.length === 0) return;

        const { ctx } = chart;
        const maxValue = Math.max(...heatMapBars.map((bar) => Number(bar.value) || 0), 1);
        ctx.save();

        heatMapBars.forEach((bar) => {
            const point = Number(bar.point);
            if (!Number.isFinite(point)) return;

            const isTop = point >= 13;
            const xPos = chart.scales.x.getPixelForValue(pointNumberToBoardPosition(point));
            const width = 18;
            const baseY = chart.scales.y.getPixelForValue(isTop ? 10.8 : 0.2);
            const normalized = (Number(bar.value) || 0) / maxValue;
            const height = Math.max(5, normalized * 75);
            const y = isTop ? baseY : baseY - height;

            ctx.fillStyle = bar.color === 'green' ? 'rgba(40, 200, 90, 0.8)' : 'rgba(220, 38, 38, 0.8)';
            ctx.fillRect(xPos - width / 2, y, width, height);
        });

        ctx.restore();
    },
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

function normalizeBoardMovePoint(pointValue)
{
    const text = String(pointValue ?? '').trim().toLowerCase();
    if (!text) return null;
    if (text === 'bar') return 25;
    if (text === 'off') return 0;
    const numericValue = Number(text.replace(/[^0-9-]/g, ''));
    if (Number.isInteger(numericValue) && numericValue >= 0 && numericValue <= 25) return numericValue;
    return null;
}

function parseBoardMoveNotation(moveNotation)
{
    const text = String(moveNotation ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return [];

    const parsedMoves = [];

    text.split(/\s+/).forEach((segment) => {
        const cleanedSegment = segment.replace(/!+$/g, '');
        if (!cleanedSegment) return;

        let remaining = cleanedSegment;
        let previousTo = null;
        let isFirstMove = true;

        while (remaining) {
            const matches = isFirstMove
                ? remaining.match(/^([0-9]+|bar|off)\/([0-9]+|bar|off)(\*?)?(?:\(([0-9]+)\))?/i)
                : remaining.match(/^\/?([0-9]+|bar|off)(\*?)?(?:\(([0-9]+)\))?/i);

            if (!matches) break;

            const from = isFirstMove ? normalizeBoardMovePoint(matches[1]) : previousTo;
            const to = isFirstMove ? normalizeBoardMovePoint(matches[2]) : normalizeBoardMovePoint(matches[1]);
            const hit = Boolean(matches[isFirstMove ? 3 : 2]);
            const repeatCount = Number.parseInt(matches[isFirstMove ? 4 : 3] ?? '1', 10);

            if (from === null || to === null) {
                break;
            }

            parsedMoves.push({
                from,
                to,
                count: Number.isInteger(repeatCount) && repeatCount > 0 ? repeatCount : 1,
                label: matches[isFirstMove ? 4 : 3] ? `(${matches[isFirstMove ? 4 : 3]})` : null,
                hit,
            });

            previousTo = to;
            remaining = remaining.slice(matches[0].length);
            if (remaining.startsWith('/')) {
                remaining = remaining.slice(1);
            }
            isFirstMove = false;
        }
    });

    return parsedMoves;
}

function boardMovePointToPixel(pointValue, sourcePoint = pointValue)
{
    const point = normalizeBoardMovePoint(pointValue);
    if (point === null) return null;

    const xValue = pointNumberToBoardPosition(point);
    if (point === 25) {
        const source = normalizeBoardMovePoint(sourcePoint);
        return { x: xValue, y: source < 13 ? 3.5 : 7.5 };
    }
    if (point === 0) {
        const source = normalizeBoardMovePoint(sourcePoint);
        return { x: 13.8, y: source < 13 ? 2.5 : 8.5 };
    }

    return {
        x: xValue,
        y: point < 13 ? 2.5 : 8.5,
    };
}

function drawBoardArrow(ctx, start, end, lineColor, label = null, hit = false)
{
    if (!ctx || !start || !end || !lineColor) return;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const curveOffset = 32;
    const control = {
        x: (start.x + end.x) / 2 + (dy / length) * curveOffset,
        y: (start.y + end.y) / 2 - (dx / length) * curveOffset,
    };
    const angle = Math.atan2(end.y - control.y, end.x - control.x);
    const arrowHeadSize = 14;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(start.x, start.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fill();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - arrowHeadSize * Math.cos(angle - Math.PI / 7), end.y - arrowHeadSize * Math.sin(angle - Math.PI / 7));
    ctx.lineTo(end.x - arrowHeadSize * Math.cos(angle + Math.PI / 7), end.y - arrowHeadSize * Math.sin(angle + Math.PI / 7));
    ctx.closePath();
    ctx.fillStyle = lineColor;
    ctx.fill();

    if (label) {
        const midX = (start.x + end.x) / 2 + ((dy / length) || 0) * 14;
        const midY = (start.y + end.y) / 2 - ((dx / length) || 0) * 14;
        ctx.save();
        ctx.fillStyle = 'cyan';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, midX, midY);
        ctx.restore();
    }

    if (!hit) return;

    const hitX = (start.x + 2 * control.x + end.x) / 4;
    const hitY = (start.y + 2 * control.y + end.y) / 4;
    ctx.save();
    ctx.fillStyle = 'cyan';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('*', hitX, hitY);
    ctx.restore();
}

function setSelectedMoveArrows(move)
{
    selectedMoveArrows = [];
    if (!move || !move.notation) return;

    const color = typeof moveColor === 'function' ? moveColor(move.lostEquityValue) : 'lime';
    selectedMoveArrows = parseBoardMoveNotation(move.notation).map(({ from, to, count, label, hit }) => {
        const start = boardMovePointToPixel(from, to);
        const end = boardMovePointToPixel(to, from);
        return { from, to, count, label, hit, start, end, color };
    }).filter((arrow) => arrow.start && arrow.end);

    if (boardChart) boardChart.update();
}

function clearSelectedMoveArrows()
{
    selectedMoveArrows = [];
    if (boardChart) boardChart.update();
}

const moveArrowAnnotations = {
    id: 'moveArrows',
    afterDatasetsDraw(chart, args, options) {
        if (!Array.isArray(selectedMoveArrows) || selectedMoveArrows.length === 0) return;

        const { ctx } = chart;
        ctx.save();
        selectedMoveArrows.forEach((arrow) => {
            const startX = chart.scales.x.getPixelForValue(arrow.start.x);
            const startY = chart.scales.y.getPixelForValue(arrow.start.y);
            const endX = chart.scales.x.getPixelForValue(arrow.end.x);
            const endY = chart.scales.y.getPixelForValue(arrow.end.y);
            drawBoardArrow(ctx, { x: startX, y: startY }, { x: endX, y: endY }, arrow.color, arrow.label, arrow.hit);
        });
        ctx.restore();
    }
};

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

function applyBoardThemeColors(theme) {
    const body = document.body;
    if (!body || !body.style) return;

    body.style.setProperty('--text-accent', theme.frame);
    body.style.setProperty('--button-primary', theme.player0Fore);
    body.style.setProperty('--border-accent', theme.frame);
    body.style.setProperty('--bs-border-color', theme.player0Fore);
}

function setBoardTheme(themeName) {
    const selectedThemeName = themeName === 'felt' ? 'moss' : themeName;
    const isKnownTheme = Object.prototype.hasOwnProperty.call(boardThemes, selectedThemeName);
    const theme = isKnownTheme ? boardThemes[selectedThemeName] : boardThemes.classic;
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
    applyBoardThemeColors(theme);
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
    if (heatMapChart) {
        heatMapChart.data.datasets[0].borderColor = frameColor;
        heatMapChart.data.datasets[1].borderColor = pointsAForeColor;
        heatMapChart.data.datasets[1].backgroundColor = pointsAForeColor;
        heatMapChart.data.datasets[2].borderColor = pointsBForeColor;
        heatMapChart.data.datasets[2].backgroundColor = pointsBForeColor;
        heatMapChart.options.scales.x.grid.color = gridColor.color;
        heatMapChart.options.scales.y.grid.color = gridColor.color;
        heatMapChart.update();
    }

    const selection = document.getElementById('boardThemeSelection');
    if (selection) selection.value = isKnownTheme ? selectedThemeName : 'classic';
}

function wholeNumbersOnly(value) {
    return Number.isInteger(value) ? value.toLocaleString() : null;
}

function setCanvasHeight() {
    const canvas = document.getElementById('boardChartCanvas');
    const width = canvas?.parentElement?.clientWidth;
    if (!canvas || !width) return;

    const height = width * 0.85;
    canvas.style.height = `${height}px`;

    checkerSize = Math.min(height / 12 * 0.8, width / 15 * 0.8) / 1.8;
    if (boardChart) {
        boardChart.data.datasets[0].pointRadius = checkerSize;
        boardChart.data.datasets[1].pointRadius = checkerSize;
        boardChart.update();
    }
}

function setHeatMapCanvasHeight() {
    const canvas = document.getElementById('heatMapChartCanvas');
    const boardCanvas = document.getElementById('boardChartCanvas');
    const width = canvas?.parentElement?.clientWidth;
    if (!canvas) return;

    const boardHeight = Number.parseFloat(boardCanvas?.style.height) || boardCanvas?.clientHeight;
    if (!boardHeight && !width) return;

    const height = boardHeight || width * 0.85;
    canvas.style.height = `${height}px`;

    if (heatMapChart) {
        heatMapChart.update();
    }
}

function createHeatMapBoard() {
    const canvas = document.getElementById('heatMapChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    setHeatMapCanvasHeight();

    if (heatMapChart) {
        heatMapChart.destroy();
    }

    heatMapChart = new Chart(ctx, {
        type: 'scatter',
        plugins: [pointNumberAnnotations, heatMapAnnotations],
        data: {
            datasets: [
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
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: showDebug },
            },
            events: [],
            layout: { padding: { bottom: -20 } },
            scales: {
                x: {
                    title: { display: showDebug },
                    beginAtZero: true,
                    stacked: true,
                    position: 'bottom',
                    ticks: { color: unimportantColor, display: showDebug },
                    grid: gridColor,
                    min: 0.4,
                    max: 13.6,
                    display: showDebug,
                },
                y: {
                    ticks: { display: showDebug },
                    beginAtZero: true,
                    min: -0.7,
                    max: 11.7,
                    grid: gridColor,
                    display: showDebug,
                }
            }
        }
    });

    setBoardTheme(document.getElementById('boardThemeSelection')?.value || 'classic');
    refreshHeatMap(Array.isArray(blunders) ? blunders : [], heatMapType);
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
        plugins: [pointNumberAnnotations, diceNumberAnnotations, awayAnnotations, moveArrowAnnotations],
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