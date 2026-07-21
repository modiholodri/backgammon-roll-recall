
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

    updateStatistics(selectedMove) {
        const acceptedLostEquityElement = document.getElementById('acceptedLostEquity');
        const acceptedLostEquity = Math.abs(Number(acceptedLostEquityElement.value));

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

        let performanceHTML =   `<span style="display: flex; width: 100%; color: gray;">
                                    <span style="text-align: center; flex: 1;">Unrated</span>
                                </span>`;

        if ( this.timesAsked > 0 ) {
            const averageLostEquityValue = this.totalLostEquity/this.timesAsked;
            const errorRate = averageLostEquityValue * 1000.0;
            const performanceRate = averageLostEquityValue * 500.0;
            const performance = getPerformance(averageLostEquityValue);
            const performanceColor = getPerformanceColor(errorRate);
            performanceHTML =   `<span style="display: flex; width: 100%; color: ${performanceColor};">
                                    <span style="text-align: left; flex: 1;">${performanceRate.toFixed(1)} PR</span>
                                    <span style="text-align: center; flex: 1;">${performance}</span>
                                    <span style="text-align: right; flex: 1;">ER ${errorRate.toFixed(1)}</span>
                                </span>`;
        }
        
        performanceMessage.innerHTML = performanceHTML;

        const blunderStatistics = document.getElementById('blunderStatistics');
        const levelHTML = `<p>${this.timesAsked} x asked -> Level ${this.level}</p>`;
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
            button.style.removeProperty('color');
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

        const moveDisplay = document.getElementById('moveDisplay');
        if (moveDisplay) {
            moveDisplay.innerHTML = '<p> <br> <br> </p>';
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

    const winningChancesColor = getGradientColor(Number(winningChances[0]), 75, 'lime');
    const losingChancesColor = getGradientColor(Number(losingChances[0]), 75, 'magenta');

    const winningGammonColor = getGradientColor(Number(winningChances[1]), 37, 'lime');
    const losingGammonColor = getGradientColor(Number(losingChances[1]), 37, 'magenta');
    const winningBackgammonColor = getGradientColor(Number(winningChances[2]), 25, 'lime');
    const losingBackgammonColor = getGradientColor(Number(losingChances[2]), 25, 'magenta');

    const chances = `<span style="color: ${winningChancesColor}">${winningChances[0]}</span> - <span style="color: ${losingChancesColor}">${losingChances[0]}</span><br>` +
                    `<span style="color: ${winningGammonColor}">${winningChances[1]}</span> - <span style="color: ${losingGammonColor}">${losingChances[1]}</span><br>` +
                    `<span style="color: ${winningBackgammonColor}">${winningChances[2]}</span> - <span style="color: ${losingBackgammonColor}">${losingChances[2]}</span>`;

    return `|${coloredEquity}|${coloredMoveNotation}|${chances}|`;
}

    // Returns a color interpolated from gray to a target color based on value/maxValue.
    // targetColor may be a hex string like '#RRGGBB' or one of: 'lime', 'lime', 'magenta'
    function getGradientColor(value, maxValue, targetColor) {
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
        const t = maxValue > 0 ? clamp(value / maxValue, 0, 1) : 0;

        // gray base
        const base = [128, 128, 128];

        // resolve target color to RGB
        let target = [0, 255, 0]; // default lime
        if (typeof targetColor === 'string') {
            const s = targetColor.toLowerCase();
            if (s === 'magenta') target = [255, 0, 255];
            else if (s === 'lime' || s === 'lime') target = [0, 255, 0];
            else if (s === 'yellow') target = [255, 255, 0];
            else if (s === 'orange') target = [255, 165, 0];
            else if (s === 'cyan') target = [0, 255, 255];
            else if (s === 'red') target = [255, 0, 0];
            else if (s[0] === '#') {
                const hex = s.replace('#','');
                if (hex.length === 6) {
                    target = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
                }
            }
        }

        // interpolate each channel (ease with quadratic easing for nicer gradient)
        const eased = t * t;
        const r = Math.round(base[0] + (target[0] - base[0]) * eased);
        const g = Math.round(base[1] + (target[1] - base[1]) * eased);
        const b = Math.round(base[2] + (target[2] - base[2]) * eased);

        return `rgb(${r}, ${g}, ${b})`;
    }


//! not used at the moment, remove later?
// Variant that accepts custom level thresholds
function getColorWithLevels(value, awfulLevel, mediumLevel, perfectLevel)
{
    if (value >= perfectLevel) {
        return `lime`;
    }

    if (value >= mediumLevel) {
        const t = (value - mediumLevel) / (perfectLevel - mediumLevel);
        const hue = 60 + 60 * t; // yellow -> lime
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
    if (normalizedRate <= 0.026) return 'Hobbyist';
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
        return 'lime';
    }

    if (errorRate <= mediumLevel) {
        const hue = interpolateHue(150, 60, errorRate, perfectPerformance, mediumLevel);
        return `hsl(${hue}, 100%, 50%)`; // lime -> yellow
    }

    if (errorRate <= awfulPerformance) {
        const hue = interpolateHue(60, -40, errorRate, mediumLevel, awfulPerformance);
        return `hsl(${hue}, 100%, 50%)`; // yellow -> magenta
    }

    return 'magenta';
}
