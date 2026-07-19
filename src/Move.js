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

    toTableRow() {
        const blunderColor = moveColor(this.lostEquityValue);

        const coloredEquity = `<span style="color: ${unimportantColor}">${this.equity}</span><br><span style="color: ${blunderColor}">${this.lostEquity}</span><br><br>`;
        const coloredMoveNotation = `<span style="color: ${blunderColor}">${this.notation.replace(' ', '<br>')}</span>`;
        const [winningChancesRaw, losingChancesRaw] = this.chances.split(' - ');

        const winningChances = winningChancesRaw.trim().split(/\s+/);
        const losingChances = losingChancesRaw.trim().split(/\s+/);

        const winningChancesColor = getColorWithLevels(Number(winningChances[0]), 0, 50, 100);
        const losingChancesColor = getColorWithLevels(Number(losingChances[0]), 0, 50, 100);

        const chances = `<span style="color: ${winningChancesColor}">${winningChances[0]}</span> - <span style="color: ${losingChancesColor}">${losingChances[0]}</span><br>` + 
                        `<span style="color: ${unimportantColor}">${winningChances[1]} - ${losingChances[1]}<br>${winningChances[2]} - ${losingChances[2]}</span>`;

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
    const mediumLostEquity = 0.030;
    const awfulLostEquity = 0.120;

    if (lostEquity <= perfectLostEquity) {
        return 'limegreen';
    }

    if (lostEquity <= mediumLostEquity) {
        const hue = interpolateHue(150, 60, lostEquity, perfectLostEquity, mediumLostEquity);
        return `hsl(${hue}, 100%, 50%)`;
    }

    if (lostEquity <= awfulLostEquity) {
        const hue = interpolateHue(60, -40, lostEquity, mediumLostEquity, awfulLostEquity);
        return `hsl(${hue}, 100%, 50%)`;
    }

    return 'magenta';
}