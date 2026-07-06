
class Blunder {
    constructor({ positionID = null, matchID = null, level = 0, timesAsked = 0, totalLostEquity = 0, moves = [] } = {}) {
        this.positionID = positionID;
        this.matchID = matchID;
        this.level = level;
        this.timesAsked = timesAsked;
        this.totalLostEquity = totalLostEquity;
        this.moves = moves;
    }


    static create({ positionID, matchID, moves = [] } = {}) {
        return new Blunder({ positionID, matchID, moves });
    }

    static movesToTable(moves) {
        if (!moves || moves.length === 0) {
            return '| No moves recorded |';
        }

        const headers = '|Equity|- Move -|Chances|';
        const separator = '|:-:|:-:|:-:|';

        let rows = '';
        moves.forEach((singleMove) => {
            rows += moveToTableRow(singleMove) + '\n';
        });

        return `${headers}\n${separator}\n${rows}`;
    }

    updateStatistics(selectedMove) {
        const acceptedLostEquityElement = document.getElementById('acceptedLostEquity');
        const acceptedLostEquity = Number(acceptedLostEquityElement.value);

        this.timesAsked++;
        if (selectedMove.lostEquityValue < acceptedLostEquity) {
            this.level++;
        }
        else {
            if (this.level > 0 ) this.level--;
            this.totalLostEquity += selectedMove.lostEquityValue;
        }

        blunderStore.updateBlunder([this.positionID, this.matchID], {
            level: this.level,
            timesAsked: this.timesAsked,
            totalLostEquity: Math.round(this.totalLostEquity * 1000.0) / 1000.0,
        }).then(() => {
            this.showStatistics();
            console.log('Blunder statistics updated successfully');
        }).catch((error) => {
            console.error('Failed to update blunder statistics', error);
        });
    }

    showStatistics() {
        const blunderPerformance = document.getElementById('performanceMessage');

        let averageLostEquityValue = 0.000;
        if ( this.timesAsked > 0 ) {
            averageLostEquityValue = this.totalLostEquity/this.timesAsked;
        }
        
        const errorRate = averageLostEquityValue * 1000.0;
        const performanceRate = averageLostEquityValue * 500.0;
        const performance = getPerformance(averageLostEquityValue);
        const performanceColor = getPerformanceColor(errorRate);
        const performanceHTML = `<span style="color: ${performanceColor};">${performanceRate.toFixed(1)} PR <-- ${performance} --> ER ${errorRate.toFixed(1)}</span>`;
        performanceMessage.innerHTML = performanceHTML;

        const blunderStatistics = document.getElementById('blunderStatistics');
        const levelHTML = `<p>Level : ${this.level} -> ${this.timesAsked} asked</p>`;
        blunderStatistics.innerHTML = levelHTML;
    }


    populateMoveOptions() {
        const optionIds = ['moveOption1', 'moveOption2', 'moveOption3', 'moveOption4', 'moveOption5'];

        let moveIndex = Math.floor(Math.random() * 5);

        let i = 0;
        for( ; i < this.moves.length && i < 5; i++ ) {
            const button = document.getElementById(optionIds[i]);
            const move = this.moves[(moveIndex + i) % this.moves.length];

            button.style.display = '';
            button.textContent = move.notation;
        }
        for( ; i < 5; i++ ) {
            const button = document.getElementById(optionIds[i]);
            button.style.display = 'none';
        }
    }

    show() {
        if (this.positionID) {
            try {
                setPositionID(this.positionID, 1);
            } catch (err) {
                console.error('Failed to load board Position ID:', err);
                alert('Failed to load board. Please check the console for more details.');
            }
        } else {
            alert('Invalid GNUbg ID.');
        }

        // console.log(this.moves);

        if (this.matchID) {
            try {
                readMatchID(this.matchID);
                addCubeToBoard();
                addDiceToBoard();
                addAwayToBoard();
                this.populateMoveOptions();
            } catch (err) {
                console.error('Failed to load match ID:', err);
                alert('Failed to load match ID. Please check the console for more details.');
            }
        } else {
            alert('Invalid match ID.');
        }

        this.showStatistics();

        // Show the all blunder moves
        // const moves = this.moves;
        // const movesTable = Blunder.movesToTable(moves);
        // const blunderTable = marked.parse(movesTable);
        // const movesHTML = blunderTable;
        const movesDisplay = document.getElementById('movesDisplay');
        if (movesDisplay) {
            movesDisplay.innerHTML = '';
        }
    }
}

