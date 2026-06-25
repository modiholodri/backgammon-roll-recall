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

if (typeof blunderStore !== 'undefined' && typeof blunderStore.getAllBlunders === 'function') {
    loadBlunders(blunderStore.getAllBlunders());
}

function showNextBlunder() {
    if (!Array.isArray(blunders) || blunders.length === 0) {
        console.log('No blunders available');
        return;
    }

    currentBlunder = (currentBlunder + 1) % blunders.length;

    const blunder = new Blunder(blunders[currentBlunder]);
    console.log('Showing blunder:', currentBlunder, blunder);
    
    if (typeof blunder.show === 'function') {
        blunder.show.call(blunder);
    } else {
        console.log('Blunder.show is not a function:', typeof blunder.show);
    }
}

function showPreviousBlunder() {
    if (!Array.isArray(blunders) || blunders.length === 0) {
        console.log('No blunders available');
        return;
    }

    currentBlunder = (currentBlunder - 1 + blunders.length) % blunders.length;

    const blunder = new Blunder(blunders[currentBlunder]);
    console.log('Showing blunder:', currentBlunder, blunder);
    
    if (typeof blunder.show === 'function') {
        blunder.show.call(blunder);
    } else {
        console.log('Blunder.show is not a function:', typeof blunder.show);
    }
}

function showNextBlunderFromStore() {
    if (typeof blunderStore === 'undefined' || typeof blunderStore.getAllBlunders !== 'function') return;

    loadBlunders(blunderStore.getAllBlunders(), showNextBlunder);
}

function showPreviousBlunderFromStore() {
    if (typeof blunderStore === 'undefined' || typeof blunderStore.getAllBlunders !== 'function') return;

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
    if (typeof blunder.show === 'function') blunder.show.call(blunder);
}

function deleteCurrentBlunder() {
    loadBlunders(blunderStore.getAllBlunders(), performDeleteCurrentBlunder);
}

