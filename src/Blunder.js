
function createBlunderObject({ positionId, matchId, alert, moves = [],} = {}) {
    return { positionId, matchId, alert, moves, };
}

function blunderMovesToTable(moves) {
    if (!moves || moves.length === 0) {
        return '| No moves recorded |';
    }

    const headers = '|#|Move|Chances|Equity|';
    const separator = '|:-:|:-:|:-:|:-:|';
    
    const rows = moves.map((move, index) => {
        return move.toTableRow();
    }).join('\n');

    return `${headers}\n${separator}\n${rows}`;
}

function showBlunder(blunder) {
    if (blunder.positionId) {
        try {
            setPositionID(blunder.positionId, 1);
        } catch (err) {
            console.error('Failed to load board Position ID:', err);
            alert('Failed to load board. Please check the console for more details.');
        }
    } else {
        alert('Invalid GNUbg ID.');
    }
    if (blunder.matchId) {
        try {
            readMatchID(blunder.matchId);
            addDiceToBoard();
        } catch (err) {
            console.error('Failed to load match ID:', err);
            alert('Failed to load match ID. Please check the console for more details.');
        }
    } else {
        alert('Invalid match ID.');
    }

    document.getElementById('movesDisplay').innerHTML = marked.parse(blunderMovesToTable(blunder.moves));
}