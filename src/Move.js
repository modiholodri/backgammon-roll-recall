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
        const equity = `${this.equity}<br>${this.lostEquity}`
        const move = `${this.move.replace(' ', '<br>')}`;
        const winingChances = this.winningChances.split(' ');
        const losingChances = this.losingChances.split(' ');
        const chances = `${winingChances[0]} - ${losingChances[0]}<br>${winingChances[1]} - ${losingChances[1]}<br>${winingChances[2]} - ${losingChances[2]}`;

        // |#|Move|Chances|Equity|
        return `|${this.rank}|${equity}|${move}|${chances}|`;
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
