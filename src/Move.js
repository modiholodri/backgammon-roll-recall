let rgxNumber = /[0-9.,-]+/
let rgxLostEquity = /[0-9.,]+/

class Move {
    constructor(notation, chances, equity, lostEquity) {
        this.notation = notation;

        // normalize chances: collapse duplicated whitespace to single spaces and trim
        this.chances = String(chances).replace(/\s+/g, ' ').trim();

        this.equity = equity;
        this.lostEquity = lostEquity;
        if (lostEquity === '') {
            this.lostEquity = '(0.000)';
        }
        this.lostEquityValue = Number(lostEquity.match(rgxLostEquity));
    }

    toString() {
        return `Move: ${this.notation}, Chances: ${this.chances}, Equity: ${this.equity}, Lost Equity: ${this.lostEquity}`;
    }

    //! not used at the moment, remove later?
    toTableRow() {
        const blunderColor = moveColor(this.lostEquityValue);

        const coloredEquity = `<span style="color: ${unimportantColor}">${this.equity}</span><br><span style="color: ${blunderColor}">${this.lostEquity}</span><br><br>`;
        const coloredMoveNotation = `<span style="color: ${blunderColor}">${this.notation.replace(' ', '<br>')}</span>`;
        const [winningChancesRaw, losingChancesRaw] = this.chances.split(' - ');

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

    //! probably not needed, remove later
    equals(other) {
        return this instanceof Move &&
            other instanceof Move &&
            this.notation === other.notation &&
            this.chances === other.chances &&
            this.equity === other.equity &&
            this.lostEquity === other.lostEquity;
    }
}

function moveColor(lostEquity)
{
    const perfectLostEquity = 0.000;
    const doubtfulLostEquity = Math.abs(Number(document.getElementById('doubtfulLostEquity').value));
    const veryBadLostEquity = Math.abs(Number(document.getElementById('veryBadLostEquity').value));

    if (lostEquity <= perfectLostEquity) {
        return 'lime';
    }

    if (lostEquity <= doubtfulLostEquity) {
        const hue = interpolateHue(150, 60, lostEquity, perfectLostEquity, doubtfulLostEquity);
        return `hsl(${hue}, 100%, 50%)`;
    }

    if (lostEquity <= veryBadLostEquity) {
        const hue = interpolateHue(60, -40, lostEquity, doubtfulLostEquity, veryBadLostEquity);
        return `hsl(${hue}, 100%, 50%)`;
    }

    return 'magenta';
}