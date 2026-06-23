let rgxNumber = /[0-9.,-]+/
let rgxLostEquity = /[0-9.,]+/

class Move {
    constructor(rank, move, chances, equity, lostEquity) {
        this.rank = rank;
        this.move = move;

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
        return `Rank: ${this.rank}, Move: ${this.move}, Chances: ${this.chances}, Equity: ${this.equity}, Lost Equity: ${this.lostEquity}`;
    }

    toTableRow() {
        const blunderColor = moveColor(this.lostEquityValue);

        const rank = `<span style="color: ${unimportantColor}">${this.rank}</span>`;
        const equity = `<span style="color: ${unimportantColor}">${this.equity}</span><br><span style="color: ${blunderColor}">${this.lostEquity}</span><br><br>`;
        const move = `<span style="color: ${blunderColor}">${this.move.replace(' ', '<br>')}</span>`;
        const [winningChancesRaw, losingChancesRaw] = this.chances.split(' - ');
        const winningChances = winningChancesRaw.trim().split(/\s+/);
        const losingChances = losingChancesRaw.trim().split(/\s+/);
        const chances = `<span style="color: ${unimportantColor}">${winningChances[0]} - ${losingChances[0]}<br>` + 
                        `${winningChances[1]} - ${losingChances[1]}<br>${winningChances[2]} - ${losingChances[2]}</span>`;

        // |#|Move|Chances|Equity|
        return `|${rank}|${equity}|${move}|${chances}|`;
    }

    //! probably not needed, remove later
    equals(other) {
        return this instanceof Move &&
            other instanceof Move &&
            this.rank === other.rank &&
            this.move === other.move &&
            this.chances === other.chances &&
            this.equity === other.equity &&
            this.lostEquity === other.lostEquity;
    }
}

function moveColor(lostEquity)
{
    const dGoodMoveEquity = 0.030;
    const dBigBlunderEquity = 0.120;

    if (lostEquity < 0.002) {
        return `rgb(2, 255, 0)`;
    }
    if (lostEquity < dGoodMoveEquity)
    {
        const red = 255 * lostEquity / dGoodMoveEquity;
        clrIntensified = `rgb(${red}, 255, 0)`;
    }
    else if (lostEquity < dBigBlunderEquity)
    {
        const green = 255 - 255 * (lostEquity - dGoodMoveEquity) / (dBigBlunderEquity - dGoodMoveEquity);
        clrIntensified = `rgb(255, ${green}, 0)`;
    }
    else
    {
        clrIntensified = `rgb(255, 0, 0)`;
    }

    return clrIntensified;
}
