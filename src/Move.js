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
