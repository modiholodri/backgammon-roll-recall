class Move {
    constructor(rank, move, winningChances, losingChances, equity, lostEquity) {
        this.rank = rank;
        this.move = move;
        this.winningChances = winningChances;
        this.losingChances = losingChances;
        this.equity = equity;
        this.lostEquity = lostEquity;
    }

    getRank() {
        return this.rank;
    }

    setRank(rank) {
        this.rank = rank;
    }

    getMove() {
        return this.move;
    }

    setMove(move) {
        this.move = move;
    }

    getWinningChances() {
        return this.winningChances;
    }

    setWinningChances(winningChances) {
        this.winningChances = winningChances;
    }

    getLosingChances() {
        return this.losingChances;
    }

    setLosingChances(losingChances) {
        this.losingChances = losingChances;
    }

    getEquity() {
        return this.equity;
    }

    setEquity(equity) {
        this.equity = equity;
    }

    getLostEquity() {
        return this.lostEquity;
    }

    setLostEquity(lostEquity) {
        this.lostEquity = lostEquity;
    }

    toString() {
        return `Rank: ${this.rank}, Move: ${this.move}, Win%: ${this.winningChances}, Loss%: ${this.losingChances}, Equity: ${this.equity}, Lost Equity: ${this.lostEquity}`;
    }

    toTableRow() {
        const blunderColor = moveColor(this.lostEquity);

        const rank = `<span style="color: ${unimportantColor}">${this.rank}</span>`;
        const equity = `<span style="color: ${unimportantColor}">${this.equity}</span><br><span style="color: ${blunderColor}">${this.lostEquity}</span><br><br>`;
        const move = `<span style="color: ${blunderColor}">${this.move.replace(' ', '<br>')}</span>`;
        const winingChances = this.winningChances.split(' ');
        const losingChances = this.losingChances.split(' ');
        const chances = `<span style="color: ${unimportantColor}">${winingChances[0]} - ${losingChances[0]}<br>` + 
                        `${winingChances[1]} - ${losingChances[1]}<br>${winingChances[2]} - ${losingChances[2]}</span>`;

        // |#|Move|Chances|Equity|
        return `|${rank}|${equity}|${move}|${chances}|`;
    }

    //! probably not needed, remove later
    equals(other) {
        return this instanceof Move &&
            other instanceof Move &&
            this.rank === other.rank &&
            this.move === other.move &&
            this.winningChances === other.winningChances &&
            this.losingChances === other.losingChances &&
            this.equity === other.equity &&
            this.lostEquity === other.lostEquity;
    }
}


let rgxNumber = /[0-9.,-]+/
let rgxLostEquity = /[0-9.,]+/

function moveColor(lostEquity)
{
    if (lostEquity === "") return `rgb(2, 255, 0)`;
    const value = Number(lostEquity.match(rgxLostEquity));
    const dGoodMove = 0.030;
    const dBigBlunder = 0.120;

    if (value < dGoodMove)
    {
        const red = 255 * value / dGoodMove;
        clrIntensified = `rgb(${red}, 255, 0)`;
    }
    else if (value < dBigBlunder)
    {
        const green = 255 - 255 * (value - dGoodMove) / (dBigBlunder - dGoodMove);
        clrIntensified = `rgb(255, ${green}, 0)`;
    }
    else
    {
        clrIntensified = `rgb(255, 0, 0)`;
    }

    return clrIntensified;
}
