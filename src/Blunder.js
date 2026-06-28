
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
            // rows += singleMove.toTableRow() + '\n';
        });
        rows = rows.trim();

        return `${headers}\n${separator}\n${rows}`;
    }




    populateMoveOptions() {
        const optionIds = ['moveOption1', 'moveOption2', 'moveOption3', 'moveOption4', 'moveOption5'];

        optionIds.forEach((id, index) => {
            const button = document.getElementById(id);
            if (!button) {
                return;
            }

            const move = this.moves[index];
            if (!move) {
                button.style.display = 'none';
                return;
            }

            button.style.display = '';
            button.textContent = move.notation;
        });
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

        const moves = this.moves;
        const movesTable = Blunder.movesToTable(moves);
        const blunderTable = marked.parse(movesTable);
        const movesHTML = blunderTable;
        const movesDisplay = document.getElementById('movesDisplay');
        if (movesDisplay) {
            movesDisplay.innerHTML = movesHTML;
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
    const chances = `<span style="color: ${unimportantColor}">${winningChances[0]} - ${losingChances[0]}<br>` + 
                    `${winningChances[1]} - ${losingChances[1]}<br>${winningChances[2]} - ${losingChances[2]}</span>`;

    return `|${coloredEquity}|${coloredMoveNotation}|${chances}|`;
}
