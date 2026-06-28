let blunders = [];
let currentBlunder = -1; // start before first so showNext moves to 0

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

function showPreviousBlunder() {
    if (!Array.isArray(blunders) || blunders.length === 0) {
        console.log('No blunders available');
        return;
    }

    currentBlunder = (currentBlunder - 1 + blunders.length) % blunders.length;

    const blunder = new Blunder(blunders[currentBlunder]);
    console.log('Showing blunder:', currentBlunder, blunder);
    
    blunder.show();
}

function checkSelectedMoveOption() {
    if (!Array.isArray(blunders) || blunders.length === 0 || currentBlunder < 0 || currentBlunder >= blunders.length) {
        console.log('No blunders available');
        return;
    }
    const movesDisplay = document.getElementById('movesDisplay');
    if (!movesDisplay) return;

    const blunder = new Blunder(blunders[currentBlunder]);
    // console.log('Checking blunder:', currentBlunder, blunder);

    // Try to find an explicitly selected element by common patterns
    const optionIds = ['moveOption1', 'moveOption2', 'moveOption3', 'moveOption4', 'moveOption5'];
    let selectedEl = document.querySelector('.selected, [data-selected="true"], button[aria-pressed="true"], button:focus');

    let selectedMoveNotation = '';
    if (selectedEl) {
        selectedMoveNotation = selectedEl.textContent.trim();
    }

    if (!selectedMoveNotation) {
        console.log('No selected move notation found');
        return;
    }

    const moves = Array.isArray(blunder.moves) ? blunder.moves : [];
    if (moves.length === 0) {
        console.log('No moves to check on current blunder');
        return;
    }

    let selectedMove = null;
    moves.forEach((move, index) => {
        if (move.notation === selectedMoveNotation) { 
            console.log(`Selected ${index}. best move :`, move);
            selectedMove = move;
        }
    });

    if (selectedMove) {
        const moveEvaluation = moveToTable(selectedMove);
        const moveEvaluationTable = marked.parse(moveEvaluation);
        movesDisplay.innerHTML = moveEvaluationTable;
        blunder.showStatistics();
    }
    else {
        console.log('Selected move notation does not match any move in current blunder:', selectedMoveNotation);
    }
}


function checkSelectedMoveOfCurrentBlunder() {
    loadBlunders(blunderStore.getAllBlunders(), checkCurrentBlunder);
}

function showNextBlunderFromStore() {
    loadBlunders(blunderStore.getAllBlunders(), showNextBlunder);
}

function showPreviousBlunderFromStore() {
    loadBlunders(blunderStore.getAllBlunders(), showPreviousBlunder);
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
    loadBlunders(blunderStore.getAllBlunders(), performDeleteCurrentBlunder);
}