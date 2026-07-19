let blunders = [];
let currentBlunder = -1; // start before first so showNext moves to 0
let lastCheckedBlunder = -1;

function loadBlunders(result, callback) {
    if (result && typeof result.then === 'function') {
        result.then(data => {
            blunders = Array.isArray(data) ? data : [];
            if (typeof callback === 'function') callback();
        }).catch(() => {
            blunders = [];
        });
    } else {
        blunders = Array.isArray(result) ? result : [];
        if (typeof callback === 'function') callback();
    }
}

function fetchBlundersFromStore() {
    // Ensure loadBlunders completes before continuing (without making this function async)
    const _blunders = blunderStore.getAllBlunders();
    Promise.resolve(_blunders)
        .then(res => Promise.resolve(loadBlunders(res)))
        .then(() => { showNextBlunder(); })
        .catch(err => { console.error('Failed to load blunders:', err); });
}

function showNextBlunder() {
    if (!Array.isArray(blunders) || blunders.length === 0) {
        console.log('No blunders available');
        return;
    }

    currentBlunder = (currentBlunder + 1) % blunders.length;

    const blunder = new Blunder(blunders[currentBlunder]);
    console.log('Showing blunder:', currentBlunder, blunder);
    
    blunder.show();
}

function colorMoveOptions() {
    const optionIds = ['moveOption1', 'moveOption2', 'moveOption3', 'moveOption4', 'moveOption5'];

    optionIds.forEach(id => {
        const option = document.getElementById(id);
        const notation = option.textContent.trim();

        const blunder = new Blunder(blunders[currentBlunder]);
        const moves = Array.isArray(blunder.moves) ? blunder.moves : [];
        if (moves.length === 0) {
            return;
        }
        try {
            let color = 'gray';
            moves.forEach((move, index) => {
                if (move.notation === notation) { 
                    color = moveColor(move.lostEquityValue);
                }
            });

            if (color) {
                option.style.color = color;
            } else {
                option.style.removeProperty('color');
            }
        } catch (err) {
            console.error('Failed to color move option', id, err);
        }
    });
}

function checkSelectedMoveOption() {
    if (!Array.isArray(blunders) || blunders.length === 0 || currentBlunder < 0 || currentBlunder >= blunders.length) {
        console.log('No blunders available');
        return;
    }
    const movesDisplay = document.getElementById('movesDisplay');
    if (!movesDisplay) return;


    // Try to find an explicitly selected element by common patterns
    const optionIds = ['moveOption1', 'moveOption2', 'moveOption3', 'moveOption4', 'moveOption5'];
    let selectedEl = document.querySelector('.selected, [data-selected="true"], button[aria-pressed="true"], button:focus');

    let selectedMoveNotation = null;
    if (selectedEl) {
        selectedMoveNotation = selectedEl.textContent.trim();
    }
    if (!selectedMoveNotation) {
        console.log('No selected move notation found');
        return;
    }

    const blunder = new Blunder(blunders[currentBlunder]);
    const moves = Array.isArray(blunder.moves) ? blunder.moves : [];
    if (moves.length === 0) {
        console.log('No moves to check on current blunder');
        return;
    }

    let selectedMove = null;
    moves.forEach((move, index) => {
        if (move.notation === selectedMoveNotation) { 
            console.log(`Selected ${index + 1}. best move :`, move);
            selectedMove = move;
        }
    });

    if (selectedMove) {
        const moveEvaluation = moveToTable(selectedMove);
        const moveEvaluationTable = marked.parse(moveEvaluation);
        movesDisplay.innerHTML = moveEvaluationTable;
        if (lastCheckedBlunder != currentBlunder) {
            blunder.updateStatistics(selectedMove);
            colorMoveOptions();
            lastCheckedBlunder = currentBlunder;
        }
    }
    else {
        console.log('Selected move notation does not match any move in current blunder:', selectedMoveNotation);
    }
}




function performDeleteCurrentBlunder() {
    if (!Array.isArray(blunders) || blunders.length === 0 || currentBlunder < 0 || currentBlunder >= blunders.length) {
        console.log('No current blunder to delete');
        return;
    }

    const removed = blunders.splice(currentBlunder, 1)[0];
    console.log('Deleted blunder:', currentBlunder, removed);

    // If store provides a delete method for a single blunder, prefer that
    if (typeof blunderStore !== 'undefined') {
        try {
            // Dexie compound keys require an array key, not an object.
            if (removed.positionID == null || removed.matchID == null) return;
            const id = [removed.positionID, removed.matchID];
            blunderStore.deleteBlunder(id);
        } catch (e) {
            console.log('blunderStore.deleteBlunder failed', e);
        }
    }

    if (blunders.length === 0) {
        currentBlunder = -1;
        console.log('No blunders left');
        return;
    }

    // adjust currentBlunder to point to a valid index (next item takes this index)
    if (currentBlunder >= blunders.length) currentBlunder = 0;

    // show the blunder now at currentBlunder
    const blunder = new Blunder(blunders[currentBlunder]);
    blunder.show();
}

function deleteCurrentBlunder() {
    const confirmed = window.confirm('Are you sure you want to delete this blunder?');
    if (!confirmed) {
        return false;
    }

    performDeleteCurrentBlunder();
}