// Export for use elsewhere
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Blunder;
}

function moveToTableRow(singleMove) {
    const blunderColor = moveColor(singleMove.lostEquityValue);

    const coloredEquity = `<span style="color: ${unimportantColor}">${singleMove.equity}</span><br><span style="color: ${blunderColor}">${singleMove.lostEquity}</span><br><br>`;
    const coloredMoveNotation = `<span style="color: ${blunderColor}">${singleMove.notation.replace(' ', '<br>')}</span>`;
    const [winningChancesRaw, losingChancesRaw] = singleMove.chances.split(' - ');
    const winningChances = winningChancesRaw.trim().split(/\s+/);
    const losingChances = losingChancesRaw.trim().split(/\s+/);

    const winningChancesColor = getColorWithLevels(Number(winningChances[0]), 0, 50, 100);
    const losingChancesColor = getColorWithLevels(Number(losingChances[0]), 0, 50, 100);

    const chances = `<span style="color: ${winningChancesColor}">${winningChances[0]}</span> - <span style="color: ${losingChancesColor}">${losingChances[0]}</span><br>` + 
                    `<span style="color: ${unimportantColor}">${winningChances[1]} - ${losingChances[1]}<br>${winningChances[2]} - ${losingChances[2]}</span>`;

    return `|${coloredEquity}|${coloredMoveNotation}|${chances}|`;
}

// Variant that accepts custom level thresholds
function getColorWithLevels(value, awfulLevel, mediumLevel, perfectLevel)
{
    if (value >= perfectLevel) {
        return `limegreen`;
    }

    if (value >= mediumLevel) {
        const t = (value - mediumLevel) / (perfectLevel - mediumLevel);
        const hue = 60 + 60 * t; // yellow -> limegreen
        return `hsl(${hue}, 100%, 50%)`;
    }

    if (value >= awfulLevel) {
        const t = (value - awfulLevel) / (mediumLevel - awfulLevel);
        let hue = 300 + 120 * t; // magenta -> yellow via 360 boundary
        if (hue >= 360) {
            hue -= 360;
        }
        return `hsl(${hue}, 100%, 50%)`;
    }

    return `magenta`;
}

function moveToTable(move) {
    const headers = '| | | |';
    const separator = '|:-:|:-:|:-:|';
    const row = moveToTableRow(move) + '\n';
    return `${headers}\n${separator}\n${row}`;
}

function getPerformance(normalizedRate)
{
    if (normalizedRate <= 0.002) return 'Supernatural';
    if (normalizedRate <= 0.005) return 'World Class';
    if (normalizedRate <= 0.008) return 'Expert';
    if (normalizedRate <= 0.012) return 'Advanced';
    if (normalizedRate <= 0.018) return 'Intermediate';
    if (normalizedRate <= 0.026) return 'Casual Player';
    if (normalizedRate <= 0.035) return 'Beginner';
    return 'Awful';
}

function interpolateHue(startHue, endHue, value, minValue, maxValue)
{
    if (value <= minValue) {
        return startHue;
    }

    if (value >= maxValue) {
        return endHue;
    }

    const t = (value - minValue) / (maxValue - minValue);
    const easedT = t * t;
    return startHue + (endHue - startHue) * easedT;
}

function getPerformanceColor(errorRate)
{
    const perfectPerformance = 2.0;
    const mediumLevel = 12.0;
    const awfulPerformance = 35.0;

    if (errorRate <= perfectPerformance) {
        return 'limegreen';
    }

    if (errorRate <= mediumLevel) {
        const hue = interpolateHue(150, 60, errorRate, perfectPerformance, mediumLevel);
        return `hsl(${hue}, 100%, 50%)`; // limegreen -> yellow
    }

    if (errorRate <= awfulPerformance) {
        const hue = interpolateHue(60, -40, errorRate, mediumLevel, awfulPerformance);
        return `hsl(${hue}, 100%, 50%)`; // yellow -> magenta
    }

    return 'magenta';
}
