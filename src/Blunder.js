
class Blunder {
    constructor({ positionId = null, matchId = null, alert = null, moves = [] } = {}) {
        this.positionId = positionId;
        this.matchId = matchId;
        this.alert = alert;
        this.moves = moves;
        this.level = 0;
    }


    static create({ positionId, matchId, alert, moves = [] } = {}) {
        return new Blunder({ positionId, matchId, alert, moves });
    }

    static movesToTable(moves) {
        if (!moves || moves.length === 0) {
            return '| No moves recorded |';
        }

        const headers = '|#|Move|Chances|Equity|';
        const separator = '|:-:|:-:|:-:|:-:|';

        const rows = moves.map((move) => move.toTableRow()).join('\n');

        return `${headers}\n${separator}\n${rows}`;
    }

    show() {
        if (this.positionId) {
            try {
                setPositionID(this.positionId, 1);
            } catch (err) {
                console.error('Failed to load board Position ID:', err);
                alert('Failed to load board. Please check the console for more details.');
            }
        } else {
            alert('Invalid GNUbg ID.');
        }

        if (this.matchId) {
            try {
                readMatchID(this.matchId);
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