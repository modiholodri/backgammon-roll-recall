
class Blunder {
    constructor({ positionID = null, matchID = null, moves = [] } = {}) {
        this.positionID = positionID;
        this.matchID = matchID;
        this.moves = moves;
        this.level = 0;
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

        const rows = moves.map((move) => move.toTableRow()).join('\n');

        return `${headers}\n${separator}\n${rows}`;
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
            } catch (err) {
                console.error('Failed to load match ID:', err);
                alert('Failed to load match ID. Please check the console for more details.');
            }
        } else {
            alert('Invalid match ID.');
        }

        document.getElementById('movesDisplay').innerHTML = marked.parse(Blunder.movesToTable(this.moves));
        scrollToElement('boardChart');
    }
}

// Export for use elsewhere
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Blunder;
}